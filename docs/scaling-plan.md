# Scaling plan

Rough planning notes for about 10 outlets and on the order of 100k sales per month. Not an SLA.

## Assumptions

- Shared PostgreSQL (e.g. Neon), one API deployment to start.
- Reads dominate catalog and reports; writes spike at checkout.
- Receipt numbers and stock stay strongly consistent per outlet.

## Database

- Use the provider pooler and cap app pool size.
- Indexes already cover common filters; use `EXPLAIN ANALYZE` on slow reports before adding more.
- Partition or archive old `sales` / `sale_items` when tables get large.
- Heavy analytics can use a read replica or summary tables so checkout stays on OLTP.

## Reporting

- Pre-aggregate revenue and top sellers (materialized views or nightly jobs) instead of scanning full history on every request.
- Always bound queries by time range and outlet.

## API

- Stateless Node instances scale horizontally if the DB keeps up.
- More replicas mean more concurrent writers; watch lock wait and connections on checkout.
- Client idempotency keys for sale retries help on flaky networks.

## Caching

- Short TTL for stable reads (menu list, outlet directory).
- Do not cache stock or checkout prices without a clear invalidation story.

## Operations

- Log `outletId`, `saleId`, `receiptNumber` where useful.
- Keep `GET /health` cheap.
- Run migrations on deploy before traffic.

## Related

- [architecture.md](./architecture.md)
- [erd.md](./erd.md)
