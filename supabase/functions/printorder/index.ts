import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST requests allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const { orderId, force = false } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar dados do pedido (ou criar um fake para teste)
    let order;
    if (orderId === "TEST-ORDER") {
      // Criar um pedido fake para teste
      order = {
        id: "TEST-ORDER",
        customer_name: "Teste",
        total: 50.00,
        created_at: new Date().toISOString(),
      };
    } else {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !orderData) {
        console.error("Order error:", orderError);
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: corsHeaders }
        );
      }
      order = orderData;
    }

    // 2. Buscar configuração de impressora e métodos de pagamento
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("printnode_printer_id, print_mode, auto_print_pix, auto_print_card, auto_print_cash")
      .eq("id", "store-settings")
      .single();

    if (settingsError || !settings?.printnode_printer_id) {
      console.error("Settings error:", settingsError);
      return new Response(
        JSON.stringify({
          error: "Printer not configured",
          details: settingsError?.message,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Verificar modo de impressão e método de pagamento
    const shouldAutoPrint = () => {
      if (force) return true; // Force sempre imprime
      if (settings.print_mode === "auto") {
        // Verificar método de pagamento
        const paymentMethod = order.payment_method?.toLowerCase();
        if (paymentMethod === "pix" && settings.auto_print_pix) return true;
        if (paymentMethod === "card" && settings.auto_print_card) return true;
        if (paymentMethod === "cash" && settings.auto_print_cash) return true;
        if (!paymentMethod) return true; // Se não houver método, imprime
      }
      return false;
    };
    
    if (!shouldAutoPrint()) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Order not auto-printed based on payment method settings.",
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 4. Buscar items do pedido (ou usar fake para teste)
    let orderItems = [];
    if (orderId !== "TEST-ORDER") {
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      orderItems = items || [];
    } else {
      // Items fake para teste
      orderItems = [
        { quantity: 1, product_name: "Pizza Margherita", size: "Grande" },
        { quantity: 1, product_name: "Refrigerante", size: "2L" },
      ];
    }

    // 5. Montar HTML
    const html = buildHTML(order, orderItems || []);

    // 6. Enviar para PrintNode
    const apiKey = Deno.env.get("PRINTNODE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const printNodeResult = await sendToPrintNode(
      apiKey,
      settings.printnode_printer_id,
      html
    );

    if (!printNodeResult.success) {
      return new Response(
        JSON.stringify({
          error: "Failed to send to PrintNode",
          details: printNodeResult.error,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order sent to printer",
        printJobId: printNodeResult.printJobId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

function buildHTML(order: any, items: any[]): string {
  // 🎯 Função auxiliar para extrair nome seguro
  const extractName = (value: any): string => {
    if (!value) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return String(value.name);
    return String(value);
  };

  // 🎨 Renderizar cada item com todos os detalhes
  const itemsHTML = items
    .map((item) => {
      let html = `
    <div style="margin-bottom: 12px; border-bottom: 1px dotted #333; padding-bottom: 8px;">
      <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">
        ${item.quantity}x ${item.product_name}${item.size ? ` (${item.size})` : ''}
      </div>
  `;

      // 📦 Acessar item_data (JSONB) que contém todos os detalhes
      const itemData = item.item_data || {};

      // Tipo de pizza
      if (itemData.pizzaType) {
        const typeLabel = itemData.pizzaType === 'meia-meia' ? 'Meia-Meia' : 'Inteira';
        html += `<div style="margin-left: 8px; font-size: 12px;">Tipo: ${typeLabel}</div>`;
      }

      // Sabores simples (não combo)
      if (itemData.sabor1 && !itemData.comboPizzas?.length) {
        html += `<div style="margin-left: 8px; font-size: 12px;">Sabor: ${extractName(itemData.sabor1)}</div>`;
        if (itemData.sabor2) {
          html += `<div style="margin-left: 8px; font-size: 12px;">Sabor 2: ${extractName(itemData.sabor2)}</div>`;
        }
      }

      // Meia-meia (metades)
      if (itemData.halfOne || itemData.halfTwo) {
        html += `<div style="margin-left: 8px; font-size: 12px;">
        Meia: ${extractName(itemData.halfOne)} | ${extractName(itemData.halfTwo)}
      </div>`;
      }

      // Combos com múltiplas pizzas
      if (itemData.comboPizzas && Array.isArray(itemData.comboPizzas) && itemData.comboPizzas.length > 0) {
        html += `<div style="margin-left: 8px; font-size: 12px; font-weight: bold; margin-top: 4px;">Pizzas:</div>`;
        itemData.comboPizzas.forEach((pizza: any, idx: number) => {
          const pizzaName = extractName(pizza.pizzaName || pizza.name || `Pizza ${idx + 1}`);
          if (pizza.isHalfHalf) {
            html += `<div style="margin-left: 16px; font-size: 11px;">
          • ${pizzaName} (${extractName(pizza.halfOne)} | ${extractName(pizza.halfTwo)})
        </div>`;
          } else {
            html += `<div style="margin-left: 16px; font-size: 11px;">
          • ${pizzaName}
        </div>`;
          }
        });
      }

      // Borda
      if (itemData.border) {
        html += `<div style="margin-left: 8px; font-size: 12px;">Borda: ${extractName(itemData.border)}</div>`;
      }

      // Bebida
      if (itemData.drink) {
        html += `<div style="margin-left: 8px; font-size: 12px;">Bebida: ${extractName(itemData.drink)}</div>`;
      }

      // Extras/Adicionais
      if (itemData.extras && Array.isArray(itemData.extras) && itemData.extras.length > 0) {
        const extrasStr = itemData.extras.map((e: any) => extractName(e)).join(', ');
        html += `<div style="margin-left: 8px; font-size: 12px;">+ ${extrasStr}</div>`;
      }

      // Custom Ingredients
      if (itemData.customIngredients && Array.isArray(itemData.customIngredients) && itemData.customIngredients.length > 0) {
        const customStr = itemData.customIngredients.map((c: any) => extractName(c)).join(', ');
        html += `<div style="margin-left: 8px; font-size: 12px;">Custom: ${customStr}</div>`;
      }

      // Observações
      if (itemData.notes) {
        html += `<div style="margin-left: 8px; font-size: 11px; font-style: italic; color: #666;">Obs: ${itemData.notes}</div>`;
      }

      html += `</div>`;
      return html;
    })
    .join("");

  const pointsDiscountHTML = order.points_discount && order.points_discount > 0 
    ? `<div style="font-size: 12px; color: green; margin-top: 10px;">Desconto (Pontos): -R$ ${(order.points_discount || 0).toFixed(2)}</div>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; padding: 20px; }
        h2 { text-align: center; margin-bottom: 20px; margin-top: 0; }
        .order-info { margin-bottom: 10px; font-size: 12px; }
        .separator { border-top: 1px solid #333; margin-bottom: 10px; }
        .total { font-size: 16px; font-weight: bold; margin-top: 10px; text-align: center; border-top: 2px solid #000; padding-top: 10px; }
        hr { border: none; border-top: 1px dashed #333; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h2>🍕 COMANDA 🍕</h2>
      <div class="order-info"><strong>Pedido:</strong> ${order.id}</div>
      <div class="order-info"><strong>Data:</strong> ${new Date(order.created_at).toLocaleString("pt-BR")}</div>
      <div class="order-info"><strong>Cliente:</strong> ${order.customer_name || "S/N"}</div>
      <hr>
      <div>${itemsHTML}</div>
      ${pointsDiscountHTML}
      <div class="total">Total: R$ ${(order.total || 0).toFixed(2)}</div>
    </body>
    </html>
  `;
}

async function sendToPrintNode(
  apiKey: string,
  printerId: string,
  htmlContent: string
): Promise<{ success: boolean; printJobId?: string; error?: string }> {
  try {
    const base64HTML = btoa(htmlContent);

    const response = await fetch("https://api.printnode.com/printjobs", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        printerId: parseInt(printerId),
        title: "Comanda - Forneiro Éden",
        contentType: "raw_base64",
        content: base64HTML,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PrintNode error ${response.status}: ${errorText}`);
      return {
        success: false,
        error: `PrintNode API error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`Print job created: ${data.id}`);
    return {
      success: true,
      printJobId: data.id,
    };
  } catch (error) {
    console.error("PrintNode error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
