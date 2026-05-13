/**
 * Bestellingen opslag — localStorage CRUD.
 * Bij echte launch vervangen we dit door Supabase voor multi-device.
 */

export type OrderStatus = 'nieuw' | 'productie' | 'klaar'

export interface OrderProduct {
  name: string
  qty: number
}

export interface Order {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  customer: string
  phone: string
  products: OrderProduct[]
  price: number
  status: OrderStatus
  notes?: string
  createdAt: string // ISO timestamp
}

const KEY = 'bakepilot_orders'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getOrders(): Order[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

export function saveOrder(order: Order): void {
  if (!isClient()) return
  const existing = getOrders()
  const updated = [
    order,
    ...existing.filter((o) => o.id !== order.id),
  ]
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function deleteOrder(id: string): void {
  if (!isClient()) return
  const updated = getOrders().filter((o) => o.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function updateOrder(id: string, updates: Partial<Order>): void {
  if (!isClient()) return
  const existing = getOrders()
  const updated = existing.map((o) =>
    o.id === id ? { ...o, ...updates } : o
  )
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function newOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Bereken de volgende status in cycle: nieuw → productie → klaar → nieuw
 */
export function nextStatus(current: OrderStatus): OrderStatus {
  if (current === 'nieuw') return 'productie'
  if (current === 'productie') return 'klaar'
  return 'nieuw'
}
