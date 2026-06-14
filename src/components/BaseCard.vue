<template>
  <ion-card class="base-card">
    <ion-card-content>
      <slot />
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent
} from '@ionic/vue';
</script>

<style scoped>
.base-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
  background: #ffffff !important;
}
</style>