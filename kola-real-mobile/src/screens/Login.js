import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T } from '../theme';
import { useStore } from '../store';
import { Button, Field, Input, Ion, Segmented } from '../ui';

export default function Login() {
  const { login } = useStore();
  const [code, setCode] = useState('');
  const [business, setBusiness] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('cliente');
  const valid = code.trim() && business.trim() && phone.trim();

  return (
    <View style={{ flex: 1, backgroundColor: C.primary }}>
      <LinearGradient colors={[C.primary, C.primaryDark]} style={StyleSheet.absoluteFill} />
      <View style={s.circleA} />
      <View style={s.circleB} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
            <View style={s.hero}>
              <View style={s.badge}>
                <Ion name="storefront" size={14} color={C.primary} />
                <Text style={s.badgeText}>NEGOCIOS</Text>
              </View>
              <Text style={s.brand}>Kola Real</Text>
              <Text style={s.tagline}>Haz tus pedidos y reporta cualquier problema con tus equipos, todo desde tu teléfono.</Text>
            </View>

            <View style={s.sheet}>
              <Text style={T.title}>Entrar</Text>
              <Text style={[T.body, { color: C.muted, marginTop: 4, marginBottom: 22 }]}>Usa el código de cliente que aparece en tu factura.</Text>

              <Segmented
                style={{ marginBottom: 20 }}
                value={role}
                onChange={setRole}
                options={[
                  { value: 'cliente', label: 'Mi negocio', icon: 'storefront-outline' },
                  { value: 'admin', label: 'Distribuidor', icon: 'briefcase-outline' },
                ]}
              />

              <Field label="Código de cliente">
                <Input icon="card-outline" value={code} onChangeText={setCode} placeholder="Ej: CLI-1001" autoCapitalize="characters" />
              </Field>
              <Field label="Nombre del negocio">
                <Input icon="storefront-outline" value={business} onChangeText={setBusiness} placeholder="Ej: Colmado Don Pedro" />
              </Field>
              <Field label="Teléfono o WhatsApp">
                <Input icon="call-outline" value={phone} onChangeText={setPhone} placeholder="809-000-0000" keyboardType="phone-pad" />
              </Field>

              <Button
                title="Entrar"
                icon="arrow-forward"
                disabled={!valid}
                onPress={() => login({ code: code.trim().toUpperCase(), business: business.trim(), phone: phone.trim(), role })}
              />
              <Text style={[T.small, { textAlign: 'center', marginTop: 16 }]}>Versión de demostración · los datos se guardan en este teléfono</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  circleA: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: '#ffffff12', top: -120, right: -100 },
  circleB: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#FFC20E22', top: 150, left: -70 },
  hero: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.yellow, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 12 },
  badgeText: { color: C.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  brand: { color: '#fff', fontSize: 46, fontWeight: '900', letterSpacing: -1.5, marginTop: 18, fontStyle: 'italic' },
  tagline: { color: '#FFE3E5', fontSize: 16, lineHeight: 23, marginTop: 8, maxWidth: 320 },
  sheet: { flex: 1, backgroundColor: C.bg, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: 24, paddingBottom: 40 },
});
