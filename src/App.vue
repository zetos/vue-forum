<template>
  <div id="app">
    <TheNavbar />
    <div class="container">
      <router-view v-show="showPage" @ready="showPage = true" />
      <AppSpinner v-show="!showPage" />
    </div>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar';
import AppSpinner from '@/components/AppSpinner';

export default {
  name: 'app',
  components: {
    TheNavbar,
    AppSpinner
  },
  data() {
    return {
      showPage: false
    };
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.showPage = false;
      next();
    });
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
