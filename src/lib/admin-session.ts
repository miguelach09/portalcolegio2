import type { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adminVisit } from './admin-visit';

let closing: Promise<void> | undefined;

export function closeAdminSession(queryClient: QueryClient): Promise<void> {
  adminVisit.leave();
  if (closing) return closing;
  closing = (async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) await supabase.auth.signOut({ scope: 'local' });
  })().finally(() => { closing = undefined; });
  return closing;
}