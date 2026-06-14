<template>
  <ion-button
    :type="type"
    :disabled="disabled"
    expand="block"
    class="base-button"
  >
    <slot />

    <ion-icon
      v-if="icon"
      :icon="icon"
      slot="end"
    />
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import type { PropType } from 'vue';

defineProps({
  icon: Object,
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.base-button {
  --background: #2ecc71;
  --background-hover: #27ae60;
  --border-radius: 999px;
  height: 52px;
  font-weight: 600;
}
</style>