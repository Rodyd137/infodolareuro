// Acceso con número de teléfono + código. El dueño no tiene que recordar códigos de cliente.
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, T } from '../theme';
import { DEMO_OTP, demoProfile } from '../data';
import { useStore } from '../store';
import { Button, Field, Input, Ion } from '../ui';

export default function Login() {
  const { login } = useStore();
  const [step, setStep] = useState('phone'); // phone | code | admin
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const codeRef = useRef(null);

  const digits = phone.replace(/\D/g, '');
  const phoneOk = digits.length === 10 && /^8[024]9/.test(digits);
  const pretty = phoneOk ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}` : phone;

  function verify(value) {
    setCode(value);
    setError('');
    if (value.length === 6) {
      if (value === DEMO_OTP) login({ ...demoProfile(pretty), role: 'cliente' });
      else setError('El código no es correcto. Revisa el mensaje e inténtalo otra vez.');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.primary, overflow: 'hidden' }}>
      <LinearGradient colors={[C.primary, C.primaryDark]} style={StyleSheet.absoluteFill} />
      <View style={s.circleA} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
            <View style={s.hero}>
              <View style={s.badge}><Ion name="storefront" size={14} color={C.primary} /><Text style={s.badgeText}>NEGOCIOS</Text></View>
              <Text style={s.brand}>Kola Real</Text>
              <Text style={s.tagline}>Pide tu mercancía y reporta tus equipos sin esperar al vendedor.</Text>
            </View>

            <View style={s.sheet}>
              {step === 'phone' && (
                <>
                  <Text style={T.title}>¿Cuál es tu número?</Text>
                  <Text style={[T.body, s.sub]}>El mismo que tiene registrado tu vendedor. Te enviamos un código por SMS.</Text>
                  <View style={s.phoneRow}>
                    <View style={s.prefix}><Text style={{ fontSize: 18 }}>🇩🇴</Text><Text style={T.bodyStrong}>+1</Text></View>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="809 000 0000"
                      placeholderTextColor="#A9A9B4"
                      keyboardType="phone-pad"
                      maxLength={14}
                      autoFocus
                      style={s.phoneInput}
                      accessibilityLabel="Número de teléfono"
                    />
                  </View>
                  <Button title="Recibir código" disabled={!phoneOk} style={{ marginTop: 20 }}
                    onPress={() => { setStep('code'); setTimeout(() => codeRef.current && codeRef.current.focus(), 50); }} />
                  {!phoneOk && digits.length >= 10 && <Text style={s.err}>Escribe un número dominicano de 10 dígitos (809, 829 u 849).</Text>}
                </>
              )}

              {step === 'code' && (
                <>
                  <Pressable onPress={() => { setStep('phone'); setCode(''); setError(''); }} style={s.back} hitSlop={8}>
                    <Ion name="arrow-back" size={20} color={C.ink} /><Text style={T.bodyStrong}>Cambiar número</Text>
                  </Pressable>
                  <Text style={T.title}>Escribe el código</Text>
                  <Text style={[T.body, s.sub]}>Lo enviamos por SMS al <Text style={{ fontWeight: '700', color: C.ink }}>{pretty}</Text>.</Text>
                  <Pressable onPress={() => codeRef.current && codeRef.current.focus()} style={s.otpRow} accessibilityLabel="Código de verificación">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <View key={i} style={[s.otpBox, code.length === i && s.otpActive, !!error && { borderColor: C.primary }]}>
                        <Text style={s.otpText}>{code[i] || ''}</Text>
                      </View>
                    ))}
                  </Pressable>
                  <TextInput
                    ref={codeRef}
                    value={code}
                    onChangeText={(v) => verify(v.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    maxLength={6}
                    style={s.hiddenInput}
                    accessibilityLabel="Código"
                    testID="otp-input"
                  />
                  {!!error && <Text style={s.err}>{error}</Text>}
                  <View style={s.demo}><Ion name="information-circle-outline" size={18} color={C.blue} /><Text style={[T.small, { color: C.blue, flex: 1 }]}>Demo: el código es {DEMO_OTP}</Text></View>
                </>
              )}

              {step === 'admin' && (
                <>
                  <Pressable onPress={() => setStep('phone')} style={s.back} hitSlop={8}>
                    <Ion name="arrow-back" size={20} color={C.ink} /><Text style={T.bodyStrong}>Volver</Text>
                  </Pressable>
                  <Text style={T.title}>Panel del distribuidor</Text>
                  <Text style={[T.body, s.sub]}>Para supervisores y personal de la distribuidora.</Text>
                  <Field label="Código de empleado"><Input icon="id-card-outline" value={adminCode} onChangeText={setAdminCode} placeholder="Ej: DIS-01" autoCapitalize="characters" /></Field>
                  <Field label="Nombre"><Input icon="person-outline" value={adminName} onChangeText={setAdminName} placeholder="Ej: Distribuidora Norte" /></Field>
                  <Button title="Entrar al panel" disabled={!adminCode.trim() || !adminName.trim()}
                    onPress={() => login({ code: adminCode.trim().toUpperCase(), business: adminName.trim(), phone: '', role: 'admin' })} />
                </>
              )}

              {step === 'phone' && (
                <Pressable onPress={() => setStep('admin')} style={{ marginTop: 'auto', paddingTop: 32 }} hitSlop={8}>
                  <Text style={[T.small, { textAlign: 'center' }]}>¿Trabajas en la distribuidora? <Text style={{ color: C.primary, fontWeight: '700' }}>Entrar al panel</Text></Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  circleA: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: '#ffffff12', top: -120, right: -100 },
  hero: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.yellow, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 12 },
  badgeText: { color: C.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  brand: { color: '#fff', fontSize: 44, fontWeight: '900', letterSpacing: -1.5, marginTop: 16, fontStyle: 'italic' },
  tagline: { color: '#FFE3E5', fontSize: 16, lineHeight: 23, marginTop: 6, maxWidth: 320 },
  sheet: { flex: 1, backgroundColor: C.bg, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: 24, paddingBottom: 32 },
  sub: { color: C.muted, marginTop: 6, marginBottom: 22 },
  phoneRow: { flexDirection: 'row', gap: 10 },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14 },
  phoneInput: { flex: 1, minWidth: 0, width: '100%', backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.line, paddingHorizontal: 16, height: 58, fontSize: 22, fontWeight: '700', color: C.ink, letterSpacing: 1, outlineStyle: 'none' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, alignSelf: 'flex-start' },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  otpBox: { flex: 1, height: 58, borderRadius: R.md, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  otpActive: { borderColor: C.ink },
  otpText: { fontSize: 24, fontWeight: '800', color: C.ink },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  err: { color: C.primary, marginTop: 12, fontSize: 14, fontWeight: '600' },
  demo: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: C.blueSoft, borderRadius: R.md, padding: 12, marginTop: 20 },
});
