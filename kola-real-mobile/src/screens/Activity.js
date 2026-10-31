// Historial del cliente: pedidos y reportes.
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { useStore } from '../store';
import { Button, Empty, ScreenHeader, Segmented } from '../ui';
import { OrderItem, ReportItem } from '../components/Items';

export default function Activity({ params, goTo }) {
  const { db } = useStore();
  const [seg, setSeg] = useState((params && params.seg) || 'pedidos');
  useEffect(() => { if (params && params.seg) setSeg(params.seg); }, [params]);

  const orders = db.orders.filter((o) => o.client.code === db.session.code);
  const reports = db.reports.filter((r) => r.client.code === db.session.code);
  const openReports = reports.filter((r) => r.status !== 'resuelto').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Actividad" subtitle="Toca un pedido o reporte para ver el detalle" />
      <Segmented
        style={{ marginHorizontal: 20, marginBottom: 6 }}
        value={seg}
        onChange={setSeg}
        options={[
          { value: 'pedidos', label: 'Pedidos', icon: 'cube-outline' },
          { value: 'reportes', label: 'Reportes', icon: 'construct-outline', badge: openReports || null },
        ]}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 14 }}>
        {seg === 'pedidos' && (orders.length
          ? orders.map((o, i) => <OrderItem key={o.id} order={o} defaultOpen={i === 0} />)
          : <Empty icon="cube-outline" title="Aún no tienes pedidos" text="Tus pedidos aparecerán aquí con su estado."
              action={<Button title="Hacer un pedido" full={false} onPress={() => goTo('pedir')} />} />)}
        {seg === 'reportes' && (reports.length
          ? reports.map((r, i) => <ReportItem key={r.id} report={r} defaultOpen={i === 0} />)
          : <Empty icon="happy-outline" title="Todo funcionando" text="No tienes reportes de equipos."
              action={<Button title="Reportar un problema" variant="secondary" full={false} onPress={() => goTo('reportar')} />} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
