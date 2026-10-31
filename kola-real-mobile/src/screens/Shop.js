// Pedir: lista rápida → confirmar (con todo prellenado) → listo.
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T, shadow, shadowStrong } from '../theme';
import { CATEGORIES, PAYMENT_METHODS, PRODUCTS, cap, fmtDay, money, nextVisits, productById } from '../data';
import { lastPayment, useStore, usualOrder } from '../store';
import { Button, Card, Chips, Empty, Input, Ion, MCI, QtySheet, RadioRow, ScreenHeader, Stepper } from '../ui';
import Bottle from '../components/Bottle';

export default function Shop({ params, goTo }) {
  const [view, setView] = useState(params && params.review ? 'confirm' : 'catalog');
  const [sent, setSent] = useState(null);
  useEffect(() => { if (params && params.review) setView('confirm'); }, [params]);

  if (view === 'sent' && sent) return <Sent order={sent} goTo={goTo} onAgain={() => { setSent(null); setView('catalog'); }} />;
  if (view === 'confirm') return <Confirm onBack={() => setView('catalog')} onSent={(o) => { setSent(o); setView('sent'); }} />;
  return <Catalog onConfirm={() => setView('confirm')} />;
}

function useCart() {
  const { db } = useStore();
  const items = Object.entries(db.cart).map(([id, qty]) => ({ p: productById(id), qty })).filter((x) => x.p);
  return { items, count: items.reduce((a, x) => a + x.qty, 0), total: items.reduce((a, x) => a + x.qty * x.p.price, 0) };
}

// Cambia la cantidad de un producto a un valor exacto.
function useSetQty() {
  const { db, addToCart } = useStore();
  return (id, n) => addToCart(id, n - (db.cart[id] || 0));
}

function ProductRow({ p, qty, onQty, onTapQty }) {
  return (
    <View style={s.row}>
      <View style={[s.art, { backgroundColor: p.color + '14' }]}><Bottle color={p.color} kind={p.kind} height={46} /></View>
      <View style={{ flex: 1 }}>
        <Text style={T.bodyStrong} numberOfLines={1}>{p.name} {p.size}</Text>
        <Text style={T.small}>{money(p.price)} · {p.pack}</Text>
      </View>
      <Stepper compact value={qty} onChange={onQty} onTapValue={onTapQty} />
    </View>
  );
}

// ---------- Lista de productos ----------
function Catalog({ onConfirm }) {
  const { db } = useStore();
  const setQty = useSetQty();
  const cart = useCart();
  const [cat, setCat] = useState('Todos');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const usualIds = useMemo(() => Object.keys(usualOrder(db)), [db.orders, db.session]);

  const query = q.trim().toLowerCase();
  const match = (p) => (cat === 'Todos' || p.cat === cat) && (!query || `${p.name} ${p.size}`.toLowerCase().includes(query));
  const sections = [];
  if (!query && cat === 'Todos') {
    const usual = PRODUCTS.filter((p) => usualIds.includes(p.id));
    if (usual.length) sections.push({ title: 'Lo que más pides', data: usual });
    sections.push({ title: 'Todos los productos', data: PRODUCTS.filter((p) => !usualIds.includes(p.id)) });
  } else {
    sections.push({ title: '', data: PRODUCTS.filter(match) });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Pedir" subtitle="Toca el número para escribir la cantidad" />
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Input icon="search-outline" value={q} onChangeText={setQ} placeholder="Buscar: roja, agua, volt…" returnKeyType="search" />
      </View>
      <Chips options={CATEGORIES} value={cat} onChange={setCat} />
      <SectionList
        sections={sections.filter((x) => x.data.length)}
        keyExtractor={(p) => p.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: cart.count ? 110 : 24 }}
        renderSectionHeader={({ section }) => (section.title ? <Text style={s.secTitle}>{section.title}</Text> : null)}
        renderItem={({ item: p, index, section }) => (
          <View style={[s.listCard, index === 0 && s.first, index === section.data.length - 1 && s.last]}>
            <ProductRow p={p} qty={db.cart[p.id] || 0} onQty={(n) => setQty(p.id, n)} onTapQty={() => setEditing(p)} />
            {index < section.data.length - 1 && <View style={s.divider} />}
          </View>
        )}
        ListEmptyComponent={<Empty icon="search-outline" title="No encontramos ese producto" text="Prueba con otra palabra." />}
      />

      {cart.count > 0 && (
        <Pressable onPress={onConfirm} style={({ pressed }) => [s.cartBar, pressed && { opacity: 0.92 }]} accessibilityRole="button" accessibilityLabel="Revisar pedido">
          <View style={s.cartCount}><Text style={s.cartCountText}>{cart.count}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Revisar pedido</Text>
            <Text style={{ color: '#B9B9C3', fontSize: 13 }}>{cart.count} paca{cart.count === 1 ? '' : 's'}</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>{money(cart.total)}</Text>
          <Ion name="chevron-forward" size={18} color="#fff" />
        </Pressable>
      )}
      <QtySheet product={editing} value={editing ? db.cart[editing.id] || 0 : 0} onClose={() => setEditing(null)}
        onSave={(n) => { setQty(editing.id, n); setEditing(null); }} />
    </SafeAreaView>
  );
}

