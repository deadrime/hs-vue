<template>
  <div id="app">
      <hs></hs>
      <!--<vueTable></vueTable>-->
  </div>
</template>

<script>
import vueTable from './components/table.vue'
import hs from './components/hs.vue'

export default {
  name: 'app',
  components: {
      vueTable,
      hs
  }
}
</script>
