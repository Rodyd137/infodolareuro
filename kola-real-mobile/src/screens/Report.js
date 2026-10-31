// Reportar un problema con un equipo, en 3 pasos.
import React, { useState } from 'react';
import { Alert, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { C, R, T, shadow } from '../theme';
import { DISTRIBUTOR_WHATSAPP, EQUIPMENT, equipById } from '../data';
import { useStore } from '../store';
import { Button, Card, Field, Input, Ion, MCI, RadioRow, ScreenHeader } from '../ui';

const STEPS = ['Equipo', 'Problema', 'Detalles'];

function notify(title, msg) {
  if (Platform.OS === 'web') return;
  Alert.alert(title, msg);
}

export default function Report({ goTo }) {
  const { createReport } = useStore();
  const [step, setStep] = useState(0);
  const [equipment, setEquipment] = useState(null);
  const [problem, setProblem] = useState('');
  const [priority, setPriority] = useState('normal');
  const [asset, setAsset] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [sent, setSent] = useState(null);
  const eq = equipment ? equipById(equipment) : null;

  function reset() {
    setStep(0); setEquipment(null); setProblem(''); setPriority('normal'); setAsset(''); setDescription(''); setPhoto(null); setSent(null);
  }

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

  if (sent) return <Sent report={sent} onDone={() => { reset(); goTo('actividad', { seg: 'reportes' }); }} />;

  const canNext = (step === 0 && equipment) || (step === 1 && problem) || step === 2;

  function next() {
    if (step < 2) return setStep(step + 1);
    setSent(createReport({
      equipment: eq.id, equipmentName: eq.name, problem, asset: asset.trim(), priority, description: description.trim(), photo,
    }));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader
        title="Reportar un problema"
        subtitle={`Paso ${step + 1} de 3 · ${STEPS[step]}`}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
      />
      <View style={s.progress}>
        {STEPS.map((x, i) => <View key={x} style={[s.progressSeg, i <= step && { backgroundColor: C.primary }]} />)}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={[T.h3, { marginBottom: 14 }]}>¿Con qué equipo tienes el problema?</Text>
            <View style={s.grid}>
              {EQUIPMENT.map((e) => {
                const active = e.id === equipment;
                return (
                  <Pressable key={e.id} accessibilityRole="radio" accessibilityState={{ checked: active }}
                    onPress={() => { if (e.id !== equipment) setProblem(''); setEquipment(e.id); }}
                    style={({ pressed }) => [s.tile, active && s.tileActive, pressed && { opacity: 0.9 }]}>
                    {active && <View style={s.check}><Ion name="checkmark" size={14} color="#fff" /></View>}
                    <View style={[s.tileIcon, active && { backgroundColor: '#fff' }]}>
                      <MCI name={e.icon} size={30} color={active ? C.primary : C.ink2} />
                    </View>
                    <Text style={[T.bodyStrong, { textAlign: 'center' }, active && { color: C.primary }]}>{e.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 1 && eq && (
          <>
            <SelectedEquip eq={eq} onChange={() => setStep(0)} />
            <Text style={[T.h3, { marginTop: 22, marginBottom: 12 }]}>¿Qué le pasa?</Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {eq.problems.map((p, i) => (
                <RadioRow key={p} title={p} selected={problem === p} onPress={() => setProblem(p)} last={i === eq.problems.length - 1} />
              ))}
            </Card>
            <Text style={[T.h3, { marginTop: 24, marginBottom: 12 }]}>¿Qué tan urgente es?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <UrgencyCard active={priority === 'normal'} onPress={() => setPriority('normal')}
                icon="time-outline" title="Normal" sub="Puede esperar unos días" color={C.blue} />
              <UrgencyCard active={priority === 'alta'} onPress={() => setPriority('alta')}
                icon="flash" title="Urgente" sub="Estoy perdiendo ventas" color={C.primary} />
            </View>
          </>
        )}

        {step === 2 && eq && (
          <>
            <SelectedEquip eq={eq} problem={problem} urgent={priority === 'alta'} onChange={() => setStep(1)} />
            <Field label="Foto del equipo" hint="Una foto ayuda al técnico a llevar la pieza correcta." style={{ marginTop: 22 }}>
              {photo ? (
                <View>
                  <Image source={{ uri: photo }} style={s.photo} resizeMode="cover" />
                  <Pressable onPress={() => setPhoto(null)} style={s.photoRemove} accessibilityLabel="Quitar foto">
                    <Ion name="close" size={18} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <PhotoBtn icon="camera-outline" label="Tomar foto" onPress={() => pickPhoto(true)} />
                  <PhotoBtn icon="images-outline" label="Galería" onPress={() => pickPhoto(false)} />
                </View>
              )}
            </Field>
            <Field label="Código o placa del equipo" hint="Lo encuentras en una etiqueta pegada al equipo. Si no lo ves, déjalo vacío.">
              <Input icon="barcode-outline" value={asset} onChangeText={setAsset} placeholder="Ej: FRZ-00231" autoCapitalize="characters" />
            </Field>
            <Field label="Cuéntanos más (opcional)">
              <Input value={description} onChangeText={setDescription} multiline
                placeholder="Ej: Desde ayer el freezer no enfría y los refrescos están calientes." />
            </Field>
          </>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={s.footer}>
        <Button
          title={step < 2 ? 'Continuar' : 'Enviar reporte'}
          icon={step < 2 ? 'arrow-forward' : 'paper-plane-outline'}
          disabled={!canNext}
          onPress={next}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}

function SelectedEquip({ eq, problem, urgent, onChange }) {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={[s.smallIcon]}><MCI name={eq.icon} size={24} color={C.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={T.bodyStrong}>{eq.name}</Text>
        {problem ? <Text style={T.small}>{problem}{urgent ? ' · Urgente' : ''}</Text> : <Text style={T.small}>Equipo seleccionado</Text>}
      </View>
      <Pressable onPress={onChange} hitSlop={8}><Text style={{ color: C.primary, fontWeight: '700' }}>Cambiar</Text></Pressable>
    </Card>
  );
}

function UrgencyCard({ active, onPress, icon, title, sub, color }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: active }}
      style={[s.urg, active && { borderColor: color, backgroundColor: color + '10' }]}>
      <View style={[s.urgIcon, { backgroundColor: active ? color : C.bg }]}>
        <Ion name={icon} size={18} color={active ? '#fff' : C.muted} />
      </View>
      <Text style={[T.bodyStrong, { marginTop: 10 }, active && { color }]}>{title}</Text>
      <Text style={T.small}>{sub}</Text>
    </Pressable>
  );
}

function PhotoBtn({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.photoBtn, pressed && { backgroundColor: C.primarySoft }]}>
      <Ion name={icon} size={26} color={C.primary} />
      <Text style={[T.bodyStrong, { marginTop: 6 }]}>{label}</Text>
    </Pressable>
  );
}

function Sent({ report, onDone }) {
  const text = `Reporte ${report.id} - ${report.client.business} (${report.client.code})\n`
    + `Equipo: ${report.equipmentName}${report.asset ? ` [${report.asset}]` : ''}\nProblema: ${report.problem}\n`
    + `Urgencia: ${report.priority === 'alta' ? 'URGENTE' : 'Normal'}${report.description ? `\nDetalle: ${report.description}` : ''}`;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.surface }}>
      <View style={s.sentWrap}>
        <View style={s.sentRing}><View style={s.sentCircle}><MCI name="wrench-check-outline" size={44} color="#fff" /></View></View>
        <Text style={[T.display, { textAlign: 'center', marginTop: 28 }]}>Reporte recibido</Text>
        <Text style={[T.body, { textAlign: 'center', marginTop: 8, color: C.muted }]}>
          Un supervisor lo revisará y te asignará un técnico. Puedes seguir el estado desde la app.
        </Text>
        <View style={s.sentBox}>
          <Row k="Número de reporte" v={report.id} />
          <Row k="Equipo" v={report.equipmentName} />
          <Row k="Problema" v={report.problem} />
        </View>
      </View>
      <View style={{ padding: 20, gap: 10 }}>
        <Button title="Ver mis reportes" onPress={onDone} />
        <Button title="Enviar copia por WhatsApp" icon="logo-whatsapp" variant="secondary"
          onPress={() => Linking.openURL(`https://wa.me/${DISTRIBUTOR_WHATSAPP}?text=${encodeURIComponent(text)}`).catch(() => {})} />
      </View>
    </SafeAreaView>
  );
}

function Row({ k, v }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={T.small}>{k}</Text>
      <Text style={[T.bodyStrong, { flexShrink: 1, textAlign: 'right' }]}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: 20 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.line },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', flexGrow: 1, backgroundColor: C.surface, borderRadius: R.lg, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center', gap: 12, borderWidth: 2, borderColor: 'transparent', ...shadow },
  tileActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  tileIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  smallIcon: { width: 46, height: 46, borderRadius: R.md, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  urg: { flex: 1, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 2, borderColor: C.line },
  urgIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  photoBtn: { flex: 1, height: 104, borderRadius: R.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: '#F3A9AE', backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 200, borderRadius: R.lg },
  photoRemove: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: '#000000aa', alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.line },
  sentWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  sentRing: { width: 132, height: 132, borderRadius: 66, backgroundColor: C.yellowSoft, alignItems: 'center', justifyContent: 'center' },
  sentCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#F2A900', alignItems: 'center', justifyContent: 'center' },
  sentBox: { alignSelf: 'stretch', backgroundColor: C.bg, borderRadius: R.lg, padding: 16, gap: 10, marginTop: 28 },
});
