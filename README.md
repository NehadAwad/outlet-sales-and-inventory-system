# Outlet Sales and Inventory System

A small POS system for a business with several outlets. Head office keeps one master menu and decides which items each outlet sells and at what price. Each outlet has its own stock, records its own sales, and gets its own receipt numbers. There are also two simple reports: revenue per outlet and top-selling items.

## Live demo

- Web app: https://outlet-sales-inventory-system.vercel.app
- API: https://outlet-sales-inventory-system.onrender.com

The frontend is hosted on Vercel, the API on Render, and the database on Neon.

## Tech stack

- Backend: Node.js 20, Express 5, TypeORM, PostgreSQL, Zod
- Frontend: React 19, Vite, TypeScript, Tailwind CSS

The repo has two folders: `backend/` for the API and `frontend/` for the web app.

## Running it locally

You need Node.js 20 or newer and a PostgreSQL database. Docker is optional.

### With Docker

This starts Postgres, the API and the web app together:

```bash
git clone git@github.com:NehadAwad/outlet-sales-and-inventory-system.git
cd outlet-sales-and-inventory-system
docker compose up --build
```

Open http://localhost:8080 for the app. The API runs on http://localhost:5000 and migrations run automatically when the API container starts.

To stop everything, run `docker compose down`. Add `-v` if you also want to delete the database data.

### Without Docker

Set up the backend first. Copy the example env file and fill in your database details:

```bash
cd backend
cp .env.example .env
npm ci
npm run migration:run:dev
npm run dev
```

Then start the frontend in another terminal, from the repo root:

```bash
cp frontend/.env.example frontend/.env
npm ci --prefix frontend
npm run frontend:dev
```

Open http://localhost:5173.

If you want some sample data (two outlets, a few menu items and stock), run this after the migrations:

```bash
npm run seed --prefix backend
```

## API

All endpoints are under `/api/v1` and use JSON.

A successful response looks like `{ "success": true, "data": ..., "message": ... }`. If validation fails you get a 400 with `{ "success": false, "message": "...", "errors": [...] }`. Other errors use the usual status codes, for example 404 when something is not found and 409 for a duplicate outlet code or SKU.

There is no authentication yet, so don't expose the API publicly without adding some.

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/health` | Health check (not under `/api/v1`) |
| POST | `/api/v1/outlets` | Create an outlet |
| GET | `/api/v1/outlets` | List outlets |
| GET | `/api/v1/outlets/:outletId` | Get one outlet |
| PATCH | `/api/v1/outlets/:outletId` | Update an outlet |
| POST | `/api/v1/outlets/:outletId/menu-items` | Add a menu item to an outlet |
| GET | `/api/v1/outlets/:outletId/menu-items` | List an outlet's menu |
| PATCH | `/api/v1/outlets/:outletId/menu-items/:menuItemId` | Change an outlet's price or status for an item |
| DELETE | `/api/v1/outlets/:outletId/menu-items/:menuItemId` | Remove an item from an outlet |
| POST | `/api/v1/outlets/:outletId/inventory` | Set stock for an item |
| GET | `/api/v1/outlets/:outletId/inventory` | List stock |
| PATCH | `/api/v1/outlets/:outletId/inventory/:menuItemId` | Update stock for an item |
| POST | `/api/v1/outlets/:outletId/sales` | Create a sale |
| GET | `/api/v1/outlets/:outletId/sales` | List sales |
| GET | `/api/v1/outlets/:outletId/sales/:saleId` | Get a sale with its items |
| POST | `/api/v1/menu-items` | Create a master menu item |
| GET | `/api/v1/menu-items` | List master menu items |
| GET | `/api/v1/menu-items/:menuItemId` | Get one menu item |
| PATCH | `/api/v1/menu-items/:menuItemId` | Update a menu item |
| DELETE | `/api/v1/menu-items/:menuItemId` | Deactivate a menu item (it is not deleted) |
| GET | `/api/v1/reports/revenue-by-outlet` | Total revenue for each outlet |
| GET | `/api/v1/reports/outlets/:outletId/top-selling-items` | Top 5 items for an outlet by quantity |

Creating a sale:

```bash
curl -X POST "http://localhost:5000/api/v1/outlets/OUTLET_ID/sales" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":"MENU_ITEM_ID","quantity":2}]}'
```

Every item in the sale has to be assigned to that outlet and have enough stock, otherwise the whole sale is rejected.

## Database

The main tables are `outlets`, `menu_items`, `outlet_menu_items`, `inventories`, `sales`, `sale_items` and `receipt_sequences`.

The database itself also enforces a few rules:

- Outlet codes and SKUs are unique.
- An item can only be assigned to an outlet once, and has only one stock row per outlet.
- Receipt numbers are unique within an outlet.
- Stock can never go below zero.

The diagram and more detail are in [docs/erd.md](docs/erd.md).

## How the code is organised

Each feature in `backend/src/modules/` has the same files: routes, a controller, a service, a repository and a Zod validation file. Requests are validated in the route, the controller calls the service, and the service holds the business logic.

Sales are the important part. A sale runs inside one database transaction that locks the outlet's receipt counter and the stock rows it touches. Two sales at the same time can't get the same receipt number, and stock can't be oversold. See [docs/architecture.md](docs/architecture.md) for more.

## Other docs

- [docs/scaling-plan.md](docs/scaling-plan.md): what to change as the number of outlets and sales grows
- [docs/microservices-plan.md](docs/microservices-plan.md): how the app could be split into services later
- [docs/offline-pos-strategy.md](docs/offline-pos-strategy.md): how outlets could keep selling without internet
