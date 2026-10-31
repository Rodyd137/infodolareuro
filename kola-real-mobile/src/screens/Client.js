// Pantallas del dueño de negocio.
import React, { useState } from 'react';
import { Alert, FlatList, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  CATEGORIES, COLORS, DELIVERY_DAYS, DISTRIBUTOR_WHATSAPP, EQUIPMENT, PAYMENT_METHODS, PRODUCTS, equipById, money, productById,
} from '../data';
import { useStore } from '../store';
import { Button, Card, Chips, Empty, Field, Input, s } from '../ui';
import { OrderCard, ReportCard } from './cards';

function openWhatsApp(text) {
  Linking.openURL(`https://wa.me/${DISTRIBUTOR_WHATSAPP}?text=${encodeURIComponent(text)}`).catch(() => {});
}

function notify(title, msg) {
  if (Platform.OS === 'web') return; // Alert no funciona en la versión web de prueba
  Alert.alert(title, msg);
}

// ---------- Catálogo / carrito ----------
export function Catalog() {
  const { db, addToCart, placeOrder } = useStore();
  const [cat, setCat] = useState('Todos');
  const [step, setStep] = useState('catalog'); // catalog | checkout | sent
  const [day, setDay] = useState(DELIVERY_DAYS[0]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(null);

  const cartItems = Object.entries(db.cart).map(([id, qty]) => ({ p: productById(id), qty })).filter((x) => x.p);
  const count = cartItems.reduce((a, x) => a + x.qty, 0);
  const total = cartItems.reduce((a, x) => a + x.qty * x.p.price, 0);

  if (step === 'sent' && sent) {
    const text = `Pedido ${sent.id} - ${sent.client.business} (${sent.client.code})\n`
      + sent.items.map((i) => `• ${i.qty} × ${i.name}`).join('\n')
      + `\nTotal: ${money(sent.total)}\nEntrega: ${sent.day}\nPago: ${sent.payment}${sent.note ? `\nNota: ${sent.note}` : ''}`;
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48 }}>✅</Text>
          <Text style={s.h1}>¡Pedido enviado!</Text>
          <Text style={[s.text, { textAlign: 'center', marginBottom: 16 }]}>
            Tu número de pedido es <Text style={s.bold}>{sent.id}</Text>.{'\n'}Te avisaremos cuando sea confirmado.
          </Text>
          <Button title="Enviar copia por WhatsApp" onPress={() => openWhatsApp(text)} style={{ alignSelf: 'stretch', marginBottom: 8 }} />
          <Button title="Hacer otro pedido" variant="ghost" onPress={() => setStep('catalog')} style={{ alignSelf: 'stretch' }} />
        </Card>
      </ScrollView>
    );
  }

  if (step === 'checkout') {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>Confirmar pedido</Text>
        <Card>
          {cartItems.map(({ p, qty }) => (
            <View key={p.id} style={[s.between, { marginVertical: 4 }]}>
              <Text style={[s.text, { flex: 1 }]}>{qty} × {p.name}</Text>
              <Text style={s.text}>{money(p.price * qty)}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderColor: COLORS.border, marginTop: 8, paddingTop: 8 }}>
            <View style={s.between}><Text style={s.bold}>Total estimado</Text><Text style={s.bold}>{money(total)}</Text></View>
          </View>
        </Card>
        <Field label="Día de entrega"><Chips options={DELIVERY_DAYS} value={day} onChange={setDay} /></Field>
        <Field label="Forma de pago"><Chips options={PAYMENT_METHODS} value={payment} onChange={setPayment} /></Field>
        <Field label="Nota para el distribuidor (opcional)">
          <Input value={note} onChangeText={setNote} placeholder="Ej: entregar por la puerta de atrás" multiline />
        </Field>
        <Button
          title="Enviar pedido"
          disabled={!count}
          onPress={() => {
            const o = placeOrder({ day, payment, note: note.trim() });
            setSent(o); setNote(''); setStep('sent');
          }}
        />
        <Button title="← Seguir comprando" variant="ghost" onPress={() => setStep('catalog')} style={{ marginTop: 10 }} />
      </ScrollView>
    );
  }

  const list = PRODUCTS.filter((p) => cat === 'Todos' || p.cat === cat);
  return (
    <View style={s.screen}>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[s.content, { paddingBottom: count ? 100 : 32 }]}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={s.h1}>Hacer pedido</Text>
            <Chips scroll options={CATEGORIES} value={cat} onChange={setCat} />
          </View>
        }
        renderItem={({ item: p }) => {
          const q = db.cart[p.id] || 0;
          return (
            <Card style={s.row}>
              <View style={[st.swatch, { backgroundColor: p.color }]}>
                <Text style={st.swatchText}>{p.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.bold}>{p.name}</Text>
                <Text style={s.muted}>{p.pack}</Text>
                <Text style={s.bold}>{money(p.price)}</Text>
              </View>
              <View style={s.row}>
                <QtyBtn label="−" onPress={() => addToCart(p.id, -1)} a11y={`Quitar ${p.name}`} />
                <Text style={[s.bold, { minWidth: 20, textAlign: 'center' }]}>{q}</Text>
                <QtyBtn label="+" onPress={() => addToCart(p.id, 1)} a11y={`Agregar ${p.name}`} />
              </View>
            </Card>
          );
        }}
      />
      {count > 0 && (
        <View style={st.bar}>
          <View style={{ flex: 1 }}>
            <Text style={s.muted}>{count} paca(s)</Text>
            <Text style={[s.bold, { fontSize: 17 }]}>{money(total)}</Text>
          </View>
          <Button title="Revisar pedido" onPress={() => setStep('checkout')} />
        </View>
      )}
    </View>
  );
}

