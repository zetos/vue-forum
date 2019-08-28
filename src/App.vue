<template>
  <div id="app">
    <TheNavbar />
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar';

export default {
  name: 'app',
  components: {
    TheNavbar
  }
};
</script>

<style>
@import 'assets/css/style.css';

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
