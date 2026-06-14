// ============================================================================
// API Integration Guide - Ejemplo de cómo reemplazar los TODO cuando API esté lista
// ============================================================================

// ANTES (Desarrollo actual con comentarios TODO):
// ============================================================================
/*
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/dashboard/resumen
  // Obtener: nombre de usuario, total de ganado, estado general
  console.log('📡 [PENDING API] GET /api/dashboard/resumen - Cargar datos del dashboard');
  
  // Ejemplo de datos para desarrollo (eliminar cuando API esté lista)
  // userName.value = 'Austin Ponce';
  // totalGanado.value = 124;
  // estadoGanado.value = 'Sano';
});
*/

// DESPUÉS (Cuando la API esté lista - ACTUALIZAR así):
// ============================================================================

import { ref, onMounted } from 'vue';
import api from '@/services/api'; // Ya existe en tu proyecto

// En el script setup de cualquier vista, reemplazar onMounted así:

onMounted(async () => {
  try {
    const response = await api.get('/dashboard/resumen');
    
    // Asignar los datos a tus variables reactivas
    userName.value = response.data.userName;
    totalGanado.value = response.data.totalGanado;
    estadoGanado.value = response.data.estadoGanado;
    
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    // Mostrar mensaje de error al usuario (usar toast o modal)
  } finally {
    loading.value = false;
  }
});

// ============================================================================
// Ejemplos por tipo de solicitud
// ============================================================================

// ✅ EJEMPLO 1: GET simple (lista de bovinos)
// Archivo: src/views/bovinos/MisBovinosPage.vue
// Ubicación: onMounted()

onMounted(async () => {
  loading.value = true;
  try {
    const response = await api.get('/bovinos');
    bovinos.value = response.data; // Asignar la lista de bovinos
  } catch (error) {
    console.error('Error al cargar bovinos:', error);
  } finally {
    loading.value = false;
  }
});

// ============================================================================

// ✅ EJEMPLO 2: GET con parámetro de ruta (detalle de un bovino)
// Archivo: src/views/bovinos/HistorialPesoPage.vue
// Ubicación: onMounted()

onMounted(async () => {
  loading.value = true;
  try {
    const bovinoId = route.params.id;
    
    // Petición 1: Obtener datos del bovino
    const bovResponse = await api.get(`/bovinos/${bovinoId}`);
    bovino.value = bovResponse.data;
    
    // Petición 2: Obtener historial de pesos
    const historialResponse = await api.get(`/bovinos/${bovinoId}/historial-peso`);
    historialPeso.value = historialResponse.data;
    
  } catch (error) {
    console.error('Error al cargar datos del bovino:', error);
  } finally {
    loading.value = false;
  }
});

// ============================================================================

// ✅ EJEMPLO 3: POST (crear/guardar datos)
// Archivo: src/views/bovinos/RegistrarManualPage.vue
// Ubicación: guardarBovino()

const guardarBovino = async () => {
  // Validación básica
  if (!formulario.arete || !formulario.raza || !formulario.peso) {
    console.error('Por favor completa los campos obligatorios');
    return;
  }

  loading.value = true;
  try {
    // Enviar datos a la API
    const response = await api.post('/bovinos/registrar-manual', {
      arete: formulario.arete,
      nombre: formulario.nombre,
      raza: formulario.raza,
      edad: formulario.edad,
      sexo: formulario.sexo,
      peso: formulario.peso,
      largo: formulario.largo,
      altura: formulario.altura,
      perimetro: formulario.perimetro,
      finca: formulario.finca,
      fecha: formulario.fecha
    });
    
    console.log('Bovino creado:', response.data);
    
    // Redirigir tras éxito
    router.push('/bovinos');
    
  } catch (error) {
    console.error('Error al guardar bovino:', error);
    // Mostrar mensaje de error al usuario
  } finally {
    loading.value = false;
  }
};

