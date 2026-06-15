<template>
  <div class="input-wrapper">

    <label
      v-if="label"
      class="input-label"
    >
      {{ label }}
    </label>

    <ion-item
      lines="none"
      class="input-item"
    >
      <ion-icon
        v-if="icon"
        :icon="icon"
        slot="start"
      />

      <ion-input
        :value="modelValue"
        :placeholder="placeholder"
        :type="type"
        :disabled="disabled"
        @ionInput="$emit('update:modelValue', $event.target.value)"
      />
    </ion-item>

  </div>
</template>

<script setup lang="ts">
import {
  IonItem,
  IonInput,
  IonIcon
} from '@ionic/vue';
import type { PropType } from 'vue';
import type { TextFieldTypes } from '@ionic/core';

defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  icon: Object,
  type: {
    type: String as PropType<TextFieldTypes>,
    default: 'text'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-label {
  font-size: 12px;
  font-weight: 700;
  margin-left: 6px;
  color: #374151;
}

.input-item {
  --background: #ffffff;
  --border-radius: 12px;
  --border: 1px solid #e5e7eb;
  border: 1px solid #e5e7eb;
  margin-top: 6px;
}

.input-item ion-input {
  color: #000000 !important;
}

.input-item ion-input::placeholder {
  color: #9ca3af !important;
}
</style>