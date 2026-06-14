<template>
  <ion-fab
    vertical="bottom"
    horizontal="end"
    slot="fixed"
  >
    <ion-fab-button @click="$emit('click')">
      <ion-icon :icon="add" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import {
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/vue';

import { add } from 'ionicons/icons';

defineEmits(['click']);
</script>