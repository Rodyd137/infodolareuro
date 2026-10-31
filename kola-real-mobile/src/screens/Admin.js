// Pantallas del distribuidor / supervisor.
import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T, shadow } from '../theme';
import { EQUIPMENT, ORDER_FLOW, ORDER_STATUS, REPORT_FLOW, REPORT_STATUS, money } from '../data';
import { useStore } from '../store';
import { Button, Card, Chips, Empty, IconButton, Input, Ion, MCI, ScreenHeader, SectionTitle } from '../ui';
import { OrderItem, ReportItem } from '../components/Items';

export function Summary({ goTo }) {
  const { db, logout } = useStore();
  const pending = db.orders.filter((o) => o.status === 'pendiente').length;
  const open = db.reports.filter((r) => r.status !== 'resuelto');
  const urgent = open.filter((r) => r.priority === 'alta').length;
  const sales = db.orders.filter((o) => o.status !== 'cancelado').reduce((a, o) => a + o.total, 0);
  const byEquip = EQUIPMENT.map((e) => ({ e, n: open.filter((r) => r.equipment === e.id).length })).filter((x) => x.n);
  const maxN = Math.max(1, ...byEquip.map((x) => x.n));

  async function shareCsv() {
    const rows = [['id', 'fecha', 'negocio', 'codigo', 'telefono', 'equipo', 'placa', 'problema', 'urgencia', 'estado', 'tecnico', 'descripcion']];
    db.reports.forEach((r) => rows.push([r.id, r.createdAt, r.client.business, r.client.code, r.client.phone, r.equipmentName, r.asset, r.problem, r.priority, REPORT_STATUS[r.status].label, r.technician, r.description]));
    const csv = rows.map((row) => row.map((v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n');
    try { await Share.share({ title: 'reportes-equipos.csv', message: csv }); } catch (e) { /* cancelado */ }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <ScreenHeader title="Resumen" subtitle={`${db.session.business} · ${db.session.code}`}
          right={<IconButton icon="log-out-outline" label="Cerrar sesión" onPress={logout} />} />
        <View style={{ paddingHorizontal: 20 }}>
          <View style={s.kpis}>
            <Kpi icon="cube-outline" n={pending} label="Pedidos por confirmar" color={C.amber} bg={C.amberSoft} onPress={() => goTo('admin-pedidos')} />
            <Kpi icon="construct-outline" n={open.length} label="Reportes abiertos" color={C.blue} bg={C.blueSoft} onPress={() => goTo('admin-reportes')} />
          </View>
          <View style={s.kpis}>
            <Kpi icon="flash" n={urgent} label="Urgentes" color={C.primary} bg={C.primarySoft} onPress={() => goTo('admin-reportes')} />
            <Kpi icon="cash-outline" n={money(sales)} label="En pedidos" color={C.green} bg={C.greenSoft} small />
          </View>

          <SectionTitle title="Reportes abiertos por equipo" />
          <Card>
            {byEquip.length === 0 && <Text style={[T.body, { color: C.muted }]}>No hay reportes abiertos.</Text>}
            {byEquip.map(({ e, n }) => (
              <View key={e.id} style={s.barRow}>
                <MCI name={e.icon} size={22} color={C.ink2} />
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={T.bodyStrong}>{e.name}</Text>
                    <Text style={T.bodyStrong}>{n}</Text>
                  </View>
                  <View style={s.barTrack}><View style={[s.barFill, { width: `${(n / maxN) * 100}%` }]} /></View>
                </View>
              </View>
            ))}
          </Card>
          <Button title="Compartir reportes (CSV)" icon="share-outline" variant="secondary" style={{ marginTop: 16 }} onPress={shareCsv} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ icon, n, label, color, bg, onPress, small }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.kpi, pressed && { opacity: 0.9 }]}>
      <View style={[s.kpiIcon, { backgroundColor: bg }]}><Ion name={icon} size={18} color={color} /></View>
      <Text style={[s.kpiN, small && { fontSize: 20 }]} numberOfLines={1} adjustsFontSizeToFit>{n}</Text>
      <Text style={T.small}>{label}</Text>
    </Pressable>
  );
}

