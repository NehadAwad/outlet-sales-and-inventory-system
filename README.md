# Outlet Sales and Inventory System

Multi-outlet POS: HQ master menu, per-outlet pricing and stock, sales with sequential receipts, and basic reporting.

## Live deployment

Web app: https://outlet-sales-inventory-system.vercel.app

API: https://outlet-sales-inventory-system.onrender.com

The UI is a static SPA on Vercel. The API runs on Render with Neon Postgres.

## Stack

| Layer | Tech |
|-------|------|
| API | Node 20+, Express 5, TypeORM, PostgreSQL, Zod |
| UI | React 19, Vite, TypeScript, Tailwind CSS |
| Layout | Monorepo: `backend/`, `frontend/` |

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL (local, Docker Compose, or hosted e.g. Neon)
- Docker (optional) for the full local stack

## Quick start

Docker (Postgres + API + Nginx UI):

```bash
git clone git@github.com:NehadAwad/outlet-sales-and-inventory-system.git
cd outlet-sales-and-inventory-system
docker compose up --build
```

- UI: http://localhost:8080
- API health: http://localhost:5000/health

Local Node (bring your own Postgres):

```bash
cd backend && cp .env.example .env && npm ci && npm run migration:run:dev && npm run dev
```

Second terminal:

```bash
cp frontend/.env.example frontend/.env
# VITE_API_BASE_URL=http://localhost:5000/api/v1
npm run frontend:dev
```

Open http://localhost:5173. Optional seed: `npm run seed --prefix backend` while the API is running.

## API

Base path: `/api/v1`. JSON request and response bodies.

Success shape: `{ "success": true, "data": ..., "message": ... }`. Validation errors: `{ "success": false, "message": "...", "errors": ... }` with HTTP 400.

There is no built-in auth. Add API keys or JWT before production use.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness (no `/api/v1` prefix) |
| POST | `/api/v1/outlets` | Create outlet |
| GET | `/api/v1/outlets` | List outlets |
| GET | `/api/v1/outlets/:outletId` | Get outlet |
| PATCH | `/api/v1/outlets/:outletId` | Update outlet |
| POST | `/api/v1/outlets/:outletId/menu-items` | Assign menu item |
| GET | `/api/v1/outlets/:outletId/menu-items` | List outlet menu |
| PATCH | `/api/v1/outlets/:outletId/menu-items/:menuItemId` | Update assignment |
| DELETE | `/api/v1/outlets/:outletId/menu-items/:menuItemId` | Remove assignment |
| POST | `/api/v1/outlets/:outletId/inventory` | Create/update stock |
| GET | `/api/v1/outlets/:outletId/inventory` | List inventory |
| PATCH | `/api/v1/outlets/:outletId/inventory/:menuItemId` | Update stock |
| POST | `/api/v1/outlets/:outletId/sales` | Create sale |
| GET | `/api/v1/outlets/:outletId/sales` | List sales |
| GET | `/api/v1/outlets/:outletId/sales/:saleId` | Get sale with lines |
| POST | `/api/v1/menu-items` | Create menu item |
| GET | `/api/v1/menu-items` | List menu items |
| GET | `/api/v1/menu-items/:menuItemId` | Get menu item |
| PATCH | `/api/v1/menu-items/:menuItemId` | Update menu item |
| DELETE | `/api/v1/menu-items/:menuItemId` | Soft-delete menu item |
| GET | `/api/v1/reports/revenue-by-outlet` | Revenue by outlet |
| GET | `/api/v1/reports/outlets/:outletId/top-selling-items` | Top sellers |

Example sale:

```bash
curl -sS -X POST "http://localhost:5000/api/v1/outlets/OUTLET_UUID/sales" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":"MENU_ITEM_UUID","quantity":2}]}'
```

## Schema

Tables: outlets, menu_items, outlet_menu_items, inventories, sales, sale_items, receipt_sequences.

Notable constraints: unique outlet code and SKU; unique (outletId, menuItemId) on assignments and inventory; unique (outletId, receiptNumber) on sales; `stockQty >= 0` check on inventory.

See [docs/erd.md](docs/erd.md) and [docs/ERD Diagram.png](docs/ERD%20Diagram.png).

## Architecture notes

- Routes validate with Zod; controllers call services; services use repositories.
- Sale creation runs in one transaction with pessimistic locks on receipt sequence and inventory rows.

More detail: [docs/architecture.md](docs/architecture.md).

## Further reading

- [docs/scaling-plan.md](docs/scaling-plan.md)
- [docs/microservices-plan.md](docs/microservices-plan.md)
- [docs/offline-pos-strategy.md](docs/offline-pos-strategy.md)
