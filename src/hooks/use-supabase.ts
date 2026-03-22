import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Hook para obter o cliente Supabase inicializado de forma segura
export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeSupabase() {
      try {
        // Importar a função de inicialização
        const { initSupabase } = await import('@/integrations/supabase/client');
        const client = await initSupabase();

        if (isMounted) {
          setSupabase(client);
          console.log('[useSupabase] ✅ Supabase inicializado com sucesso');
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('[useSupabase] ❌ Erro ao inicializar Supabase:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  return { supabase, loading, error };
}
