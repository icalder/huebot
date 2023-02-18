<template>
  <nav>
    <ul>
      <li class="inline-block pl-4 pr-4 border-r-4 first:pl-0 last:pr-0 last:border-r-0" v-for="link in links">
        <router-link :to="link.path" :class="{ 'text-blue-300': $route.path == link.path }">{{ link.label }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const links = [
{
  path: '/',
  label: "Lights"
},
{
  path: '/sensors',
  label: "Sensors"
},
{
  path: '/events',
  label: "Events"
},
{
  path: '/about',
  label: "About"
},
{
  path: '/test',
  label: "Test"
}
]
//import { watch } from 'vue';
//import { ref } from 'vue';
//import { toRefs } from 'vue';
//import { useRoute } from 'vue-router';

// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
//const route = useRoute()
//const { path } = toRefs(route)
//const path = ref(route.path)

/*watch(
  () => route.path,
  async p => {
    path.value = p
  }
)*/
</script>