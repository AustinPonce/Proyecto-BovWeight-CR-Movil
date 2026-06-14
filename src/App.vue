<template>
  <ion-app>
    <ion-router-outlet />
    <!-- BottomNav solo se muestra en rutas autenticadas -->
    <BottomNav v-if="showBottomNav" />
  </ion-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonApp,
  IonRouterOutlet
} from '@ionic/vue';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();

// Mostrar BottomNav solo en rutas autenticadas
const showBottomNav = computed(() => {
  const rutasAuthenticadas = [
    '/dashboard',
    '/bovinos',
    '/bovinos/registrar-foto',
    '/bovinos/registrar-manual',
    '/bovinos/detalle',
    '/fincas',
    '/fincas/detalle',
    '/notificaciones',
    '/reportes',
    '/perfil',
    '/perfil/editar',
    '/configuracion'
  ];
  
  return rutasAuthenticadas.some(ruta => route.path.startsWith(ruta));
});
</script>

<style>
/* Asegurar que el router outlet tenga espacio para el bottom nav */
ion-router-outlet {
  --padding-bottom: 60px;
}

/* Fondo blanco para toda la app */
ion-app {
  --background: #ffffff;
  background-color: #ffffff;
}

ion-content {
  --background: #ffffff;
}
</style>