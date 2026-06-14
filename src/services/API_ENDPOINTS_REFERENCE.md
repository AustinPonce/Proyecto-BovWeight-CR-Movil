# 📡 Referencia de Endpoints de API - BovWeight

## Tabla de Endpoints por Vista

### 🔐 AUTENTICACIÓN (sin BottomNav)

| Endpoint | Método | Descripción | Vista | Ubicación |
|----------|--------|-------------|-------|-----------|
| `/api/auth/login` | POST | Login de usuario | LoginPage.vue | - |
| `/api/auth/register` | POST | Registro de usuario | RegisterPage.vue | - |
| `/api/auth/forgot-password` | POST | Recuperar contraseña | ForgotPasswordPage.vue | - |
| `/api/auth/logout` | POST | Cerrar sesión | PerfilPage.vue | `cerrarSesion()` |

---

### 🏠 DASHBOARD / INICIO (DashboardPage.vue)

```
📍 Ruta: /dashboard
📍 BottomNav: Activo (Pestaña "Inicio")
```

| Endpoint | Método | Descripción | Ubicación en Código |
|----------|--------|-------------|---------------------|
| `/api/dashboard/resumen` | GET | Obtener nombre usuario, total ganado, estado general | `onMounted()` - línea ~60 |

**Datos esperados:**
```typescript
{
  userName: string;
  totalGanado: number;
  estadoGanado: string; // "Sano", "Alerta", etc
}
```

**Campos donde van los datos:**
- `userName` → `ref(userName)`
- `totalGanado` → `ref(totalGanado)`
- `estadoGanado` → `ref(estadoGanado)`

---

### 🐄 BOVINOS

#### Lista de Bovinos (MisBovinosPage.vue)
```
📍 Ruta: /bovinos
📍 BottomNav: Accesible desde Inicio (QuickAccessCard)
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/bovinos` | GET | Obtener lista de bovinos del usuario | `onMounted()` - línea ~45 |

**Datos esperados:**
```typescript
[
  {
    id: string;
    nombre: string;
    rebano: string;
    peso: number;
    foto?: string;
    estado: 'activo' | 'cuarentena' | 'vendido';
  }
]
```

**Campos donde van los datos:**
- Reemplazar en `ref(bovinos)`

---

#### Registrar Bovino Manual (RegistrarManualPage.vue)
```
📍 Ruta: /bovinos/registrar-manual
📍 BottomNav: Accesible desde Inicio
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/bovinos/registrar-manual` | POST | Crear nuevo bovino | `guardarBovino()` - línea ~90 |

**Datos a enviar:**
```typescript
{
  arete: string;
  nombre: string;
  raza: string;
  edad: number;
  sexo: string;
  peso: number;
  largo: number;
  altura: number;
  perimetro: number;
  finca: string;
  fecha: string; // YYYY-MM-DD
}
```

**Acción post-éxito:** `router.push('/bovinos')`

---

#### Registrar Bovino con Foto (RegistrarFotoPage.vue)
```
📍 Ruta: /bovinos/registrar-foto
📍 BottomNav: Accesible desde Inicio
📍 Tipo: Multipart Form Data (contiene imagen)
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/bovinos/registrar-foto` | POST | Crear bovino con foto | `guardarBovino()` - línea ~70 |

**Datos a enviar (FormData):**
```typescript
{
  ubicacion: string;
  finca: string;
  nombre: string;
  fecha: string; // YYYY-MM-DD
  fotoCostado: boolean;
  foto: File; // Imagen capturada
}
```

**Acción post-éxito:** `router.push('/bovinos')`

---

#### Detalle del Bovino / Historial de Peso (HistorialPesoPage.vue)
```
📍 Ruta: /bovinos/detalle/:id
📍 BottomNav: Accesible desde MisBovinosPage
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/bovinos/:id` | GET | Obtener datos del bovino específico | `onMounted()` - línea ~50 |
| `/api/bovinos/:id/historial-peso` | GET | Obtener historial de pesos | `onMounted()` - línea ~54 |
| `/api/bovinos/:id/peso` | POST | Registrar nuevo peso | `agregarPeso()` - línea ~46 |

**Datos esperados (GET /bovinos/:id):**
```typescript
{
  id: string;
  nombre: string;
  rebano: string;
  peso: number;
}
```

**Datos esperados (GET /bovinos/:id/historial-peso):**
```typescript
[
  {
    id: string;
    peso: number;
    fecha: string; // YYYY-MM-DD
  }
]
```

**Datos a enviar (POST /bovinos/:id/peso):**
```typescript
{
  peso: number;
  fecha: string; // YYYY-MM-DD
}
```

---

### 🏘️ FINCAS

#### Lista de Fincas (MisFincasPage.vue)
```
📍 Ruta: /fincas
📍 BottomNav: Accesible desde Inicio
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/fincas` | GET | Obtener lista de fincas del usuario | `onMounted()` - línea ~36 |
| `/api/fincas` | POST | Crear nueva finca | `crearFinca()` - línea ~32 |

