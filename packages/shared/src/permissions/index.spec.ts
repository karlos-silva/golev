import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  permissionForPath,
  portalHome,
  Permission,
  ROLE_PERMISSIONS,
} from './index';
import { AppRole } from '../domain/roles';

describe('RBAC do portal (matriz papel→capability)', () => {
  it('admin tem todas as capabilities (incl. gestão)', () => {
    for (const p of Object.values(Permission)) {
      expect(hasPermission(AppRole.ADMIN, p)).toBe(true);
    }
  });

  it('doctor tem só o operacional, nunca a gestão', () => {
    expect(hasPermission(AppRole.DOCTOR, Permission.VIEW_PATIENTS)).toBe(true);
    expect(hasPermission(AppRole.DOCTOR, Permission.VIEW_LEADS)).toBe(true);
    expect(hasPermission(AppRole.DOCTOR, Permission.MANAGE_APPOINTMENTS)).toBe(true);
    expect(hasPermission(AppRole.DOCTOR, Permission.MANAGE_REQUESTS)).toBe(true);
    // Gestão é exclusiva do admin.
    expect(hasPermission(AppRole.DOCTOR, Permission.VIEW_DASHBOARD)).toBe(false);
    expect(hasPermission(AppRole.DOCTOR, Permission.MANAGE_BILLING)).toBe(false);
    expect(hasPermission(AppRole.DOCTOR, Permission.MANAGE_SETTINGS)).toBe(false);
  });

  it('patient e papéis desconhecidos/ausentes não têm capability de portal', () => {
    expect(ROLE_PERMISSIONS[AppRole.PATIENT]).toEqual([]);
    expect(hasPermission(AppRole.PATIENT, Permission.VIEW_PATIENTS)).toBe(false);
    expect(hasPermission(null, Permission.VIEW_PATIENTS)).toBe(false);
    expect(hasPermission(undefined, Permission.VIEW_DASHBOARD)).toBe(false);
    expect(hasPermission('intruso', Permission.VIEW_DASHBOARD)).toBe(false);
  });

  it('permissionForPath mapeia área→capability, inclusive subrotas', () => {
    expect(permissionForPath('/dashboard')).toBe(Permission.VIEW_DASHBOARD);
    expect(permissionForPath('/clients/123')).toBe(Permission.VIEW_PATIENTS);
    expect(permissionForPath('/settings')).toBe(Permission.MANAGE_SETTINGS);
    expect(permissionForPath('/billing')).toBe(Permission.MANAGE_BILLING);
    expect(permissionForPath('/login')).toBeNull();
  });

  it('portalHome: admin→/dashboard, doctor→/clients', () => {
    expect(portalHome(AppRole.ADMIN)).toBe('/dashboard');
    expect(portalHome(AppRole.DOCTOR)).toBe('/clients');
  });
});
