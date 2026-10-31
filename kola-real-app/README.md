> **Nota:** la app para los clientes es la app móvil en [`../kola-real-mobile`](../kola-real-mobile) (iOS y Android). Esta versión web queda como demo rápida en el navegador.

# Kola Real Negocios — Prototipo

App para que los **negocios (colmados, bodegas, cafeterías, etc.) en República Dominicana**:

1. **Pidan productos** de Kola Real y marcas relacionadas (catálogo, carrito, repetir pedido).
2. **Reporten problemas con equipos** prestados por la marca: freezer/nevera, letrero, exhibidor, toldo, mesas y sillas, etc.
3. **Den seguimiento** al estado de pedidos y reportes.

Y para que el **distribuidor / supervisor** reciba los pedidos, gestione los reportes, asigne técnicos y exporte la información.

> ⚠️ Es un **prototipo de demostración**. Los precios y productos son de ejemplo, y los datos se guardan solo en el navegador (`localStorage`). No usa logos oficiales.

## Cómo probarlo

Abre `index.html` en el navegador (también funciona en el teléfono), o sírvelo con:

```bash
cd kola-real-app && python3 -m http.server 8080
# abrir http://localhost:8080
```

- Entra como **Dueño de negocio** para hacer pedidos y reportes.
- Sal y entra como **Distribuidor / Supervisor** (mismo dispositivo) para ver lo que llegó.

## Funciones incluidas

| Dueño de negocio | Distribuidor / Supervisor |
|---|---|
| Catálogo por categorías con cantidades por paca | Resumen: pedidos pendientes, reportes abiertos, urgentes |
| Carrito, día de entrega, forma de pago, nota | Cambiar estado del pedido (pendiente → confirmado → en camino → entregado) |
| Historial y "Repetir pedido" | Lista de reportes, con los urgentes primero |
| Reporte de equipo: tipo, problema, placa, urgencia, descripción y **foto con la cámara** | Asignar técnico y cambiar estado (abierto → técnico asignado → en reparación → resuelto) |
| Seguimiento del reporte con historial de estados | Exportar reportes a CSV (Excel) |
| Enviar copia del pedido o reporte por **WhatsApp** | |

## Propuesta para producción

| Pieza | Recomendación |
|---|---|
| App del cliente | PWA (como este prototipo) o React Native/Flutter si se necesita estar en Play Store. En RD la mayoría usa Android de gama media, así que conviene que sea ligera y funcione con mala señal (modo offline). |
| Backend | Supabase o Firebase: autenticación por teléfono (OTP por SMS/WhatsApp), base de datos, almacenamiento de fotos y reglas de acceso por rol. |
| Roles | Cliente (negocio), Vendedor/Preventa (ruta), Supervisor, Técnico, Administrador. |
| Notificaciones | Push (OneSignal / FCM) y WhatsApp Business API cuando cambie el estado de un pedido o reporte. |
| Integración | Exportar pedidos al ERP/sistema de rutas de la distribuidora (API o CSV diario). |
| Equipos | Inventario de equipos por negocio con código QR en el freezer/letrero: el dueño escanea y el reporte ya sale con la placa correcta. |
| Métricas | Tiempo promedio de respuesta y de solución, fallas por tipo de equipo, ventas por zona o ruta. |

### Modelo de datos (resumen)

- `negocios` (id, código cliente, nombre, RNC, dirección, GPS, zona/ruta, teléfono)
- `productos` (id, nombre, presentación, precio, categoría, activo)
- `pedidos` (id, negocio_id, estado, total, fecha_entrega, forma_pago, nota) + `pedido_items`
- `equipos` (id, negocio_id, tipo, placa/serie, fecha_instalación)
- `reportes` (id, negocio_id, equipo_id, problema, urgencia, descripción, fotos, estado, técnico_id) + `reporte_historial`

### Preguntas para el cliente antes de cotizar

1. ¿Quién recibe los pedidos: la fábrica, los distribuidores o los vendedores de ruta?
2. ¿Los precios cambian por zona, por tipo de cliente o por promociones?
3. ¿Hay crédito a clientes? ¿Se cobra en la app o al entregar?
4. ¿Tienen un inventario de los equipos prestados (freezers, letreros) con placas?
5. ¿Quién repara los equipos: personal propio o una empresa contratada?
6. ¿Tienen un sistema actual (ERP o app de preventa) con el que haya que integrarse?
7. ¿Cuántos negocios se espera en el primer año?
