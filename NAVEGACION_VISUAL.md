# 🗺️ Mapa de Navegación Visual - BovWeight

## 📱 Estructura de Pantallas

```
PANTALLA INICIAL
├─ LOGIN (/login)
│  └─ "¿No tienes cuenta?" → REGISTER
│  └─ "¿Olvidaste la contraseña?" → FORGOT PASSWORD
│
├─ REGISTER (/register)
│  └─ "¿Ya tienes cuenta?" → LOGIN
│
└─ FORGOT PASSWORD (/forgot-password)
   └─ "Volver a Login" → LOGIN
```

---

## 🏠 PANTALLAS CON BOTTOM NAVIGATION

Una vez autenticado, TODAS estas pantallas tienen el **BottomNav** con 4 botones:

```
┌─────────────────────────────────────┐
│                                     │
│         CONTENIDO DE PÁGINA         │
│                                     │
├─────────────────────────────────────┤
│  [Inicio] [Alertas] [Informes] [Perfil] │  ← BottomNav
└─────────────────────────────────────┘
```

### 📋 BottomNav Detallado

```
┌────────────┬────────────┬────────────┬────────────┐
│   Inicio   │   Alertas  │  Informes  │   Perfil   │
│    🏠      │     🔔     │    📊      │    👤      │
│ /dashboard │    /notif  │ /reportes  │  /perfil   │
└────────────┴────────────┴────────────┴────────────┘
```

---

## 🧭 Mapa Completo de Navegación

