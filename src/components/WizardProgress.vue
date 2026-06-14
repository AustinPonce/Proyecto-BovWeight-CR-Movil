<template>
  <ion-progress-bar
    :value="progress"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonProgressBar } from '@ionic/vue';

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const progress = computed(() => {
  return props.total > 0
    ? props.current / props.total
    : 0;
});
</script>