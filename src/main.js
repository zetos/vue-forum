import Vue from 'vue';
import firebase from 'firebase';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import firebaseConfig from '../firebaseConfig';

// Components
import AppDate from '@/components/AppDate';

Vue.config.productionTip = false;
Vue.component('AppDate', AppDate);

// console.log('fire config:', firebaseConfig);
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
