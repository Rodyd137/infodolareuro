// Ilustración vectorial del producto (reemplazar por fotos oficiales en producción).
import React from 'react';
import Svg, { Path, Rect, Ellipse } from 'react-native-svg';

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, v + amt));
  const r = ch(n >> 16), g = ch((n >> 8) & 0xff), b = ch(n & 0xff);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export default function Bottle({ color, kind = 'bottle', height = 96 }) {
  const dark = shade(color, -45);
  const water = kind === 'jug' || color === '#1E88E5';
  const body = water ? color + '55' : color;
  const width = height * 0.5;

  if (kind === 'can') {
    return (
      <Svg width={width} height={height} viewBox="0 0 50 100">
        <Ellipse cx="25" cy="18" rx="16" ry="4" fill={dark} />
        <Rect x="9" y="18" width="32" height="70" rx="5" fill={color} />
        <Rect x="9" y="42" width="32" height="20" fill={dark} />
        <Path d="M14 48 L22 48 L18 56 L26 56" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Rect x="13" y="22" width="3" height="62" rx="1.5" fill="#fff" opacity="0.3" />
        <Ellipse cx="25" cy="88" rx="16" ry="3.5" fill={dark} />
      </Svg>
    );
  }

  if (kind === 'jug') {
    return (
      <Svg width={height * 0.7} height={height} viewBox="0 0 70 100">
        <Rect x="27" y="6" width="16" height="9" rx="2" fill={color} />
        <Path d="M24 15 H46 L58 30 V90 C58 94 55 96 51 96 H19 C15 96 12 94 12 90 V30 Z" fill={body} stroke={color} strokeWidth="2" />
        <Path d="M46 22 C56 22 60 30 60 38" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        <Rect x="12" y="52" width="46" height="22" fill="#fff" opacity="0.92" />
        <Rect x="12" y="52" width="46" height="4" fill={color} />
        <Rect x="17" y="34" width="4" height="54" rx="2" fill="#fff" opacity="0.5" />
      </Svg>
    );
  }

  const big = kind === 'big';
  return (
    <Svg width={width} height={height} viewBox="0 0 50 100">
      <Rect x="19" y="2" width="12" height="8" rx="2" fill={dark} />
      <Path
        d={big
          ? 'M20 10 H30 V16 C30 22 40 25 40 35 V90 C40 95 36 98 31 98 H19 C14 98 10 95 10 90 V35 C10 25 20 22 20 16 Z'
          : 'M20 10 H30 V20 C30 28 37 31 37 40 V90 C37 95 33 98 29 98 H21 C17 98 13 95 13 90 V40 C13 31 20 28 20 20 Z'}
        fill={body}
        stroke={water ? color : 'none'}
        strokeWidth="1.5"
      />
      <Rect x={big ? 10 : 13} y="52" width={big ? 30 : 24} height="22" fill="#fff" opacity="0.94" />
      <Rect x={big ? 10 : 13} y="52" width={big ? 30 : 24} height="5" fill={water ? color : '#FFC20E'} />
      <Rect x={big ? 15 : 17} y="62" width={big ? 20 : 16} height="3" rx="1.5" fill={color} />
      <Rect x={big ? 15 : 17} y="38" width="3" height="50" rx="1.5" fill="#fff" opacity="0.35" />
    </Svg>
  );
}
