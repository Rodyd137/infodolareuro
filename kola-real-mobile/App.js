import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './src/data';
import { StoreProvider, useStore } from './src/store';
import Login from './src/screens/Login';
import { Catalog, MyOrders, MyReports, ReportForm } from './src/screens/Client';
import { AllOrders, AllReports, Summary } from './src/screens/Admin';

const CLIENT_TABS = [
  { id: 'pedir', label: 'Pedir', ico: '🛒', Screen: Catalog },
  { id: 'pedidos', label: 'Mis pedidos', ico: '📦', Screen: MyOrders },
  { id: 'reportar', label: 'Reportar', ico: '🛠️', Screen: ReportForm },
  { id: 'reportes', label: 'Mis reportes', ico: '📋', Screen: MyReports },
];
const ADMIN_TABS = [
  { id: 'resumen', label: 'Resumen', ico: '📊', Screen: Summary },
  { id: 'admin-pedidos', label: 'Pedidos', ico: '📦', Screen: AllOrders },
  { id: 'admin-reportes', label: 'Reportes', ico: '🛠️', Screen: AllReports },
];

function Main() {
  const { db, ready, logout } = useStore();
  const isAdmin = db.session && db.session.role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : CLIENT_TABS;
  const [tab, setTab] = useState(tabs[0].id);

  // Al cambiar de usuario, volver a la primera pestaña de su rol.
  useEffect(() => { setTab(tabs[0].id); }, [db.session && db.session.code, isAdmin]);

  if (!ready) {
    return <View style={st.center}><ActivityIndicator color={COLORS.red} size="large" /></View>;
  }
  if (!db.session) return <Login />;

  const current = tabs.find((t) => t.id === tab) || tabs[0];
  const cartCount = Object.values(db.cart).reduce((a, b) => a + b, 0);
  const { Screen } = current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.red }} edges={['top']}>
      <View style={st.header}>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle} numberOfLines={1}>{db.session.business}</Text>
          <Text style={st.headerSub}>{isAdmin ? 'Distribuidor' : 'Cliente'} · {db.session.code}</Text>
        </View>
        <Pressable onPress={logout} style={st.logout} accessibilityRole="button">
          <Text style={{ color: '#fff', fontWeight: '600' }}>Salir</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <Screen key={current.id} goTo={setTab} />
      </View>

      <SafeAreaView edges={['bottom']} style={st.tabbar}>
        {tabs.map((t) => {
          const active = t.id === current.id;
          return (
            <Pressable key={t.id} onPress={() => setTab(t.id)} style={st.tab} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Text style={{ fontSize: 22 }}>{t.ico}</Text>
              <Text style={[st.tabLabel, active && st.tabActive]}>{t.label}</Text>
              {t.id === 'pedir' && cartCount > 0 && (
                <View style={st.badge}><Text style={st.badgeText}>{cartCount}</Text></View>
              )}
            </Pressable>
          );
        })}
      </SafeAreaView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.red },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 17 },
  headerSub: { color: '#ffd9de', fontSize: 13 },
  logout: { borderWidth: 1, borderColor: '#fff', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  tabbar: { flexDirection: 'row', backgroundColor: COLORS.card, borderTopWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabLabel: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  tabActive: { color: COLORS.red, fontWeight: '700' },
  badge: { position: 'absolute', top: 4, right: '22%', backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 6, minWidth: 18, alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
