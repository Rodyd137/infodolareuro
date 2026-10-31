// Componentes compartidos del sistema de diseño.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { C, R, T, shadow } from './theme';
import { fmtDate } from './data';

export { Ionicons as Ion, MaterialCommunityIcons as MCI };

export function Button({ title, onPress, variant = 'primary', size = 'lg', icon, disabled, style, full = true }) {
  const v = VARIANTS[variant];
  const small = size === 'sm';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        st.btn,
        small && st.btnSm,
        { backgroundColor: v.bg, borderColor: v.border || v.bg },
        !full && { alignSelf: 'flex-start' },
        disabled && { backgroundColor: C.line, borderColor: C.line },
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={small ? 16 : 19} color={disabled ? C.muted : v.fg} />}
      <Text style={[st.btnText, small && { fontSize: 14 }, { color: disabled ? C.muted : v.fg }]}>{title}</Text>
    </Pressable>
  );
}
const VARIANTS = {
  primary: { bg: C.primary, fg: '#fff' },
  dark: { bg: C.ink, fg: '#fff' },
  secondary: { bg: C.surface, fg: C.ink, border: C.line },
  soft: { bg: C.primarySoft, fg: C.primary },
  whatsapp: { bg: '#25D366', fg: '#fff' },
};

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [st.card, style, pressed && { opacity: 0.92 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[st.card, style]}>{children}</View>;
}

