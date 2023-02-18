<template>
  <div @touchstart.stop="touchStart()" @touchend.stop="touchEnd()" @mousedown.stop="mouseDown()" @mouseup.stop="mouseUp()" @touchmove.stop="touchMove()" >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">

const emit = defineEmits(['longpress'])
let timer: undefined | number = undefined

function touchStart() {
  timer = window.setTimeout(() => longPress(), 750)
}

function touchEnd() {
  clearTimeout(timer)
}

function mouseDown() {
  timer = window.setTimeout(() => longPress(), 750)
}

function mouseUp() {
  clearTimeout(timer)
}

function touchMove() {
  clearTimeout(timer)
}

function longPress() {
  emit('longpress')
  timer = undefined
}
</script>