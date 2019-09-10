import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';

import { countObjectProperties } from '@/utils';

Vue.use(Vuex);

// High Order Mutation
const appendChildToParent = ({ parent, child }) => (
  state,
  { childId, parentId }
) => {
  const resource = state[parent][parentId];
  if (!resource[child]) {
    Vue.set(resource, child, {});
  }
  Vue.set(resource[child], childId, childId);
};

export default new Vuex.Store({
  state: {
    categories: {},
    forums: {},
    threads: {},
    posts: {},
    users: {},
    authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3'
  },
  getters: {
    authUser(state) {
      // return state.users[state.authId];
      return {};
    },
    // Dynamic Getter
    userThreadsCount: state => id =>
      countObjectProperties(state.users[id].threads),
    userPostsCount: state => id => countObjectProperties(state.users[id].posts),
    threadRepliesCount: state => id =>
      countObjectProperties(state.threads[id].posts) - 1
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
    setItem(state, { item, id, resource }) {
      item['.key'] = id;
      Vue.set(state[resource], id, item);
    },
    appendPostToThread: appendChildToParent({
      parent: 'threads',
      child: 'posts'
    }),
    appendPostToUser: appendChildToParent({
      parent: 'users',
      child: 'posts'
    }),
    appendThreadToForum: appendChildToParent({
      parent: 'forums',
      child: 'threads'
    }),
    appendThreadToUser: appendChildToParent({
      parent: 'users',
      child: 'threads'
    })
  },
  actions: {
    createPost({ commit, state }, post) {
      const postId = 'greatPost' + Math.random();
      post['.key'] = postId;
      post.userId = state.authId;
      post.publishedAt = Math.floor(Date.now() / 1000);

      commit('setPost', { post, postId });
      commit('appendPostToThread', {
        parentId: post.threadId,
        childId: postId
      });
      commit('appendPostToUser', { parentId: post.userId, childId: postId });
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
        commit('appendThreadToForum', { parentId: forumId, childId: threadId });
        commit('appendThreadToUser', { parentId: userId, childId: threadId });

        dispatch('createPost', { text, threadId }).then(post => {
          commit('setThread', {
            threadId,
            thread: { ...thread, firstPostId: post['.key'] }
          });
        });
        resolve(state.threads[threadId]);
      });
    },
    updateThread({ state, commit, dispatch }, { title, text, id }) {
      return new Promise(resolve => {
        const thread = state.threads[id];
        const newThread = { ...thread, title };

        commit('setThread', { threadId: id, thread: newThread });
        dispatch('updatePost', { id: thread.firstPostId, text }).then(() => {
          resolve(newThread);
        });
      });
    },
    updatePost({ state, commit }, { id, text }) {
      return new Promise(resolve => {
        const post = state.posts[id];
        commit('setPost', {
          postId: id,
          post: {
            ...post,
            text,
            edited: {
              at: Math.floor(Date.now() / 1000),
              by: state.authId
            }
          }
        });
        resolve(post);
      });
    },
    updateUser({ commit }, user) {
      commit('setUser', { userId: user['.key'], user });
    },

    fetchThreads({ dispatch }, { ids }) {
      return dispatch('fetchItems', { resource: 'threads', ids, emoji: '📃s' });
    },

    fetchThread({ dispatch }, { id }) {
      return dispatch('fetchItem', { resource: 'threads', id, emoji: '📃' });
    },

    fetchUser({ dispatch }, { id }) {
      return dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' });
    },

    fetchPosts({ dispatch }, { ids }) {
      return dispatch('fetchItems', { resource: 'posts', ids, emoji: '🌧' });
    },

    fetchPost({ dispatch }, { id }) {
      return dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' });
    },

    fetchForums({ dispatch }, { ids }) {
      return dispatch('fetchItems', { resource: 'forums', ids, emoji: '🐕' });
    },

    fetchForum({ dispatch }, { id }) {
      return dispatch('fetchItem', { resource: 'forums', id, emoji: '🐶' });
    },

    fetchCategory({ dispatch }, { id }) {
      return dispatch('fetchItem', {
        resource: 'categories',
        id,
        emoji: '🐱'
      });
    },

    fetchAllCategories({ state, commit }) {
      console.log('🔥', '🐈', 'all');
      return new Promise(resolve => {
        firebase
          .database()
          .ref('categories')
          .once('value', snapshot => {
            const categoriesObj = snapshot.val();
            Object.keys(categoriesObj).forEach(categoryId => {
              const category = categoriesObj[categoryId];
              commit('setItem', {
                resource: 'categories',
                id: categoryId,
                item: category
              });
            });
            resolve(Object.values(state.categories));
          });
      });
    },

    fetchItem({ state, commit }, { id, emoji, resource }) {
      console.log('🔥', emoji, id);
      return new Promise(resolve => {
        firebase
          .database()
          .ref(resource)
          .child(id)
          .once('value', snapshot => {
            commit('setItem', {
              resource,
              id: snapshot.key,
              item: snapshot.val()
            });
            resolve(state[resource][id]);
          });
      });
    },

    fetchItems({ dispatch }, { ids, emoji, resource }) {
      ids = Array.isArray(ids) ? ids : Object.keys(ids);
      return Promise.all(
        ids.map(id => dispatch('fetchItem', { id, resource, emoji }))
      );
    }
  }
});
