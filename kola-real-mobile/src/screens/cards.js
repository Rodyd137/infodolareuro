// Tarjetas de pedido y reporte, compartidas entre cliente y distribuidor.
import React from 'react';
import { Image, Text, View } from 'react-native';
import { COLORS, ORDER_STATUS, REPORT_STATUS, equipById, fmtDate, money } from '../data';
import { Card, StatusPill, s } from '../ui';

export function OrderCard({ order: o, showClient, footer }) {
  return (
    <Card>
      <View style={s.between}>
        <Text style={s.bold}>{o.id}</Text>
        <StatusPill status={ORDER_STATUS[o.status]} />
      </View>
      {showClient && <ClientLine client={o.client} />}
      <Text style={[s.muted, { marginTop: 4 }]}>{fmtDate(o.createdAt)} · Entrega: {o.day} · {o.payment}</Text>
      <View style={{ marginVertical: 8 }}>
        {o.items.map((i) => <Text key={i.id} style={s.text}>• {i.qty} × {i.name}</Text>)}
      </View>
      {!!o.note && <Text style={s.muted}>📝 {o.note}</Text>}
      <Text style={[s.bold, { marginTop: 6, fontSize: 16 }]}>{money(o.total)}</Text>
      {footer}
    </Card>
  );
}

export function ReportCard({ report: r, showClient, footer }) {
  const eq = equipById(r.equipment);
  return (
    <Card>
      <View style={s.between}>
        <Text style={s.bold}>{eq ? eq.ico : ''} {r.id}</Text>
        <StatusPill status={REPORT_STATUS[r.status]} />
      </View>
      {showClient && <ClientLine client={r.client} />}
      <Text style={[s.text, { marginTop: 6 }]}>
        <Text style={s.bold}>{r.equipmentName}:</Text> {r.problem}
        {r.priority === 'alta' && <Text style={{ color: COLORS.red, fontWeight: '700' }}>  · URGENTE</Text>}
      </Text>
      {!!r.asset && <Text style={s.muted}>Equipo: {r.asset}</Text>}
      {!!r.description && <Text style={[s.text, { marginTop: 6 }]}>{r.description}</Text>}
      {!!r.photo && <Image source={{ uri: r.photo }} style={{ width: '100%', height: 180, borderRadius: 10, marginTop: 8 }} resizeMode="cover" />}
      {!!r.technician && <Text style={[s.text, { marginTop: 6 }]}>👷 Técnico: <Text style={s.bold}>{r.technician}</Text></Text>}
      <View style={{ marginTop: 8 }}>
        {r.history.map((h, idx) => (
          <Text key={idx} style={s.muted}>• {REPORT_STATUS[h.status].label} — {fmtDate(h.at)}{h.note ? ` · ${h.note}` : ''}</Text>
        ))}
      </View>
      {footer}
    </Card>
  );
}

function ClientLine({ client }) {
  return (
    <Text style={[s.text, { marginTop: 4 }]}>
      <Text style={s.bold}>{client.business}</Text>
      <Text style={s.muted}>  {client.code} · {client.phone}</Text>
    </Text>
  );
}
