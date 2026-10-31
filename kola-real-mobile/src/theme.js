// Sistema de diseño: colores, radios, sombras y tipografía.
import { Platform } from 'react-native';

export const C = {
  primary: '#E30613',
  primaryDark: '#A3000C',
  primarySoft: '#FDECEE',
  yellow: '#FFC20E',
  yellowSoft: '#FFF6D9',
  ink: '#111114',
  ink2: '#45454F',
  muted: '#8B8B97',
  line: '#ECECF1',
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  green: '#11A055',
  greenSoft: '#E5F6EC',
  blue: '#2563EB',
  blueSoft: '#E8EFFE',
  amber: '#D97706',
  amberSoft: '#FDF1E1',
  graySoft: '#EFEFF3',
};

export const R = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: { boxShadow: '0 4px 16px rgba(17,17,20,0.06)' },
});

export const shadowStrong = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  android: { elevation: 8 },
  default: { boxShadow: '0 8px 28px rgba(17,17,20,0.20)' },
});

export const T = {
  display: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.4 },
  h3: { fontSize: 17, fontWeight: '700', color: C.ink, letterSpacing: -0.2 },
  body: { fontSize: 15, color: C.ink2, lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', color: C.ink },
  small: { fontSize: 13, color: C.muted },
  smallStrong: { fontSize: 13, fontWeight: '600', color: C.ink2 },
  label: { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
};