const ORDER_FILTERS = ['Activos', 'Todos', 'Entregados'];
export function AllOrders() {
  const { db, setOrderStatus } = useStore();
  const [f, setF] = useState('Activos');
  const list = db.orders.filter((o) => (f === 'Todos') || (f === 'Entregados' ? o.status === 'entregado' : !['entregado', 'cancelado'].includes(o.status)));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Pedidos" subtitle={`${db.orders.length} ${db.orders.length === 1 ? 'pedido recibido' : 'pedidos recibidos'}`} />
      <Chips options={ORDER_FILTERS} value={f} onChange={setF} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {list.length === 0 && <Empty icon="cube-outline" title="Sin pedidos aquí" text="Cuando un negocio haga un pedido aparecerá en esta lista." />}
        {list.map((o) => {
          const idx = ORDER_FLOW.indexOf(o.status);
          const nextKey = idx >= 0 && idx < ORDER_FLOW.length - 1 ? ORDER_FLOW[idx + 1] : null;
          return (
            <OrderItem key={o.id} order={o} showClient actions={nextKey && (
              <View style={s.actionsRow}>
                <Button title="Cancelar" variant="secondary" size="sm" full={false} onPress={() => setOrderStatus(o.id, 'cancelado')} />
                <Button title={`Marcar: ${ORDER_STATUS[nextKey].label}`} size="sm" icon="checkmark" style={{ flex: 1 }} onPress={() => setOrderStatus(o.id, nextKey)} />
              </View>
            )} />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const REPORT_FILTERS = ['Abiertos', 'Urgentes', 'Resueltos', 'Todos'];
export function AllReports() {
  const { db } = useStore();
  const [f, setF] = useState('Abiertos');
  const list = [...db.reports]
    .filter((r) => (f === 'Todos') || (f === 'Resueltos' ? r.status === 'resuelto'
      : f === 'Urgentes' ? r.status !== 'resuelto' && r.priority === 'alta' : r.status !== 'resuelto'))
    .sort((a, b) => (b.priority === 'alta') - (a.priority === 'alta'));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Reportes de equipos" subtitle="Urgentes primero" />
      <Chips options={REPORT_FILTERS} value={f} onChange={setF} />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {list.length === 0 && <Empty icon="checkmark-done-outline" title="Nada pendiente" text="No hay reportes en esta lista." />}
        {list.map((r) => <ReportItem key={r.id} report={r} showClient actions={<ReportActions report={r} />} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportActions({ report: r }) {
  const { setReportStatus } = useStore();
  const [tech, setTech] = useState(r.technician || '');
  if (r.status === 'resuelto') return null;
  const idx = REPORT_FLOW.indexOf(r.status);

  if (r.status === 'abierto') {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={[T.bodyStrong, { marginBottom: 8 }]}>Asignar técnico</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Input icon="person-outline" value={tech} onChangeText={setTech} placeholder="Nombre del técnico" style={{ flex: 1 }} />
          <Button title="Asignar" size="sm" full={false} style={{ height: 50 }} disabled={!tech.trim()}
            onPress={() => setReportStatus(r.id, 'tecnico_asignado', { technician: tech.trim() })} />
        </View>
      </View>
    );
  }
  const nextKey = REPORT_FLOW[idx + 1];
  return (
    <View style={s.actionsRow}>
      <Button title={`Marcar: ${REPORT_STATUS[nextKey].label}`} size="sm" icon="checkmark" onPress={() => setReportStatus(r.id, nextKey)} />
    </View>
  );
}

const s = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpi: { flex: 1, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, ...shadow },
  kpiIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  kpiN: { fontSize: 30, fontWeight: '800', color: C.ink, marginTop: 12, letterSpacing: -0.8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: C.bg, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: C.primary },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
