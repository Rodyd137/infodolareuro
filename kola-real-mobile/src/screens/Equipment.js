// Mis equipos: el negocio ve los equipos que tiene instalados y reporta tocando uno.
// La placa ya se conoce y la urgencia se decide sola según el problema.
import React, { useState } from 'react';
import { Alert, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { C, R, T, shadow } from '../theme';
import { EQUIPMENT, REPORT_FLOW, REPORT_STATUS, equipById, fmtDate } from '../data';
import { useStore } from '../store';
import { Button, Card, Input, Ion, MCI, ScreenHeader, Sheet, Timeline } from '../ui';

function notify(title, msg) {
  if (Platform.OS === 'web') return;
  Alert.alert(title, msg);
}

export default function Equipment() {
  const { db } = useStore();
  const me = db.session;
  const [target, setTarget] = useState(null); // equipo a reportar
  const [viewing, setViewing] = useState(null); // reporte abierto a ver
  const reports = db.reports.filter((r) => r.client.code === me.code);
  const openFor = (asset) => reports.find((r) => r.asset === asset && r.status !== 'resuelto');
  const equipment = me.equipment || [];
  const otherOpen = reports.filter((r) => r.status !== 'resuelto' && !equipment.some((e) => e.asset === r.asset));
  const resolved = reports.filter((r) => r.status === 'resuelto');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScreenHeader title="Mis equipos" subtitle="¿Algo no funciona? Toca el equipo." />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {equipment.map((e) => {
          const type = equipById(e.type);
          const rep = openFor(e.asset);
          const st = rep && REPORT_STATUS[rep.status];
          return (
            <Card key={e.asset} style={[s.equip, rep && { borderColor: st.color }]} onPress={() => (rep ? setViewing(rep) : setTarget({ ...e, typeInfo: type }))}>
              <View style={[s.equipIcon, { backgroundColor: rep ? st.bg : C.greenSoft }]}>
                <MCI name={type.icon} size={30} color={rep ? st.color : C.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={T.h3}>{e.name}</Text>
                <Text style={T.small}>{e.detail} · {e.asset}</Text>
                {rep ? (
                  <View style={[s.state, { backgroundColor: st.bg }]}>
                    <Ion name={st.icon} size={14} color={st.color} />
                    <Text style={[s.stateText, { color: st.color }]} numberOfLines={1}>{rep.problem} · {st.label}</Text>
                  </View>
                ) : (
                  <View style={[s.state, { backgroundColor: C.greenSoft }]}>
                    <Ion name="checkmark-circle" size={14} color={C.green} />
                    <Text style={[s.stateText, { color: C.green }]}>Funcionando</Text>
                  </View>
                )}
              </View>
              <Ion name="chevron-forward" size={20} color={C.muted} />
            </Card>
          );
        })}

        <Pressable style={({ pressed }) => [s.other, pressed && { opacity: 0.8 }]} onPress={() => setTarget({ asset: '', name: '', typeInfo: null })}>
          <Ion name="add-circle-outline" size={22} color={C.ink2} />
          <View style={{ flex: 1 }}>
            <Text style={T.bodyStrong}>Otro equipo o no está en la lista</Text>
            <Text style={T.small}>Toldo, mesas, pedir un equipo nuevo…</Text>
          </View>
        </Pressable>

        {otherOpen.map((r) => (
          <Card key={r.id} style={[s.equip, { marginTop: 12 }]} onPress={() => setViewing(r)}>
            <View style={[s.equipIcon, { backgroundColor: REPORT_STATUS[r.status].bg }]}>
              <MCI name={equipById(r.equipment).icon} size={28} color={REPORT_STATUS[r.status].color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={T.h3}>{r.equipmentName}</Text>
              <Text style={[T.small, { color: REPORT_STATUS[r.status].color, fontWeight: '700' }]}>{r.problem} · {REPORT_STATUS[r.status].label}</Text>
            </View>
            <Ion name="chevron-forward" size={20} color={C.muted} />
          </Card>
        ))}

        {resolved.length > 0 && (
          <>
            <Text style={[T.label, { marginTop: 26, marginBottom: 8 }]}>Arreglados</Text>
            {resolved.map((r) => (
              <Pressable key={r.id} onPress={() => setViewing(r)} style={s.resolved}>
                <Ion name="checkmark-done" size={18} color={C.green} />
                <Text style={[T.body, { flex: 1 }]} numberOfLines={1}>{r.equipmentName}: {r.problem}</Text>
                <Text style={T.small}>{fmtDate(r.createdAt).split(',')[0]}</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <ReportSheet target={target} onClose={() => setTarget(null)} />
      <ReportDetail report={viewing} onClose={() => setViewing(null)} />
    </SafeAreaView>
  );
}

// ---------- Reportar (en una sola hoja) ----------
function ReportSheet({ target, onClose }) {
  const { db, createReport } = useStore();
  const [type, setType] = useState(null);
  const [problem, setProblem] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [sent, setSent] = useState(null);

  const typeInfo = (target && target.typeInfo) || (type && equipById(type));
  const known = !!(target && target.typeInfo);

  function close() {
    setType(null); setProblem(null); setDescription(''); setPhoto(null); setSent(null); onClose();
  }

  async function pickPhoto(fromCamera) {
    try {
      const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return notify('Permiso requerido', 'Activa el permiso en los ajustes del teléfono para adjuntar fotos.');
      const opts = { mediaTypes: ['images'], quality: 0.5 };
      const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (!res.canceled && res.assets && res.assets[0]) setPhoto(res.assets[0].uri);
    } catch (e) { notify('Error', 'No se pudo cargar la foto.'); }
  }

  function send() {
    const r = createReport({
      equipment: typeInfo.id,
      equipmentName: known ? target.name : typeInfo.name,
      asset: known ? target.asset : '',
      problem: problem.label,
      priority: problem.urgent ? 'alta' : 'normal',
      description: description.trim(),
      photo,
    });
    setSent(r);
  }

  const title = sent ? null
    : !typeInfo ? '¿Qué equipo es?'
      : !problem ? `¿Qué le pasa al ${known ? target.name.toLowerCase() : typeInfo.name.toLowerCase()}?`
        : 'Último paso';

  return (
    <Sheet visible={!!target} onClose={close} title={title}>
      {sent ? (
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View style={s.sentCircle}><MCI name="wrench-check-outline" size={40} color="#fff" /></View>
          <Text style={[T.title, { marginTop: 18, textAlign: 'center' }]}>Reporte enviado</Text>
          <Text style={[T.body, { textAlign: 'center', marginTop: 6 }]}>
            {sent.priority === 'alta'
              ? 'Lo marcamos como urgente. Un técnico te contactará lo antes posible.'
              : 'Un supervisor lo revisa y te asigna un técnico. Te avisamos por aquí.'}
          </Text>
          <Text style={[T.small, { marginTop: 6 }]}>Reporte {sent.id}</Text>
          <Button title="Entendido" style={{ marginTop: 20, alignSelf: 'stretch' }} onPress={close} />
        </View>
      ) : !typeInfo ? (
        <View style={s.grid}>
          {EQUIPMENT.map((e) => (
            <Pressable key={e.id} onPress={() => setType(e.id)} style={({ pressed }) => [s.tile, pressed && { opacity: 0.85 }]} accessibilityRole="button">
              <MCI name={e.icon} size={30} color={C.ink2} />
              <Text style={[T.bodyStrong, { textAlign: 'center' }]}>{e.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : !problem ? (
        <View style={s.grid}>
          {typeInfo.problems.map((p) => (
            <Pressable key={p.label} onPress={() => setProblem(p)} style={({ pressed }) => [s.tile, pressed && { opacity: 0.85 }]} accessibilityRole="button">
              <MCI name={p.icon} size={30} color={p.urgent ? C.primary : C.ink2} />
              <Text style={[T.bodyStrong, { textAlign: 'center' }]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View>
          <View style={s.summary}>
            <MCI name={typeInfo.icon} size={22} color={C.ink2} />
            <Text style={[T.bodyStrong, { flex: 1 }]}>{known ? target.name : typeInfo.name}: {problem.label}</Text>
            <Pressable onPress={() => setProblem(null)} hitSlop={8}><Text style={{ color: C.primary, fontWeight: '700' }}>Cambiar</Text></Pressable>
          </View>
          {problem.urgent && (
            <View style={s.urgent}><Ion name="flash" size={16} color={C.primary} /><Text style={[T.smallStrong, { color: C.primary, flex: 1 }]}>Se enviará como urgente</Text></View>
          )}
          <Text style={[T.bodyStrong, { marginTop: 16, marginBottom: 8 }]}>Foto (ayuda al técnico, opcional)</Text>
          {photo ? (
            <View>
              <Image source={{ uri: photo }} style={s.photo} resizeMode="cover" />
              <Pressable onPress={() => setPhoto(null)} style={s.photoRemove} accessibilityLabel="Quitar foto"><Ion name="close" size={18} color="#fff" /></Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Tomar foto" icon="camera-outline" variant="secondary" size="sm" style={{ flex: 1, height: 48 }} onPress={() => pickPhoto(true)} />
              <Button title="Galería" icon="images-outline" variant="secondary" size="sm" style={{ flex: 1, height: 48 }} onPress={() => pickPhoto(false)} />
            </View>
          )}
          <Text style={[T.bodyStrong, { marginTop: 16, marginBottom: 8 }]}>¿Algo más que debamos saber? (opcional)</Text>
          <Input value={description} onChangeText={setDescription} placeholder="Ej: empezó ayer en la tarde" />
          <Button title="Enviar reporte" icon="paper-plane-outline" style={{ marginTop: 20 }} onPress={send} />
        </View>
      )}
    </Sheet>
  );
}

// ---------- Seguimiento de un reporte ----------
function ReportDetail({ report, onClose }) {
  const { db } = useStore();
  const live = report && db.reports.find((r) => r.id === report.id);
  const seller = db.session.seller;
  return (
    <Sheet visible={!!live} onClose={onClose} title={live ? live.equipmentName : ''}>
      {live && (
        <View>
          <Text style={[T.body, { marginBottom: 14 }]}>{live.problem}{live.priority === 'alta' ? ' · Urgente' : ''} · {live.id}</Text>
          {!!live.photo && <Image source={{ uri: live.photo }} style={[s.photo, { marginBottom: 14 }]} resizeMode="cover" />}
          <Card><Timeline flow={REPORT_FLOW} statusMap={REPORT_STATUS} history={live.history} current={live.status} /></Card>
          {seller && live.status !== 'resuelto' && (
            <Button title={`Preguntarle a ${seller.name.split(' ')[0]}`} icon="logo-whatsapp" variant="secondary" style={{ marginTop: 16 }}
              onPress={() => Linking.openURL(`https://wa.me/${seller.phone}?text=${encodeURIComponent(`Hola, ¿cómo va mi reporte ${live.id} (${live.equipmentName}: ${live.problem})?`)}`).catch(() => {})} />
          )}
        </View>
      )}
    </Sheet>
  );
}

const s = StyleSheet.create({
  equip: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent' },
  equipIcon: { width: 60, height: 60, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center' },
  state: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 4, marginTop: 8, maxWidth: '100%' },
  stateText: { fontSize: 12, fontWeight: '700' },
  other: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CFCFD8', borderRadius: R.lg, padding: 16 },
  resolved: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 8, paddingBottom: 4 },
  tile: { width: '48%', flexGrow: 1, minHeight: 104, backgroundColor: C.surface, borderRadius: R.lg, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 14, marginTop: 8 },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primarySoft, borderRadius: R.md, padding: 12, marginTop: 10 },
  photo: { width: '100%', height: 180, borderRadius: R.lg },
  photoRemove: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: '#000000aa', alignItems: 'center', justifyContent: 'center' },
  sentCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#F2A900', alignItems: 'center', justifyContent: 'center' },
});
