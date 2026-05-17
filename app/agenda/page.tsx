'use client'

/**
 * Bestellingen / Agenda pagina — volledig werkend met localStorage.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  getOrders,
  saveOrder,
  deleteOrder,
  updateOrder,
  newOrderId,
  nextStatus,
  type Order,
  type OrderStatus,
} from '@/lib/orders'

const STATUS_LABELS: Record<OrderStatus, string> = {
  nieuw: 'Nieuw',
  productie: 'In productie',
  klaar: 'Klaar voor afhaling',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  nieuw: 'bg-blue-50 text-blue-700 border-blue-200',
  productie: 'bg-amber-50 text-amber-700 border-amber-200',
  klaar: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

type View = 'dag' | 'week' | 'maand' | 'klanten'

const WEEKDAYS_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const WEEKDAYS_SHORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function todayISO(): string {
  return isoDate(new Date())
}

export default function AgendaPage() {
  const [view, setView] = useState<View>('dag')
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [orders, setOrders] = useState<Order[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Form state
  const [formCustomer, setFormCustomer] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formDate, setFormDate] = useState(todayISO())
  const [formTime, setFormTime] = useState('09:00')
  const [formProducts, setFormProducts] = useState<{ name: string; qty: number }[]>([
    { name: '', qty: 1 },
  ])
  const [formNotes, setFormNotes] = useState('')
  const [formPrice, setFormPrice] = useState('')

  // Laad orders op mount
  useEffect(() => {
    setOrders(getOrders())
  }, [])

  function refresh() {
    setOrders(getOrders())
  }

  // ── Computed ───────────────────────────────────────────
  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate])
  const dateLabel = useMemo(() => {
    const d = selectedDateObj
    const weekday = WEEKDAYS_NL[d.getDay()]
    const day = d.getDate()
    const month = MONTHS_NL[d.getMonth()]
    const year = d.getFullYear()
    return { weekday, formatted: `${day} ${month} ${year}` }
  }, [selectedDateObj])

  const dayOrders = useMemo(
    () =>
      orders
        .filter((o) => o.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [orders, selectedDate]
  )

  const stats = useMemo(() => {
    const todayList = orders.filter((o) => o.date === selectedDate)
    return {
      today: todayList.length,
      inProductie: todayList.filter((o) => o.status === 'productie').length,
      revenue: todayList.reduce((sum, o) => sum + o.price, 0),
    }
  }, [orders, selectedDate])

  const customers = useMemo(() => {
    return Array.from(
      orders
        .reduce((map, o) => {
          const existing = map.get(o.customer)
          map.set(o.customer, {
            name: o.customer,
            phone: o.phone,
            orderCount: (existing?.orderCount ?? 0) + 1,
            totalSpent: (existing?.totalSpent ?? 0) + o.price,
            lastOrderDate: existing
              ? o.date > existing.lastOrderDate
                ? o.date
                : existing.lastOrderDate
              : o.date,
          })
          return map
        }, new Map<string, { name: string; phone: string; orderCount: number; totalSpent: number; lastOrderDate: string }>())
        .values()
    ).sort((a, b) => b.orderCount - a.orderCount)
  }, [orders])

  // Week info (rond geselecteerde datum)
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate)
    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay() // ma=1, zo=7
    const monday = new Date(d)
    monday.setDate(d.getDate() - dayOfWeek + 1)
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      return {
        date: isoDate(day),
        short: WEEKDAYS_SHORT[day.getDay()],
        dayNum: day.getDate(),
        month: day.getMonth(),
      }
    })
  }, [selectedDate])

  // Maand info
  const monthInfo = useMemo(() => {
    const d = new Date(selectedDate)
    const year = d.getFullYear()
    const month = d.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const lastOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastOfMonth.getDate()
    // Eerste-dag offset (ma=0)
    const startDayOfWeek = (firstOfMonth.getDay() + 6) % 7
    return {
      year,
      month,
      monthName: MONTHS_NL[month],
      daysInMonth,
      startDayOfWeek,
    }
  }, [selectedDate])

  // ── Acties ──────────────────────────────────────────────
  function openNewForm() {
    setFormCustomer('')
    setFormPhone('')
    setFormDate(selectedDate)
    setFormTime('09:00')
    setFormProducts([{ name: '', qty: 1 }])
    setFormNotes('')
    setFormPrice('')
    setEditingOrder(null)
    setShowForm(true)
  }

  function openEditForm(order: Order) {
    setFormCustomer(order.customer)
    setFormPhone(order.phone)
    setFormDate(order.date)
    setFormTime(order.time)
    setFormProducts(order.products.length > 0 ? order.products : [{ name: '', qty: 1 }])
    setFormNotes(order.notes ?? '')
    setFormPrice(String(order.price))
    setEditingOrder(order)
    setSelectedOrder(null)
    setShowForm(true)
  }

  function handleSubmit() {
    if (!formCustomer.trim()) {
      alert('Vul een klantnaam in')
      return
    }
    const validProducts = formProducts.filter((p) => p.name.trim().length > 0)
    if (validProducts.length === 0) {
      alert('Voeg minstens één product toe')
      return
    }
    const priceNum = parseFloat(formPrice.replace(',', '.')) || 0

    if (editingOrder) {
      // Update bestaande
      const updated: Order = {
        ...editingOrder,
        customer: formCustomer.trim(),
        phone: formPhone.trim(),
        date: formDate,
        time: formTime,
        products: validProducts,
        notes: formNotes.trim() || undefined,
        price: priceNum,
      }
      saveOrder(updated)
    } else {
      // Nieuwe order
      const order: Order = {
        id: newOrderId(),
        customer: formCustomer.trim(),
        phone: formPhone.trim(),
        date: formDate,
        time: formTime,
        products: validProducts,
        notes: formNotes.trim() || undefined,
        price: priceNum,
        status: 'nieuw',
        createdAt: new Date().toISOString(),
      }
      saveOrder(order)
    }
    refresh()
    setShowForm(false)
    setEditingOrder(null)
  }

  function handleStatusChange(order: Order) {
    const next = nextStatus(order.status)
    updateOrder(order.id, { status: next })
    refresh()
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...order, status: next })
    }
  }

  function handleDelete() {
    if (!selectedOrder) return
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      setTimeout(() => setDeleteConfirm(false), 4000)
      return
    }
    deleteOrder(selectedOrder.id)
    refresh()
    setSelectedOrder(null)
    setDeleteConfirm(false)
  }

  function addProductRow() {
    setFormProducts((prev) => [...prev, { name: '', qty: 1 }])
  }

  function updateProduct(i: number, field: 'name' | 'qty', value: string | number) {
    setFormProducts((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
    )
  }

  function removeProductRow(i: number) {
    setFormProducts((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Agenda" />

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* DATUM + VIEW SWITCHER */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-muted text-xs uppercase tracking-wider font-bold capitalize">
                {dateLabel.weekday}
              </p>
              <h1 className="text-espresso text-2xl font-bold">
                {dateLabel.formatted}
              </h1>
            </div>
            <button
              onClick={openNewForm}
              className="flex items-center gap-1.5 bg-warm text-white text-xs font-bold px-3 py-2.5 rounded-full shadow-md active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nieuwe bestelling
            </button>
          </div>

          {/* View tabs */}
          <div className="grid grid-cols-4 gap-2 bg-warm-bg/40 rounded-2xl p-1">
            {(['dag', 'week', 'maand', 'klanten'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs font-bold py-2.5 rounded-xl transition-colors capitalize ${
                  view === v
                    ? 'bg-white text-warm shadow-sm'
                    : 'text-muted hover:text-espresso'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="bg-warm-bg rounded-2xl p-3">
            <p className="text-muted text-[10px] uppercase tracking-wider font-bold mb-1">
              Vandaag
            </p>
            <p className="text-espresso text-2xl font-bold tabular-nums">
              {stats.today}
            </p>
            <p className="text-muted text-[10px]">bestellingen</p>
          </div>
          <div className="bg-warm-bg rounded-2xl p-3">
            <p className="text-muted text-[10px] uppercase tracking-wider font-bold mb-1">
              In oven
            </p>
            <p className="text-warm text-2xl font-bold tabular-nums">
              {stats.inProductie}
            </p>
            <p className="text-muted text-[10px]">in productie</p>
          </div>
          <div className="bg-warm-bg rounded-2xl p-3">
            <p className="text-muted text-[10px] uppercase tracking-wider font-bold mb-1">
              Omzet
            </p>
            <p className="text-espresso text-2xl font-bold tabular-nums">
              €{stats.revenue.toFixed(0)}
            </p>
            <p className="text-muted text-[10px]">verwacht</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── DAG VIEW ── */}
          {view === 'dag' && (
            <motion.div
              key="dag"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <h2 className="text-warm text-xs uppercase tracking-wider font-bold">
                Tijdlijn
              </h2>
              {dayOrders.length === 0 ? (
                <div className="bg-warm-bg/60 rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-muted text-sm mb-4">
                    Geen bestellingen voor deze dag
                  </p>
                  <button
                    onClick={openNewForm}
                    className="bg-warm text-white text-sm font-bold px-5 py-2.5 rounded-full"
                  >
                    + Voeg bestelling toe
                  </button>
                </div>
              ) : (
                dayOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-warm-bg shadow-sm rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-left p-4 active:bg-warm-bg/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-center w-14">
                          <p className="text-espresso text-lg font-bold tabular-nums">
                            {order.time}
                          </p>
                        </div>
                        <div className="w-px bg-warm-bg self-stretch" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-espresso font-semibold text-sm">
                              {order.customer}
                            </p>
                            <span
                              className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                STATUS_COLORS[order.status]
                              }`}
                            >
                              {STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <ul className="text-muted text-xs space-y-0.5">
                            {order.products.map((p, idx) => (
                              <li key={idx}>
                                {p.qty}× {p.name}
                              </li>
                            ))}
                          </ul>
                          {order.notes && (
                            <p className="text-warm text-[11px] italic mt-1.5">
                              💬 {order.notes}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-warm font-bold text-sm">
                              €{order.price.toFixed(2)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(order)
                              }}
                              className="text-xs text-muted hover:text-warm font-semibold"
                            >
                              Status →
                            </button>
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ── WEEK VIEW ── */}
          {view === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <h2 className="text-warm text-xs uppercase tracking-wider font-bold">
                Deze week
              </h2>
              {weekDays.map((d) => {
                const dayOrders = orders.filter((o) => o.date === d.date)
                const isSelected = d.date === selectedDate
                return (
                  <button
                    key={d.date}
                    onClick={() => {
                      setSelectedDate(d.date)
                      setView('dag')
                    }}
                    className={`w-full text-left rounded-2xl p-3 border transition-all ${
                      isSelected
                        ? 'bg-warm text-white border-warm shadow-md'
                        : dayOrders.length > 0
                          ? 'bg-white border-warm-bg hover:border-warm/30'
                          : 'bg-warm-bg/30 border-warm-bg/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold capitalize ${isSelected ? 'text-white' : 'text-espresso'}`}>
                        {d.short} {d.dayNum} {MONTHS_NL[d.month].slice(0, 3)}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                        {dayOrders.length === 0 ? 'leeg' : `${dayOrders.length} bestelling${dayOrders.length > 1 ? 'en' : ''}`}
                      </span>
                    </div>
                    {dayOrders.length > 0 && !isSelected && (
                      <div className="flex gap-1 mt-2">
                        {dayOrders.slice(0, 5).map((o) => (
                          <span
                            key={o.id}
                            className={`block w-2 h-2 rounded-full ${
                              o.status === 'nieuw'
                                ? 'bg-blue-400'
                                : o.status === 'productie'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* ── MAAND VIEW ── */}
          {view === 'maand' && (
            <motion.div
              key="maand"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <h2 className="text-warm text-xs uppercase tracking-wider font-bold capitalize">
                {monthInfo.monthName} {monthInfo.year}
              </h2>
              <div className="bg-white border border-warm-bg rounded-3xl p-3">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map((d, i) => (
                    <div key={i} className="text-center text-muted text-[10px] font-bold uppercase py-2">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: monthInfo.startDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: monthInfo.daysInMonth }, (_, i) => {
                    const day = i + 1
                    const date = `${monthInfo.year}-${(monthInfo.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                    const dayOrders = orders.filter((o) => o.date === date)
                    const isSelected = date === selectedDate
                    const busy = dayOrders.length
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDate(date)
                          setView('dag')
                        }}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-warm text-white shadow-md'
                            : busy > 0
                              ? 'bg-warm-bg hover:bg-warm-bg/80 text-espresso'
                              : 'hover:bg-warm-bg/50 text-espresso'
                        }`}
                      >
                        <span className="text-sm font-semibold">{day}</span>
                        {busy > 0 && (
                          <span className={`text-[9px] font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-warm'}`}>
                            {busy}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── KLANTEN VIEW ── */}
          {view === 'klanten' && (
            <motion.div
              key="klanten"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-warm text-xs uppercase tracking-wider font-bold">
                  Klanten ({customers.length})
                </h2>
                <span className="text-muted text-[10px]">
                  Op aantal bestellingen
                </span>
              </div>
              {customers.length === 0 ? (
                <div className="bg-warm-bg/60 rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-2">👥</p>
                  <p className="text-muted text-sm">
                    Nog geen klanten — klanten verschijnen hier automatisch zodra je bestellingen invoert.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customers.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white border border-warm-bg shadow-sm rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-warm text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {c.name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-espresso font-semibold text-sm truncate">
                              {c.name}
                            </p>
                            <p className="text-muted text-xs">{c.phone || 'geen telefoon'}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-warm font-bold text-sm">
                            €{c.totalSpent.toFixed(0)}
                          </p>
                          <p className="text-muted text-[10px]">
                            {c.orderCount}× bestellingen
                          </p>
                        </div>
                      </div>
                      <p className="text-muted text-[10px] mt-2 pt-2 border-t border-warm-bg">
                        Laatste bestelling:{' '}
                        {new Date(c.lastOrderDate).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-espresso/60 z-50 print:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-20 max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="bg-warm p-5 text-white">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center print:hidden"
                  aria-label="Sluiten"
                >
                  ✕
                </button>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">
                  Bestelling
                </p>
                <h2 className="text-2xl font-bold">
                  {selectedOrder.customer}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {new Date(selectedOrder.date).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}
                  · {selectedOrder.time}
                </p>
                {selectedOrder.phone && (
                  <p className="text-white/70 text-xs mt-1">{selectedOrder.phone}</p>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-warm text-xs uppercase tracking-wider font-bold mb-2">
                    Producten
                  </p>
                  <ul className="space-y-1.5">
                    {selectedOrder.products.map((p, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-espresso">{p.name}</span>
                        <span className="text-muted">×{p.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <p className="text-warm text-xs uppercase tracking-wider font-bold mb-2">
                      Notitie
                    </p>
                    <p className="text-espresso text-sm bg-warm-bg/60 rounded-xl p-3">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
                <div className="bg-warm-bg rounded-2xl p-4 text-center">
                  <p className="text-muted text-xs uppercase tracking-wider font-bold mb-1">
                    Totaal
                  </p>
                  <p className="text-warm text-3xl font-bold">
                    €{selectedOrder.price.toFixed(2)}
                  </p>
                </div>

                <span
                  className={`block text-center text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full border ${
                    STATUS_COLORS[selectedOrder.status]
                  }`}
                >
                  {STATUS_LABELS[selectedOrder.status]}
                </span>

                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={() => handleStatusChange(selectedOrder)}
                    className="flex-1 bg-warm text-white font-bold py-3 rounded-full text-sm"
                  >
                    Status →
                  </button>
                  <button
                    onClick={() => openEditForm(selectedOrder)}
                    className="bg-warm-bg text-warm font-bold py-3 px-4 rounded-full border border-warm/30 hover:bg-warm-bg/80"
                    aria-label="Bewerken"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-warm-bg text-warm font-bold py-3 px-4 rounded-full border border-warm/30 hover:bg-warm-bg/80"
                    aria-label="Print bestelbon"
                  >
                    🖨️
                  </button>
                </div>

                <button
                  onClick={handleDelete}
                  className={`w-full font-bold py-2.5 rounded-full text-sm transition-colors print:hidden ${
                    deleteConfirm
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-muted/70 hover:text-red-600'
                  }`}
                >
                  {deleteConfirm
                    ? 'Klik nogmaals om te bevestigen'
                    : '🗑️ Bestelling verwijderen'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── FORM MODAL (nieuw + bewerken) ─── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-espresso/60 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-12 max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-5 border-b border-warm-bg flex items-center justify-between z-10">
                <h2 className="text-espresso text-lg font-bold">
                  {editingOrder ? 'Bestelling bewerken' : 'Nieuwe bestelling'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-warm-bg flex items-center justify-center text-muted"
                  aria-label="Sluiten"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Klantnaam *
                  </label>
                  <input
                    type="text"
                    value={formCustomer}
                    onChange={(e) => setFormCustomer(e.target.value)}
                    placeholder="bijv. Mevr. Janssen"
                    className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso mt-1 text-sm focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Telefoonnummer
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="06-12345678"
                    className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso mt-1 text-sm focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Datum *
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso mt-1 text-sm focus:outline-none focus:border-warm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Ophaaltijd *
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso mt-1 text-sm focus:outline-none focus:border-warm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Producten *
                  </label>
                  <div className="space-y-2 mt-1">
                    {formProducts.map((p, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updateProduct(i, 'name', e.target.value)}
                          placeholder="Productnaam"
                          className="flex-1 bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso text-sm focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                        />
                        <input
                          type="number"
                          value={p.qty}
                          onChange={(e) => updateProduct(i, 'qty', parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-20 bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso text-sm focus:outline-none focus:border-warm"
                        />
                        {formProducts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductRow(i)}
                            className="text-muted hover:text-red-500 p-2"
                            aria-label="Verwijder product"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addProductRow}
                      className="text-warm text-sm font-bold"
                    >
                      + Nog een product
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Notitie (optioneel)
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder='bijv. Met "Lieve Mama 65 jaar" erop'
                    rows={3}
                    className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso mt-1 text-sm resize-none focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Prijs (€) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formPrice}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return
                      setFormPrice(raw)
                    }}
                    placeholder="0,00"
                    className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso mt-1 text-sm focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-warm text-white font-bold py-3.5 rounded-full"
                >
                  {editingOrder ? 'Wijzigingen opslaan' : 'Bestelling opslaan'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
