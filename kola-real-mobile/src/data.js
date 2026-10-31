// Datos de ejemplo para la demo (precios ficticios).
// En producción vienen del backend.
import { C } from './theme';

// Número del distribuidor para enviar copias por WhatsApp (cambiar por el real).
export const DISTRIBUTOR_WHATSAPP = '18090000000';

export const CATEGORIES = ['Todos', 'Gaseosas', 'Agua', 'Energizantes', 'Deportivas', 'Jugos'];

// kind: forma de la ilustración (bottle | big | can | jug)
export const PRODUCTS = [
  { id: 'kr-roja-400', name: 'Kola Real Roja', size: '400 ml', pack: 'Paca de 12', cat: 'Gaseosas', price: 420, color: '#D3121B', kind: 'bottle', tag: 'Más vendido' },
  { id: 'kr-roja-2l', name: 'Kola Real Roja', size: '2 L', pack: 'Paca de 6', cat: 'Gaseosas', price: 510, color: '#D3121B', kind: 'big', tag: 'Más vendido' },
  { id: 'kr-roja-3l', name: 'Kola Real Roja', size: '3 L', pack: 'Paca de 4', cat: 'Gaseosas', price: 480, color: '#D3121B', kind: 'big' },
  { id: 'kr-naranja-2l', name: 'Kola Real Naranja', size: '2 L', pack: 'Paca de 6', cat: 'Gaseosas', price: 510, color: '#F57C00', kind: 'big' },
  { id: 'kr-uva-2l', name: 'Kola Real Uva', size: '2 L', pack: 'Paca de 6', cat: 'Gaseosas', price: 510, color: '#6A2C91', kind: 'big' },
  { id: 'kr-limon-2l', name: 'Kola Real Limón', size: '2 L', pack: 'Paca de 6', cat: 'Gaseosas', price: 510, color: '#3C9A2F', kind: 'big' },
  { id: 'kr-negra-2l', name: 'Kola Real Negra', size: '2 L', pack: 'Paca de 6', cat: 'Gaseosas', price: 510, color: '#3B2314', kind: 'big' },
  { id: 'cielo-600', name: 'Agua Cielo', size: '600 ml', pack: 'Paca de 20', cat: 'Agua', price: 300, color: '#1E88E5', kind: 'bottle' },
  { id: 'cielo-galon', name: 'Agua Cielo', size: 'Galón', pack: 'Paca de 6', cat: 'Agua', price: 360, color: '#1E88E5', kind: 'jug' },
  { id: 'volt-300', name: 'Volt Energizante', size: '300 ml', pack: 'Paca de 12', cat: 'Energizantes', price: 540, color: '#E5B000', kind: 'can' },
  { id: 'sporade-500', name: 'Sporade', size: '500 ml', pack: 'Paca de 12', cat: 'Deportivas', price: 600, color: '#00A3A3', kind: 'bottle' },
  { id: 'cifrut-500', name: 'Cifrut', size: '500 ml', pack: 'Paca de 12', cat: 'Jugos', price: 480, color: '#FF7A00', kind: 'bottle' },
];

// icon: nombre en MaterialCommunityIcons.
// urgent: el problema se marca urgente automáticamente (el dueño no tiene que decidirlo).
export const EQUIPMENT = [
  { id: 'freezer', name: 'Freezer o nevera', icon: 'fridge-outline', problems: [
    { label: 'No enfría', icon: 'thermometer-alert', urgent: true },
    { label: 'No enciende', icon: 'power-plug-off-outline', urgent: true },
    { label: 'Bota agua', icon: 'water-alert-outline' },
    { label: 'Hace mucho ruido', icon: 'volume-high' },
    { label: 'Puerta o goma dañada', icon: 'door-closed' },
    { label: 'Luz no sirve', icon: 'lightbulb-off-outline' },
  ] },
  { id: 'letrero', name: 'Letrero', icon: 'billboard', problems: [
    { label: 'No prende', icon: 'lightbulb-off-outline' },
    { label: 'Se está cayendo', icon: 'alert-outline', urgent: true },
    { label: 'Roto o dañado', icon: 'image-broken-variant' },
    { label: 'Desteñido', icon: 'palette-outline' },
  ] },
  { id: 'exhibidor', name: 'Exhibidor', icon: 'bookshelf', problems: [
    { label: 'Roto o doblado', icon: 'image-broken-variant' },
    { label: 'Le falta una pieza', icon: 'puzzle-outline' },
  ] },
  { id: 'toldo', name: 'Toldo o sombrilla', icon: 'umbrella-beach-outline', problems: [
    { label: 'Roto', icon: 'image-broken-variant' },
    { label: 'Desteñido', icon: 'palette-outline' },
  ] },
  { id: 'mesas', name: 'Mesas y sillas', icon: 'table-chair', problems: [
    { label: 'Rotas', icon: 'image-broken-variant' },
    { label: 'Faltan unidades', icon: 'numeric-negative-1' },
  ] },
  { id: 'otro', name: 'Otro equipo', icon: 'help-circle-outline', problems: [
    { label: 'Necesito equipo nuevo', icon: 'plus-circle-outline' },
    { label: 'Otro problema', icon: 'dots-horizontal-circle-outline' },
  ] },
];

