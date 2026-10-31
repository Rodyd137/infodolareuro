import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../data';
import { useStore } from '../store';
import { Button, Chips, Field, Input } from '../ui';

export default function Login() {
  const { login } = useStore();
  const [code, setCode] = useState('');
  const [business, setBusiness] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('cliente');
  const valid = code.trim() && business.trim() && phone.trim();

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.red }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={st.wrap} keyboardShouldPersistTaps="handled">
        <View style={st.card}>
          <View style={st.logo}><Text style={st.logoText}>KR</Text></View>
          <Text style={st.title}>Kola Real Negocios</Text>
          <Text style={st.sub}>Pide tus productos y reporta problemas con tus equipos.</Text>

          <Field label="Código de cliente">
            <Input value={code} onChangeText={setCode} placeholder="Ej: CLI-1001" autoCapitalize="characters" />
          </Field>
          <Field label="Nombre del negocio">
            <Input value={business} onChangeText={setBusiness} placeholder="Ej: Colmado Don Pedro" />
          </Field>
          <Field label="Teléfono / WhatsApp">
            <Input value={phone} onChangeText={setPhone} placeholder="809-000-0000" keyboardType="phone-pad" />
          </Field>
          <Field label="Entrar como">
            <Chips
              value={role}
              onChange={setRole}
              options={[{ value: 'cliente', label: 'Dueño de negocio' }, { value: 'admin', label: 'Distribuidor / Supervisor' }]}
            />
          </Field>

          <Button
            title="Entrar"
            disabled={!valid}
            onPress={() => login({ code: code.trim().toUpperCase(), business: business.trim(), phone: phone.trim(), role })}
          />
          <Text style={st.note}>Prototipo de demostración. Los datos se guardan solo en este teléfono.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 22, width: '100%', maxWidth: 420, alignSelf: 'center' },
  logo: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.red, borderWidth: 3, borderColor: COLORS.yellow, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: COLORS.yellow, fontWeight: '800', fontSize: 20 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 10, color: COLORS.text },
  sub: { color: COLORS.muted, marginTop: 4, marginBottom: 16 },
  note: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 14 },
});
