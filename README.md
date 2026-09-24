# ¿Cuánta Calle Tenés? 🧭🇦🇷
### *El juego interactivo de geografía urbana, memoria barrial y cultura de Resistencia, Chaco*

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-Serverless-00E599?style=for-the-badge&logo=redis&logoColor=black)](https://upstash.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
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
   - En cada ronda se señala un punto misterioso en mitad de cuadra.
   - Podés explorar con zoom libre, alternar entre mapa oscuro mudo y vista satelital, u ocultar el panel para estudiar el entorno.

3. **Sistema de Puntuación**:
   - ✍️ **Escribir el Nombre Exacto (+2 puntos)**: Demostrá maestría escribiendo la calle con tildes y diéresis (ej. *Güemes*, *Julio A. Roca*, *Marcelo T. de Alvear*).
   - 💡 **4 Opciones Múltiples (+1 punto / -1 punto)**: Elegí entre alternativas verosímiles del mismo sector urbano.
   - ⭐ **Desafío de Comercio Local (+4 puntos)**: Si la calle es sede de un local auspiciante, podés arriesgar la dirección exacta con altura catastral (ej. *French 683*).

4. **Escalafón de Rangos Chaqueños (0 a 10 pts)**:
   - 🚴‍♂️ `0 - 2 pts`: **Desorientado en las zanjas** — *¿Te tomaste el bondi para el lado contrario? Tranqui, ¡a pedalear y seguir descubriendo la ciudad!*
   - 🚌 `3 - 4 pts`: **Recién bajado del Flechabus** — *Conocés las avenidas y las paradas clave, pero dos cuadras adentro te agarra la duda.*
   - 🚶‍♂️ `5 - 6 pts`: **Caminante de la Peatonal** — *El microcentro te lo sabés al dedillo. Tomaste café en la Illia y compraste chipá caliente en la plaza.*
   - 🧭 `7 - 8 pts`: **Dueño de las 4 Avenidas** — *¡Impresionante orientación! Te movés como pez en el agua entre Alberdi, San Martín, 9 de Julio y 25 de Mayo.*
   - 👑 `9 - 10 pts`: **Remisero Legendario de Resistencia** — *¡Nivel Dios de la calle! Ni Waze ni Google Maps te hacen sombra. Te sabés hasta el sentido de las cortadas más escondidas.*

---

## 🛠️ El Proceso de Construcción (Architecture & Engineering)

El desarrollo del proyecto atravesó distintas etapas de ingeniería de software, cartografía y diseño de producto:

### 1. Extracción y Normalización Cartográfica
- Se procesó la red vial de Resistencia a partir de los conjuntos de datos de **OpenStreetMap**.
- Se normalizaron nombres, nomenclaturas antiguas, tildes, tipos de vía (calles, avenidas, pasajes, diagonales) y alias populares chaqueños.
- Los puntos de juego fueron calculados algorítmicamente en los puntos medios de los tramos viales, evitando esquinas e intersecciones para garantizar que cada coordenada pertenezca inequívocamente a una sola calle.

### 2. Motor de Mapa Mudo (Zero-Labels Rendering)
- Implementado con **Leaflet** y capas cartográficas vectoriales/raster estilizadas para remover todo texto, capa POI y rótulo toponímico (`apistyle=s.e:l|p.v:off`).
- Incorporación de referencias espaciales clave que los habitantes reconocen intuitivamente: la forma de la Plaza 25 de Mayo, las plazas periféricas (12 de Octubre, España, 9 de Julio, Belgrano) y las lagunas chaqueñas (Argüello, Ávalos, Los Lirios, etc.).

### 3. Presencia en Vivo con Redis Serverless (`api/online.js`)
- Para mostrar la cantidad de jugadores conectados simultáneamente sin mantener servidores WebSocket costosos ni complejos, se implementó un **Heartbeat con Redis Sorted Sets (ZADD)** en **Upstash**.
- Cada sesión activa envía un pulso HTTP liviano periódicamente. En cada consulta o latido:
  1. Se eliminan registros con inactividad superior a 90 segundos mediante `ZREMRANGEBYSCORE`.
  2. Se actualiza el score del jugador con el timestamp actual mediante `ZADD`.
  3. Se obtiene el total de usuarios concurrentes mediante `ZCARD`.
- En el cliente, el servicio (`onlinePresence.js`) escucha la **Page Visibility API** (`visibilitychange`), pausando las peticiones si el usuario cambia de pestaña para no consumir cuota innecesaria.
- En Vercel Serverless, los endpoints `GET` aprovechan cabeceras `Cache-Control: s-maxage=15, stale-while-revalidate=30` para máxima velocidad y eficiencia.

### 4. Capa Publicitaria y Cupones Comerciales (B2B Hyperlocal)
- Módulo dinámico administrable por JSON (`sponsorPlans.json` y `sponsors.json`) que permite a comercios chaqueños integrarse orgánicamente al juego con tres formatos:
  - **Pase Barrial**: Marcador y ficha en el mapa.
  - **Esquina Destacada**: Calle jugable dentro de la partida + cupón de descuento canjeable en el mostrador del local.
  - **Sponsor de Zona**: Auspiciante destacado en la pantalla de podio final y exclusividad de rubro.
- Formulario de contacto directo con enlace a WhatsApp (`+543624625240`) para presupuestos instantáneos.

### 5. Telemetría y Analítica de Juego (Google Analytics 4)
- Medición de interacción y eventos del juego sin sesgos a través de **GA4** (`src/services/analytics.js` y `gtag.js`):
  - **Métricas Nativas de Interacción (`user_engagement`)**: GA4 recopila automáticamente el tiempo real activo en pantalla (`engagement_time_msec`). A partir de esto calcula el tiempo de juego promedio por sesión, sesiones con interacción (*engaged sessions*) y tasa de rebote (*bounce rate*) real, pausando el conteo si el usuario cambia de pestaña.
  - **Eventos Personalizados de Dominio**:
    | Evento | Cuándo se dispara | Parámetros Registrados |
    |---|---|---|
    | `game_start` | Inicio de partida en una zona | `zone_id`, `zone_name` |
    | `round_answer` | Respuesta de cada calle en la ronda | `round_number`, `mode`, `is_correct`, `score_delta`, `street_name`, `is_exact_address` |
    | `game_complete` | Finalización exitosa de las 5 calles | `score`, `rank`, `rank_badge`, `zone` |
    | `generate_lead` | Envío de formulario para auspiciantes | `plan`, `business_name`, `category`, `currency` |
    | `share` | Clic en compartir resultado o puntaje | `content_type`, `score`, `rank` |
    | `save_score` | Registro del récord en el podio | `score`, `zone` |
    | `select_content` | Interacción con un auspiciante (ej: ver en Maps) | `content_type`, `item_id`, `action` |
    | `open_advertise_modal` | Apertura de la ventana de sponsors | `source` (`header`, `start_screen`, `game_over`, `ribbon`) |
- **Privacidad y Cookies**: La plataforma emplea exclusivamente cookies de origen técnicas y analíticas anónimas (`_ga`, `_ga_*`) para estadísticas agregadas de uso y rendimiento. No se utilizan cookies de seguimiento publicitario cruzado de terceros ni tecnologías invasivas.

### 6. Identidad Visual y Experiencia de Usuario
- Interfaz construida con la paleta de marca oficial del creador @denischaco:
  - 🟢 **Verde Monte**: `#339136`
  - 🟤 **Marrón Chaqueño**: `#321401`
  - 🟠 **Naranja Chaco**: `#F48138`
  - 🔶 **Ámbar / Naranja Oscuro**: `#B95D0E`
- Feedback háptico y visual: confeti de victoria con `canvas-confetti`, transiciones suaves, diseño mobile-first preparado para jugar con una sola mano en el colectivo o caminando.

---

## 🗂️ Estructura del Repositorio

```text
cuantacalletenes/
├── api/
│   └── online.js                 # Serverless Function: Heartbeat Redis (Upstash)
├── public/
│   ├── favicon.svg               # Ícono oficial del juego
│   └── sponsors/                 # Logos de comercios chaqueños auspiciantes
├── src/
│   ├── components/
│   │   ├── AdvertiseModal.jsx    # Modal de planes para comercios y chat a WhatsApp
│   │   ├── DenisRibbonHeader.jsx # Barra superior con identidad, contador en vivo y accesos
│   │   ├── GameOverScreen.jsx    # Podio final, asignación de Rango Chaqueño y compartir
│   │   ├── HelpModal.jsx         # Guía de reglas y puntajes
│   │   ├── LeaderboardModal.jsx  # Tabla de posiciones en tiempo real (Firebase)
│   │   ├── RoundHUD.jsx          # Panel de adivinanza (escritura o 4 opciones)
│   │   ├── RoundResultModal.jsx  # Resultado por ronda, cupones y trivia
│   │   ├── StartScreen.jsx       # Portada de bienvenida y selector de zonas
│   │   └── StreetGameMap.jsx     # Mapa Leaflet mudo (Dark & Satellite)
│   ├── data/
│   │   ├── landmarks.json        # Zonas de juego (4 Avenidas y Gran Resistencia)
│   │   ├── ranks.json            # Títulos y descripciones de los Rangos Chaqueños
│   │   ├── referencePoints.json  # Plazas, lagunas y puntos de orientación
│   │   ├── resistenciaStreets.json # Geometrías y nombres de las calles
│   │   ├── sponsorPlans.json     # Tarifario y planes comerciales administrables
│   │   └── sponsors.json         # Comercios participantes y cupones activos
│   ├── services/
│   │   ├── analytics.js          # Helper de tracking y telemetría de eventos con GA4
│   │   ├── firebase.js           # Conexión Firestore para records y solicitudes
│   │   └── onlinePresence.js     # Hook y heartbeat de presencia en tiempo real
│   ├── utils/
│   │   ├── geoUtils.js           # Normalización de strings, tildes y distancias
│   │   └── streetRandomizer.js   # Generación de rondas y distractoras realistas
│   ├── App.jsx                   # Máquina de estados del juego
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
