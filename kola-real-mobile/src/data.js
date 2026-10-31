// Datos de ejemplo para la demo (precios ficticios).
// En producción vienen del backend.

export const COLORS = {
  red: '#c8102e',
  redDark: '#9e0c24',
  yellow: '#ffcd00',
  bg: '#f5f5f7',
  card: '#ffffff',
  text: '#1d1d1f',
  muted: '#6e6e73',
  border: '#e3e3e8',
  ok: '#1a8f4c',
  warn: '#c77700',
  info: '#1f6fd1',
};

// Número del distribuidor para enviar copias por WhatsApp (cambiar por el real).
export const DISTRIBUTOR_WHATSAPP = '18090000000';

export const CATEGORIES = ['Todos', 'Gaseosas', 'Agua', 'Energizantes', 'Deportivas', 'Jugos'];

export const PRODUCTS = [
  { id: 'kr-roja-400', name: 'Kola Real Roja 400 ml', pack: 'Paca 12 und', cat: 'Gaseosas', price: 420, color: '#c8102e' },
  { id: 'kr-roja-2l', name: 'Kola Real Roja 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#c8102e' },
  { id: 'kr-roja-3l', name: 'Kola Real Roja 3 L', pack: 'Paca 4 und', cat: 'Gaseosas', price: 480, color: '#c8102e' },
  { id: 'kr-naranja-2l', name: 'Kola Real Naranja 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#f28c00' },
  { id: 'kr-uva-2l', name: 'Kola Real Uva 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#6b2c91' },
  { id: 'kr-limon-2l', name: 'Kola Real Limón 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#3aa335' },
  { id: 'kr-negra-2l', name: 'Kola Real Negra 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#3b2314' },
  { id: 'cielo-600', name: 'Agua Cielo 600 ml', pack: 'Paca 20 und', cat: 'Agua', price: 300, color: '#2a8fd6' },
  { id: 'cielo-galon', name: 'Agua Cielo Galón', pack: 'Paca 6 und', cat: 'Agua', price: 360, color: '#2a8fd6' },
  { id: 'volt-300', name: 'Volt Energizante 300 ml', pack: 'Paca 12 und', cat: 'Energizantes', price: 540, color: '#e0b400' },
  { id: 'sporade-500', name: 'Sporade 500 ml', pack: 'Paca 12 und', cat: 'Deportivas', price: 600, color: '#0aa4a4' },
  { id: 'cifrut-500', name: 'Cifrut 500 ml', pack: 'Paca 12 und', cat: 'Jugos', price: 480, color: '#ff7a00' },
];

export const EQUIPMENT = [
  { id: 'freezer', name: 'Freezer / Nevera', ico: '🧊',
    problems: ['No enfría', 'Hace mucho ruido', 'Bota agua / gotea', 'No enciende', 'Puerta / goma dañada', 'Luz interna no sirve'] },
  { id: 'letrero', name: 'Letrero', ico: '🪧',
    problems: ['Luz apagada / no enciende', 'Dañado o roto', 'Desteñido', 'Se está cayendo', 'Necesito uno nuevo'] },
  { id: 'exhibidor', name: 'Exhibidor / Rack', ico: '🗄️',
    problems: ['Roto / doblado', 'Falta pieza', 'Necesito uno nuevo'] },
  { id: 'toldo', name: 'Toldo / Sombrilla', ico: '⛱️',
    problems: ['Roto', 'Desteñido', 'Necesito uno nuevo'] },
  { id: 'mesas', name: 'Mesas y sillas', ico: '🪑',
    problems: ['Rotas', 'Faltan unidades', 'Necesito más'] },
  { id: 'otro', name: 'Otro', ico: '❓', problems: ['Otro problema'] },
];

export const DELIVERY_DAYS = ['Próxima visita de ruta', 'Lo antes posible', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const PAYMENT_METHODS = ['Efectivo al recibir', 'Transferencia', 'Crédito (clientes aprobados)'];

export const ORDER_STATUS = {
  pendiente: { label: 'Pendiente', color: COLORS.warn },
  confirmado: { label: 'Confirmado', color: COLORS.info },
  en_camino: { label: 'En camino', color: COLORS.info },
  entregado: { label: 'Entregado', color: COLORS.ok },
  cancelado: { label: 'Cancelado', color: COLORS.muted },
};

export const REPORT_STATUS = {
  abierto: { label: 'Abierto', color: COLORS.warn },
  tecnico_asignado: { label: 'Técnico asignado', color: COLORS.info },
  en_reparacion: { label: 'En reparación', color: COLORS.info },
  resuelto: { label: 'Resuelto', color: COLORS.ok },
};

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const equipById = (id) => EQUIPMENT.find((e) => e.id === id);

export const money = (n) =>
  'RD$ ' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const fmtDate = (iso) => {
  const d = new Date(iso);
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