**Datos esperados (GET):**
```typescript
[
  {
    id: string;
    nombre: string;
    ubicacion: string;
    hectareas: number;
    imagen?: string;
    bovinosCount: number;
  }
]
```

**Datos a enviar (POST):**
```typescript
{
  nombre: string;
  ubicacion: string;
  hectareas: number;
  imagen?: File;
}
```

---

#### Detalle de Finca (DetalleFincaPage.vue)
```
📍 Ruta: /fincas/detalle/:id
📍 BottomNav: Accesible desde MisFincasPage
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/fincas/:id` | GET | Obtener datos de la finca | `onMounted()` - línea ~36 |
| `/api/fincas/:id` | PUT | Actualizar finca | `editarFinca()` - línea ~32 |

**Datos esperados:**
```typescript
{
  id: string;
  nombre: string;
  ubicacion: string;
  hectareas: number;
  bovinosCount: number;
}
```

---

### 🔔 NOTIFICACIONES / ALERTAS (NotificacionesPage.vue)
```
📍 Ruta: /notificaciones
📍 BottomNav: Activo (Pestaña "Alertas")
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/notificaciones` | GET | Obtener lista de notificaciones | `onMounted()` - línea ~33 |

**Datos esperados:**
```typescript
[
  {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    fecha: string; // YYYY-MM-DD
    leida: boolean;
  }
]
```

---

### 📊 REPORTES (ReportesPage.vue)
```
📍 Ruta: /reportes
📍 BottomNav: Activo (Pestaña "Informes")
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/reportes/resumen` | GET | Obtener resumen mensual | `onMounted()` - línea ~43 |
| `/api/reportes/:tipo` | GET | Obtener reporte específico | `verReporte(tipo)` - línea ~36 |

**Tipos de reportes:** `peso`, `produccion`, `historial`

**Datos esperados:**
```typescript
{
  resumen: {
    pesoGanado: number;
    produccion: number;
    eventos: number;
  }
}
```

---

### 👤 PERFIL (PerfilPage.vue)
```
📍 Ruta: /perfil
📍 BottomNav: Activo (Pestaña "Perfil")
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/usuario/perfil` | GET | Obtener datos del perfil | `onMounted()` - línea ~55 |
| `/api/usuario/perfil` | PUT | Actualizar perfil | `editarPerfil()` - línea ~45 |
| `/api/usuario/historial` | GET | Obtener historial de actividades | `verHistorial()` - línea ~49 |

**Datos esperados (GET):**
```typescript
{
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  totalBovinos: number;
  totalFincas: number;
}
```

---

### ⚙️ CONFIGURACIÓN (ConfiguracionPage.vue)
```
📍 Ruta: /configuracion
📍 BottomNav: Accesible desde Perfil
```

| Endpoint | Método | Descripción | Ubicación |
|----------|--------|-------------|-----------|
| `/api/usuario/configuracion` | GET | Obtener configuración | `onMounted()` - línea ~57 |
| `/api/usuario/cambiar-contrasena` | PUT | Cambiar contraseña | `cambiarContrasena()` - línea ~35 |
| `/api/usuario/configuracion/notificaciones` | PUT | Actualizar notificaciones | `toggleNotificaciones()` - línea ~39 |

**Datos esperados:**
```typescript
{
  notificacionesActivadas: boolean;
  modoOscuro: boolean;
  idiomaActual: string;
}
```

---

## 🔄 Flujo de Navegación

```
Login
  ↓
Register ← → ForgotPassword
  ↓
Dashboard (Inicio)
  ├─→ Registrar Bovino por Foto → MisBovinosPage
  ├─→ Registrar Bovino Manual → MisBovinosPage
  ├─→ Mis Bovinos → [Detalle Bovino]
  └─→ Mis Fincas → [Detalle Finca]

BottomNav (visible en todas las rutas autenticadas):
├─ Inicio → /dashboard
├─ Alertas → /notificaciones
├─ Informes → /reportes
└─ Perfil → /perfil
    └─ Configuración → /configuracion
```

---

## ⚡ Notas Importantes

1. **Autenticación:** Se usa `localStorage.getItem('authToken')` para verificar sesión
2. **Headers recomendados:**
   ```
   Authorization: Bearer {token}
   Content-Type: application/json
   ```
3. **Multipart Form Data:** Solo en `/api/bovinos/registrar-foto`
4. **Manejo de Errores:** Todos los endpoints deben manejar errores con `console.error()`
5. **Loading:** Usar `ref(loading)` para mostrar estado de carga

---

## 🚀 Próximos Pasos

1. Implementar todos los endpoints en tu backend
2. Reemplazar los `console.log()` con llamadas reales a axios
3. Revisar que los datos devueltos coincidan con las interfaces TypeScript
4. Testar cada vista con datos reales de la API

