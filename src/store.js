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
    setThread(state, { thread, threadId }) {
      Vue.set(state.threads, threadId, thread);
    },
    appendPostToThread(state, { postId, threadId }) {
      const thread = state.threads[threadId];
      if (!thread.posts) {
        Vue.set(thread, 'posts', {});
      }
      Vue.set(thread.posts, postId, postId);
    },
    appendPostToUser(state, { postId, userId }) {
      const user = state.users[userId];
      if (!user.posts) {
        Vue.set(user, 'posts', {});
      }
      Vue.set(user.posts, postId, postId);
    },
    appendThreadToForum(state, { forumId, threadId }) {
      const forum = state.forums[forumId];
      if (!forum.threads) {
        Vue.set(forum, 'threads', {});
      }
      Vue.set(forum.threads, threadId, threadId);
    },
    appendThreadToUser(state, { userId, threadId }) {
      const user = state.users[userId];
      if (!user.threads) {
        Vue.set(user, 'threads', {});
      }
      Vue.set(user.threads, threadId, threadId);
    }
  },
  actions: {
    createPost({ commit, state }, post) {
      const postId = 'greatPost' + Math.random();
      post['.key'] = postId;
      post.userId = state.authId;
      post.publishedAt = Math.floor(Date.now() / 1000);

      commit('setPost', { post, postId });
      commit('appendPostToThread', { threadId: post.threadId, postId });
      commit('appendPostToUser', { userId: post.userId, postId });
      return Promise.resolve(state.posts[postId]);
    },
    createThread({ commit, state, dispatch }, { text, title, forumId }) {
      return new Promise(resolve => {
        const threadId = 'greatThread' + Math.random();
        const userId = state.authId;
        const publishedAt = Math.floor(Date.now() / 1000);

        const thread = {
          '.key': threadId,
          title,
          forumId,
          publishedAt,
          userId
        };

        commit('setThread', { threadId, thread });
        commit('appendThreadToForum', { forumId, threadId });
        commit('appendThreadToUser', { userId, threadId });

        dispatch('createPost', { text, threadId }).then(post => {
          commit('setThread', {
            threadId,
            thread: { ...thread, firstPostId: post['.key'] }
          });
        });
        resolve(state.threads[threadId]);
      });
    },
    updateThread({ state, commit }, { title, text, id }) {
      return new Promise(resolve => {
        const thread = state.threads[id];
        const post = state.posts[thread.firstPostId];

        const newThread = { ...thread, title };
        const newPost = { ...post, text };

        commit('setThread', { threadId: id, thread: newThread });
        commit('setPost', { post: newPost, postId: thread.firstPostId });

        resolve(newThread);
      });
    },
    updatePost({ state, commit }, { id, text }) {
      return new Promise(resolve => {
        const post = state.posts[id];
        commit('setPost', { postId: id, post: { ...post, text } });
        resolve(post);
      });
    },
    updateUser({ commit }, user) {
      commit('setUser', { userId: user['.key'], user });
    }
  }
});
