# Kola Real Negocios — App móvil (iOS y Android)

App para los clientes de Kola Real en República Dominicana (colmados, bodegas, cafeterías…):

- **Pedir productos**: catálogo por categorías, carrito por pacas, día de entrega, forma de pago, "Repetir pedido".
- **Reportar problemas con equipos**: freezer/nevera, letrero, exhibidor, toldo, mesas y sillas. Incluye el problema, la placa, la urgencia, una descripción y una **foto con la cámara o de la galería**.
- **Seguimiento** de pedidos y reportes (abierto → técnico asignado → en reparación → resuelto).
- **Vista del distribuidor o supervisor**: resumen, cambio de estado de los pedidos, asignación de técnicos y CSV de reportes.
- Copia del pedido o reporte por **WhatsApp**.

Hecha con **Expo (React Native)**: un solo código para iOS y Android.

> ⚠️ Prototipo: los productos y precios son de ejemplo y los datos se guardan solo en el teléfono (AsyncStorage). Para producción hace falta un backend (ver abajo).

## Probarla en tu teléfono (sin publicar en las tiendas)

```bash
cd kola-real-mobile
npm install
npx expo start
```

Instala **Expo Go** (App Store / Play Store) y escanea el código QR que aparece en la terminal.

Para probarla en el navegador: `npx expo start --web`.

## Generar las apps para las tiendas

Se usa **EAS Build**, que compila en la nube. **No hace falta tener una Mac** para generar la app de iOS.

```bash
npm install -g eas-cli
eas login
eas init                                         # vincula el proyecto a tu cuenta de Expo
eas build -p android --profile preview           # APK para instalar directo y hacer pruebas
eas build -p all --profile production            # builds para App Store y Play Store
eas submit -p ios      # sube a App Store Connect / TestFlight
eas submit -p android  # sube a Google Play Console
```

Cuentas necesarias (a nombre del cliente, idealmente):

- **Apple Developer Program**: US$99 al año.
- **Google Play Console**: US$25, pago único.

Antes de publicar:

- Cambiar `bundleIdentifier` y `package` en `app.json` (ahora `do.kolareal.negocios`) por los que defina el cliente.
- Reemplazar los íconos y el splash en `assets/` por los oficiales, con la autorización de la marca.
- Poner el número real del distribuidor en `DISTRIBUTOR_WHATSAPP` (`src/data.js`).

## Estructura

```
App.js                  Navegación por pestañas según el rol
src/data.js             Catálogo, equipos, estados, colores
src/store.js            Estado y acciones (aquí se conecta la API en producción)
src/ui.js               Componentes compartidos
src/screens/Login.js    Acceso
src/screens/Client.js   Pedir, mis pedidos, reportar, mis reportes
src/screens/Admin.js    Resumen, pedidos y reportes para el distribuidor
src/screens/cards.js    Tarjetas de pedido y reporte
```

## Siguientes pasos para producción

1. **Backend** (Supabase o Firebase): tablas de negocios, productos, pedidos, equipos y reportes. Las fotos van a almacenamiento en la nube. Las acciones de `src/store.js` pasan a llamar a la API.
2. **Login por teléfono** con código por SMS o WhatsApp, en vez del formulario libre.
3. **Notificaciones push** (`expo-notifications`) cuando cambie el estado de un pedido o reporte.
4. **QR en cada equipo**: el dueño lo escanea y el reporte sale con la placa correcta.
5. **Panel web** para el supervisor, con mapa, filtros por zona y métricas de tiempo de respuesta.
6. **Modo sin conexión**: guardar los pedidos y reportes y enviarlos cuando vuelva la señal.
7. Integración con el ERP o el sistema de rutas de la distribuidora.
