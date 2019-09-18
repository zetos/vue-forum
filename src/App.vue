<template>
  <div id="app">
    <TheNavbar />
    <div class="container">
      <router-view :key="$route.path" v-show="showPage" @ready="pageReady" />
      <AppSpinner v-show="!showPage" />
    </div>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar';
import AppSpinner from '@/components/AppSpinner';
import NProgress from 'nprogress';

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
  methods: {
    pageReady() {
      this.showPage = true;
      NProgress.done();
    }
  },
  created() {
    NProgress.configure({
      speed: 200,
      showSpinner: false
    });
    NProgress.start(); // start here and in beforeEach to show on first visit and on refresh

    this.$router.beforeEach((to, from, next) => {
      this.showPage = false;
      NProgress.start();
      next();
    });
  }
};
</script>

<style>
@import 'assets/css/style.css';
@import '~nprogress/nprogress.css';

#nprogress .bar {
  background: #57ad8d;
}

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
