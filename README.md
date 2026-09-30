# ¿Cuánta Calle Tenés? 🧭🇦🇷
### *El juego interactivo de geografía urbana, memoria barrial y cultura de Resistencia, Chaco*

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-339136?style=for-the-badge&logo=pwa&logoColor=white)](https://cuantacalletenes.denischaco.com.ar/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-Serverless-00E599?style=for-the-badge&logo=redis&logoColor=black)](https://upstash.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Analytics 4](https://img.shields.io/badge/GA4-PWA_Telemetry-E37400?style=for-the-badge&logo=google-analytics&logoColor=white)](https://analytics.google.com/)
[![Desarrollado por Denis Chaco](https://img.shields.io/badge/Creador-Denis_Chaco-F48138?style=for-the-badge&logo=google-chrome&logoColor=white)](https://denischaco.com.ar)

---

## 🌆 Sobre el Proyecto

**¿Cuánta Calle Tenés?** es una experiencia web interactiva creada para celebrar la identidad urbana de **Resistencia, Chaco**, capital nacional de las esculturas. 

El desafío pone a prueba la orientación espacial y la memoria cotidiana de los chaqueños mediante una premisa simple pero adictiva: **adivinar 5 calles secretas marcadas en un mapa totalmente mudo (sin nombres, sin carteles y sin pistas evidentes)**.

El proyecto combina cartografía de precisión, gamificación barrial con chistes y referencias locales ("rangos chaqueños"), presencia en tiempo real con Redis Serverless y un ecosistema publicitario nativo para comercios locales.

---

## 🎮 Mecánica de Juego

1. **Selección de Zona**:
   - 🏛️ **Casco Céntrico (4 Avenidas)**: Para arrancar con el corazón de la ciudad: Plaza 25 de Mayo, Peatonal y el perímetro de las avenidas históricas (Wilde, Belgrano, Las Heras, Laprida / Lavalle, San Martín, 9 de Julio y 25 de Mayo).
   - 🔥 **Gran Resistencia**: Nivel experto. Todo el trazado vial de la capital, más Barranqueras y Fontana, con diagonales, pasajes y cortadas periféricas.

2. **5 Rondas por Partida**:
   - En cada ronda se señala un punto misterioso en mitad de cuadra (lejos de esquinas para evitar ambigüedades).
   - Podés explorar con zoom libre, alternar entre mapa oscuro mudo y vista satelital, u ocultar el panel para estudiar el entorno.

3. **Sistema de Puntuación**:
   - ✍️ **Escribir el Nombre Exacto (+2 puntos)**: Demostrá maestría escribiendo la calle con tildes y diéresis (ej. *Güemes*, *Julio A. Roca*, *Marcelo T. de Alvear*).
   - 💡 **4 Opciones Múltiples (+1 punto / -1 punto)**: Elegí entre alternativas verosímiles del mismo sector urbano (+1 si acertás, -1 si errás).
   - ⚡ **Multiplicador GeoBoost 2x**: Si estás jugando físicamente en o cerca de un comercio auspiciante (radio de 70 metros), ¡los aciertos suman **Doble Puntaje (+4 pts / +2 pts)**!

4. **🏛️ Colección Patrimonial: Álbum de Esculturas**:
   - Resistencia cuenta con más de 650 obras a cielo abierto que le valieron el título de **Capital Nacional de las Esculturas**.
   - A lo largo de las rondas, los jugadores van descubriendo y desbloqueando un **Álbum de 30 Esculturas Icónicas** distribuidas en la ciudad, con ficha técnica completa: nombre, escultor, año de emplazamiento, material e historia cultural.

5. **🎟️ Cupones Comerciales con Descuento**:
   - Al adivinar una calle con un comercio auspiciante (ej: *Bacanal Burgers*, *La Fichita*), el jugador desbloquea un **cupón de descuento exclusivo** con ID temporal único antifraude y voucher gráfico en HD (1080x1440) descargable en un clic para canjear en el mostrador.

6. **⚔️ Modo Desafío 1v1 Asincrónico**:
   - Al terminar cualquier partida, el jugador puede retar a un amigo o familiar generando un enlace directo para WhatsApp. El rival juega **exactamente las mismas 5 calles** para definir quién tiene más calle en un mano a mano transparente.

7. **Escalafón de Rangos Chaqueños (0 a 10+ pts)**:
   - 🚴‍♂️ `0 - 2 pts`: **Desorientado en las zanjas** — *¿Te tomaste el bondi para el lado contrario? Tranqui, ¡a pedalear y seguir descubriendo la ciudad!*
   - 🚌 `3 - 4 pts`: **Recién bajado del Flechabus** — *Conocés las avenidas y las paradas clave, pero dos cuadras adentro te agarra la duda.*
   - 🚶‍♂️ `5 - 6 pts`: **Caminante de la Peatonal** — *El microcentro te lo sabés al dedillo. Tomaste café en la Illia y compraste chipá caliente en la plaza.*
   - 🧭 `7 - 8 pts`: **Dueño de las 4 Avenidas** — *¡Impresionante orientación! Te movés como pez en el agua entre Alberdi, San Martín, 9 de Julio y 25 de Mayo.*
   - 👑 `9 - 10+ pts`: **Remisero Legendario de Resistencia** — *¡Nivel Dios de la calle! Ni Waze ni Google Maps te hacen sombra. Te sabés hasta el sentido de las cortadas más escondidas.*

8. **🏆 Tabla de Posiciones Competitiva (Leaderboard)**:
   - Podio segmentado por modalidad (*4 Avenidas* vs *Gran Resistencia*).
   - Criterio de clasificación estricto: **Mayor Puntaje** y, como factor de desempate, **Menor Tiempo Total** de partida en segundos.

---

## 🛠️ Arquitectura e Ingeniería del Producto Digital

El proyecto fue diseñado como una Progressive Web App (PWA) de alto rendimiento, bajo consumo de recursos y costo de infraestructura prácticamente nulo ($0 USD en tiers serverless gratuitos):

```
+--------------------------------------------------------------------------------------------------+
|                                ARQUITECTURA GENERAL DEL SISTEMA                                  |
+--------------------------------------------------------------------------------------------------+
|   CLIENTE (React 19 + Vite 8 + Tailwind CSS)                                                     |
|   ├── Leaflet Map Engine (Zero-labels dark tiles + Esri Satelital + Capa SVG de Esculturas)     |
|   ├── Game State Machine (Rondas, Modos de Juego, GeoBoost Haversine, Álbum Local)              |
|   ├── Voucher Canvas Generator (1080x1440 HD nativo sin servidor)                                |
|   └── Telemetry Client (GA4 gtag.js + Firebase SDK)                                             |
+--------------------------------------------------------------------------------------------------+
|   INFRAESTRUCTURA SERVERLESS & ALMACENAMIENTO                                                    |
|   ├── Vercel Serverless Function (`api/online.js`) -> Heartbeat y Conteo Redis                   |
|   ├── Upstash Redis (Serverless KV):                                                             |
|   │   ├── Sorted Sets (`ZADD`, `ZCARD`) -> Usuarios en vivo concurrentes (<90s)                  |
|   │   └── HyperLogLog (`PFADD`, `PFCOUNT`) -> Visitantes únicos mensuales reales                 |
|   ├── Firebase Cloud Firestore:                                                                  |
|   │   ├── `leaderboard` -> Podio histórico por zona con desempate por tiempo                    |
|   │   └── `sponsor_stats/{sponsorId}_{YYYY-MM}` -> Métricas B2B de atribución agregada          |
|   └── Google Analytics 4 -> Engagement time, embudos de conversión y retención                  |
+--------------------------------------------------------------------------------------------------+
```

### 1. Extracción y Normalización Cartográfica
- Extracción de la red vial de Resistencia, Barranqueras y Fontana a partir de los datos geoespaciales abiertos de **OpenStreetMap**.
- Normalización fonética y toponímica: tratamiento de tildes, diéresis, nombres formales vs nombres populares (ej. *Julio A. Roca*, *Güemes*, *Marcelo T. de Alvear*), y alturas catastrales.
- Cálculo algorítmico de los puntos de juego en los segmentos medios de cada cuadra (distancia euclidiana mínima a cualquier nodo de intersección > 25 m), asegurando que cada coordenada pertenezca unívocamente a una sola calle.

### 2. Motor de Mapa Mudo (Zero-Labels Rendering)
- Renderizado de mapas con **Leaflet 1.9** sobre teselas estilizadas sin rótulos toponímicos (`apistyle=s.e:l|p.v:off`).
- Incorporación de hitos visuales no textuales que los resistencianos reconocen intuitivamente:
  - Trazado cuadrangular y diagonales de la **Plaza 25 de Mayo**.
  - Plazas perimetrales históricas (12 de Octubre, España, 9 de Julio, Belgrano).
  - Cuerpos de agua característicos: Laguna Argüello, Laguna Ávalos, Laguna Francia, Laguna Los Lirios.
- Soporte de cambio dinámico a capa satelital de alta resolución (**Esri World Imagery**) y botón de colapso rápido de interfaz (*"Ver mapa"*).

### 3. Presencia en Vivo y Métricas Reales con Redis Serverless (`api/online.js`)
El conteo de jugadores abandonó estimaciones estáticas y opera con métricas 100% reales procesadas en **Upstash Redis**:
- **Jugadores Concurrentes Simultáneos**:
  1. Cada cliente activo envía un latido HTTP periódico cada 45 segundos.
  2. La función serverless ejecuta `ZREMRANGEBYSCORE` para purgar sesiones con inactividad mayor a 90 segundos.
  3. Inserta el ID de sesión mediante `ZADD` con el timestamp UNIX actual.
  4. Consulta `ZCARD` para retornar la cantidad exacta de jugadores conectados en ese instante.
  5. Escucha la **Page Visibility API** (`document.visibilitychange`): si el usuario minimiza el navegador o cambia de pestaña, el pulso se suspende automáticamente para no inflar la métrica ni agotar la cuota de peticiones.
- **Visitantes Únicos Mensuales Reales (HyperLogLog)**:
  - Registro de sesiones con `PFADD cct:visitors:{YYYY-MM} {sessionId}`.
  - El algoritmo probabilístico **HyperLogLog** de Redis calcula la cardinalidad de usuarios únicos con un margen de error menor al 1% requiriendo un consumo fijo inferior a 12 KB de memoria, sin guardar datos personales ni IPs.
  - La métrica real alimenta el modal comercial y los reportes de alcance entregados a auspiciantes.

### 4. Sistema O2O de Cupones Verificables con ID Temporal
Diseñado para que los comercios locales reciban clientes presenciales reales sin riesgo de fraude o duplicación descontrolada:
- **Algoritmo de ID Único Antifraude**:
  - Estructura: `YYMMDD-HHMM-XXXX` (ej. `260927-2130-A4F8`).
  - Compuesto por la fecha de emisión en hora local argentina (`YYMMDD`), la hora/minuto (`HHMM`) y un hash de entropía criptográfica pseudoaleatoria de 4 caracteres alfanuméricos.
- **Persistencia en Sesión (`sessionStorage`)**:
  - El cupón generado se fija en la sesión de navegación del jugador. Si el usuario vuelve a consultar la ronda, recarga la pestaña o revisa el resultado, se le presenta el mismo identificador original, impidiendo la emisión múltiple de cupones durante la misma partida.
- **Condiciones y Reglas Comerciales Transparentes**:
  - Modalidad de alcance parametrizada: *Por mesa / ticket completo* vs *Individual por comensal*.
  - Medios de pago aceptados (efectivo, débito, transferencias inmediatas; exclusión de promociones bancarias superpuestas).
  - Período de vigencia explícito (48 horas a 7 días según el sponsor) y leyenda de no acumulabilidad.
- **Motor de Renderizado de Voucher HD en Canvas (1080 x 1440 px)**:
  - Archivo: `src/utils/voucherCanvas.js`.
  - Generación en cliente sin dependencias de servidor: mediante la API nativa de **HTML5 Canvas**, compone un voucher digital de alta fidelidad exportable a PNG.
  - Incluye: fondo con degradados de identidad visual de la marca, microtexturas decorativas, isotipo del sponsor, código de barras/QR de verificación visual, ID temporal en tipografía monoespaciada de alta legibilidad, fecha y hora exacta de emisión, alcance comercial y cláusula de autenticidad para que el personal del local valide el cupón en segundos.

### 5. Motor "GeoBoost 2x" de Proximidad Física (Geofencing O2O)
Un puente tecnológico directo entre la experiencia lúdica digital y el consumo gastronómico presencial:
- **Geolocalización en Tiempo Real**:
  - Implementado en el hook `useSponsorGeoboost.js` mediante la API nativa `navigator.geolocation.getCurrentPosition`.
- **Cálculo Geodésico con Fórmula de Haversine** (`src/utils/geoUtils.js`):
  $$\text{distancia} = 2 R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1) \cos(\varphi_2) \sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  Donde $R = 6,371,000\text{ m}$ (radio terrestre).
- **Radio de Activación de 70 Metros**:
  - Cubre con precisión el salón comercial, mesas sobre la vereda y estacionamiento inmediato del local auspiciante.
- **Mecánica Lúdica**:
  - Si el jugador se encuentra dentro del perímetro del sponsor y le toca adivinar la calle del mismo, el juego despliega una alerta visual interactiva: `⚡ GeoBoost 2x Activo - Jugando en [Comercio]`.
  - Al acertar la calle, la puntuación de esa ronda se duplica automáticamente (+4 pts en escritura directa, +2 pts en múltiple opción), incentivando que grupos de amigos jueguen en la sobremesa del bar.

### 6. Telemetría Dual y Atribución Comercial B2B
El proyecto combina análisis de producto general con métricas comerciales auditables para los sponsors locales:

#### A) Atribución en Firestore Cloud (`sponsor_stats/{sponsorId}_{YYYY-MM}`)
Se registra de forma atómica en Firestore para generar reportes mensuales de retorno de inversión:
| Métrica B2B | Definición |
|---|---|
| `impressions` | Cantidad de veces que la calle del sponsor salió en una ronda de juego. |
| `views` | Usuarios que hicieron clic para ver el perfil, menú o info del comercio. |
| `coupons_generated` | Cupones con ID temporal emitidos tras una respuesta correcta. |
| `coupons_downloaded` | Vouchers HD en PNG guardados en la galería del dispositivo del usuario. |
| `geoboost_activations` | Comensales que jugaron físicamente dentro del local (radio 70m). |
| `maps_clicks` | Clics en *"Cómo llegar"* redirigiendo a la app de Google Maps. |

#### B) Eventos de Producto y Telemetría PWA en Google Analytics 4 (GA4)
*Measurement ID: `G-5QEL8C8RBG`*. Todos los eventos del juego viajan enriquecidos automáticamente con el parámetro global **`app_mode: 'pwa' | 'browser'`**, permitiendo comparar métricas de engagement y retención entre usuarios que instalaron la app y quienes juegan en el navegador.

| Evento GA4 | Cuándo se dispara | Parámetros Clave |
|---|---|---|
| `pwa_session_start` | Arranque de sesión en cliente | `app_mode` (`pwa`/`browser`), `display_mode` (`standalone`/`browser_tab`) |
| `pwa_installed` | Instalación nativa exitosa de la PWA | `method` (`browser_prompt`), `installed_at` |
| `pwa_install_prompt_eligible` | Navegador ofrece banner de instalación | *(Detección nativa del navegador)* |
| `game_start` | Inicio de partida en una zona | `zone_id`, `zone_name`, `is_challenge`, `app_mode` |
| `round_answer` | Respuesta de cada calle | `round_number`, `mode`, `is_correct`, `score_delta`, `street_name`, `geoboost_active`, `app_mode` |
| `coupon_generated` | Emisión del cupón con ID único | `sponsor_id`, `coupon_id`, `discount_text`, `app_mode` |
| `coupon_download_voucher` | Descarga de imagen PNG del voucher | `sponsor_id`, `coupon_id`, `app_mode` |
| `geoboost_detected` | Activación de proximidad GPS | `sponsor_id`, `distance_meters`, `app_mode` |
| `sponsor_view` | Visualización de ficha de sponsor | `sponsor_id`, `source`, `app_mode` |
| `sculpture_unlocked` | Desbloqueo de obra en el álbum | `sculpture_id`, `sculpture_name`, `app_mode` |
| `challenge_created` | Generación de reto 1v1 para compartir | `zone`, `score`, `app_mode` |
| `challenge_played` | Partida jugada desde un enlace de reto | `challenger_score`, `final_score`, `app_mode` |
| `game_complete` | Finalización de las 5 calles | `score`, `rank`, `time_seconds`, `zone`, `app_mode` |

### 7. Sistema de Desafíos 1v1 Asincrónicos
- Permite competir entre amigos sin necesidad de estar conectados en simultáneo.
- **Payload URL-Safe Base64**:
  - Al completar una partida, se empaqueta un objeto con el array de las 5 calles exactas sorteadas, la zona, el nombre del retador y su puntaje:
    ```javascript
    const payload = btoa(JSON.stringify({ z: zoneId, s: streetIndices, p: score, n: playerName }));
    const challengeUrl = `https://cuantacalletenes.denischaco.com.ar/?reto=${encodeURIComponent(payload)}`;
    ```
- **Experiencia de Entrada y Metadatos**:
  - Al abrir el enlace, el receptor visualiza una tarjeta de desafío que le informa a quién está enfrentando y cuántos puntos debe superar.
  - Al concluir, la pantalla final compara ambos resultados cara a cara (*"¿Superaste a tu amigo o te faltó calle?"*).
  - Incluye metadatos OpenGraph dinámicos y plantilla de mensaje para WhatsApp lista para enviar.

### 8. Módulo Cultural: Esculturas de Resistencia
- En homenaje a la identidad artística de la ciudad, se incorporó una base de datos curada con **30 esculturas representativas**:
  - Obras de artistas consagrados: Fabriciano Gómez, Eddie Torre, Stephan Erzia, Humberto Gómez Lollo, Mimo Eidman, entre otros.
  - Datos registrados: Título, autor, material (mármol, bronce, quebracho, cemento, chapa batida), año de emplazamiento, ubicación en coordenadas y fotografía testimonial.
- **Álbum Coleccionable**: Interfaz con barra de progreso, estado de bloqueo/desbloqueo persistido en `localStorage` y visor ampliado de fichas técnicas para consulta cultural.

### 9. Modelo de Negocio B2B: El "Pase Temporada" (90 Días)
Estrategia comercial orientada a pymes chaqueñas, eliminando la fricción de pagos mensuales recurrentes y el compromiso de contratos anuales prolongados:
- **Pase Barrial**: Marcador georreferenciado, presencia de marca en el mapa y ficha informativa.
- **Esquina + Cupón (Top)**: Calle jugable dentro de las rondas, emisión de cupones con código único temporal, voucher descargable HD y activación de **GeoBoost 2x**.
- **Sponsor de Zona (Exclusivo)**: Máxima visibilidad en pantallas de inicio y podio final, exclusividad por rubro comercial en la zona elegida y reporte mensual detallado de métricas de atribución.

### 10. Identidad Visual y Experiencia de Usuario
- Paleta de colores oficial de la marca @denischaco:
  - 🟢 **Verde Monte**: `#339136`
  - 🟤 **Marrón Chaqueño**: `#321401`
  - 🟠 **Naranja Chaco**: `#F48138`
  - 🔶 **Ámbar / Naranja Oscuro**: `#B95D0E`
- **Insignia Oficial de Marca**: Isotipo circular oficial con teléfono inteligente, señalética urbana chaqueña y badge de identidad visual @denischaco, integrado en la cabecera del juego ([DenisRibbonHeader.jsx](file:///d:/Localhost/denischaco/CAPSULAS/CuantaCalle/src/components/DenisRibbonHeader.jsx)), la pantalla de bienvenida ([StartScreen.jsx](file:///d:/Localhost/denischaco/CAPSULAS/CuantaCalle/src/components/StartScreen.jsx)) y los metadatos de aplicación.
- Animaciones fluidas con Tailwind CSS, partículas de confeti con `canvas-confetti`, adaptabilidad móvil completa (mobile-first con navegación accesible con una sola mano) y soporte offline con fallbacks locales.

### 11. Progressive Web App (PWA) e Integración OpenGraph (WhatsApp & Redes)
- **Instalabilidad Nativa y Comportamiento Standalone**:
  - Configuración completa en `public/manifest.webmanifest` (`display: standalone`, orientación `portrait`, `theme_color: #0B0F19`, `background_color: #0B0F19`).
  - Suite integral de íconos en `public/icons/`:
    - Favicons para navegador: `.ico` multicapa (16, 24, 32, 48, 64, 128, 256 px) y PNGs (16x16, 32x32).
    - Íconos PWA estándar: 192x192 px y 512x512 px.
    - Íconos adaptativos Android: `icon-maskable-192.png` y `icon-maskable-512.png` con margen seguro para recortes circulares/squircle.
    - Ícono para iOS: `apple-touch-icon.png` (180x180 px con barra translúcida `black-translucent`).
- **Atribución y Detección de Instalación PWA**:
  - `start_url` parametrizado con `/?utm_source=pwa&utm_medium=standalone&utm_campaign=homescreen`, registrando en GA4 de forma automática qué jugadores abren el juego desde su pantalla de inicio.
  - Escucha nativa en cliente de `appinstalled` y `beforeinstallprompt` para contabilizar instalaciones día a día.
- **Optimización de Previsualización en Redes (WhatsApp & Meta)**:
  - Tarjeta OpenGraph en alta definición (`public/icons/profile-icon.png` y `public/og-preview.png` en 1024x1024 px).
  - Configuración con `og:image` con control de invalidación de caché (`?v=2`) y `twitter:card: summary` para que WhatsApp, Telegram, X y Facebook generen miniaturas instantáneas y nítidas al compartir partidas o retos 1v1.

---

## 🗂️ Estructura del Repositorio

```text
cuantacalletenes/
├── api/
│   └── online.js                 # Serverless Function: Heartbeat Redis & HyperLogLog
├── public/
│   ├── favicon.ico               # Favicon multicapa oficial (16px a 256px)
│   ├── favicon.svg               # Ícono vectorial para navegadores
│   ├── logo.svg                  # Isotipo SVG oficial
│   ├── manifest.webmanifest      # Manifiesto PWA con atribución UTM y modo standalone
│   ├── og-preview.jpg            # Portada OpenGraph optimizada para redes
│   ├── og-preview.png            # Portada OpenGraph en alta resolución (1024x1024)
│   ├── icons/                    # Suite de íconos PWA (16, 32, 180, 192, 512 px y maskable)
│   └── sponsors/                 # Logos de comercios chaqueños auspiciantes
├── src/
│   ├── components/
│   │   ├── AdvertiseModal.jsx    # Tarifario de sponsors B2B y contacto a WhatsApp
│   │   ├── CouponModal.jsx       # Modal de cupón de descuento con ID único y descarga HD
│   │   ├── DenisRibbonHeader.jsx # Barra superior, contador en vivo y accesos
│   │   ├── GameOverScreen.jsx    # Podio final, Rango Chaqueño, retos 1v1 y compartir
│   │   ├── HelpModal.jsx         # Guía de juego, cupones, GeoBoost y esculturas
│   │   ├── LeaderboardModal.jsx  # Podio histórico por zona con desempate por tiempo
│   │   ├── RoundHUD.jsx          # Panel de adivinanza (escritura, 4 opciones y badge GeoBoost)
│   │   ├── RoundResultModal.jsx  # Resultado por ronda, cupones y trivia
│   │   ├── SculptureModal.jsx    # Ficha de escultura desbloqueada en la ronda
│   │   ├── SculpturesAlbumModal.jsx # Álbum coleccionable de 30 esculturas
│   │   ├── StartScreen.jsx       # Portada de bienvenida y selector de zonas
│   │   └── StreetGameMap.jsx     # Mapa Leaflet mudo (Dark & Satellite) con marcadores
│   ├── data/
│   │   ├── landmarks.json        # Zonas de juego (4 Avenidas y Gran Resistencia)
│   │   ├── ranks.json            # Títulos y descripciones de los Rangos Chaqueños
│   │   ├── referencePoints.json  # Plazas, lagunas y puntos de orientación
│   │   ├── resistenciaStreets.json # Geometrías y nombres de las calles
│   │   ├── sculptures.json       # Catálogo de 30 esculturas urbanas de Resistencia
│   │   ├── sponsorPlans.json     # Tarifario y paquetes comerciales trimestrales
│   │   └── sponsors.json         # Comercios auspiciantes y términos de cupones
│   ├── hooks/
│   │   └── useSponsorGeoboost.js # Hook de geolocalización y detección de radio de 70m
│   ├── services/
│   │   ├── analytics.js          # Telemetría GA4 y atribución en Firestore (`sponsor_stats`)
│   │   ├── firebase.js           # Conexión Firestore para records y métricas
│   │   └── onlinePresence.js     # Heartbeat en vivo con Page Visibility API
│   ├── utils/
│   │   ├── couponGenerator.js    # Generador de ID temporal único antifraude
│   │   ├── geoUtils.js           # Normalización de strings, tildes y fórmula Haversine
│   │   ├── sculptureUtils.js     # Asociación espacial de esculturas y progreso del álbum
│   │   ├── streetRandomizer.js   # Generación de rondas y distractoras realistas
│   │   └── voucherCanvas.js      # Renderizador cliente de voucher gráfico HD (1080x1440 PNG)
│   ├── App.jsx                   # Máquina de estados principal y routing de modales
│   ├── index.css                 # Estilos globales y tokens Tailwind
│   └── main.jsx                  # Punto de entrada React
├── .env.example                  # Plantilla de variables de entorno (segura)
├── package.json                  # Dependencias y scripts del proyecto
├── tailwind.config.js            # Configuración de diseño y colores de marca
└── vite.config.js                # Configuración de bundler Vite
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** (v18 o superior recomendado)
- Gestor de paquetes **npm** o **pnpm**

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/denischaco/cuantacalletenes.git
   cd cuantacalletenes
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copiá el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
   Completá las credenciales en tu `.env` local:
   ```env
   # Firebase Firestore (Leaderboard y Récords)
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id

   # Upstash Redis (Heartbeat Serverless para jugadores en línea)
   UPSTASH_REDIS_REST_URL=https://tu-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=tu_token_aqui
   ```
   *(Nota: Si no configurás Firebase o Redis localmente, el juego cuenta con fallbacks en memoria y mock data para que puedas probar la jugabilidad inmediatamente sin bloqueos).*

4. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abrí en tu navegador: [http://localhost:5173](http://localhost:5173)

5. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 👏 Créditos y Agradecimientos

Este proyecto es posible gracias al trabajo colaborativo de la comunidad abierta y las siguientes herramientas y fuentes:

- **Idea, Diseño y Desarrollo**: **Denis Chaco** ([denischaco.com.ar](https://denischaco.com.ar)) — Desarrollador y creador de contenidos digitales chaqueño. Contacto: `denischaco@gmail.com` / WhatsApp: [+54 362 462-5240](https://wa.me/543624625240).
- **Datos Geográficos y Cartografía**: A todos los colaboradores de [OpenStreetMap (OSM)](https://www.openstreetmap.org/) por el mapeo libre, comunitario y colaborativo de la República Argentina y la provincia del Chaco (licencia ODbL).
- **Capas de Mapa**:
  - Tiles satelitales cortesía de **Esri World Imagery**.
  - Teselas viales limpias procesadas para el modo mudo.
- **Herramientas de Software Libre**:
  - [React](https://react.dev/) & [Vite](https://vitejs.dev/) por el ecosistema de frontend ágil.
  - [Leaflet](https://leafletjs.com/) por la librería cartográfica ligera y modular.
  - [Tailwind CSS](https://tailwindcss.com/) por el sistema de utilidades CSS.
  - [Lucide Icons](https://lucide.dev/) por la iconografía limpia y consistente.
  - [Canvas Confetti](https://github.com/catdad/canvas-confetti) por los efectos de festejo.
- **Infraestructura en la Nube y Telemetría**:
  - [Upstash](https://upstash.com/) por su base de datos Redis Serverless de baja latencia.
  - [Firebase / Google Cloud](https://firebase.google.com/) por la persistencia NoSQL de récords.
  - [Google Analytics 4](https://analytics.google.com/) por la analítica anónima y métricas de interacción.
  - [Vercel](https://vercel.com/) por el despliegue serverless global.
- **Comunidad y Comercios Chaqueños**:
  - A todos los vecinos, estudiantes, choferes y caminantes de Resistencia que se sumaron al testeo y aportaron anécdotas, correcciones de calles y sugerencias.
  - A los comerciantes locales (como *Bacanal Burgers* y amigos) por confiar en iniciativas digitales independientes nacidas en el Chaco.

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

---

<p align="center">
  Hecho con 🧉 y mucho orgullo chaqueño desde <b>Resistencia, Chaco, Argentina</b>.
  <br>
  Visitanos en <a href="https://denischaco.com.ar"><b>denischaco.com.ar</b></a>
</p>
