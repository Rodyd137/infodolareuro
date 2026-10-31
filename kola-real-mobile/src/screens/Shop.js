// Catálogo → carrito → pedido enviado.
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T, shadow, shadowStrong } from '../theme';
import {
  CATEGORIES, DELIVERY_DAYS, DISTRIBUTOR_WHATSAPP, PAYMENT_METHODS, PRODUCTS, money, productById,
} from '../data';
import { useStore } from '../store';
import { Button, Card, Chips, Empty, Field, Input, Ion, RadioRow, ScreenHeader, Stepper } from '../ui';
import Bottle from '../components/Bottle';

export default function Shop({ params, goTo }) {
  const [view, setView] = useState(params && params.view === 'cart' ? 'cart' : 'catalog');
  const [sent, setSent] = useState(null);
  useEffect(() => { if (params && params.view === 'cart') setView('cart'); }, [params]);

  if (view === 'sent' && sent) return <Sent order={sent} onDone={() => { setSent(null); setView('catalog'); }} goTo={goTo} />;
  if (view === 'cart') return <Cart onBack={() => setView('catalog')} onSent={(o) => { setSent(o); setView('sent'); }} />;
  return <Catalog onCart={() => setView('cart')} />;
}

function useCart() {
  const { db } = useStore();
  const items = Object.entries(db.cart).map(([id, qty]) => ({ p: productById(id), qty })).filter((x) => x.p);
  return {
    items,
    count: items.reduce((a, x) => a + x.qty, 0),
    total: items.reduce((a, x) => a + x.qty * x.p.price, 0),
  };
}

