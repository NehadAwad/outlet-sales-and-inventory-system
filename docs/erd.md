# Entity-relationship diagram

Relational model for the outlet POS backend (`backend/src/entities`). HQ holds the master menu; outlets get assignments, per-outlet prices, inventory, and sales with sequential receipt numbers.

## Static diagram

PNG copy for slides or PDFs: [ERD Diagram.png](./ERD%20Diagram.png)

![Entity-relationship diagram](./ERD%20Diagram.png)

## Integrity

Uniqueness:

- `outlets.code`
- `menu_items.sku`
- `outlet_menu_items (outletId, menuItemId)`
- `inventories (outletId, menuItemId)`
- `sales (outletId, receiptNumber)`
- `receipt_sequences.outletId` (one sequence row per outlet)

Referential actions (TypeORM):

- Outlet delete cascades to `outlet_menu_items`, `inventories`, `receipt_sequences`. Sales use `RESTRICT` on outlet delete.
- Menu item delete is `RESTRICT` where referenced.

Database rules:

- `inventories.stockQty >= 0` (`CHK_inventory_stock_non_negative`).

Reporting reads `sales` and `sale_items` joined to outlets and menu items, filtered by outlet and time as implemented in report repositories.
