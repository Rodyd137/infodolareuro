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

// icon: nombre en MaterialCommunityIcons
export const EQUIPMENT = [
  { id: 'freezer', name: 'Freezer o nevera', icon: 'fridge-outline',
    problems: ['No enfría', 'No enciende', 'Hace mucho ruido', 'Bota agua / gotea', 'Puerta o goma dañada', 'Luz interna no sirve'] },
  { id: 'letrero', name: 'Letrero', icon: 'billboard',
    problems: ['Luz apagada / no enciende', 'Dañado o roto', 'Se está cayendo', 'Desteñido', 'Necesito uno nuevo'] },
  { id: 'exhibidor', name: 'Exhibidor o rack', icon: 'bookshelf',
    problems: ['Roto o doblado', 'Le falta una pieza', 'Necesito uno nuevo'] },
  { id: 'toldo', name: 'Toldo o sombrilla', icon: 'umbrella-beach-outline',
    problems: ['Roto', 'Desteñido', 'Necesito uno nuevo'] },
  { id: 'mesas', name: 'Mesas y sillas', icon: 'table-chair',
    problems: ['Están rotas', 'Faltan unidades', 'Necesito más'] },
  { id: 'otro', name: 'Otro', icon: 'help-circle-outline', problems: ['Otro problema'] },
];

export const DELIVERY_DAYS = [
  { value: 'Próxima visita de ruta', label: 'Próxima visita', sub: 'De la ruta' },
  { value: 'Lo antes posible', label: 'Lo antes', sub: 'posible' },
  { value: 'Lunes', label: 'Lunes', sub: '' },
  { value: 'Martes', label: 'Martes', sub: '' },
  { value: 'Miércoles', label: 'Miércoles', sub: '' },
  { value: 'Jueves', label: 'Jueves', sub: '' },
  { value: 'Viernes', label: 'Viernes', sub: '' },
  { value: 'Sábado', label: 'Sábado', sub: '' },
];

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
