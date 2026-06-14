<template>
  <ion-card
    class="quick-card"
    button
    @click="$emit('click')"
  >
    <ion-card-content>

      <div class="icon-container">
        <ion-icon
          :icon="icon"
          class="card-icon"
        />
      </div>

      <span class="card-title">
        {{ title }}
      </span>

    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/vue';

defineProps({
  title: {
    type: String,
    required: true
  },

  icon: {
  type: String,
  required: true
}
});

defineEmits(['click']);
</script>

<style scoped>
.quick-card {
  border-radius: 16px;
  min-height: 160px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #2ecc71;
}

.icon-container {
  width: 56px;
  height: 56px;

  border-radius: 50%;

  background: rgba(255,255,255,.2);

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 12px;
}

.card-icon {
  font-size: 30px;
  color: #005027;
}

.card-title {
  display: block;
  text-align: center;

  font-size: 13px;
  font-weight: 600;

  color: #005027;
}
</style>