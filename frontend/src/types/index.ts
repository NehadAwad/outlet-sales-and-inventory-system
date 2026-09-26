export type IsoDateString = string

export interface Outlet {
  id: string
  name: string
  code: string
  address: string | null
  isActive: boolean
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

export interface MenuItem {
  id: string
  name: string
  sku: string
  description: string | null
  basePrice: string
  isActive: boolean
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

export interface OutletMenuItem {
  id: string
  outletId: string
  menuItemId: string
  price: string
  isActive: boolean
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

export interface Inventory {
  id: string
  outletId: string
  menuItemId: string
  stockQty: number
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

export interface SaleItem {
  id: string
  saleId: string
  menuItemId: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export interface Sale {
  id: string
  outletId: string
  receiptNumber: string
  totalAmount: string
  createdAt: IsoDateString
  items?: SaleItem[]
}

export interface OutletMenuItemRow extends OutletMenuItem {
  menuItem?: MenuItem
}

export interface InventoryRow extends Inventory {
  menuItem?: MenuItem
}

export interface SaleItemRow extends SaleItem {
  menuItem?: Pick<MenuItem, 'id' | 'name' | 'sku'>
}

export interface SaleDetail extends Omit<Sale, 'items'> {
  items?: SaleItemRow[]
}

export interface RevenueByOutletRow {
  outletId: string
  outletName: string
  totalRevenue: string
}

export interface TopSellingItemRow {
  menuItemId: string
  name: string
  totalQuantity: number
  totalRevenue: string
}

export interface ApiSuccess<T> {
  success: true
  data?: T
  message?: string
}

export interface ApiErrorBody {
  success: false
  message: string
  errors?: unknown[]
}
