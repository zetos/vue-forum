import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';

//modules
import auth from './modules/auth';
import categories from './modules/categories';
import forums from './modules/forums';
import posts from './modules/posts';
import threads from './modules/threads';
import users from './modules/users';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  getters,
  mutations,
  actions,
  modules: {
    auth,
    categories,
    forums,
    posts,
    threads,
    users
  }
});
