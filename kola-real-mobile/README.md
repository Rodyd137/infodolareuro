# Kola Real Negocios — App móvil (iOS y Android)

App para los clientes de Kola Real en República Dominicana (colmados, bodegas, cafeterías…).

## Principios de UX

El usuario es un dueño de colmado ocupado, atendiendo clientes con una mano libre:

- **Entrar sin recordar nada**: solo el número de teléfono y un código por SMS. El negocio, su ruta, su vendedor y sus equipos salen del sistema.
- **Pedir lo de siempre en 2 toques**: Inicio → "Pedir lo mismo de siempre" → "Confirmar pedido". El carrito se llena con el último pedido (o con el sugerido, si es la primera vez).
- **Cantidades rápidas**: se toca el número para escribirlo, o se usan los atajos 5, 10, 15 y 20. Nada de tocar "+" veinte veces.
- **Confirmar sin preguntas**: la entrega ya viene puesta en la próxima visita de la ruta y el pago en el último que se usó. Solo se cambian si hace falta.
- **Reportar en 3 toques**: Mis equipos → se toca el freezer → se toca "No enfría" → Enviar. La placa ya se sabe, y la urgencia se decide sola según el problema. La foto es opcional.
- **Lo importante, en Inicio**: cuándo llega el pedido, en qué van los reportes, y el vendedor con botones para escribirle por WhatsApp o llamarlo.
- **El panel del distribuidor queda aparte**: los clientes no ven opciones que no son para ellos.

Hecha con **Expo (React Native)**: un solo código para iOS y Android. Las botellas son ilustraciones vectoriales provisionales (`src/components/Bottle.js`); en producción se reemplazan por fotos oficiales.

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
src/screens/Home.js     Inicio del negocio
src/screens/Shop.js     Catálogo, carrito y confirmación
src/screens/Equipment.js Mis equipos y reportes
src/screens/Activity.js Historial de pedidos
src/screens/Admin.js    Resumen, pedidos y reportes para el distribuidor
src/components/         Tarjetas de pedido/reporte e ilustración de productos
src/theme.js            Colores, tipografía y sombras
```

## Siguientes pasos para producción

1. **Backend** (Supabase o Firebase): tablas de negocios, productos, pedidos, equipos y reportes. Las fotos van a almacenamiento en la nube. Las acciones de `src/store.js` pasan a llamar a la API.
2. **Envío real del código por SMS** (en la demo el código es `123456`). El perfil del negocio, sus equipos y su ruta vienen del sistema de la distribuidora.
3. **Notificaciones push** (`expo-notifications`) cuando cambie el estado de un pedido o reporte.
4. **QR en cada equipo**: el dueño lo escanea y el reporte sale con la placa correcta.
5. **Panel web** para el supervisor, con mapa, filtros por zona y métricas de tiempo de respuesta.
6. **Modo sin conexión**: guardar los pedidos y reportes y enviarlos cuando vuelva la señal.
7. Integración con el ERP o el sistema de rutas de la distribuidora.