// ---------- Catálogo ----------
function Catalog({ onCart }) {
  const { db, addToCart } = useStore();
  const [cat, setCat] = useState('Todos');
  const [q, setQ] = useState('');
  const { width } = useWindowDimensions();
  const cart = useCart();
  const cardW = (Math.min(width, 600) - 20 * 2 - 12) / 2;

  const query = q.trim().toLowerCase();
  const list = PRODUCTS.filter((p) => (cat === 'Todos' || p.cat === cat)
    && (!query || `${p.name} ${p.size}`.toLowerCase().includes(query)));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: cart.count ? 110 : 24, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <View style={{ marginBottom: 4 }}>
            <ScreenHeader title="Hacer pedido" subtitle="Precios por paca" />
            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <Input icon="search-outline" value={q} onChangeText={setQ} placeholder="Buscar producto" returnKeyType="search" />
            </View>
            <Chips options={CATEGORIES} value={cat} onChange={setCat} />
          </View>
        )}
        ListEmptyComponent={<Empty icon="search-outline" title="Sin resultados" text="Prueba con otra palabra o categoría." />}
        renderItem={({ item: p }) => (
          <View style={[s.product, { width: cardW }]}>
            <View style={[s.productArt, { backgroundColor: p.color + '14' }]}>
              {p.tag && <View style={s.tag}><Text style={s.tagText}>{p.tag}</Text></View>}
              <Bottle color={p.color} kind={p.kind} height={92} />
            </View>
            <View style={{ padding: 12, flex: 1 }}>
              <Text style={s.pName} numberOfLines={2}>{p.name} {p.size}</Text>
              <Text style={T.small}>{p.pack}</Text>
              {db.cart[p.id] ? (
                <View style={{ marginTop: 8, gap: 8 }}>
                  <Text style={s.pPrice}>{money(p.price)}</Text>
                  <Stepper wide value={db.cart[p.id]} onChange={(v) => addToCart(p.id, v - db.cart[p.id])} />
                </View>
              ) : (
                <View style={s.pFooter}>
                  <Text style={s.pPrice} numberOfLines={1}>{money(p.price)}</Text>
                  <Stepper compact value={0} onChange={(v) => addToCart(p.id, v)} />
                </View>
              )}
            </View>
          </View>
        )}
      />

      {cart.count > 0 && (
        <Pressable onPress={onCart} style={({ pressed }) => [s.cartBar, pressed && { opacity: 0.92 }]} accessibilityRole="button" accessibilityLabel="Ver carrito">
          <View style={s.cartCount}><Text style={s.cartCountText}>{cart.count}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Ver carrito</Text>
            <Text style={{ color: '#B9B9C3', fontSize: 13 }}>{cart.count} paca{cart.count === 1 ? '' : 's'}</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>{money(cart.total)}</Text>
          <Ion name="chevron-forward" size={18} color="#fff" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

// ---------- Carrito / checkout ----------
function Cart({ onBack, onSent }) {
  const { db, addToCart, placeOrder } = useStore();
  const cart = useCart();
  const [day, setDay] = useState(DELIVERY_DAYS[0].value);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].value);
  const [note, setNote] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Tu pedido" subtitle={db.session.business} onBack={onBack} />
      {cart.count === 0 ? (
        <Empty icon="cart-outline" title="Tu carrito está vacío" text="Agrega productos desde el catálogo."
          action={<Button title="Ver catálogo" full={false} onPress={onBack} />} />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
            <Card style={{ paddingVertical: 4 }}>
              {cart.items.map(({ p, qty }, i) => (
                <View key={p.id} style={[s.cartRow, i < cart.items.length - 1 && { borderBottomWidth: 1, borderColor: C.line }]}>
                  <View style={[s.cartArt, { backgroundColor: p.color + '14' }]}><Bottle color={p.color} kind={p.kind} height={44} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={T.bodyStrong} numberOfLines={1}>{p.name} {p.size}</Text>
                    <Text style={T.small}>{money(p.price)} · {p.pack}</Text>
                  </View>
                  <Stepper compact value={qty} onChange={(v) => addToCart(p.id, v - qty)} />
                </View>
              ))}
            </Card>

            <Text style={[T.h3, s.sectionGap]}>¿Cuándo lo quieres?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
              {DELIVERY_DAYS.map((d) => {
                const active = d.value === day;
                return (
                  <Pressable key={d.value} onPress={() => setDay(d.value)} accessibilityRole="radio" accessibilityState={{ checked: active }}
                    style={[s.dayCard, active && s.dayActive]}>
                    <Ion name={active ? 'checkmark-circle' : 'calendar-outline'} size={18} color={active ? C.primary : C.muted} />
                    <Text style={[T.bodyStrong, { marginTop: 8 }, active && { color: C.primary }]}>{d.label}</Text>
                    {!!d.sub && <Text style={T.small}>{d.sub}</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[T.h3, s.sectionGap]}>Forma de pago</Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {PAYMENT_METHODS.map((m, i) => (
                <RadioRow key={m.value} title={m.value} subtitle={m.sub} icon={m.icon}
                  selected={payment === m.value} onPress={() => setPayment(m.value)} last={i === PAYMENT_METHODS.length - 1} />
              ))}
            </Card>

            <Field label="Nota para el distribuidor" style={{ marginTop: 24 }}>
              <Input value={note} onChangeText={setNote} placeholder="Ej: entregar por la puerta de atrás" multiline />
            </Field>

            <View style={s.totals}>
              <View style={s.totalRow}><Text style={T.body}>Productos ({cart.count} pacas)</Text><Text style={T.body}>{money(cart.total)}</Text></View>
              <View style={[s.totalRow, { marginTop: 6 }]}><Text style={T.h3}>Total estimado</Text><Text style={T.h3}>{money(cart.total)}</Text></View>
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={s.footer}>
            <Button title={`Enviar pedido · ${money(cart.total)}`} icon="paper-plane-outline"
              onPress={() => onSent(placeOrder({ day, payment, note: note.trim() }))} />
          </SafeAreaView>
        </>
      )}
    </SafeAreaView>
  );
}

// ---------- Confirmación ----------
function Sent({ order, onDone, goTo }) {
  const text = `Pedido ${order.id} - ${order.client.business} (${order.client.code})\n`
    + order.items.map((i) => `• ${i.qty} × ${i.name}`).join('\n')
    + `\nTotal: ${money(order.total)}\nEntrega: ${order.day}\nPago: ${order.payment}${order.note ? `\nNota: ${order.note}` : ''}`;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.surface }}>
      <View style={s.sentWrap}>
        <View style={s.sentRing}><View style={s.sentCircle}><Ion name="checkmark" size={46} color="#fff" /></View></View>
        <Text style={[T.display, { textAlign: 'center', marginTop: 28 }]}>¡Pedido enviado!</Text>
        <Text style={[T.body, { textAlign: 'center', marginTop: 8, color: C.muted }]}>
          Tu distribuidor lo recibió. Te avisaremos cuando lo confirme.
        </Text>
        <View style={s.sentBox}>
          <View style={s.totalRow}><Text style={T.small}>Número de pedido</Text><Text style={T.bodyStrong}>{order.id}</Text></View>
          <View style={s.totalRow}><Text style={T.small}>Entrega</Text><Text style={T.bodyStrong}>{order.day}</Text></View>
          <View style={s.totalRow}><Text style={T.small}>Total</Text><Text style={T.bodyStrong}>{money(order.total)}</Text></View>
        </View>
      </View>
      <View style={{ padding: 20, gap: 10 }}>
        <Button title="Ver estado del pedido" onPress={() => { onDone(); goTo('actividad', { seg: 'pedidos' }); }} />
        <Button title="Enviar copia por WhatsApp" icon="logo-whatsapp" variant="secondary"
          onPress={() => Linking.openURL(`https://wa.me/${DISTRIBUTOR_WHATSAPP}?text=${encodeURIComponent(text)}`).catch(() => {})} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  product: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden', ...shadow },
  productArt: { height: 128, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 10, left: 10, backgroundColor: C.ink, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pName: { fontSize: 15, fontWeight: '700', color: C.ink, lineHeight: 19, minHeight: 38 },
  pFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  pPrice: { fontSize: 15, fontWeight: '800', color: C.ink },
  cartBar: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.ink, borderRadius: R.lg, paddingVertical: 12, paddingHorizontal: 14, ...shadowStrong },
  cartCount: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  cartCountText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  cartArt: { width: 52, height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  sectionGap: { marginTop: 26, marginBottom: 12 },
  dayCard: { width: 112, backgroundColor: C.surface, borderRadius: R.md, padding: 12, borderWidth: 1.5, borderColor: C.line },
  dayActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  totals: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, gap: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.line },
  sentWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  sentRing: { width: 132, height: 132, borderRadius: 66, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  sentCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  sentBox: { alignSelf: 'stretch', backgroundColor: C.bg, borderRadius: R.lg, padding: 16, gap: 10, marginTop: 28 },
});
