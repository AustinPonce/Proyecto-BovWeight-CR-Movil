import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  // Ruta raíz
  {
    path: '/',
    redirect: '/login'
  },

  // ============= RUTAS DE AUTENTICACIÓN (SIN BOTTOM NAV) =============
  {
    path: '/login',
    component: () => import('../views/auth/LoginPage.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/register',
    component: () => import('../views/auth/RegisterPage.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/forgot-password',
    component: () => import('../views/auth/ForgotPasswordPage.vue'),
    meta: { requiresAuth: false }
  },

  // ============= RUTAS DE LA APP (CON BOTTOM NAV) =============
  // Dashboard / Inicio
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },

  // Bovinos
  {
    path: '/bovinos',
    component: () => import('../views/bovinos/MisBovinosPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/bovinos/detalle/:id',
    component: () => import('../views/bovinos/HistorialPesoPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/bovinos/registrar-foto',
    component: () => import('../views/bovinos/RegistrarFotoPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/bovinos/registrar-manual',
    component: () => import('../views/bovinos/RegistrarManualPage.vue'),
    meta: { requiresAuth: true }
  },

  // Fincas
  {
    path: '/fincas',
    component: () => import('../views/fincas/MisFincasPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/fincas/detalle/:id',
    component: () => import('../views/fincas/DetalleFincaPage.vue'),
    meta: { requiresAuth: true }
  },

  // Notificaciones / Alertas
  {
    path: '/notificaciones',
    component: () => import('../views/notificaciones/NotificacionesPage.vue'),
    meta: { requiresAuth: true }
  },

  // Reportes
  {
    path: '/reportes',
    component: () => import('../views/reportes/ReportesPage.vue'),
    meta: { requiresAuth: true }
  },

  // Perfil
  {
    path: '/perfil',
    component: () => import('../views/perfil/PerfilPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/perfil/editar',
    component: () => import('../views/perfil/PerfilPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/configuracion',
    component: () => import('../views/perfil/ConfiguracionPage.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guard para verificar autenticación
router.beforeEach((to, from, next) => {
  // TODO: API - Verificar token de autenticación en localStorage
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;