function QtyBtn({ label, onPress, a11y }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={a11y} accessibilityRole="button" style={({ pressed }) => [st.qty, pressed && { opacity: 0.5 }]}>
      <Text style={{ fontSize: 20, color: COLORS.text }}>{label}</Text>
    </Pressable>
  );
}

// ---------- Mis pedidos ----------
export function MyOrders({ goTo }) {
  const { db, setCart } = useStore();
  const mine = db.orders.filter((o) => o.client.code === db.session.code);
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h1}>Mis pedidos</Text>
      {mine.length === 0 && <Empty text="Aún no has hecho pedidos." />}
      {mine.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          footer={(
            <Button
              small variant="ghost" title="Repetir pedido" style={{ marginTop: 10, alignSelf: 'flex-start' }}
              onPress={() => {
                const cart = {};
                o.items.forEach((i) => { if (productById(i.id)) cart[i.id] = i.qty; });
                setCart(cart);
                goTo('pedir');
              }}
            />
          )}
        />
      ))}
    </ScrollView>
  );
}

// ---------- Reportar equipo ----------
export function ReportForm({ goTo }) {
  const { createReport } = useStore();
  const [equipment, setEquipment] = useState(null);
  const [problem, setProblem] = useState('');
  const [asset, setAsset] = useState('');
  const [priority, setPriority] = useState('normal');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [sent, setSent] = useState(null);

  const eq = equipment ? equipById(equipment) : null;

  async function pickPhoto(fromCamera) {
    try {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return notify('Permiso requerido', 'Activa el permiso en los ajustes del teléfono para adjuntar fotos.');
      const opts = { mediaTypes: ['images'], quality: 0.5 };
      const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (!res.canceled && res.assets && res.assets[0]) setPhoto(res.assets[0].uri);
    } catch (e) {
      notify('Error', 'No se pudo cargar la foto.');
    }
  }

  function reset() {
    setEquipment(null); setProblem(''); setAsset(''); setPriority('normal'); setDescription(''); setPhoto(null); setSent(null);
  }

  if (sent) {
    const text = `Reporte ${sent.id} - ${sent.client.business} (${sent.client.code})\n`
      + `Equipo: ${sent.equipmentName}${sent.asset ? ` [${sent.asset}]` : ''}\nProblema: ${sent.problem}\n`
      + `Urgencia: ${sent.priority === 'alta' ? 'URGENTE' : 'Normal'}${sent.description ? `\nDetalle: ${sent.description}` : ''}`;
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48 }}>🛠️</Text>
          <Text style={s.h1}>Reporte recibido</Text>
          <Text style={[s.text, { textAlign: 'center', marginBottom: 16 }]}>
            Número de reporte: <Text style={s.bold}>{sent.id}</Text>.{'\n'}Un supervisor lo revisará y te asignará un técnico.
          </Text>
          <Button title="Enviar copia por WhatsApp" onPress={() => openWhatsApp(text)} style={{ alignSelf: 'stretch', marginBottom: 8 }} />
          <Button title="Ver mis reportes" variant="ghost" onPress={() => { reset(); goTo('reportes'); }} style={{ alignSelf: 'stretch' }} />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Reportar un problema</Text>
      <Text style={[s.muted, { fontSize: 15, marginBottom: 10 }]}>¿Con qué equipo tienes el inconveniente?</Text>
      <View style={st.grid}>
        {EQUIPMENT.map((e) => {
          const active = e.id === equipment;
          return (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => { setEquipment(e.id); setProblem(''); }}
              style={[st.equip, active && st.equipActive]}
            >
              <Text style={{ fontSize: 30 }}>{e.ico}</Text>
              <Text style={[s.text, { textAlign: 'center' }]}>{e.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {eq && (
        <View style={{ marginTop: 8 }}>
          <Field label="¿Qué le pasa?"><Chips options={eq.problems} value={problem} onChange={setProblem} /></Field>
          <Field label="Código / placa del equipo (si lo tiene)">
            <Input value={asset} onChangeText={setAsset} placeholder="Ej: FRZ-00231" autoCapitalize="characters" />
          </Field>
          <Field label="¿Qué tan urgente es?">
            <Chips
              value={priority}
              onChange={setPriority}
              options={[{ value: 'normal', label: 'Normal' }, { value: 'alta', label: 'Urgente: estoy perdiendo ventas' }]}
            />
          </Field>
          <Field label="Describe el problema">
            <Input value={description} onChangeText={setDescription} multiline placeholder="Ej: Desde ayer el freezer no enfría y los refrescos están calientes." />
          </Field>
          <Field label="Foto (opcional)">
            <View style={[s.row, { flexWrap: 'wrap' }]}>
              <Button small variant="ghost" title="📷 Tomar foto" onPress={() => pickPhoto(true)} />
              <Button small variant="ghost" title="🖼️ Galería" onPress={() => pickPhoto(false)} />
              {photo && <Button small variant="ghost" title="Quitar" onPress={() => setPhoto(null)} />}
            </View>
            {photo && <Image source={{ uri: photo }} style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }} resizeMode="cover" />}
          </Field>
          <Button
            title="Enviar reporte"
            disabled={!problem}
            onPress={() => {
              const r = createReport({
                equipment: eq.id, equipmentName: eq.name, problem, asset: asset.trim(), priority, description: description.trim(), photo,
              });
              setSent(r);
            }}
          />
          {!problem && <Text style={[s.muted, { textAlign: 'center', marginTop: 6 }]}>Selecciona qué le pasa al equipo.</Text>}
        </View>
      )}
    </ScrollView>
  );
}

// ---------- Mis reportes ----------
export function MyReports() {
  const { db } = useStore();
  const mine = db.reports.filter((r) => r.client.code === db.session.code);
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h1}>Mis reportes</Text>
      {mine.length === 0 && <Empty text="No tienes reportes. ¡Qué bien! 🎉" />}
      {mine.map((r) => <ReportCard key={r.id} report={r} />)}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  swatch: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  swatchText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  qty: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderColor: COLORS.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  equip: { width: '48%', flexGrow: 1, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 4 },
  equipActive: { borderColor: COLORS.red, backgroundColor: '#c8102e14' },
});
