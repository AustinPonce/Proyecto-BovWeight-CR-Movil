<template>
  <div class="empty-state">

    <ion-icon
      :icon="icon"
      class="empty-icon"
    />

    <h3>{{ title }}</h3>

    <p>{{ description }}</p>

  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

defineProps({
  icon: Object,
  title: String,
  description: String
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #2ecc71;
}
</style>