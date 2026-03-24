import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCatalogStore } from '@/store/useCatalogStore';
import type { Medication } from '@/data/medications';

/**
 * Adapta dados do Supabase (snake_case) para Medication (camelCase)
 * Mantém compatibilidade com estrutura de Product
 */
const parseMedicationFromSupabase = (supabaseData: any): Medication => {
  let data = supabaseData.data || {};
  
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.warn('❌ Erro ao fazer parse de data JSON:', e);
      data = {};
    }
  }

  const isActive = supabaseData.is_active === true || (supabaseData.is_active !== false && supabaseData.is_active !== undefined);

  return {
    id: supabaseData.id,
    name: supabaseData.name || data.name,
    description: supabaseData.description || data.description || '',
    activeIngredient: supabaseData.active_ingredient || data.activeIngredient || '',
    category: supabaseData.category || data.category || 'generico',
    price: supabaseData.price ?? data.price ?? 0,
    image: supabaseData.image || data.image,
    isPopular: supabaseData.is_popular ?? data.isPopular ?? false,
    isNew: supabaseData.is_new ?? data.isNew ?? false,
    isActive: isActive,
    requiresRecipe: supabaseData.requires_recipe ?? data.requiresRecipe ?? false,
    isControlled: supabaseData.is_controlled ?? data.isControlled ?? false,
    stock: supabaseData.stock ?? data.stock ?? 0,
    maxQuantityPerOrder: supabaseData.max_quantity_per_order ?? data.maxQuantityPerOrder,
  };
};

/**
 * Hook para sincronizar medicamentos do Supabase em tempo real
 * Reutiliza a mesma estrutura de realtime de produtos
 */
export const useMedicationsRealtimeSync = () => {
  useEffect(() => {
    console.log('🏥 Iniciando useMedicationsRealtimeSync hook...');
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;
    const lastLocalUpdate = new Map<string, number>();

    const syncMedicationsFromSupabase = async () => {
      if (!isMounted) return;

      try {
        const { data: medications } = await (supabase as any)
          .from('medications')
          .select('*');

        if (medications && isMounted) {
          const catalogStore = useCatalogStore.getState();
          const currentTime = Date.now();
          const currentMedicationIds = new Set(medications.map((m: any) => m.id));

          for (const medication of medications) {
            const lastUpdate = lastLocalUpdate.get(medication.id) || 0;
            const timeSinceLastUpdate = currentTime - lastUpdate;

            if (timeSinceLastUpdate < 3000) {
              console.log(`⏭️  [MEDICATIONS-POLLING] Pulando ${medication.name}`);
              continue;
            }

            catalogStore.upsertProduct(parseMedicationFromSupabase(medication) as any);
          }

          // Remover medicamentos deletados
          const storeProducts = catalogStore.getAll();
          for (const storeProduct of storeProducts) {
            if (!currentMedicationIds.has(storeProduct.id)) {
              console.log(`🗑️ [MEDICATIONS-POLLING] Medicamento deletado: ${storeProduct.id}`);
              catalogStore.removeProduct(storeProduct.id);
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar medicamentos:', error);
      }
    };

    // Carregar dados iniciais
    const loadInitialData = async () => {
      if (!isMounted) return;

      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const { data: medications } = await (supabase as any)
          .from('medications')
          .select('*');

        if (medications && isMounted) {
          const catalogStore = useCatalogStore.getState();
          console.log(`✅ Carregados ${medications.length} medicamentos inicialmente`);
          for (const medication of medications) {
            catalogStore.upsertProduct(parseMedicationFromSupabase(medication) as any);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar medicamentos iniciais:', error);
      }
    };

    loadInitialData();

    // ✅ WEBHOOK REALTIME
    const medicationsChannel = supabase
      .channel('realtime:medications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medications' },
        (payload: any) => {
          if (!isMounted) return;
          console.log('🔔 Webhook Medicamentos Realtime:', payload.eventType, payload.new?.id || payload.old?.id, payload.new?.name || payload.old?.name);

          const catalogStore = useCatalogStore.getState();

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const medication = parseMedicationFromSupabase(payload.new as any);
            console.log('✅ Atualizando medicamento via webhook:', medication.id, medication.name);
            lastLocalUpdate.set(payload.new.id, Date.now() + 10000);
            catalogStore.upsertProduct(medication as any);
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Removendo medicamento via webhook:', payload.old?.id);
            catalogStore.removeProduct(payload.old?.id);
          }
        }
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME-MEDICATIONS] Canal ATIVO');
        } else if (error) {
          console.error('❌ [REALTIME-MEDICATIONS] Erro:', error?.message);
          console.log('🔄 [REALTIME-MEDICATIONS] Ativando polling fallback...');
        }
      });

    // ⏰ POLLING FALLBACK
    pollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        console.log('🔄 [MEDICATIONS-POLLING] Verificando atualizações...');
        await syncMedicationsFromSupabase();
      } catch (err) {
        console.error('❌ [MEDICATIONS-POLLING] Erro:', err);
      }
    }, 10000); // 10 segundos

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(medicationsChannel);
      console.log('🛑 Realtime sync de medicamentos finalizado');
    };
  }, []);
};