// ---------- Confirmar: todo prellenado, solo se cambia si hace falta ----------
function Confirm({ onBack, onSent }) {
  const { db, placeOrder } = useStore();
  const setQty = useSetQty();
  const cart = useCart();
  const me = db.session;
  const visits = useMemo(() => nextVisits(me.visitDays || [1, 2, 3, 4, 5, 6], 3), [me.visitDays]);
  const [visitIdx, setVisitIdx] = useState(0);
  const [payment, setPayment] = useState(lastPayment(db) || PAYMENT_METHODS[0].value);
  const [open, setOpen] = useState(null); // 'day' | 'pay' | 'note'
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(null);
  const visit = visits[visitIdx];
  const payInfo = PAYMENT_METHODS.find((m) => m.value === payment) || PAYMENT_METHODS[0];

  function confirm() {
    onSent(placeOrder({
      day: visit ? fmtDay(visit) : 'Próxima visita', deliveryDate: visit ? visit.toISOString() : null, payment, note: note.trim(),
    }));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Revisa tu pedido" subtitle={me.business} onBack={onBack} />
      {cart.count === 0 ? (
        <Empty icon="cart-outline" title="Tu pedido está vacío" text="Agrega productos de la lista."
          action={<Button title="Ver productos" full={false} onPress={onBack} />} />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
            <Card style={{ paddingVertical: 4 }}>
              {cart.items.map(({ p, qty }, i) => (
                <View key={p.id}>
                  <ProductRow p={p} qty={qty} onQty={(n) => setQty(p.id, n)} onTapQty={() => setEditing(p)} />
                  {i < cart.items.length - 1 && <View style={s.divider} />}
                </View>
              ))}
              <Pressable onPress={onBack} style={s.addMore} hitSlop={4}>
                <Ion name="add-circle-outline" size={20} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: '700' }}>Agregar otros productos</Text>
              </Pressable>
            </Card>

            <Card style={{ padding: 0, marginTop: 14, overflow: 'hidden' }}>
              <Setting icon="truck-delivery-outline" label="Entrega" value={visit ? cap(fmtDay(visit)) : 'Próxima visita'}
                sub={me.seller ? `En la visita de ${me.seller.name.split(' ')[0]}` : 'En la próxima visita de la ruta'}
                open={open === 'day'} onPress={() => setOpen(open === 'day' ? null : 'day')} />
              {open === 'day' && (
                <View style={s.options}>
                  {visits.map((v, i) => (
                    <RadioRow key={v.toISOString()} title={cap(fmtDay(v))} subtitle={i === 0 ? 'Próxima visita' : null}
                      selected={visitIdx === i} onPress={() => { setVisitIdx(i); setOpen(null); }} last={i === visits.length - 1} />
                  ))}
                </View>
              )}
              <View style={s.divider} />
              <Setting icon={payInfo.icon} label="Pago" value={payment} sub={payInfo.sub}
                open={open === 'pay'} onPress={() => setOpen(open === 'pay' ? null : 'pay')} />
              {open === 'pay' && (
                <View style={s.options}>
                  {PAYMENT_METHODS.map((m, i) => (
                    <RadioRow key={m.value} title={m.value} subtitle={m.sub} icon={m.icon}
                      selected={payment === m.value} onPress={() => { setPayment(m.value); setOpen(null); }} last={i === PAYMENT_METHODS.length - 1} />
                  ))}
                </View>
              )}
              <View style={s.divider} />
              {open === 'note' || note ? (
                <View style={{ padding: 16 }}>
                  <Text style={[T.bodyStrong, { marginBottom: 8 }]}>Nota para el vendedor</Text>
                  <Input value={note} onChangeText={setNote} placeholder="Ej: entregar por la puerta de atrás" multiline autoFocus={open === 'note'} />
                </View>
              ) : (
                <Setting icon="message-text-outline" label="Nota" value="Agregar una nota (opcional)" muted onPress={() => setOpen('note')} />
              )}
            </Card>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={s.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={T.body}>{cart.count} pacas</Text>
              <Text style={T.h3}>Total {money(cart.total)}</Text>
            </View>
            <Button title="Confirmar pedido" icon="checkmark" onPress={confirm} />
          </SafeAreaView>
        </>
      )}
      <QtySheet product={editing} value={editing ? db.cart[editing.id] || 0 : 0} onClose={() => setEditing(null)}
        onSave={(n) => { setQty(editing.id, n); setEditing(null); }} />
    </SafeAreaView>
  );
}

