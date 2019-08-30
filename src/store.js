import Vue from 'vue';
import Vuex from 'vuex';

import sourceDate from '@/data';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ...sourceDate,
    authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3'
  },
  getters: {
    authUser(state) {
      return state.users[state.authId];
    }
  },
  mutations: {
    // mutations args: (objectToAddNewProp, {propertyName, valueOfProperty})
    setPost(state, { postId, post }) {
      Vue.set(state.posts, postId, post);
    },
    setUser(state, { userId, user }) {
      Vue.set(state.users, userId, user);
    },
    appendPostToThread(state, { postId, threadId }) {
      const thread = state.threads[threadId];
      Vue.set(thread.posts, postId, postId);
    },
    appendPostToUser(state, { postId, userId }) {
      const user = state.users[userId];
      Vue.set(user.posts, postId, postId);
    }
  },
  actions: {
    createPost(context, post) {
      const postId = 'greatPost' + Math.random();
      post['.key'] = postId;

      context.commit('setPost', { post, postId });
      context.commit('appendPostToThread', { threadId: post.threadId, postId });
      context.commit('appendPostToUser', { userId: post.userId, postId });
    },
    updateUser({ commit }, user) {
      commit('setUser', { userId: user['.key'], user });
    }
  }
});
