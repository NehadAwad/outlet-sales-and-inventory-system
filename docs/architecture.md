# Architecture

This page explains how the backend is structured and how sales stay correct when several happen at once.

## Structure

The API is one Express app. Each feature lives in its own folder under `backend/src/modules/` (outlets, menu-items, outlet-menu, inventory, sales, reports), and every folder follows the same pattern:

- **routes**: defines the URLs and runs Zod validation on the params, body and query.
- **controller**: reads the validated input, calls the service and sends the response.
- **service**: holds the business rules, such as checking stock or allocating a receipt number.
- **repository**: runs the database queries through TypeORM.

A few shared pieces sit around this. `asyncHandler` passes errors from async handlers to Express. `error.middleware.ts` turns errors into JSON responses, and `notFound.middleware.ts` handles unknown URLs.

The frontend is a React app. It calls the API through `frontend/src/api/client.ts`, which reads the API address from `VITE_API_BASE_URL`.

## Creating a sale

Creating a sale changes several tables at once. It reserves a receipt number, reduces stock, and saves the sale with its line items. Either all of that happens or none of it does.

`createSale` in `sale.service.ts` does this with a single TypeORM transaction:

1. Open a transaction and check the outlet exists and is active.
2. Load the outlet's receipt counter and lock it.
3. Check that every item is assigned to the outlet and appears only once in the sale.
4. Load the stock rows for those items and lock them.
5. Check there is enough stock, then reduce it.
6. Save the sale and its items, and bump the receipt counter.
7. Commit. If anything fails along the way, roll everything back.

## Handling sales that happen at the same time

Two things could go wrong when two sales hit the same outlet together:

- Both read the same receipt counter and end up with the same receipt number.
- Both see enough stock for the last few items and sell more than exists.

Locking prevents both. The receipt counter row is locked with `pessimistic_write`, so the second sale waits until the first one commits and then sees the new number. The stock rows are locked the same way before they are checked and reduced.

The database also acts as a backstop. Receipt numbers are unique per outlet, and stock has a check constraint so it can't go below zero.

## Errors

- Invalid input returns 400 with the Zod error details.
- Known errors (not found, duplicate, not enough stock) are thrown as `ApiError` and return the matching status code.
- Anything unexpected is logged and returns a plain 500.