function Setting({ icon, label, value, sub, open, onPress, muted }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.setting, pressed && { backgroundColor: C.bg }]} accessibilityRole="button">
      <View style={s.settingIcon}><MCI name={icon} size={20} color={C.ink2} /></View>
      <View style={{ flex: 1 }}>
        <Text style={T.small}>{label}</Text>
        <Text style={[T.bodyStrong, muted && { color: C.muted, fontWeight: '500' }]}>{value}</Text>
        {!!sub && <Text style={T.small}>{sub}</Text>}
      </View>
      {muted ? <Ion name="add" size={20} color={C.muted} /> : <Text style={{ color: C.primary, fontWeight: '700' }}>{open ? 'Listo' : 'Cambiar'}</Text>}
    </Pressable>
  );
}

// ---------- Listo ----------
function Sent({ order, goTo, onAgain }) {
  const { db } = useStore();
  const seller = db.session.seller;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.surface }}>
      <View style={s.sentWrap}>
        <View style={s.sentRing}><View style={s.sentCircle}><Ion name="checkmark" size={46} color="#fff" /></View></View>
        <Text style={[T.display, { textAlign: 'center', marginTop: 28 }]}>¡Listo!</Text>
        <Text style={[T.body, { textAlign: 'center', marginTop: 8, fontSize: 17, lineHeight: 24 }]}>
          Tu pedido llega el <Text style={{ fontWeight: '800', color: C.ink }}>{order.day}</Text>
          {seller ? ` con ${seller.name.split(' ')[0]}.` : '.'}
        </Text>
        <Text style={[T.small, { textAlign: 'center', marginTop: 6 }]}>Te avisamos cuando lo confirmen. Pedido {order.id} · {money(order.total)}</Text>
      </View>
      <View style={{ padding: 20, gap: 10 }}>
        <Button title="Volver al inicio" onPress={() => { onAgain(); goTo('inicio'); }} />
        {seller && (
          <Button title={`Avisarle a ${seller.name.split(' ')[0]} por WhatsApp`} icon="logo-whatsapp" variant="secondary"
            onPress={() => Linking.openURL(`https://wa.me/${seller.phone}?text=${encodeURIComponent(`Hola, hice el pedido ${order.id} por la app (${money(order.total)}) para el ${order.day}.`)}`).catch(() => {})} />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  secTitle: { ...T.label, marginTop: 16, marginBottom: 8 },
  listCard: { backgroundColor: C.surface, paddingHorizontal: 14 },
  first: { borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, paddingTop: 2 },
  last: { borderBottomLeftRadius: R.lg, borderBottomRightRadius: R.lg, paddingBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  art: { width: 50, height: 54, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: C.line },
  cartBar: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.ink, borderRadius: R.lg, paddingVertical: 12, paddingHorizontal: 14, ...shadowStrong },
  cartCount: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  cartCountText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  addMore: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, borderTopWidth: 1, borderColor: C.line },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  options: { backgroundColor: C.bg, borderTopWidth: 1, borderColor: C.line },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.line, ...shadow },
  sentWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  sentRing: { width: 132, height: 132, borderRadius: 66, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  sentCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
});
