import { describe, it, expect } from 'bun:test';
import { createAdminVisit, isAdminPath } from './admin-visit';

describe('admin visit credential requirement', () => {
  it('requires credentials for the initial visit, even for an existing session', () => {
    expect(createAdminVisit().permits('admin-user')).toBe(false);
  });
  it('keeps access between pages during the same authenticated visit', () => {
    const visit = createAdminVisit();
    visit.authorize('admin-user');
    expect(visit.permits('admin-user')).toBe(true);
    expect(isAdminPath('/admin/historial')).toBe(true);
  });
  it('requires credentials again after leaving the panel', () => {
    const visit = createAdminVisit();
    visit.authorize('admin-user');
    visit.leave();
    expect(visit.permits('admin-user')).toBe(false);
    expect(isAdminPath('/')).toBe(false);
    expect(isAdminPath('/administrator')).toBe(false);
  });
  it('does not reuse access for another account or a new tab/reload', () => {
    const visit = createAdminVisit();
    visit.authorize('admin-user');
    expect(visit.permits('other-user')).toBe(false);
    expect(createAdminVisit().permits('admin-user')).toBe(false);
  });
});