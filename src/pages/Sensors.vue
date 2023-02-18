<template>
  <h1>Sensors</h1>
  <div class="flex flex-wrap justify-evenly gap-3">
    <LongPress class="grow sm:grow-0" v-for="sensor in compositeSensors" :key="sensor.mac" @longpress="longPressSensor(sensor)" @click="showGraphs(sensor)">
      <Sensor class="cursor-pointer" :sensor="sensor" :highlight="isLastUpdated(sensor)"/>
      <!-- @click="dialog!.showModal()" -->
    </LongPress>
  </div>
  <!-- https://tympanus.net/codrops/2021/10/06/how-to-implement-and-style-the-dialog-element/-->
  <dialog ref="dialog" class="bg-gray-800 backdrop:backdrop-blur-sm">
    <p>TODO some edit sensor stuff will go here</p>
    <button @click="dialog!.close()">Close</button>
  </dialog>
</template>

<script setup lang="ts">

import { computed, onMounted, onServerPrefetch, Ref, ref, useSSRContext, watch } from 'vue'
import { useHueStore } from '../services/HueStore'
import { useHuebotApiClient } from '../api/HuebotApiClient'
import { CompositeSensor } from '../api/Types'
import { HueCompositeSensor, HueLightSensor, HueMotionSensor, HueTemperatureSensor } from '../api/Sensor';
import Sensor from '../components/Sensor.vue'
import LongPress from '../components/LongPress.vue'
import { useRouter } from 'vue-router';

const router = useRouter()
const api = useHuebotApiClient(import.meta.env.SSR ? 'http://localhost:5173' : '')

const hueStore = useHueStore()
const { event, sensors } = hueStore.state
const lastUpdated = ref('')
const dialog: Ref<HTMLDialogElement | undefined> = ref()

const compositeSensors = computed(() => {
  const assemblies = new Map<string, CompositeSensor>()
  Array.from(sensors.value.values()).forEach(s => {
    if (!assemblies.has(s.mac)) {
      assemblies.set(s.mac, {} as CompositeSensor)
    }
    if (HueMotionSensor.isMotionSensor(s)) {
      assemblies.get(s.mac)!.motionSensor = s
    } else if (HueLightSensor.isLightSensor(s)) {
      assemblies.get(s.mac)!.lightSensor = s
    } else if (HueTemperatureSensor.isTemperatureSensor(s)) {
      assemblies.get(s.mac)!.temperatureSensor = s
    } else {
      throw new Error('unrecognised sensor type')
    }
  })
  return Array.from(assemblies.values()).map((a) => Object.setPrototypeOf(a, HueCompositeSensor.prototype))
})

function isLastUpdated(s: CompositeSensor) {
  return s.motionSensor.id == lastUpdated.value ||
    s.temperatureSensor.id == lastUpdated.value ||
    s.lightSensor.id == lastUpdated.value
}

function longPressSensor(s: CompositeSensor) {
  api.configureSensor(s.motionSensor.id, {on: !s.motionSensor.isOn()})
}

function updateSensor(cs: CompositeSensor) {
  for (const sensor of [cs.motionSensor, cs.temperatureSensor, cs.lightSensor]) {
    api.getSensor(sensor.id).then((s) => {
      lastUpdated.value = s.id
      hueStore.setSensor(s)
    })
  }
}

function showGraphs(cs: CompositeSensor) {
  router.push({path: `/sensors/${cs.motionSensor.id}/graphs`})
}

watch(event, async (newEvent) => {
  handleEvent(newEvent)
})

async function handleEvent(event: any) {
  for (const d of event.data) {
    const id: string = d.id_v1
    // TODO use d.type here, look for 'temperature', 'light_level', 'motion', 'device_power', 'zigbee_connectivity'
    if (id && id.startsWith('/sensors/')) {
      const sensor = await api.getSensor(id)
      lastUpdated.value = sensor.id
      hueStore.setSensor(sensor)
    }
  }
}

onMounted(async () => {
  if (compositeSensors.value.length == 0) {
    hueStore.sensors = await api.getSensors()
  }
  if (event.value) {
    handleEvent(event.value)
  }
})

onServerPrefetch(async() => {
  const ctx = useSSRContext()
  const ssrData = await import('../util/SSRData')
  hueStore.sensors = await api.getSensors()
  hueStore.saveState(ssrData.getInitialData(ctx!))
})

</script>