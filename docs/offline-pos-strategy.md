# Offline POS strategy

Keep the register usable without network, then sync sales without duplicate receipts or silent stock errors. Server rules should match online checkout (`sale.service.ts`).

## Client storage

Local durable store (SQLite, IndexedDB) for:

- pending sale payloads and sync state,
- optional catalog snapshot with a "as of" timestamp.

## Idempotency

Each offline sale gets a client UUID (`Idempotency-Key` or body field). Server stores key, outletId, resulting `saleId`. Retries return the existing sale.

## Sync flow

1. Upload pending sales when online (FIFO or priority).
2. Server runs the same transaction as online: lock receipt sequence, validate assignment, lock inventory, decrement, insert sale lines.
3. Client marks synced and stores `receiptNumber` / `saleId`.
4. Retry 5xx with backoff.
5. On 4xx (stock, assignment), mark failed locally and let staff fix the draft.

## Conflicts

Stock can drop while offline. Show a clear message and require staff to adjust lines.

Price policy: snapshot offline or reject if live pricing is required.

## KDS

Online: optional WebSocket for tickets. Offline POS may not reach KDS until reconnect; show staleness. Offline KDS is usually read-only or disabled.

## Security

Outlet-scoped device tokens, rate limits on sync, audit idempotency hits.

## Summary

Local queue + server idempotency + the same transactional checkout as online. Conflict UX is the hard part.
