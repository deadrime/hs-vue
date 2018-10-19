<template>
  <div id="app">
    <Hs msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Hs from './components/Hs.vue'

export default {
  name: 'app',
  components: {
    Hs,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
