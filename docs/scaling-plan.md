# Scaling plan

The current setup is fine for a few outlets. This page covers what I would change for around 10 outlets and about 100,000 sales a month, which works out to roughly 3,300 sales a day. These are rough planning numbers, not guarantees.

## Database

Postgres is where the pressure shows up first.

- Use the connection pooler from the hosting provider (Neon has one) and keep the app's pool small. Otherwise adding more API instances can use up all the database connections.
- The columns we filter on most already have indexes (`outletId`, `menuItemId`, `sales.createdAt`). Before adding more, check slow queries with `EXPLAIN ANALYZE`.
- `sales` and `sale_items` only ever grow. Once they get big, split them by month (Postgres partitioning) or move old data to an archive.

## Reports

Right now the reports add up every sale each time they run. That gets slow as data grows. Two fixes:

- Add a date range to the report endpoints so they don't scan the whole history.
- Keep pre-calculated totals, for example a summary table updated every night or a materialized view.

If reports get heavy, run them on a read replica so they don't slow down checkout.

## API

The API doesn't keep any state between requests, so you can run more copies behind a load balancer. Keep in mind that more copies means more sales competing for the same locks. Watch lock wait times before scaling up.

It would also help to let the client send an idempotency key with each sale. If a request times out and the client retries, the server can return the first sale instead of creating a second one.

## Caching

Things that rarely change, like the master menu and the outlet list, can be cached for a few minutes. Don't cache stock levels or prices used at checkout. Stale values there cause overselling or wrong totals.

## Operations

- Include `outletId`, `saleId` and `receiptNumber` in logs so problems are easy to trace.
- Keep `/health` fast and cheap.
- Run migrations during deploy, before new traffic reaches the new version.
