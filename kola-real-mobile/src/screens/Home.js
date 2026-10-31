// Inicio: lo que el dueño necesita saber y hacer, sin buscar.
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T, shadow } from '../theme';
import { ORDER_FLOW, ORDER_STATUS, REPORT_STATUS, cap, equipById, fmtDay, money, nextVisits, productById, visitDaysText } from '../data';
import { useStore, usualOrder } from '../store';
import { Card, Ion, MCI, SectionTitle } from '../ui';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Home({ goTo }) {
  const { db, logout, setCart } = useStore();
  const me = db.session;
  const myOrders = db.orders.filter((o) => o.client.code === me.code);
  const active = myOrders.find((o) => !['entregado', 'cancelado'].includes(o.status));
  const usual = usualOrder(db);
  const usualItems = Object.entries(usual).map(([id, q]) => ({ p: productById(id), q })).filter((x) => x.p);
  const usualTotal = usualItems.reduce((a, x) => a + x.p.price * x.q, 0);
  const usualCount = usualItems.reduce((a, x) => a + x.q, 0);
  const openReports = db.reports.filter((r) => r.client.code === me.code && r.status !== 'resuelto');
  const visit = nextVisits(me.visitDays || [], 1)[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient colors={[C.primary, C.primaryDark]} style={s.hero}>
        <SafeAreaView edges={['top']}>
          <View style={s.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.hello}>{greeting()}{me.owner ? `, ${me.owner}` : ''}</Text>
              <Text style={s.biz} numberOfLines={1}>{me.business}</Text>
            </View>
            <Pressable onPress={logout} style={s.logout} accessibilityLabel="Cerrar sesión" accessibilityRole="button">
              <Ion name="log-out-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -58 }}>
        {/* 1. Estado: ¿cuándo llega mi pedido? */}
        {active ? <ActiveOrder order={active} onPress={() => goTo('historial')} /> : (
          <Card style={{ padding: 18 }}>
            <Text style={T.label}>Próxima visita de tu vendedor</Text>
            <Text style={[T.title, { marginTop: 6 }]}>{visit ? cap(fmtDay(visit)) : '—'}</Text>
            <Text style={[T.small, { marginTop: 4 }]}>Pasa los {visitDaysText(me.visitDays || [])}. Pide antes y te lo trae en esa visita.</Text>
          </Card>
        )}

        {/* 2. Acción principal: pedir lo de siempre en un toque */}
        {!active && usualItems.length > 0 && (
          <Pressable
            onPress={() => { setCart(usual); goTo('pedir', { review: true }); }}
            style={({ pressed }) => [s.usual, pressed && { opacity: 0.92 }]}
            accessibilityRole="button"
          >
            <View style={s.usualIcon}><Ion name="refresh" size={24} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.usualTitle}>Pedir lo mismo de siempre</Text>
              <Text style={s.usualSub} numberOfLines={1}>{usualCount} pacas · {money(usualTotal)}</Text>
              <Text style={s.usualSub} numberOfLines={1}>{usualItems.map((x) => `${x.q} ${x.p.name.replace('Kola Real ', '')} ${x.p.size}`).join(', ')}</Text>
            </View>
            <Ion name="chevron-forward" size={20} color="#fff" />
          </Pressable>
        )}

        <View style={s.actions}>
          <Action icon="cart-outline" title={active ? 'Hacer otro pedido' : 'Pedido nuevo'} onPress={() => { setCart({}); goTo('pedir'); }} />
          <Action icon="wrench-outline" mci title="Reportar un equipo" onPress={() => goTo('equipos')} />
        </View>

        {/* 3. Equipos con problemas */}
        {openReports.length > 0 && (
          <>
            <SectionTitle title="Tus reportes" action="Ver equipos" onAction={() => goTo('equipos')} />
            {openReports.map((r) => {
              const st = REPORT_STATUS[r.status];
              const eq = equipById(r.equipment);
              return (
                <Card key={r.id} style={s.repRow} onPress={() => goTo('equipos')}>
                  <View style={[s.repIcon, { backgroundColor: st.bg }]}><MCI name={eq.icon} size={22} color={st.color} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={T.bodyStrong}>{r.equipmentName}: {r.problem}</Text>
                    <Text style={[T.small, { color: st.color, fontWeight: '700' }]}>{st.label}{r.technician ? ` · ${r.technician}` : ''}</Text>
                  </View>
                  <Ion name="chevron-forward" size={18} color={C.muted} />
                </Card>
              );
            })}
          </>
        )}

        {/* 4. Contacto humano */}
        {me.seller && (
          <>
            <SectionTitle title="Tu vendedor" />
            <Card style={s.seller}>
              <View style={s.sellerAvatar}><Text style={{ fontWeight: '800', color: C.ink }}>{me.seller.name.split(' ').map((w) => w[0]).join('')}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={T.bodyStrong}>{me.seller.name}</Text>
                <Text style={T.small}>Ruta de los {visitDaysText(me.visitDays || [])}</Text>
              </View>
              <Pressable style={[s.round, { backgroundColor: C.greenSoft }]} accessibilityLabel="Escribir por WhatsApp"
                onPress={() => Linking.openURL(`https://wa.me/${me.seller.phone}`).catch(() => {})}>
                <Ion name="logo-whatsapp" size={20} color={C.green} />
              </Pressable>
              <Pressable style={[s.round, { backgroundColor: C.blueSoft }]} accessibilityLabel="Llamar"
                onPress={() => Linking.openURL(`tel:+${me.seller.phone}`).catch(() => {})}>
                <Ion name="call" size={18} color={C.blue} />
              </Pressable>
            </Card>
          </>
        )}

        {myOrders.length > 0 && (
          <Pressable onPress={() => goTo('historial')} style={s.historyLink} hitSlop={6}>
            <Ion name="time-outline" size={18} color={C.ink2} />
            <Text style={[T.bodyStrong, { flex: 1 }]}>Historial de pedidos</Text>
            <Text style={T.small}>{myOrders.length}</Text>
            <Ion name="chevron-forward" size={18} color={C.muted} />
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

function Action({ icon, title, onPress, mci }) {
  const I = mci ? MCI : Ion;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.action, pressed && { opacity: 0.9 }]}>
      <I name={icon} size={22} color={C.ink} />
      <Text style={[T.bodyStrong, { flex: 1 }]}>{title}</Text>
    </Pressable>
  );
}

