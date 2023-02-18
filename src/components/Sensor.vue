<template>
  <div class= "mb-3 p-2 bg-gra" :class="borderClasses">
    <h2 :class="motionClass">{{ sensor.shortName }}&nbsp;<span class="text-sm">{{ sensor.motionSensor.id }}</span></h2>
    <h3>Motion: {{ sensor.motionSensor.lastUpdated.toLocaleString() }}</h3>
    <h3>Temp: <span :class="temperatureClass">{{ formatTemperature(sensor) }} @ {{ sensor.temperatureSensor.lastUpdated.toLocaleTimeString() }}</span>
      <span v-if="temperatureIncreasing === true">&uarr;</span>
      <span v-if="temperatureIncreasing === false">&darr;</span>
    </h3>
    <h3>Light: <span :class="lightClass">{{ sensor.lightSensor.lightLevel }}</span>
      <span v-if="lightIncreasing === true">&uarr;</span>
      <span v-if="lightIncreasing === false">&darr;</span>
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watch } from 'vue';
import { HueCompositeSensor } from '../api/Sensor';
import { CompositeSensor } from '../api/Types'

const temperatureIncreasing: Ref<boolean|undefined> = ref(undefined)
const lightIncreasing: Ref<boolean|undefined> = ref(undefined)

const props = defineProps<{
  highlight?: boolean,
  sensor: HueCompositeSensor
}>()

const borderClasses = computed(() => ({
  'border-2': props.sensor.motionSensor.isOn() && props.sensor.isOutdoor(),
  'border-double': props.sensor.motionSensor.isOn() && props.sensor.isIndoor(),
  'border-8': props.sensor.motionSensor.isOn() && props.sensor.isIndoor(),
  'outline-dashed': !props.sensor.motionSensor.isOn()
}))

const motionClass = computed(() => ({
  'bg-amber-900': !props.sensor.motionSensor.presence,
  'bg-green-900': props.sensor.motionSensor.presence,
  'bg-gray-700': !props.sensor.motionSensor.isOn()
}))

const temperatureClass = computed(() => ({
  'text-rose-500': props.highlight &&
    props.sensor.temperatureSensor.lastUpdated > props.sensor.motionSensor.lastUpdated &&
    props.sensor.temperatureSensor.lastUpdated > props.sensor.lightSensor.lastUpdated
}))

const lightClass = computed(() => ({
  'text-rose-500': props.highlight &&
    props.sensor.lightSensor.lastUpdated > props.sensor.motionSensor.lastUpdated &&
    props.sensor.lightSensor.lastUpdated > props.sensor.temperatureSensor.lastUpdated
}))

function formatTemperature(s: CompositeSensor) {
  return (s.temperatureSensor.temperature / 100).toFixed(2)
}

watch(() => props.sensor, (newValue, oldValue) => {
  if (newValue.temperatureSensor.temperature == oldValue.temperatureSensor.temperature) {
    temperatureIncreasing.value = undefined
  } else {
    temperatureIncreasing.value = newValue.temperatureSensor.temperature > oldValue.temperatureSensor.temperature
  }

  if (newValue.lightSensor.lightLevel == oldValue.lightSensor.lightLevel) {
    lightIncreasing.value = undefined
  } else {
    lightIncreasing.value = newValue.lightSensor.lightLevel > oldValue.lightSensor.lightLevel
  }

})

</script>