```
╔════════════════════════════════════════════════════════════════════╗
║                      FLUJO DE NAVEGACIÓN                          ║
╚════════════════════════════════════════════════════════════════════╝

🔐 ZONA SIN AUTENTICACIÓN (Sin BottomNav)
├─────────────────────────────────────────────────────────────
│
├─ LOGIN (/login)
│  ├─ [Link] Registrarse → REGISTER
│  ├─ [Link] Recuperar contraseña → FORGOT PASSWORD
│  └─ [Botón] Iniciar Sesión → DASHBOARD
│
├─ REGISTER (/register)
│  ├─ [Link] Ya tengo cuenta → LOGIN
│  └─ [Botón] Registrarse → (Vuelve a LOGIN para autenticar)
│
└─ FORGOT PASSWORD (/forgot-password)
   ├─ [Link] Volver al login → LOGIN
   └─ [Botón] Recuperar → LOGIN


✅ ZONA CON AUTENTICACIÓN (Con BottomNav)
├─────────────────────────────────────────────────────────────

┌─ 1️⃣ INICIO (/dashboard) - BottomNav [SELECCIONADO]
│
│  ├─ [CARD] Bienvenida con usuario
│  │  └─ [Botón ⚙️] → PERFIL
│  │
│  ├─ [CARD] Estado del Ganado (124 cabezas)
│  │
│  ├─ ACCESOS RÁPIDOS (Grid 2x2):
│  │  ├─ [Card] Registrar Bovino por Foto
│  │  │  └─ Click → REGISTRAR BOVINO FOTO
│  │  │
│  │  ├─ [Card] Registrar Bovino Manual
│  │  │  └─ Click → REGISTRAR BOVINO MANUAL
│  │  │
│  │  ├─ [Card] Mis Bovinos
│  │  │  └─ Click → MIS BOVINOS
│  │  │
│  │  └─ [Card] Mis Fincas
│  │     └─ Click → MIS FINCAS
│  │
│  └─ BottomNav:
│     ├─ [Inicio - ACTIVO]
│     ├─ [Alertas] → NOTIFICACIONES
│     ├─ [Informes] → REPORTES
│     └─ [Perfil] → PERFIL


├─ 2️⃣ MIS BOVINOS (/bovinos) - BottomNav
│
│  ├─ [Input] Buscar por ID, Rebaño o Arete
│  │
│  ├─ SI NO HAY BOVINOS:
│  │  ├─ [Ícono] 🌿
│  │  ├─ "Sin registros aún"
│  │  └─ [Botón] Agregar Bovino → REGISTRAR MANUAL
│  │
│  ├─ SI HAY BOVINOS:
│  │  ├─ [List Item] Bovino 1
│  │  │  ├─ [Avatar] Foto
│  │  │  ├─ Nombre, Rebaño, Peso
│  │  │  ├─ [Badge] Estado
│  │  │  └─ Click → HISTORIAL PESO (Detalle bovino)
│  │  │
│  │  ├─ [List Item] Bovino 2
│  │  │  └─ Click → HISTORIAL PESO
│  │  │
│  │  ├─ [CARDS] Stats
│  │  │  ├─ ACTIVOS: 124
│  │  │  └─ CUARENTENA: 0
│  │
│  └─ BottomNav


├─ 3️⃣ REGISTRAR BOVINO MANUAL (/bovinos/registrar-manual) - BottomNav
│
│  ├─ [Card] GENERAL
│  │  ├─ [Input] Número de Arete *
│  │  ├─ [Input] Nombre del Bovino
│  │  ├─ [Input] Raza *
│  │  ├─ [Input] Edad (años)
│  │  └─ [Input] Sexo
│  │
│  ├─ [Card] MEDIDAS
│  │  ├─ [Input] Peso (kg) *
│  │  ├─ [Input] Largo del cuerpo (cm)
│  │  ├─ [Input] Altura (cm)
│  │  └─ [Input] Perímetro torácico (cm)
│  │
│  ├─ [Card] UBICACIÓN
│  │  ├─ [Input] Finca
│  │  └─ [Input] Fecha
│  │
│  ├─ [Botón] Guardar Bovino
│  │  └─ POST /api/bovinos/registrar-manual → MIS BOVINOS
│  │
│  └─ BottomNav


├─ 4️⃣ REGISTRAR BOVINO POR FOTO (/bovinos/registrar-foto) - BottomNav
│
│  ├─ [Card] INFORMACIÓN GENERAL
│  │  ├─ [Input] Ubicación
│  │  ├─ [Input] Finca
│  │  ├─ [Input] Nombre/ID del Bovino
│  │  └─ [Input] Fecha
│  │
│  ├─ [Card] IMAGEN
│  │  ├─ [Camera Box] (Previsualización)
│  │  ├─ [Botón] Tomar Fotografía
│  │  │  └─ Abre cámara del dispositivo
│  │  ├─ [Checkbox] Tomar foto de costado
│  │  └─ [Checkbox] Subir desde galería
│  │
│  ├─ [Botón] Guardar Bovino
│  │  └─ POST /api/bovinos/registrar-foto (FormData) → MIS BOVINOS
│  │
│  └─ BottomNav


├─ 5️⃣ HISTORIAL DE PESO (/bovinos/detalle/:id) - BottomNav
│
│  ├─ [Card] INFO DEL BOVINO
│  │  ├─ Nombre: Bella (#BOV001)
│  │  ├─ Peso Actual: 450 kg
│  │  └─ [Botón] + Registrar Nuevo Peso
│  │     └─ POST /api/bovinos/:id/peso → Recarga
│  │
│  ├─ [Header] Historial
│  │
│  ├─ [List Items] Registros de Peso
│  │  ├─ 15/06/2026 → 450 kg [+10kg]
│  │  ├─ 08/06/2026 → 440 kg [+5kg]
│  │  └─ 01/06/2026 → 435 kg [-]
│  │
│  └─ BottomNav


├─ 6️⃣ MIS FINCAS (/fincas) - BottomNav
│
│  ├─ SI NO HAY FINCAS:
│  │  ├─ [Ícono] 🏢
│  │  ├─ "Comienza tu viaje"
│  │  └─ [Botón] Registrar Finca
│  │
│  ├─ SI HAY FINCAS:
│  │  ├─ [List Item] Finca 1
│  │  │  ├─ [Avatar] Foto
│  │  │  ├─ Nombre, Ubicación, Hectáreas
│  │  │  ├─ [Badge] # de bovinos
│  │  │  └─ Click → DETALLE FINCA
│  │  │
│  │  └─ [List Item] Finca 2
│  │     └─ Click → DETALLE FINCA
│  │
│  └─ BottomNav


├─ 7️⃣ DETALLE DE FINCA (/fincas/detalle/:id) - BottomNav
│
│  ├─ [Card] INFO
│  │  ├─ Nombre: La Esperanza
│  │  ├─ Ubicación: Cartago
│  │  └─ [Chip] 50 Hectáreas
│  │
│  ├─ [Card] BOVINOS
│  │  └─ Registrados: 124
│  │
│  ├─ [Botón] Editar Finca
│  │  └─ PUT /api/fincas/:id
│  │
│  └─ BottomNav


├─ 8️⃣ NOTIFICACIONES (/notificaciones) - BottomNav [ALERTAS]
│
│  ├─ SI NO HAY NOTIFICACIONES:
│  │  ├─ [Ícono] 🔕
│  │  ├─ "No tienes notificaciones"
│  │  └─ "Te avisaremos cuando haya novedades"
│  │
│  ├─ SI HAY NOTIFICACIONES:
│  │  ├─ [List Item] Notif 1
│  │  │  ├─ Título: Bovino en cuarentena
│  │  │  ├─ Mensaje: BOV001 necesita revisión
│  │  │  ├─ Fecha: 14/06/2026
│  │  │  └─ [Badge] Alerta
│  │  │
│  │  ├─ [List Item] Notif 2
│  │  │  └─ Similar al anterior
│  │
│  └─ BottomNav


├─ 9️⃣ REPORTES (/reportes) - BottomNav [INFORMES]
│
│  ├─ [Card] Título: "Resumen Mensual"
│  │  └─ "Monitorea el desempeño..."
│  │
│  ├─ [List Item] Reporte de Peso 📊
│  │  ├─ Subtítulo: "Análisis detallado de ganancia"
│  │  └─ Click → GET /api/reportes/peso
│  │
│  ├─ [List Item] Producción 📈
│  │  ├─ Subtítulo: "Métricas de producción láctea"
│  │  └─ Click → GET /api/reportes/produccion
│  │
│  ├─ [List Item] Historial 📅
│  │  ├─ Subtítulo: "Registro cronológico de eventos"
│  │  └─ Click → GET /api/reportes/historial
│  │
│  └─ BottomNav


├─ 🔟 PERFIL (/perfil) - BottomNav [PERFIL]
│
│  ├─ [Card] PERFIL DE USUARIO
│  │  ├─ [Avatar] Foto de perfil
│  │  ├─ Nombre: Austin Ponce
│  │  ├─ Email: ponceaustin@gmail.com
│  │  └─ [Botón] Editar Perfil ✏️
│  │     └─ PUT /api/usuario/perfil
│  │
│  ├─ [CARDS] ESTADÍSTICAS
│  │  ├─ BOVINOS: 124
│  │  └─ FINCAS: 2
│  │
│  ├─ [List Item] Historial de Actividad ⏱️
│  │  └─ Click → GET /api/usuario/historial
│  │
│  ├─ [List Item] Configuración ⚙️
│  │  └─ Click → CONFIGURACIÓN
│  │
│  ├─ [List Item] Cerrar Sesión 🚪
│  │  └─ Click → POST /api/auth/logout → LOGIN
│  │
│  └─ BottomNav


└─ 1️⃣1️⃣ CONFIGURACIÓN (/configuracion) - BottomNav [Acceso: Perfil]
   │
   ├─ [Header] SEGURIDAD
   │  └─ [List Item] Cambiar contraseña 🔒
   │     └─ Click → PUT /api/usuario/cambiar-contrasena
   │
   ├─ [Header] PREFERENCIAS
   │  ├─ [Toggle] Notificaciones 🔔
   │  │  └─ Cambio → PUT /api/usuario/configuracion/notificaciones
   │  └─ [Toggle] Modo oscuro 🌙
   │     └─ Local (sin API)
   │
   ├─ [Header] ACERCA DE
   │  └─ [List Item] Información de la aplicación ℹ️
   │     └─ Muestra versión y datos
   │
   └─ BottomNav
```

