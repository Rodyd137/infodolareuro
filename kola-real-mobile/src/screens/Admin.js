// Pantallas del distribuidor / supervisor.
import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { COLORS, EQUIPMENT, ORDER_STATUS, REPORT_STATUS, money } from '../data';
import { useStore } from '../store';
import { Button, Card, Chips, Empty, Input, s } from '../ui';
import { OrderCard, ReportCard } from './cards';

const toOptions = (map) => Object.entries(map).map(([value, v]) => ({ value, label: v.label }));

export function Summary() {
  const { db } = useStore();
  const pending = db.orders.filter((o) => o.status === 'pendiente').length;
  const open = db.reports.filter((r) => r.status !== 'resuelto');
  const urgent = open.filter((r) => r.priority === 'alta').length;
  const sales = db.orders.filter((o) => o.status !== 'cancelado').reduce((a, o) => a + o.total, 0);
  const byEquip = EQUIPMENT.map((e) => ({ e, n: open.filter((r) => r.equipment === e.id).length })).filter((x) => x.n);

  async function shareCsv() {
    const rows = [['id', 'fecha', 'negocio', 'codigo', 'telefono', 'equipo', 'placa', 'problema', 'urgencia', 'estado', 'tecnico', 'descripcion']];
    db.reports.forEach((r) => rows.push([r.id, r.createdAt, r.client.business, r.client.code, r.client.phone, r.equipmentName, r.asset, r.problem, r.priority, REPORT_STATUS[r.status].label, r.technician, r.description]));
    const csv = rows.map((row) => row.map((v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n');
    try { await Share.share({ title: 'reportes-equipos.csv', message: csv }); } catch (e) { /* cancelado */ }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h1}>Resumen</Text>
      <View style={[s.row, { marginBottom: 12 }]}>
        <Stat n={pending} label="Pedidos pendientes" />
        <Stat n={open.length} label="Reportes abiertos" />
        <Stat n={urgent} label="Urgentes" color={COLORS.red} />
      </View>
      <Card>
        <Text style={s.muted}>Total en pedidos (no cancelados)</Text>
        <Text style={[s.bold, { fontSize: 20 }]}>{money(sales)}</Text>
      </Card>
      <Text style={s.h2}>Reportes abiertos por tipo de equipo</Text>
      {byEquip.length === 0 && <Empty text="Sin reportes abiertos." />}
      {byEquip.map(({ e, n }) => (
        <Card key={e.id} style={s.between}>
          <Text style={s.text}>{e.ico} {e.name}</Text>
          <Text style={s.bold}>{n}</Text>
        </Card>
      ))}
      <Button small variant="ghost" title="Compartir reportes (CSV)" onPress={shareCsv} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
    </ScrollView>
  );
}

function Stat({ n, label, color }) {
  return (
    <View style={st.stat}>
      <Text style={[st.statN, color && { color }]}>{n}</Text>
      <Text style={[s.muted, { textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

export function AllOrders() {
  const { db, setOrderStatus } = useStore();
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h1}>Pedidos recibidos</Text>
      {db.orders.length === 0 && <Empty text="No hay pedidos todavía." />}
      {db.orders.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          showClient
          footer={(
            <View style={{ marginTop: 10 }}>
              <Text style={[s.muted, { marginBottom: 6 }]}>Cambiar estado:</Text>
              <Chips options={toOptions(ORDER_STATUS)} value={o.status} onChange={(v) => v !== o.status && setOrderStatus(o.id, v)} />
            </View>
          )}
        />
      ))}
    </ScrollView>
  );
}

export function AllReports() {
  const { db } = useStore();
  const sorted = [...db.reports].sort((a, b) =>
    (a.status === 'resuelto') - (b.status === 'resuelto') || (b.priority === 'alta') - (a.priority === 'alta'));
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Reportes de equipos</Text>
      {sorted.length === 0 && <Empty text="No hay reportes." />}
      {sorted.map((r) => <ReportCard key={r.id} report={r} showClient footer={<ReportActions report={r} />} />)}
    </ScrollView>
  );
}

function ReportActions({ report: r }) {
  const { setReportStatus } = useStore();
  const [tech, setTech] = useState(r.technician || '');
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[s.muted, { marginBottom: 6 }]}>Asignar técnico:</Text>
      <View style={s.row}>
        <Input value={tech} onChangeText={setTech} placeholder="Nombre del técnico" style={{ flex: 1, paddingVertical: 8 }} />
        <Button
          small title="Asignar" disabled={!tech.trim() || tech.trim() === r.technician}
          onPress={() => setReportStatus(r.id, 'tecnico_asignado', { technician: tech.trim() })}
        />
      </View>
      <Text style={[s.muted, { marginVertical: 6 }]}>Cambiar estado:</Text>
      <Chips options={toOptions(REPORT_STATUS)} value={r.status} onChange={(v) => v !== r.status && setReportStatus(r.id, v)} />
    </View>
  );
}

const st = StyleSheet.create({
  stat: { flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 10, alignItems: 'center' },
  statN: { fontSize: 24, fontWeight: '800', color: COLORS.text },
});
