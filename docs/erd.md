# Database design

The entities are in `backend/src/entities`. Head office owns the master menu. Each outlet picks items from it, sets its own price, keeps its own stock, and records its own sales.

![ERD diagram](./ERD%20Diagram.png)

## Tables

- `outlets`: the branches. Each has a unique code.
- `menu_items`: the master menu. Each item has a unique SKU and a base price.
- `outlet_menu_items`: which items an outlet sells and at what price.
- `inventories`: how many of each item an outlet has in stock.
- `sales`: one row per sale, with the receipt number and total.
- `sale_items`: the lines of a sale, with quantity, unit price and line total.
- `receipt_sequences`: one row per outlet that tracks the last receipt number used.

## Rules enforced by the database

- Outlet codes and SKUs are unique.
- An outlet can have each menu item assigned only once, and only one stock row per item.
- Receipt numbers are unique within an outlet.
- Stock (`stockQty`) can't be negative.

## What happens on delete

- Deleting an outlet also deletes its menu assignments, stock rows and receipt counter. It is blocked if the outlet has sales, so sales history is never lost.
- A menu item can't be deleted while an outlet, stock row or sale still uses it. The API deactivates items instead of deleting them.

## Reports

Both reports read from `sales` and `sale_items`. Revenue by outlet adds up all sales for each outlet. Top-selling items returns the five items an outlet has sold the most of. Neither report filters by date yet.
