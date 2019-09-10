import firebase from 'firebase';

export default {
  createPost({ commit, state }, post) {
    const postId = firebase
      .database()
      .ref('posts')
      .push().key;

    post.userId = state.authId;
    post.publishedAt = Math.floor(Date.now() / 1000);

    const updates = {};
    updates[`posts/${postId}`] = post;
    updates[`threads/${post.threadId}/posts/${postId}`] = postId;
    updates[`users/${post.userId}/posts/${postId}`] = postId;

    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        commit('setItem', { resource: 'posts', item: post, id: postId });
        commit('appendPostToThread', {
          parentId: post.threadId,
          childId: postId
        });
        commit('appendPostToUser', { parentId: post.userId, childId: postId });
        return Promise.resolve(state.posts[postId]);
      });
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

  fetchThreads: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'threads', ids, emoji: '📃s' }),

  fetchThread: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'threads', id, emoji: '📃' }),

  fetchUser: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' }),

  fetchPosts: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'posts', ids, emoji: '🌧' }),

  fetchPost: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' }),

  fetchForums: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'forums', ids, emoji: '🐕' }),

  fetchForum: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { resource: 'forums', id, emoji: '🐶' }),

  fetchCategory: ({ dispatch }, { id }) =>
    dispatch('fetchItem', {
      resource: 'categories',
      id,
      emoji: '🐱'
    }),

  fetchCategories: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', {
      resource: 'categories',
      ids,
      emoji: '🐱'
    }),

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
};