// ---------- Perfil de ejemplo ----------
// En producción: el teléfono identifica al negocio en el sistema de la distribuidora,
// y de ahí salen su ruta, su vendedor, sus equipos instalados y su historial.
export const DEMO_OTP = '123456';
export function demoProfile(phone) {
  return {
    code: 'CLI-1001',
    business: 'Colmado Don Pedro',
    owner: 'Pedro',
    phone,
    address: 'C/ Duarte #45, Villa Mella',
    seller: { name: 'Carlos Martínez', phone: '18090000001' },
    visitDays: [2, 5], // martes y viernes
    equipment: [
      { asset: 'FRZ-00231', type: 'freezer', name: 'Freezer vertical', detail: '2 puertas · al lado del mostrador' },
      { asset: 'LTR-0087', type: 'letrero', name: 'Letrero luminoso', detail: 'Fachada' },
      { asset: 'EXH-0412', type: 'exhibidor', name: 'Exhibidor de pacas', detail: 'Entrada del local' },
    ],
    usual: { 'kr-roja-2l': 6, 'kr-roja-400': 4, 'kr-naranja-2l': 2, 'cielo-600': 3 },
  };
}

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Próximas visitas de la ruta (a partir de mañana).
export function nextVisits(visitDays, count = 3) {
  const out = [];
  const d = new Date();
  for (let i = 1; out.length < count && i < 30; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (visitDays.includes(x.getDay())) out.push(x);
  }
  return out;
}
export const fmtDay = (date) => {
  const d = new Date(date);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};
export const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
export const visitDaysText = (days) => days.map((n) => DAY_NAMES[n]).join(' y ');

export const PAYMENT_METHODS = [
  { value: 'Efectivo al recibir', icon: 'cash', sub: 'Pagas cuando llegue el camión' },
  { value: 'Transferencia', icon: 'bank-transfer', sub: 'Te enviamos los datos de la cuenta' },
  { value: 'Crédito', icon: 'credit-card-clock-outline', sub: 'Solo clientes aprobados' },
];

export const ORDER_FLOW = ['pendiente', 'confirmado', 'en_camino', 'entregado'];
export const ORDER_STATUS = {
  pendiente: { label: 'Recibido', color: C.amber, bg: C.amberSoft, icon: 'time-outline' },
  confirmado: { label: 'Confirmado', color: C.blue, bg: C.blueSoft, icon: 'checkmark-circle-outline' },
  en_camino: { label: 'En camino', color: C.blue, bg: C.blueSoft, icon: 'car-outline' },
  entregado: { label: 'Entregado', color: C.green, bg: C.greenSoft, icon: 'checkmark-done-circle-outline' },
  cancelado: { label: 'Cancelado', color: C.muted, bg: C.graySoft, icon: 'close-circle-outline' },
};

export const REPORT_FLOW = ['abierto', 'tecnico_asignado', 'en_reparacion', 'resuelto'];
export const REPORT_STATUS = {
  abierto: { label: 'Recibido', color: C.amber, bg: C.amberSoft, icon: 'time-outline' },
  tecnico_asignado: { label: 'Técnico asignado', color: C.blue, bg: C.blueSoft, icon: 'person-outline' },
  en_reparacion: { label: 'En reparación', color: C.blue, bg: C.blueSoft, icon: 'construct-outline' },
  resuelto: { label: 'Resuelto', color: C.green, bg: C.greenSoft, icon: 'checkmark-done-circle-outline' },
};

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const equipById = (id) => EQUIPMENT.find((e) => e.id === id);

export const money = (n) =>
  'RD$ ' + Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fmtDate = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  h = h % 12 || 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
};
