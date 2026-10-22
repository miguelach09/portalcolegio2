import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { createAdminVisit, isAdminPath } from './admin-visit';

describe('admin visit credential requirement', () => {
  it('requires credentials for the initial visit, even for an existing session', () => {
    assert.equal(createAdminVisit().permits('admin-user'), false);
  });
  it('keeps access between pages during the same authenticated visit', () => {
    const visit = createAdminVisit();
    visit.authorize('admin-user');
    assert.equal(visit.permits('admin-user'), true);
    assert.equal(isAdminPath('/admin/historial'), true);
  });
  it('requires credentials again after leaving the panel', () => {
    const visit = createAdminVisit();
    visit.authorize('admin-user');
    visit.leave();
    assert.equal(visit.permits('admin-user'), false);
    assert.equal(isAdminPath('/'), false);
    assert.equal(isAdminPath('/administrator'), false);
  });
  it('does not reuse access for another account or a new tab/reload', () => {
    const visit = createAdminVisit();
    visit.authorize('admin-user');
    assert.equal(visit.permits('other-user'), false);
    assert.equal(createAdminVisit().permits('admin-user'), false);
  });
});