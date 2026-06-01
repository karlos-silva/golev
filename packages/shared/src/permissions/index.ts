import type { Role } from '../domain/index';

export const Permission = {
  MANAGE_BILLING: 'manage:billing',
  MANAGE_MEMBERS: 'manage:members',
  MANAGE_SETTINGS: 'manage:settings',
  VIEW_ANALYTICS: 'view:analytics',
  CREATE_CONTENT: 'create:content',
  EDIT_CONTENT: 'edit:content',
  DELETE_CONTENT: 'delete:content',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: Object.values(Permission),
  admin: [
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
  ],
  member: [
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
