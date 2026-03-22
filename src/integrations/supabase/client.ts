import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Carrega configuração em runtime (prioridade: config.json > variáveis de ambiente > valores padrão)
async function loadSupabaseConfig() {
  try {
    // Tentar carregar config.json (gerado em tempo de build)
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      console.log('[Supabase] ✅ Config carregada de /config.json');
      return {
        url: config.supabaseUrl,
        key: config.supabasePublishableKey,
      };
    }
  } catch (error) {
    console.warn('[Supabase] ⚠️  Não foi possível carregar /config.json:', error);
  }

  // Fallback para variáveis de ambiente (desenvolvimento local)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (envUrl && envKey) {
    console.log('[Supabase] ✅ Config carregada de variáveis de ambiente');
    return {
      url: envUrl,
      key: envKey,
    };
  }

  // Se nada funcionar, usar valores padrão (devem estar em config.json ou .env)
  console.warn('[Supabase] ⚠️  Usando config padrão (pode não funcionar)');
  return {
    url: 'https://towmfxficdkrgfwghcer.supabase.co',
    key: 'sb_live_O5iF9eHqrKkxQPvASr7RvxZcTwEm1hq1nJOvTKzAZjWOjdVCM3x4zFLu5wPOhXkc8aZxGOqL7sNR0qrXEY9L',
  };
}

// Armazena a promise para reuso
let supabasePromise: Promise<ReturnType<typeof createClient<Database>>> | null = null;

// Export função para inicializar (deve ser chamada na app)
export async function initSupabase() {
  if (!supabasePromise) {
    supabasePromise = loadSupabaseConfig().then(config => {
      if (!config.url || !config.key) {
        throw new Error('❌ supabaseUrl ou supabaseKey não foram configurados corretamente');
      }
      return createClient<Database>(config.url, config.key, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    });
  }
  return supabasePromise;
}

// Inicializar na importação (lazy-loaded)
export const supabase = (async () => {
  return initSupabase();
})();