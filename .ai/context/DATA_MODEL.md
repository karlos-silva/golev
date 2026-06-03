# Data Model

> Atualize conforme o schema evolui.

## Entidades Core

### users
- id (UUID, PK)
- email (text, unique)
- name (text)
- passwordHash (text)
- role (text: member, ...) — default `member`
- isActive (boolean)
- createdAt, updatedAt, deletedAt

### customers (billing)
- id (UUID, PK)
- userId (FK → users, unique)
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
