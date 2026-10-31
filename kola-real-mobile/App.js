import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from './src/theme';
import { StoreProvider, useStore } from './src/store';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import Shop from './src/screens/Shop';
import Report from './src/screens/Report';
import Activity from './src/screens/Activity';
import { AllOrders, AllReports, Summary } from './src/screens/Admin';

const CLIENT_TABS = [
  { id: 'inicio', label: 'Inicio', icon: 'home', Screen: Home, light: true },
  { id: 'pedir', label: 'Pedir', icon: 'cart', Screen: Shop },
  { id: 'reportar', label: 'Reportar', icon: 'construct', Screen: Report },
  { id: 'actividad', label: 'Actividad', icon: 'receipt', Screen: Activity },
];
const ADMIN_TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'stats-chart', Screen: Summary },
  { id: 'admin-pedidos', label: 'Pedidos', icon: 'cube', Screen: AllOrders },
  { id: 'admin-reportes', label: 'Reportes', icon: 'construct', Screen: AllReports },
];

function Main() {
  const { db, ready } = useStore();
  const isAdmin = !!(db.session && db.session.role === 'admin');
  const tabs = isAdmin ? ADMIN_TABS : CLIENT_TABS;
  const [nav, setNav] = useState({ tab: tabs[0].id, params: null });
  const sessionKey = db.session ? `${db.session.code}:${db.session.role}` : '';

  // Al cambiar de usuario, volver a la primera pestaña de su rol.
  useEffect(() => { setNav({ tab: tabs[0].id, params: null }); }, [sessionKey]);

  if (!ready) {
    return <View style={st.center}><ActivityIndicator color={C.primary} size="large" /></View>;
  }
  if (!db.session) return <><StatusBar style="light" /><Login /></>;

  const current = tabs.find((t) => t.id === nav.tab) || tabs[0];
  const goTo = (tab, params = null) => setNav({ tab, params: params ? { ...params, _t: Date.now() } : null });
  const cartCount = Object.values(db.cart).reduce((a, b) => a + b, 0);
  const openReports = db.reports.filter((r) => r.client.code === db.session.code && r.status !== 'resuelto').length;
  const pendingOrders = db.orders.filter((o) => o.status === 'pendiente').length;
  const adminOpen = db.reports.filter((r) => r.status === 'abierto').length;
  const badges = { pedir: cartCount, actividad: openReports, 'admin-pedidos': pendingOrders, 'admin-reportes': adminOpen };
  const { Screen } = current;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={current.light ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <Screen key={current.id} goTo={goTo} params={nav.params} />
      </View>
      <SafeAreaView edges={['bottom']} style={st.tabbar}>
        {tabs.map((t) => {
          const active = t.id === current.id;
          const badge = badges[t.id];
          return (
            <Pressable key={t.id} onPress={() => goTo(t.id)} style={st.tab} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={t.label}>
              <View style={[st.tabIcon, active && st.tabIconActive]}>
                <Ionicons name={active ? t.icon : `${t.icon}-outline`} size={22} color={active ? C.primary : C.muted} />
                {!!badge && <View style={st.badge}><Text style={st.badgeText}>{badge > 99 ? '99+' : badge}</Text></View>}
              </View>
              <Text style={[st.tabLabel, active && st.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  tabbar: { flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.line, paddingTop: 6 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 6 },
  tabIcon: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: C.primarySoft },
  tabLabel: { fontSize: 11, color: C.muted, marginTop: 3, fontWeight: '600' },
  tabLabelActive: { color: C.primary, fontWeight: '800' },
  badge: { position: 'absolute', top: -2, right: 6, backgroundColor: C.primary, borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.surface },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