// ============================================================================

// ✅ EJEMPLO 4: POST con archivo (Multipart Form Data)
// Archivo: src/views/bovinos/RegistrarFotoPage.vue
// Ubicación: guardarBovino()

const guardarBovino = async () => {
  if (!foto.value) {
    console.error('Debes capturar una foto');
    return;
  }

  loading.value = true;
  try {
    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('ubicacion', formulario.ubicacion);
    formData.append('finca', formulario.finca);
    formData.append('nombre', formulario.nombre);
    formData.append('fecha', formulario.fecha);
    formData.append('fotoCostado', formulario.fotoCostado);
    
    // Agregar la imagen (convertir webPath a Blob)
    if (fotoBinaria.value) {
      formData.append('foto', fotoBinaria.value);
    }
    
    // Enviar con Content-Type: multipart/form-data (axios lo hace automáticamente)
    const response = await api.post('/bovinos/registrar-foto', formData);
    
    console.log('Bovino registrado con foto:', response.data);
    router.push('/bovinos');
    
  } catch (error) {
    console.error('Error al guardar bovino con foto:', error);
  } finally {
    loading.value = false;
  }
};

// ============================================================================

// ✅ EJEMPLO 5: PUT (actualizar datos)
// Archivo: src/views/perfil/PerfilPage.vue
// Ubicación: editarPerfil()

const editarPerfil = async () => {
  loading.value = true;
  try {
    const response = await api.put('/usuario/perfil', {
      nombre: usuario.value.nombre,
      email: usuario.value.email,
      avatar: usuario.value.avatar // o un archivo si permite actualizar avatar
    });
    
    console.log('Perfil actualizado:', response.data);
    // Mostrar éxito al usuario
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
  } finally {
    loading.value = false;
  }
};

// ============================================================================

// ✅ EJEMPLO 6: Manejo de errores con interceptores
// Archivo: src/services/api.ts (ya existe pero puede mejorarse)

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://api.bovweight.com'
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, hacer logout
      localStorage.removeItem('authToken');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================================

// 📝 CHECKLIST para reemplazar todos los TODO:
// ============================================================================

/*
□ DashboardPage.vue - onMounted()
  └ GET /api/dashboard/resumen

□ MisBovinosPage.vue - onMounted()
  └ GET /api/bovinos

□ RegistrarManualPage.vue - guardarBovino()
  └ POST /api/bovinos/registrar-manual

□ RegistrarFotoPage.vue - guardarBovino()
  └ POST /api/bovinos/registrar-foto (FormData)

□ HistorialPesoPage.vue - onMounted() y agregarPeso()
  ├ GET /api/bovinos/:id
  ├ GET /api/bovinos/:id/historial-peso
  └ POST /api/bovinos/:id/peso

□ MisFincasPage.vue - onMounted() y crearFinca()
  ├ GET /api/fincas
  └ POST /api/fincas

□ DetalleFincaPage.vue - onMounted() y editarFinca()
  ├ GET /api/fincas/:id
  └ PUT /api/fincas/:id

□ NotificacionesPage.vue - onMounted()
  └ GET /api/notificaciones

□ ReportesPage.vue - onMounted() y verReporte()
  ├ GET /api/reportes/resumen
  └ GET /api/reportes/:tipo

□ PerfilPage.vue - onMounted(), editarPerfil(), verHistorial()
  ├ GET /api/usuario/perfil
  ├ PUT /api/usuario/perfil
  └ GET /api/usuario/historial

□ ConfiguracionPage.vue - onMounted(), cambiarContrasena(), toggleNotificaciones()
  ├ GET /api/usuario/configuracion
  ├ PUT /api/usuario/cambiar-contrasena
  └ PUT /api/usuario/configuracion/notificaciones

*/

// ============================================================================
// Consejo: Busca "TODO: API" en todo el proyecto para encontrar todos los puntos
// ============================================================================
