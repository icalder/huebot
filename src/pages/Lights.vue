<template>
  <h1>Lights</h1>
  <ul>
    <li v-for="light in lights" :key="light.id">[{{ light.id }}] {{ light.name }}</li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, onServerPrefetch, useSSRContext } from 'vue'
import { useHueStore } from '../services/HueStore'
import { useHuebotApiClient } from '../api/HuebotApiClient'

const api = useHuebotApiClient(import.meta.env.SSR ? 'http://localhost:5173' : '')

const hueStore = useHueStore()
const { lights } = hueStore.state

onMounted(async() => {
  if (lights.value.length == 0) {
    hueStore.lights = await api.getLights()
  }
})

// https://vitedge.js.org/conditional-rendering.html#static-imports-vite-plugin

// https://dev.to/fyapy/making-nuxtjs-clone-with-vue-3-and-vite-vue-server-side-rendering-8e5

onServerPrefetch(async() => {
  console.log('Lights onServerPrefetch')
  const ctx = useSSRContext()
  const ssrData = await import('../util/SSRData')
  hueStore.lights = await api.getLights()
  hueStore.saveState(ssrData.getInitialData(ctx!))
})

</script>