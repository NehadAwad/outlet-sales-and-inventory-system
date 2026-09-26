# Architecture

How the POS API is laid out and how checkout stays correct under concurrent requests.

## Layers

Traffic hits Express routers under `backend/src/modules/`:

```text
routes -> controllers -> services -> repositories -> TypeORM / PostgreSQL
            ^
      validate.middleware (Zod)
```

| Layer | Role |
|-------|------|
| Routes | HTTP paths; attach Zod schemas via `validate(...)`. |
| Controllers | Call services; return JSON via `ApiResponse`. |
| Services | Business rules and transactions. |
| Repositories | TypeORM queries per aggregate. |

Shared middleware: `error.middleware.ts`, `notFound.middleware.ts`, `asyncHandler`.

The React SPA calls the API through `frontend/src/api/client.ts` using `VITE_API_BASE_URL`.

## Sales transaction

`createSale` in `sale.service.ts` uses a TypeORM `QueryRunner`:

1. `connect()` and `startTransaction()`.
2. All reads/writes for that checkout use `queryRunner.manager`.
3. `commitTransaction()` on success; `rollbackTransaction()` on error; `release()` in `finally`.

## Concurrency

Risks at the same outlet: duplicate receipt numbers and overselling stock.

Mitigations in `createSale`:

- `ReceiptSequence` loaded with `pessimistic_write`. Unique `(outletId, receiptNumber)` on `sales` is a backstop.
- `Inventory` rows for line items locked with `pessimistic_write` before stock checks and decrements. `stockQty >= 0` is enforced in the database.

## Errors

- Validation: HTTP 400 with Zod issues.
- `ApiError`: mapped status (404, 409, etc.).
- Unexpected errors: logged; generic 500 response.

## Related

- [erd.md](./erd.md)
- [scaling-plan.md](./scaling-plan.md)
- [microservices-plan.md](./microservices-plan.md)