export function ScreenHeader({ title, subtitle, right, onBack }) {
  return (
    <View style={st.header}>
      {onBack && (
        <Pressable onPress={onBack} style={st.iconBtn} accessibilityLabel="Atrás" accessibilityRole="button" hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.ink} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={T.title}>{title}</Text>
        {!!subtitle && <Text style={[T.small, { marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function IconButton({ icon, onPress, label, color = C.ink, bg = C.surface }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} accessibilityRole="button" hitSlop={6}
      style={({ pressed }) => [st.iconBtn, { backgroundColor: bg }, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }) {
  return (
    <View style={st.section}>
      <Text style={T.h3}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: C.primary, fontWeight: '700', fontSize: 14 }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function StatusPill({ status, size = 'md' }) {
  return (
    <View style={[st.pill, { backgroundColor: status.bg }, size === 'sm' && { paddingVertical: 3, paddingHorizontal: 8 }]}>
      <View style={[st.dot, { backgroundColor: status.color }]} />
      <Text style={{ color: status.color, fontWeight: '700', fontSize: size === 'sm' ? 11 : 12 }}>{status.label}</Text>
    </View>
  );
}

export function Chips({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} accessibilityRole="button" accessibilityState={{ selected: active }}
            style={[st.chip, active && { backgroundColor: C.ink, borderColor: C.ink }]}>
            <Text style={[st.chipText, active && { color: '#fff' }]}>{o}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[st.seg, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} accessibilityRole="tab" accessibilityState={{ selected: active }}
            style={[st.segItem, active && st.segActive]}>
            {o.icon && <Ionicons name={o.icon} size={16} color={active ? (o.activeColor || C.ink) : C.muted} />}
            <Text style={[st.segText, active && { color: o.activeColor || C.ink }]}>{o.label}</Text>
            {o.badge ? <View style={st.segBadge}><Text style={st.segBadgeText}>{o.badge}</Text></View> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({ value, onChange, compact, wide }) {
  if (!value) {
    return (
      <Pressable onPress={() => onChange(1)} accessibilityRole="button" accessibilityLabel="Agregar"
        style={({ pressed }) => [st.addBtn, compact && { width: 36, height: 36 }, pressed && { opacity: 0.8 }]}>
        <Ionicons name="add" size={22} color="#fff" />
      </Pressable>
    );
  }
  return (
    <View style={[st.stepper, wide && { justifyContent: 'space-between' }]}>
      <Pressable onPress={() => onChange(value - 1)} accessibilityLabel="Quitar uno" hitSlop={6} style={st.stepBtn}>
        <Ionicons name={value === 1 ? 'trash-outline' : 'remove'} size={18} color="#fff" />
      </Pressable>
      <Text style={st.stepVal}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} accessibilityLabel="Agregar uno" hitSlop={6} style={st.stepBtn}>
        <Ionicons name="add" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

export function Field({ label, hint, children, style }) {
  return (
    <View style={[{ marginBottom: 18 }, style]}>
      <Text style={st.fieldLabel}>{label}</Text>
      {children}
      {!!hint && <Text style={[T.small, { marginTop: 6 }]}>{hint}</Text>}
    </View>
  );
}

export function Input({ icon, style, ...props }) {
  return (
    <View style={[st.inputWrap, props.multiline && { alignItems: 'flex-start' }, style]}>
      {icon && <Ionicons name={icon} size={19} color={C.muted} style={props.multiline ? { marginTop: 14 } : null} />}
      <TextInput
        placeholderTextColor="#A9A9B4"
        {...props}
        style={[st.input, props.multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 13 }]}
      />
    </View>
  );
}

export function RadioRow({ title, subtitle, icon, selected, onPress, last }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      style={({ pressed }) => [st.radioRow, !last && st.radioDivider, pressed && { backgroundColor: C.bg }]}>
      {icon && (
        <View style={[st.radioIcon, selected && { backgroundColor: C.primarySoft }]}>
          <MaterialCommunityIcons name={icon} size={20} color={selected ? C.primary : C.ink2} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={T.bodyStrong}>{title}</Text>
        {!!subtitle && <Text style={[T.small, { marginTop: 1 }]}>{subtitle}</Text>}
      </View>
      <View style={[st.radio, selected && { borderColor: C.primary }]}>
        {selected && <View style={st.radioDot} />}
      </View>
    </Pressable>
  );
}

// Línea de tiempo vertical de estados.
export function Timeline({ flow, statusMap, history, current }) {
  const reached = new Map(history.map((h) => [h.status, h]));
  const curIdx = flow.indexOf(current);
  return (
    <View style={{ marginTop: 4 }}>
      {flow.map((key, i) => {
        const done = i <= curIdx;
        const h = reached.get(key);
        const last = i === flow.length - 1;
        return (
          <View key={key} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 20 }}>
              <View style={[st.tlDot, done ? { backgroundColor: C.green, borderColor: C.green } : null]}>
                {done && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              {!last && <View style={[st.tlLine, i < curIdx && { backgroundColor: C.green }]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
              <Text style={[T.bodyStrong, !done && { color: C.muted, fontWeight: '500' }]}>{statusMap[key].label}</Text>
              {done && h && <Text style={T.small}>{fmtDate(h.at)}{h.note ? ` · ${h.note}` : ''}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function Empty({ icon = 'file-tray-outline', title, text, action }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <View style={st.emptyIcon}><Ionicons name={icon} size={30} color={C.muted} /></View>
      <Text style={[T.h3, { marginTop: 14, textAlign: 'center' }]}>{title}</Text>
      {!!text && <Text style={[T.body, { textAlign: 'center', marginTop: 4, color: C.muted }]}>{text}</Text>}
      {action && <View style={{ marginTop: 18 }}>{action}</View>}
    </View>
  );
}

export const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, ...shadow },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  btn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 54, paddingHorizontal: 20, borderRadius: R.md, borderWidth: 1 },
  btnSm: { height: 40, paddingHorizontal: 14, borderRadius: R.sm },
  btnText: { fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, ...shadow },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  chip: { height: 38, justifyContent: 'center', paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  chipText: { fontSize: 14, fontWeight: '600', color: C.ink2 },
  seg: { flexDirection: 'row', backgroundColor: C.graySoft, borderRadius: R.md, padding: 4 },
  segItem: { flex: 1, flexDirection: 'row', gap: 6, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: R.sm },
  segActive: { backgroundColor: C.surface, ...shadow },
  segText: { fontSize: 14, fontWeight: '700', color: C.muted },
  segBadge: { backgroundColor: C.primary, borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  segBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, borderRadius: R.pill, height: 40, paddingHorizontal: 4 },
  stepBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  stepVal: { color: '#fff', fontWeight: '800', fontSize: 15, minWidth: 22, textAlign: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 16, color: C.ink, paddingVertical: 14, outlineStyle: 'none' },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  radioDivider: { borderBottomWidth: 1, borderColor: C.line },
  radioIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C9C9D2', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: C.primary },
  tlDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D5D5DD', backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  tlLine: { width: 2, flex: 1, backgroundColor: '#E2E2E8', marginVertical: 2 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.graySoft, alignItems: 'center', justifyContent: 'center' },
});
