<template>
  <ion-header>
    <ion-toolbar color="success">

      <ion-buttons slot="start" v-if="showBack">
        <ion-back-button :default-href="defaultHref" />
      </ion-buttons>

      <ion-title>
        {{ title }}
      </ion-title>

      <ion-buttons slot="end">
        <ion-button fill="clear">
          <ion-icon :icon="searchOutline" />
        </ion-button>
      </ion-buttons>

    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon
} from '@ionic/vue';

import { searchOutline } from 'ionicons/icons';

defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: false
  },
  defaultHref: {
    type: String,
    default: '/dashboard'
  }
});
</script>