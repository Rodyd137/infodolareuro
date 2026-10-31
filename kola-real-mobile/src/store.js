// Estado de la app guardado en el teléfono (AsyncStorage).
// En producción, estas acciones llaman a la API (Supabase/Firebase) en vez de guardar localmente.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productById } from './data';

const KEY = 'kr-negocios-v1';
const initial = { session: null, orders: [], reports: [], cart: {} };
const Ctx = createContext(null);

const now = () => new Date().toISOString();
const nextId = (prefix, list) => `${prefix}-${list.length + 1001}`;

export function StoreProvider({ children }) {
  const [db, setDb] = useState(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  const dbRef = useRef(db);
  dbRef.current = db;
  const commit = (next) => { dbRef.current = next; setDb(next); };
  const update = (fn) => commit(fn(dbRef.current));

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => { if (raw) commit({ ...initial, ...JSON.parse(raw) }); })
      .catch(() => {})
      .finally(() => { loaded.current = true; setReady(true); });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(db)).catch(() => {});
  }, [db]);

  const actions = useMemo(() => ({
    login: (session) => update((d) => ({ ...d, session })),
    logout: () => update((d) => ({ ...d, session: null, cart: {} })),

    addToCart: (id, delta) => update((d) => {
      const cart = { ...d.cart };
      const q = (cart[id] || 0) + delta;
      if (q > 0) cart[id] = q; else delete cart[id];
      return { ...d, cart };
    }),
    setCart: (cart) => update((d) => ({ ...d, cart })),

    placeOrder: ({ day, deliveryDate, payment, note }) => {
      const d = dbRef.current;
      const items = Object.entries(d.cart).map(([id, qty]) => {
        const p = productById(id);
        return { id, name: `${p.name} ${p.size}`, qty, price: p.price };
      });
      const created = {
        id: nextId('PED', d.orders),
        client: { ...d.session },
        items,
        total: items.reduce((s, i) => s + i.price * i.qty, 0),
        day, deliveryDate, payment, note,
        status: 'pendiente',
        createdAt: now(),
        history: [{ status: 'pendiente', at: now() }],
      };
      commit({ ...d, cart: {}, orders: [created, ...d.orders] });
      return created;
    },

    createReport: (data) => {
      const d = dbRef.current;
      const created = {
        id: nextId('REP', d.reports),
        client: { ...d.session },
        ...data,
        status: 'abierto',
        technician: '',
        createdAt: now(),
        history: [{ status: 'abierto', at: now() }],
      };
      commit({ ...d, reports: [created, ...d.reports] });
      return created;
    },

    setOrderStatus: (id, status) => update((d) => ({
      ...d,
      orders: d.orders.map((o) => (o.id === id ? { ...o, status, history: [...o.history, { status, at: now() }] } : o)),
    })),

    setReportStatus: (id, status, extra = {}) => update((d) => ({
      ...d,
      reports: d.reports.map((r) => (r.id === id
        ? { ...r, ...extra, status, history: [...r.history, { status, at: now(), note: extra.technician }] }
        : r)),
    })),
  }), []);

  return <Ctx.Provider value={{ db, ready, ...actions }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

// "Lo de siempre": el último pedido del negocio o, si es nuevo, el sugerido por la distribuidora.
export function usualOrder(db) {
  const last = db.orders.find((o) => o.client.code === db.session.code && o.status !== 'cancelado');
  if (last) {
    const cart = {};
    last.items.forEach((i) => { if (productById(i.id)) cart[i.id] = i.qty; });
    return cart;
  }
  return { ...(db.session.usual || {}) };
}

// Última forma de pago usada (para no volver a preguntarla).
export function lastPayment(db) {
  const last = db.orders.find((o) => o.client.code === db.session.code);
  return last ? last.payment : null;
}
