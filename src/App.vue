<template>
  <ion-app :style="appStyle">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import fondoBovinos from '@/assets/images/fondo-vaca.png';

const appStyle = {
  backgroundImage: `url("${fondoBovinos}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
</script>

<style>
/* ion-page llena siempre el 100% del viewport → overlay consistente */
ion-page {
  background: rgba(249, 250, 251, 0.85);
}

/* Login usa overlay oscuro para destacar el formulario */
ion-page.login-page {
  background: rgba(0, 0, 0, 0.45) !important;
}

/* ion-content transparente para que se vea el fondo de ion-page */
ion-content {
  --background: transparent;
}
</style>
