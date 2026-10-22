// Deliberately memory-only: a reload or new tab requires credentials again.
export function createAdminVisit() {
  let userId: string | null = null;
  return {
    authorize(id: string) { userId = id; },
    permits(id: string) { return userId === id; },
    leave() { userId = null; },
  };
}

export const adminVisit = createAdminVisit();

export function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}