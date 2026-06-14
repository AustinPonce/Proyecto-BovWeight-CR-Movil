/**
 * ============================================================================
 * Servicio de API - BovWeight
 * ============================================================================
 * 
 * Configuración centralizada para todas las llamadas a la API.
 * Aquí se manejan:
 * - Base URL de la API
 * - Headers por defecto
 * - Interceptores para autenticación
 * - Gestión de errores global
 * 
 * IMPORTANTE: Reemplaza el valor de API_BASE_URL cuando tengas la URL de tu backend
 */

import axios from 'axios';
import { useRouter } from 'vue-router';

/**
 * TODO: Reemplaza esta URL con la de tu servidor backend
 * Ejemplos:
 * - Desarrollo local: http://localhost:3000
 * - Producción: https://api.bovweight.com
 * - Servidor remoto: https://tu-servidor.com/api
 * 
 * NOTA: Para emulador Android, usa http://10.0.2.2:8000/api
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Crear instancia de axios configurada
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

/**
 * ============================================================================
 * Interceptor de REQUEST - Agregar token a todas las peticiones
 * ============================================================================
 */
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('authToken');
    
    // Agregar token en el header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

/**
 * ============================================================================
 * Interceptor de RESPONSE - Manejar respuestas y errores
 * ============================================================================
 */
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [RESPONSE] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const router = useRouter();
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error(`❌ [ERROR] ${error.response.status} - ${error.response.statusText}`);
      console.error('Detalles:', error.response.data);
      
      // Manejar errores específicos
      switch (error.response.status) {
        case 401:
          // No autorizado - Token inválido o expirado
          console.warn('⚠️ Token expirado o no válido. Redirigiendo a login...');
          localStorage.removeItem('authToken');
          router.push('/login');
          break;
          
        case 403:
          // Prohibido - No tiene permisos
          console.error('❌ No tienes permisos para acceder a este recurso');
          break;
          
        case 404:
          // No encontrado
          console.error('❌ Recurso no encontrado');
          break;
          
        case 500:
          // Error interno del servidor
          console.error('❌ Error en el servidor. Por favor, intenta más tarde.');
          break;
      }
    } else if (error.request) {
      // Se hizo la petición pero no se recibió respuesta
      console.error('❌ No se recibió respuesta del servidor:', error.request);
    } else {
      // Error al configurar la petición
      console.error('❌ Error al hacer la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * ============================================================================
 * MÉTODOS RÁPIDOS PARA OPERACIONES COMUNES
 * ============================================================================
 */

/**
 * GET - Obtener datos
 * @param url - Endpoint relativo (ej: '/bovinos')
 * @param params - Parámetros opcionales (ej: { page: 1, limit: 10 })
 */
export const apiGet = (url: string, params?: any) => {
  return api.get(url, { params });
};

/**
 * POST - Crear datos
 * @param url - Endpoint relativo
 * @param data - Datos a enviar
 */
export const apiPost = (url: string, data: any) => {
  return api.post(url, data);
};

/**
 * PUT - Actualizar datos
 * @param url - Endpoint relativo
 * @param data - Datos a actualizar
 */
export const apiPut = (url: string, data: any) => {
  return api.put(url, data);
};

/**
 * DELETE - Eliminar datos
 * @param url - Endpoint relativo
 */
export const apiDelete = (url: string) => {
  return api.delete(url);
};

/**
 * ============================================================================
 * Exportar la instancia de axios para uso directo si es necesario
 * ============================================================================
 */
export default api;

/**
 * ============================================================================
 * EJEMPLO DE USO EN LAS VISTAS
 * ============================================================================
 * 
 * // Opción 1: Usar la instancia directamente
 * import api from '@/services/api';
 * 
 * onMounted(async () => {
 *   try {
 *     const response = await api.get('/bovinos');
 *     bovinos.value = response.data;
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * });
 * 
 * // Opción 2: Usar los métodos rápidos
 * import { apiGet, apiPost } from '@/services/api';
 * 
 * onMounted(async () => {
 *   try {
 *     const response = await apiGet('/bovinos');
 *     bovinos.value = response.data;
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * });
 */
