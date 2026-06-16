import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { ROL_ADMIN, ROL_GANADERO, ROL_VETERINARIO } from '@/composables/useRol';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: number[];
  }
}

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/login' },

  // ── Autenticación (públicas) ──────────────────────────────────────────
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

  // ── Dashboard ─────────────────────────────────────────────────────────
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },

  // ── Admin ────────────────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('../views/admin/GestionAdminPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_ADMIN] }
  },
  {
    path: '/admin/usuarios',
    component: () => import('../views/admin/UsuariosAdminPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_ADMIN] }
  },
  {
    path: '/admin/catalogos',
    component: () => import('../views/admin/CatalogosAdminPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_ADMIN] }
  },
  {
    path: '/admin/reportes',
    component: () => import('../views/reportes/ReportesGlobalPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_ADMIN] }
  },

  // ── Bovinos ───────────────────────────────────────────────────────────
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
    meta: { requiresAuth: true, roles: [ROL_ADMIN, ROL_GANADERO] }
  },
  {
    path: '/bovinos/registrar-manual',
    component: () => import('../views/bovinos/RegistrarManualPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_ADMIN, ROL_GANADERO] }
  },

  // ── Dosis (veterinario) ───────────────────────────────────────────────
  {
    path: '/dosis',
    component: () => import('../views/bovinos/DosisPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_VETERINARIO] }
  },

  // ── Comentarios veterinario ───────────────────────────────────────────
  {
    path: '/comentarios',
    component: () => import('../views/bovinos/ComentariosVeterinarioPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_VETERINARIO, ROL_GANADERO] }
  },

  // ── Transacciones ─────────────────────────────────────────────────────
  {
    path: '/transacciones',
    component: () => import('../views/bovinos/TransaccionesPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_GANADERO, ROL_ADMIN] }
  },

  // ── Veterinario (admin asigna vets a fincas) ──────────────────────────
  {
    path: '/veterinario/asignar',
    component: () => import('../views/veterinario/AsignarVeterinarioPage.vue'),
    meta: { requiresAuth: true, roles: [ROL_ADMIN] }
  },

  // ── Fincas ────────────────────────────────────────────────────────────
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

  // ── Notificaciones ────────────────────────────────────────────────────
  {
    path: '/notificaciones',
    component: () => import('../views/notificaciones/NotificacionesPage.vue'),
    meta: { requiresAuth: true }
  },

  // ── Reportes ──────────────────────────────────────────────────────────
  {
    path: '/reportes',
    component: () => import('../views/reportes/ReportesPage.vue'),
    meta: { requiresAuth: true }
  },

  // ── Perfil / Configuración ────────────────────────────────────────────
  {
    path: '/perfil',
    component: () => import('../views/perfil/PerfilPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/configuracion',
    component: () => import('../views/perfil/ConfiguracionPage.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  const rolesRequeridos = to.meta.roles;
  if (rolesRequeridos && isAuthenticated) {
    const authUserStr = localStorage.getItem('authUser');
    const authUser = authUserStr ? JSON.parse(authUserStr) : null;
    const rolId: number | undefined = authUser?.id_tipo_usuario;

    if (rolId !== undefined && !rolesRequeridos.includes(rolId)) {
      next('/dashboard');
      return;
    }
  }

  next();
});

export default router;