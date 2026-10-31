// Componentes compartidos.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from './data';

export function Button({ title, onPress, variant = 'primary', small, disabled, style }) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        ghost ? s.btnGhost : s.btnPrimary,
        small && s.btnSmall,
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={[s.btnText, ghost && { color: COLORS.red }, small && { fontSize: 13 }]}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props) {
  return <TextInput placeholderTextColor={COLORS.muted} {...props} style={[s.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]} />;
}

// Selector de opciones en forma de "chips" (más fácil de tocar que un dropdown).
export function Chips({ options, value, onChange, scroll }) {
  const content = options.map((o) => {
    const val = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    const active = val === value;
    return (
      <Pressable key={val} onPress={() => onChange(val)} style={[s.chip, active && s.chipActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
        <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
      </Pressable>
    );
  });
  if (scroll) {
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>{content}</ScrollView>;
  }
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{content}</View>;
}

export function StatusPill({ status }) {
  return (
    <View style={[s.pill, { backgroundColor: status.color + '22' }]}>
      <Text style={{ color: status.color, fontWeight: '700', fontSize: 12 }}>{status.label}</Text>
    </View>
  );
}

export function Empty({ text }) {
  return <Text style={{ textAlign: 'center', color: COLORS.muted, padding: 32 }}>{text}</Text>;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  h1: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  h2: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  text: { color: COLORS.text, fontSize: 15 },
  muted: { color: COLORS.muted, fontSize: 13 },
  bold: { fontWeight: '700', color: COLORS.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: COLORS.card, color: COLORS.text },
  btn: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.red },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.red },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  chip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  chipText: { color: COLORS.text, fontSize: 14 },
  pill: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
});
