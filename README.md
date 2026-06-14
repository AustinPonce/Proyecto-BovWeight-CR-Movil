# 🐄 BovWeight - Sistema de Gestión Ganadera

![Status](https://img.shields.io/badge/Status-Listo%20para%20API-green)
![Vue](https://img.shields.io/badge/Vue-3.3-success)
![Ionic](https://img.shields.io/badge/Ionic-8.0-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-8.4-orange)

> Aplicación móvil para monitoreo y gestión de ganado bovino con control de peso, registro de fincas y reportes analíticos.

---

## 📋 Contenido del Proyecto

### ✅ Lo Que YA Está Listo

- ✅ **Navegación completamente conectada** - 14 rutas funcionales
- ✅ **BottomNav con 4 opciones** - Inicio, Alertas, Informes, Perfil
- ✅ **11 vistas principales** - Todas con formularios, validaciones y estado reactivo
- ✅ **20+ comentarios TODO** - Indicando exactamente dónde va cada endpoint de API
- ✅ **Servicio de API configurado** - Con interceptores y manejo de errores
- ✅ **Documentación completa** - Guías de integración y referencias de endpoints

### 🔄 Lo Que Falta (Por Hacer)

Solo necesitas:
1. Implementar los endpoints en tu backend
2. Reemplazar los `TODO: API` con llamadas reales a la API
3. Testar cada vista

---

## 🚀 Inicio Rápido

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Desarrollo Local
```bash
npm run dev
```
Se abrirá en `http://localhost:5173`

### 3. Build de Producción
```bash
npm run build
```

---

## 📱 Estructura de la Aplicación

```
src/
├── App.vue                          # Componente raíz
├── main.ts                          # Punto de entrada
├── router/
│   └── index.ts                     # Configuración de rutas (14 rutas)
├── views/                           # Todas las pantallas
│   ├── auth/                        # Login, Registro, Recuperar contraseña
│   ├── dashboard/                   # Inicio (resumen)
│   ├── bovinos/                     # Listado, registro manual, registro por foto, historial
│   ├── fincas/                      # Listado y detalle
│   ├── notificaciones/              # Centro de alertas
│   ├── reportes/                    # Reportes y análisis
│   └── perfil/                      # Perfil y configuración
├── components/                      # 10 componentes reutilizables
├── services/                        # Servicios de negocio
│   ├── api.ts ⭐                    # Configuración de axios (YA HECHO)
│   ├── authService.ts
│   ├── bovinoService.ts
│   ├── fincaService.ts
│   └── reporteService.ts
└── stores/                          # Pinia store (estado global)
```

---

## 🔌 Integración de API

### Paso 1: Configurar URL del Backend

Edita `src/services/api.ts` línea ~25:

```typescript
// ANTES:
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

// DESPUÉS (reemplaza con tu URL):
const API_BASE_URL = 'https://tu-backend.com/api';
```

### Paso 2: Buscar y Reemplazar TODO: API

1. En VS Code: **Ctrl + Shift + F**
2. Busca: `TODO: API`
3. Verás 20+ resultados - cada uno es un punto donde agregar la API

**Ejemplo de reemplazo (HistorialPesoPage.vue):**

```typescript
// ❌ ANTES (a reemplazar):
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/bovinos/:id
  console.log(`📡 [PENDING API] GET /api/bovinos/${bovinoId.value}...`);
});

// ✅ DESPUÉS (código real):
onMounted(async () => {
  try {
    const response = await api.get(`/bovinos/${bovinoId.value}`);
    bovino.value = response.data;
  } catch (error) {
    console.error('Error:', error);
  }
});
```

---

## 📚 Documentación Incluida

El proyecto incluye 4 documentos de referencia:

### 1. **PROYECTO_STATUS.md**
- 📊 Estado general del proyecto
- ✅ Checklist de todo lo hecho
- 🔍 Dónde buscar cada cosa

### 2. **API_ENDPOINTS_REFERENCE.md**
- 📋 Tabla completa de todos los endpoints
- 📊 Estructura de datos esperada para cada uno
- 📍 Ubicación exacta en el código

### 3. **API_INTEGRATION_GUIDE.md**
- 📖 6 ejemplos prácticos
- ✨ Cómo pasar de TODO a código real
- 📝 Checklist de integración

### 4. **NAVEGACION_VISUAL.md**
- 🗺️ Mapa completo de todas las pantallas
- 🔄 Flujo de navegación
- 🎨 Estructura visual

---

## 🌳 Estructura de Rutas

```
LOGIN (sin autenticación)
  ↓
DASHBOARD (con autenticación + BottomNav)
  ├─ Inicio (seleccionado por defecto)
  ├─ Alertas
  ├─ Informes
  └─ Perfil
     └─ Configuración

Desde Inicio puedes acceder a:
  ├─ Registrar Bovino por Foto
  ├─ Registrar Bovino Manual
  ├─ Mis Bovinos → Detalle (Historial de Peso)
  └─ Mis Fincas → Detalle Finca
```

---

## 🔐 Autenticación

El sistema ya maneja:

1. **Login:** Token se guarda en `localStorage.authToken`
2. **Protección:** Router solo permite rutas autenticadas con token válido
3. **Interceptor:** Todas las peticiones incluyen automáticamente `Authorization: Bearer {token}`
4. **Manejo de expiración:** Si token expira (401) → Redirige a login automáticamente

---

## 🎯 20+ Endpoints Listos para Conectar

| Sección | Endpoint | Método | Vista |
|---------|----------|--------|-------|
| **Dashboard** | `/dashboard/resumen` | GET | DashboardPage |
| **Bovinos** | `/bovinos` | GET | MisBovinosPage |
| | `/bovinos/registrar-manual` | POST | RegistrarManualPage |
| | `/bovinos/registrar-foto` | POST | RegistrarFotoPage |
| | `/bovinos/:id` | GET | HistorialPesoPage |
| | `/bovinos/:id/historial-peso` | GET | HistorialPesoPage |
| | `/bovinos/:id/peso` | POST | HistorialPesoPage |
| **Fincas** | `/fincas` | GET | MisFincasPage |
| | `/fincas` | POST | MisFincasPage |
| | `/fincas/:id` | GET | DetalleFincaPage |
| | `/fincas/:id` | PUT | DetalleFincaPage |
| **Notificaciones** | `/notificaciones` | GET | NotificacionesPage |
| **Reportes** | `/reportes/resumen` | GET | ReportesPage |
| | `/reportes/:tipo` | GET | ReportesPage |
| **Perfil** | `/usuario/perfil` | GET | PerfilPage |
| | `/usuario/perfil` | PUT | PerfilPage |
| | `/usuario/historial` | GET | PerfilPage |
| **Configuración** | `/usuario/configuracion` | GET | ConfiguracionPage |
| | `/usuario/cambiar-contrasena` | PUT | ConfiguracionPage |
| | `/usuario/configuracion/notificaciones` | PUT | ConfiguracionPage |

---

## 💡 Tips para Integración

1. **Usa el servicio de API:** 
   ```typescript
   import api from '@/services/api';
   const response = await api.get('/endpoint');
   ```

2. **Maneja errores:**
   ```typescript
   try {
     const response = await api.get('/data');
   } catch (error) {
     console.error('Error:', error);
     // Mostrar al usuario
   }
   ```

3. **Estados de carga:**
   ```typescript
   loading.value = true;
   // petición...
   loading.value = false;
   ```

4. **Multipart (solo fotos):**
   ```typescript
   const formData = new FormData();
   formData.append('foto', file);
   formData.append('campo', valor);
   api.post('/endpoint', formData);
   ```

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test:unit

# Tests E2E
npm run test:e2e

# Linting
npm run lint
```

---

## 📱 Compilación Mobile

### Android
```bash
npx cap sync
npx cap open android
```

### iOS
```bash
npx cap sync
npx cap open ios
```

---

## 🎨 Colores del Tema

- **Verde principal:** #16a34a (éxito, botones primarios)
- **Verde oscuro:** #006d37 (acentos)
- **Gris:** #9ca3af (texto secundario)
- **Fondo:** #ffffff (blanco)

---

## 📝 Componentes Disponibles

```typescript
// Componentes base reutilizables:
import AppHeader from '@/components/AppHeader.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BottomNav from '@/components/BottomNav.vue';  // ⭐ Ya funciona
import StatCard from '@/components/StatCard.vue';
import QuickAccessCard from '@/components/QuickAccessCard.vue';
// ... y más
```

---

## 🐛 Debugging

1. **Ver todos los TODO:**
   ```
   Ctrl + Shift + F → Buscar "TODO: API"
   ```

2. **Logs de peticiones:**
   Todos los requests/responses se logean en consola:
   ```
   📤 [REQUEST] GET /api/bovinos
   📥 [RESPONSE] 200 /api/bovinos
   ❌ [ERROR] 404 - Not Found
   ```

3. **Chrome DevTools:**
   - F12 → Network → Ver peticiones
   - Console → Ver logs

---

## ✨ Checklist de Integración

```
□ Configurar URL del backend en api.ts
□ Buscar todos los "TODO: API" (Ctrl+Shift+F)
□ Para cada TODO:
  □ Leer el endpoint comentado
  □ Ver el ejemplo en API_INTEGRATION_GUIDE.md
  □ Reemplazar el console.log() con llamada real
  □ Asignar datos a las variables reactivas
□ Testar en navegador/dispositivo
□ Verificar que los datos se cargan correctamente
□ Implementar UI de errores (Toast/Modal)
□ Preparar para producción
```

---

## 📞 Soporte

**Si necesitas ayuda:**

1. Revisar **PROYECTO_STATUS.md** - Estado general
2. Revisar **API_ENDPOINTS_REFERENCE.md** - Estructura de datos
3. Revisar **API_INTEGRATION_GUIDE.md** - Ejemplos de código
4. Revisar **NAVEGACION_VISUAL.md** - Flujo de navegación

Cada vista tiene comentarios con `TODO: API` indicando exactamente qué hacer.

---

## 📦 Dependencias Principales

```json
{
  "@ionic/vue": "^8.0.0",
  "@ionic/vue-router": "^8.0.0",
  "@capacitor/core": "^8.4.0",
  "@capacitor/camera": "^8.2.0",
  "axios": "^1.17.0",
  "pinia": "^3.0.4",
  "vue": "^3.3.0",
  "vue-router": "^4.2.0"
}
```

---

## 🚀 Próximas Fases

1. **Fase 1 (ACTUAL):** ✅ Preparar vistas (COMPLETO)
2. **Fase 2:** Integrar API con backend
3. **Fase 3:** Testing y debugging
4. **Fase 4:** Optimización y producción
5. **Fase 5:** Deploy en tiendas

---

## 📄 Licencia

MIT

---

**Última actualización:** 2026-06-13  
**Versión:** 1.0.0-pre-api  
**Mantenedor:** Equipo BovWeight
