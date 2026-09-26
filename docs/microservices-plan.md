# Moving to microservices

The app is currently one service with the code split into clear modules. That is the right choice at this size. Microservices add a lot of deployment and monitoring work, so I would only split once the team or the load actually needs it.

## Current modules

- `outlets`: outlet details
- `menu-items`: the master menu
- `outlet-menu`: which items each outlet sells and at what price
- `inventory`: stock per outlet
- `sales`: checkout and receipt numbers
- `reports`: read-only totals

## How it could be split

| Service | Tables it owns |
|---------|----------------|
| Outlets | `outlets` |
| Catalog | `menu_items` |
| Outlet menu | `outlet_menu_items` |
| Inventory | `inventories` |
| Checkout | `sales`, `sale_items`, `receipt_sequences` |
| Reporting | its own summary tables |

Each table should have exactly one service that writes to it. Other services ask that service through its API or read a copy of the data. Two services should never write to the same table.

## How services would talk

- Plain HTTP calls when a service needs an answer right away.
- Events for things that can happen a little later. For example, checkout publishes a "sale completed" event and reporting updates its totals from it. To make this reliable, checkout saves the event in its own database in the same transaction as the sale (the outbox pattern), and a separate worker sends it to the message broker.

## The tricky part

Today one transaction creates the sale, reduces stock and takes the next receipt number. If checkout and inventory became separate services, that single transaction would no longer exist. You would need a saga instead: reserve stock, create the sale, and undo the reservation if the sale fails. That is much harder to get right.

So I would keep checkout, inventory and receipt numbers in one service.

## Suggested order

1. Stay with one service for now.
2. If something needs to move out first, make it reporting. It only reads data and can run on events.
3. Only split checkout and inventory if there is a strong reason to.
