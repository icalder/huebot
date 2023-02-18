<template>
  <Nav class="mt-2" />
  <section>
    <router-view/>
  </section>
  <footer>
    <hr />
    Copyright (C) 2022. All rights reserved.
  </footer>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
import Nav from "./components/Nav.vue"
</script>


<style scoped>
</style>
