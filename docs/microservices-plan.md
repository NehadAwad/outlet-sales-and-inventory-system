# Microservices conversion plan

The repo is a modular monolith. Folders map to possible service boundaries later. Split only when team size or isolation needs justify the ops cost.

## Modules today

| Module | Responsibility |
|--------|----------------|
| outlets | Outlet CRUD |
| menu-items | HQ catalog |
| outlet-menu | Assign items and outlet prices |
| inventory | Per-outlet stock |
| sales | Checkout, receipts, sale lines |
| reports | Read-only aggregates |

## Possible services

| Service | Owns | Notes |
|---------|------|-------|
| Outlet registry | outlets | Outlet identity |
| Catalog | menu_items | HQ SKUs |
| Outlet menu | outlet_menu_items | What sells where |
| Inventory | inventories | Stock rows |
| Sales / checkout | sales, sale_items, receipt_sequences | One consistency boundary |
| Reporting | aggregates | Event-driven read models |

## Integration

- Sync HTTP for request/response paths that need an immediate answer.
- Async outbox + broker for analytics (`SaleCompleted`, etc.).

## Data ownership

One writer per table. No dual writes across services.

Sales, receipt sequences, and inventory deduction share one transaction today. Splitting them means a checkout service or a saga with idempotency.

## Practical path

1. Stay monolith until load or team boundaries force a change.
2. Reporting is often the first extract (read-only, event-driven).
3. Keep checkout, inventory, and receipt sequencing together unless there is a strong reason to separate.
