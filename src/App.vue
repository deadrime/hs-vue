<template>
  <div id="app">
    <Hs class="main" />
    <footer class="footer">
      <span class="copyright">
        Created by 
        <a class="copyright__link" href="https://github.com/deadrime">@deadrime</a>
      </span>
    </footer>
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
.footer {
  padding-top: 1rem;
}

.main {
  flex: 1;
}

.copyright {
  opacity: .5;
}
.copyright__link {
  color: #123
}

body, html {
  margin: 0
}

#app {
  min-height: 100vh;
  padding: .5rem 40px;
  display: flex;
  flex-direction: column;
  font-family: 'Exo 2', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
