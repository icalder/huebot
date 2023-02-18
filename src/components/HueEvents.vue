<template>
  <Transition>
    <section v-if="data" class="p-3 font-mono bg-slate-700 text-left">
      <pre>
        {{ data }}
      </pre>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHueStore } from '../services/HueStore';

const hueStore = useHueStore()
const { keepalive, event } = hueStore.state
const data = ref('Waiting for event...')

if (event.value || keepalive.value) {
  data.value = event.value ?? keepalive.value
}

watch(keepalive, (newEvent) => {
  if (newEvent) {
    // Clear then set after a delay to allow fade-in to work
    data.value = ''
    setTimeout(() => data.value = 'ping: ' + newEvent.timestamp.toLocaleTimeString(), 100)
  }
})

watch(event, (newEvent) => {
  if (newEvent) {
    // Clear then set after a delay to allow fade-in to work
    data.value = ''
    setTimeout(() => data.value = JSON.stringify(newEvent, null, 2), 100)
  }
})
  
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>