function ActiveOrder({ order, onPress }) {
  const idx = ORDER_FLOW.indexOf(order.status);
  const status = ORDER_STATUS[order.status];
  const units = order.items.reduce((a, i) => a + i.qty, 0);
  return (
    <Card style={{ padding: 18 }} onPress={onPress}>
      <Text style={T.label}>Tu pedido llega</Text>
      <Text style={[T.title, { marginTop: 6 }]}>{cap(order.day)}</Text>
      <View style={s.progress}>
        {ORDER_FLOW.map((k, i) => <View key={k} style={[s.progressSeg, i <= idx && { backgroundColor: status.color }]} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
        <Text style={[T.smallStrong, { color: status.color }]}>{status.label}</Text>
        <Text style={T.small}>{units} pacas · {money(order.total)}  ›</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 84, borderBottomLeftRadius: R.xl, borderBottomRightRadius: R.xl },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  hello: { color: '#FFD6D9', fontSize: 15 },
  biz: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  logout: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  progressSeg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.line },
  usual: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.primary, borderRadius: R.lg, padding: 18, marginTop: 14, ...shadow },
  usualIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  usualTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  usualSub: { color: '#FFD6D9', fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, paddingVertical: 16, paddingHorizontal: 14, ...shadow },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  repIcon: { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  seller: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  round: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  historyLink: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, paddingVertical: 14, paddingHorizontal: 4 },
});
