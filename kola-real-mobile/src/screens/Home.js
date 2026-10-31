import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T, shadow } from '../theme';
import { DISTRIBUTOR_WHATSAPP, ORDER_FLOW, ORDER_STATUS, money, productById } from '../data';
import { useStore } from '../store';
import { Button, Card, Ion, MCI, SectionTitle } from '../ui';
import { ReportItem } from '../components/Items';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Home({ goTo }) {
  const { db, logout, setCart } = useStore();
  const me = db.session;
  const myOrders = db.orders.filter((o) => o.client.code === me.code);
  const active = myOrders.find((o) => !['entregado', 'cancelado'].includes(o.status));
  const last = myOrders[0];
  const openReports = db.reports.filter((r) => r.client.code === me.code && r.status !== 'resuelto');
  const initials = me.business.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  function repeat(o) {
    const cart = {};
    o.items.forEach((i) => { if (productById(i.id)) cart[i.id] = i.qty; });
    setCart(cart);
    goTo('pedir', { view: 'cart' });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient colors={[C.primary, C.primaryDark]} style={s.hero}>
        <SafeAreaView edges={['top']}>
          <View style={s.heroRow}>
            <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.hello}>{greeting()}</Text>
              <Text style={s.biz} numberOfLines={1}>{me.business}</Text>
            </View>
            <Pressable onPress={logout} style={s.logout} accessibilityLabel="Cerrar sesión" accessibilityRole="button">
              <Ion name="log-out-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -54 }}>
        {active ? <ActiveOrder order={active} onPress={() => goTo('actividad', { seg: 'pedidos' })} /> : (
          <Card style={s.noOrder}>
            <View style={s.noOrderIcon}><Ion name="cube-outline" size={22} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={T.bodyStrong}>No tienes pedidos en curso</Text>
              <Text style={T.small}>Cuando hagas un pedido, aquí verás en qué va.</Text>
            </View>
          </Card>
        )}

        <View style={s.actions}>
          <Pressable style={({ pressed }) => [s.action, s.actionPrimary, pressed && s.pressed]} onPress={() => goTo('pedir')} accessibilityRole="button">
            <View style={[s.actionIcon, { backgroundColor: '#ffffff26' }]}><Ion name="cart" size={24} color="#fff" /></View>
            <Text style={[s.actionTitle, { color: '#fff' }]}>Hacer pedido</Text>
            <Text style={[s.actionSub, { color: '#FFD6D9' }]}>Catálogo completo</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.action, pressed && s.pressed]} onPress={() => goTo('reportar')} accessibilityRole="button">
            <View style={[s.actionIcon, { backgroundColor: C.yellowSoft }]}><MCI name="wrench-outline" size={24} color="#B7791F" /></View>
            <Text style={s.actionTitle}>Reportar equipo</Text>
            <Text style={s.actionSub}>Freezer, letrero…</Text>
          </Pressable>
        </View>

        {last && (
          <Card style={s.repeat} onPress={() => repeat(last)}>
            <View style={s.repeatIcon}><Ion name="refresh" size={20} color={C.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={T.bodyStrong}>Repetir último pedido</Text>
              <Text style={T.small} numberOfLines={1}>{last.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</Text>
            </View>
            <Ion name="chevron-forward" size={18} color={C.muted} />
          </Card>
        )}

        {openReports.length > 0 && (
          <>
            <SectionTitle title="Reportes abiertos" action="Ver todos" onAction={() => goTo('actividad', { seg: 'reportes' })} />
            {openReports.slice(0, 2).map((r) => <ReportItem key={r.id} report={r} />)}
          </>
        )}

        <Card style={s.help}>
          <View style={{ flex: 1 }}>
            <Text style={T.bodyStrong}>¿Necesitas ayuda?</Text>
            <Text style={[T.small, { marginTop: 2 }]}>Escríbele directo a tu distribuidor.</Text>
          </View>
          <Button title="WhatsApp" icon="logo-whatsapp" variant="whatsapp" size="sm" full={false}
            onPress={() => Linking.openURL(`https://wa.me/${DISTRIBUTOR_WHATSAPP}`).catch(() => {})} />
        </Card>
      </View>
    </ScrollView>
  );
}

function ActiveOrder({ order, onPress }) {
  const idx = ORDER_FLOW.indexOf(order.status);
  const status = ORDER_STATUS[order.status];
  return (
    <Card style={{ padding: 18 }} onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={T.label}>Pedido en curso</Text>
        <Text style={T.smallStrong}>{order.id}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <Ion name={status.icon} size={26} color={status.color} />
        <Text style={[T.title, { fontSize: 20 }]}>{status.label}</Text>
      </View>
      <View style={s.progress}>
        {ORDER_FLOW.map((k, i) => (
          <View key={k} style={[s.progressSeg, i <= idx && { backgroundColor: status.color }]} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={T.small}>Entrega: {order.day}</Text>
        <Text style={T.smallStrong}>{money(order.total)}</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 80, borderBottomLeftRadius: R.xl, borderBottomRightRadius: R.xl },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.primaryDark, fontWeight: '900', fontSize: 16 },
  hello: { color: '#FFD6D9', fontSize: 14 },
  biz: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  logout: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  noOrder: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  noOrderIcon: { width: 46, height: 46, borderRadius: R.md, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  progressSeg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.line },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  action: { flex: 1, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, minHeight: 140, ...shadow },
  actionPrimary: { backgroundColor: C.primary },
  actionIcon: { width: 46, height: 46, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' },
  actionTitle: { fontSize: 17, fontWeight: '800', color: C.ink, marginTop: 18 },
  actionSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  repeat: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  repeatIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  help: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, backgroundColor: '#fff' },
});
