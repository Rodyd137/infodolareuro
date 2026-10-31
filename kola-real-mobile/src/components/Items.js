// Tarjetas de pedido y de reporte (se expanden al tocarlas).
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { C, R, T } from '../theme';
import {
  ORDER_FLOW, ORDER_STATUS, REPORT_FLOW, REPORT_STATUS, equipById, fmtDate, money,
} from '../data';
import { Card, Ion, MCI, StatusPill, Timeline } from '../ui';

export function OrderItem({ order: o, showClient, actions, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const status = ORDER_STATUS[o.status];
  const units = o.items.reduce((a, i) => a + i.qty, 0);
  return (
    <Card style={s.card}>
      <Pressable style={s.top} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={[s.iconTile, { backgroundColor: status.bg }]}>
          <Ion name="cube-outline" size={22} color={status.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={T.bodyStrong} numberOfLines={1}>{showClient ? o.client.business : `Pedido ${o.id}`}</Text>
          <Text style={T.small}>{showClient ? `${o.id} · ` : ''}{fmtDate(o.createdAt)} · {units} paca{units === 1 ? '' : 's'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={T.bodyStrong}>{money(o.total)}</Text>
          <StatusPill status={status} size="sm" />
        </View>
      </Pressable>

      {open && (
        <View style={s.detail}>
          {showClient && <ClientInfo client={o.client} />}
          {o.items.map((i) => (
            <View key={i.id} style={s.line}>
              <Text style={[T.body, { flex: 1 }]}><Text style={{ fontWeight: '700', color: C.ink }}>{i.qty}×</Text>  {i.name}</Text>
              <Text style={T.body}>{money(i.qty * i.price)}</Text>
            </View>
          ))}
          <View style={s.meta}>
            <Meta icon="calendar-outline" text={o.day} />
            <Meta icon="wallet-outline" text={o.payment} />
            {!!o.note && <Meta icon="chatbubble-ellipses-outline" text={o.note} />}
          </View>
          {o.status !== 'cancelado' && (
            <Timeline flow={ORDER_FLOW} statusMap={ORDER_STATUS} history={o.history} current={o.status} />
          )}
          {actions}
        </View>
      )}
    </Card>
  );
}

export function ReportItem({ report: r, showClient, actions, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const status = REPORT_STATUS[r.status];
  const eq = equipById(r.equipment);
  return (
    <Card style={s.card}>
      <Pressable style={s.top} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={[s.iconTile, { backgroundColor: r.priority === 'alta' && r.status !== 'resuelto' ? C.primarySoft : C.bg }]}>
          <MCI name={eq ? eq.icon : 'wrench-outline'} size={24} color={r.priority === 'alta' && r.status !== 'resuelto' ? C.primary : C.ink2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={T.bodyStrong} numberOfLines={1}>{showClient ? r.client.business : r.equipmentName}</Text>
          <Text style={T.small} numberOfLines={1}>{showClient ? `${r.equipmentName} · ` : ''}{r.problem}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <StatusPill status={status} size="sm" />
            {r.priority === 'alta' && r.status !== 'resuelto' && (
              <View style={s.urgent}><Ion name="flash" size={11} color={C.primary} /><Text style={s.urgentText}>Urgente</Text></View>
            )}
          </View>
        </View>
        <Ion name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
      </Pressable>

      {open && (
        <View style={s.detail}>
          {showClient && <ClientInfo client={r.client} />}
          <View style={s.meta}>
            <Meta icon="pricetag-outline" text={`${r.id}${r.asset ? ` · Placa ${r.asset}` : ''}`} />
            <Meta icon="time-outline" text={fmtDate(r.createdAt)} />
            {!!r.technician && <Meta icon="person-outline" text={`Técnico: ${r.technician}`} />}
          </View>
          {!!r.description && <Text style={[T.body, { marginBottom: 12 }]}>“{r.description}”</Text>}
          {!!r.photo && <Image source={{ uri: r.photo }} style={s.photo} resizeMode="cover" />}
          <Timeline flow={REPORT_FLOW} statusMap={REPORT_STATUS} history={r.history} current={r.status} />
          {actions}
        </View>
      )}
    </Card>
  );
}

function ClientInfo({ client }) {
  return (
    <View style={s.client}>
      <Ion name="storefront-outline" size={18} color={C.ink2} />
      <View style={{ flex: 1 }}>
        <Text style={T.bodyStrong}>{client.business}</Text>
        <Text style={T.small}>{client.code} · {client.phone}</Text>
      </View>
    </View>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ion name={icon} size={15} color={C.muted} />
      <Text style={[T.small, { color: C.ink2, flex: 1 }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: { width: 48, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  detail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderColor: C.line },
  line: { flexDirection: 'row', paddingVertical: 4, gap: 8 },
  meta: { gap: 8, marginVertical: 12 },
  client: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md, padding: 12, marginBottom: 12 },
  photo: { width: '100%', height: 180, borderRadius: R.md, marginBottom: 14 },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.primarySoft, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { color: C.primary, fontSize: 11, fontWeight: '700' },
});
