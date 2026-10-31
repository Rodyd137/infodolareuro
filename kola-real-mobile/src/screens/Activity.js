// Historial de pedidos del negocio (se abre desde Inicio).
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { useStore } from '../store';
import { Button, Empty, ScreenHeader } from '../ui';
import { OrderItem } from '../components/Items';

export default function Activity({ goTo }) {
  const { db } = useStore();
  const orders = db.orders.filter((o) => o.client.code === db.session.code);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Mis pedidos" subtitle="Toca un pedido para ver el detalle" onBack={() => goTo('inicio')} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4 }}>
        {orders.length
          ? orders.map((o, i) => <OrderItem key={o.id} order={o} defaultOpen={i === 0} />)
          : <Empty icon="cube-outline" title="Aún no tienes pedidos" text="Tus pedidos aparecerán aquí con su estado."
              action={<Button title="Hacer un pedido" full={false} onPress={() => goTo('pedir')} />} />}
      </ScrollView>
    </SafeAreaView>
  );
}
