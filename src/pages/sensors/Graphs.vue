<template>
    <h2>{{ sensorName }}</h2>
    <div class="max-w-xl ml-auto mr-auto">
      <Line :data="motionGraphData" :options="motionOptions"/>
      <Line :data="temperatureGraphData" :options="chartOptions"/>
      <Line :data="lightLevelGraphData" :options="chartOptions"/>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onServerPrefetch, ref, Ref, useSSRContext } from 'vue';
import { useHuebotApiClient } from '../../api/HuebotApiClient';
import { TimeStampedData } from '../../services/DataStore'
import { InitialDataKey } from '../../util/InjectionKeys'
import { resample24 } from '../../util/DataProcessing'
import { Scatter, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend)

const props = defineProps<{ id: string }>()
const motionSamples: Ref<TimeStampedData<boolean>[]> = ref([])
const lightLevelSamples: Ref<TimeStampedData<number>[]> = ref([])
const temperatureSamples: Ref<TimeStampedData<number>[]> = ref([])

const STATE_KEY = `__graphs_state_${props.id}`

const api = useHuebotApiClient(import.meta.env.SSR ? 'http://localhost:5173' : '')

const sensorName = ref('')
const motionSensorId = parseInt(props.id)
const lightLevelSensorId = motionSensorId + 1
const temperatureSensorId = motionSensorId + 2
const start = new Date()
start.setDate(start.getDate() - 1)

if (!import.meta.env.SSR) {
  const initialData = inject(InitialDataKey)
  if (initialData && STATE_KEY in initialData) {
    motionSamples.value = initialData[STATE_KEY].motions.map((s: any) => ({ts: new Date(s.ts), value: s.value }))
    lightLevelSamples.value = initialData[STATE_KEY].lightLevels.map((s: any) => ({ts: new Date(s.ts), value: s.value }))
    temperatureSamples.value = initialData[STATE_KEY].temperatures.map((s: any) => ({ts: new Date(s.ts), value: s.value }))
  }
}

onMounted(() => {
  if (sensorName.value == '') {
    api.getSensor(props.id)
      .then(s => sensorName.value = s.name)
      .catch(e => console.log(e))
  }
  if (motionSamples.value.length == 0) {
    api.getMotions(motionSensorId.toString())
      .then(samples => motionSamples.value = samples)
      .catch(e => console.log(e))
  }
  if (lightLevelSamples.value.length == 0) {
    api.getLightLevels(lightLevelSensorId.toString())
      .then(samples => lightLevelSamples.value = samples)
      .catch(e => console.log(e))
  }
  if (temperatureSamples.value.length == 0) {
    api.getTemperatures(temperatureSensorId.toString())
      .then(samples => temperatureSamples.value = samples)
      .catch(e => console.log(e))
  }
})

onServerPrefetch(async() => {
  const ctx = useSSRContext()
  const dsm = await import('../../services/PostgresDataStore')
  const ds = dsm.useDataStore()
  const end = new Date()
  const [s, mdata, ldata, tdata] = await Promise.all([
    api.getSensor(props.id), 
    ds.getMotionData(motionSensorId.toString(), start, end),
    ds.getLightLevelData(lightLevelSensorId.toString(), start, end),
    ds.getTemperatureData(temperatureSensorId.toString(), start, end)
  ])
  sensorName.value = s.name
  motionSamples.value = mdata
  lightLevelSamples.value = ldata
  temperatureSamples.value = tdata
  const ssrData = await import('../../util/SSRData')
  ssrData.getInitialData(ctx!)[STATE_KEY] = {
    motions: motionSamples.value,
    lightLevels: lightLevelSamples.value,
    temperatures: temperatureSamples.value
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
        display: true,
        position: 'right'
      }
  }
}

const motionOptions = {
  ...chartOptions,
  scales: {
    y: {
      min: 0,
      max: 1,
      position: 'right'
    }
  }
}

const motionGraphData = computed(() => {
  const rs = resample24(start, motionSamples.value, (i) => i ? 1 : 0)
  return {
    labels: rs.map(r => r.x),
    datasets: [
      { 
        label: 'Motion',
        backgroundColor: '#79f879',
        borderColor: '#79f879',
        showLine: false,
        data: rs.map(r => r.y)
      }
    ]
  }
})

const lightLevelGraphData = computed(() => {
  const rs = resample24(start, lightLevelSamples.value, (i) => i, true)
  return {
    labels: rs.map(r => r.x),
    datasets: [
      { 
        label: 'Light level',
        backgroundColor: '#7979f8',
        borderColor: '#7979f8',
        data: rs.map(r => r.y)
      }
    ]
  }
})

const temperatureGraphData = computed(() => {
  const rs = resample24(start, temperatureSamples.value, (i) => i, true)
  return {
    labels: rs.map(r => r.x),
    datasets: [
      { 
        label: 'Temperature',
        backgroundColor: '#f87979',
        borderColor: '#f87979',
        data: rs.map(r => r.y)
      }
    ]
  }
})
</script>