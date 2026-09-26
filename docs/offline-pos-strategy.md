# Offline POS

The goal is to let an outlet keep selling when its internet drops, then send those sales to the server once it's back. When that happens there should be no duplicate sales and no wrong stock numbers.

## Saving sales on the device

The POS app stores pending sales locally, for example in IndexedDB in the browser or SQLite in a desktop app. For each sale it keeps the items, quantities, time and sync status. It can also keep a copy of the outlet's menu and prices, so staff can still see them offline.

## Avoiding duplicates

Each offline sale gets an ID generated on the device. The server stores that ID with the sale it created. If the same sale is sent again, for example after a timeout, the server returns the existing sale instead of creating a new one.

## Syncing

1. When the connection comes back, the app sends pending sales one at a time, oldest first.
2. The server handles each one exactly like an online sale: same transaction, same stock checks, same receipt numbering.
3. On success, the app marks the sale as synced and saves the receipt number it got back.
4. If the server fails (a 5xx error), the app waits and tries again.
5. If the server rejects the sale (a 4xx error, for example not enough stock), the app stops retrying and shows it to staff to fix.

## Conflicts

The most likely problem is stock. While the device was offline, other sales may have used up the stock. The server will reject those sales and staff need to adjust or cancel them. Prices can also change while offline. The business needs to decide whether to accept the offline price or reject the sale.

## Kitchen display

If the POS is offline, the kitchen display won't get new orders until it reconnects. It should show when it was last updated so staff know it may be out of date.

## Security

Give each device its own token tied to its outlet. Rate limit the sync endpoint. Log duplicate and rejected sales so they can be checked later.
