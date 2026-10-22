import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { adminVisit } from '@/lib/admin-visit';
import { closeAdminSession } from '@/lib/admin-session';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context, location }) => {
    if (adminVisit.permits(context.user.id)) return;
    await closeAdminSession(context.queryClient);
    throw redirect({ to: '/auth', search: { redirect: location.href } });
  },
  component: Outlet,
});