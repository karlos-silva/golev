# Data Model

> Atualize conforme o schema evolui.

## Entidades Core

### users
- id (UUID, PK)
- email (text, unique)
- name (text)
- passwordHash (text)
- isActive (boolean)
- createdAt, updatedAt, deletedAt

### tenants
- id (UUID, PK)
- name (text)
- slug (text, unique)
- isActive (boolean)
- createdAt, updatedAt, deletedAt

### tenant_memberships
- id (UUID, PK)
- tenantId (FK → tenants)
- userId (FK → users)
- role (text: owner, admin, member)
- createdAt

### customers (billing)
- id (UUID, PK)
- tenantId (FK → tenants, unique)
- stripeCustomerId (text, unique)
- createdAt

### subscriptions
- id (UUID, PK)
- customerId (FK → customers)
- stripeSubscriptionId, stripePriceId
- status, currentPeriodStart, currentPeriodEnd
- createdAt, updatedAt

### refresh_tokens
- id (UUID, PK)
- userId (FK → users)
- tokenHash (text)
- expiresAt, createdAt, revokedAt

### token_blocklist
- id (UUID, PK)
- jti (text, unique)
- expiresAt, createdAt
