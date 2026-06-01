export const Role = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const SubscriptionStatus = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const InviteStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
} as const;

export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];
