import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null;
  loading: boolean;
  error: Error | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeSupabase() {
      try {
        const { initSupabase } = await import('@/integrations/supabase/client');
        const client = await initSupabase();

        if (isMounted) {
          setSupabase(client);
          console.log('[SupabaseProvider] ✅ Supabase inicializado com sucesso');
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('[SupabaseProvider] ❌ Erro ao inicializar:', error.message);
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

  return (
    <SupabaseContext.Provider value={{ supabase, loading, error }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseContext deve ser usado dentro de um SupabaseProvider');
  }
  return context;
}
