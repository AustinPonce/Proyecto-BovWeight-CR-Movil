<template>
  <ion-card class="stat-card">

    <ion-card-content>

      <div class="header">

        <span class="title">
          {{ title }}
        </span>

        <ion-badge
          v-if="badge"
          color="success"
        >
          {{ badge }}
        </ion-badge>

      </div>

      <h2 class="value">
        {{ value }}
      </h2>

    </ion-card-content>

  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonBadge
} from '@ionic/vue';

defineProps({
  title: String,
  value: [String, Number],
  badge: String
});
</script>

<style scoped>
.stat-card {
  border-radius: 16px;
  background: #ffffff !important;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #374151;
  font-size: 12px;
}

.value {
  color: #006d37;
  font-size: 32px;
  font-weight: bold;
  margin-top: 12px;
}
</style>