---

## 🎨 Componentes Reutilizables

```
COMPONENTES BASE:
├─ AppHeader.vue       → Encabezado de página
├─ BaseButton.vue      → Botón estándar
├─ BaseCard.vue        → Card contenedor
├─ BaseInput.vue       → Input de formulario
├─ BottomNav.vue       → Navegación inferior ⭐
├─ EmptyState.vue      → Estado vacío
├─ FloatingActionBtn.vue → Botón flotante
├─ QuickAccessCard.vue → Card de acceso rápido
├─ StatCard.vue        → Card de estadísticas
└─ WizardProgress.vue  → Indicador de progreso
```

---

## 🔌 Conexión a API

### Punto de Entrada
```
Toda solicitud pasa por: src/services/api.ts
                               ↓
Interceptor REQUEST      Interceptor RESPONSE
   ↓                             ↓
Agrega Token             Maneja Errores
   ↓                             ↓
Autorización            Error 401 → Login
Verificada              Error 404 → Manejo
                        Error 500 → Alerta
```

---

## 📲 Estados de Carga

Cada vista con peticiones a API tiene:
```typescript
const loading = ref(false);  // Estado de carga

loading.value = true;   // Inicia petición
// ... petición ...
loading.value = false;  // Termina petición

// En template:
<BaseButton :disabled="loading">
  {{ loading ? 'Guardando...' : 'Guardar' }}
</BaseButton>
```

---

## ✨ Summary

| Sección | Botones | Rutas | Con API | Estado |
|---------|---------|-------|---------|--------|
| Autenticación | 6 | 3 | Sí | ✅ |
| Dashboard | 5 | 1 | Sí | ✅ |
| Bovinos | 8 | 4 | Sí | ✅ |
| Fincas | 4 | 2 | Sí | ✅ |
| Notificaciones | 0 | 1 | Sí | ✅ |
| Reportes | 3 | 1 | Sí | ✅ |
| Perfil | 3 | 1 | Sí | ✅ |
| Configuración | 3 | 1 | Sí | ✅ |
| **TOTAL** | **32** | **14** | **20+** | **✅** |

---

**Documento creado:** 2026-06-13  
**Versión:** 1.0  
**Estado:** Listo para integrar API
