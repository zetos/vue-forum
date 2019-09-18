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
    updates[`threads/${post.threadId}/contributors/${post.userId}`] = postId;
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
        commit('appendContributorToThread', {
          parentId: post.threadId,
          childId: post.userId
        });
        commit('appendPostToUser', { parentId: post.userId, childId: postId });
        return Promise.resolve(state.posts[postId]);
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

  createThread({ commit, state }, { text, title, forumId }) {
    return new Promise(resolve => {
      const threadId = firebase
        .database()
        .ref('threads')
        .push().key;

      const postId = firebase
        .database()
        .ref('posts')
        .push().key;

      const userId = state.authId;
      const publishedAt = Math.floor(Date.now() / 1000);

      const thread = {
        title,
        forumId,
        publishedAt,
        userId,
        firstPostId: postId,
        posts: {}
      };
      thread.posts[postId] = postId;

      const post = {
        text,
        publishedAt,
        threadId,
        userId
      };

      const updates = {};
      updates[`threads/${threadId}`] = thread;
      updates[`forums/${forumId}/threads/${threadId}`] = threadId;
      updates[`users/${userId}/threads/${threadId}`] = threadId;

      updates[`posts/${postId}`] = post;
      updates[`users/${userId}/posts/${postId}`] = postId;

      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          // Update thread
          commit('setItem', {
            resource: 'threads',
            id: threadId,
            item: thread
          });
          commit('appendThreadToForum', {
            parentId: forumId,
            childId: threadId
          });
          commit('appendThreadToUser', { parentId: userId, childId: threadId });

          // Update post
          commit('setItem', { resource: 'posts', item: post, id: postId });
          commit('appendPostToThread', {
            parentId: post.threadId,
            childId: postId
          });
          commit('appendPostToUser', {
            parentId: post.userId,
            childId: postId
          });

          resolve(state.threads[threadId]);
        });
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

  registerUserWithEmailAndPassword(
    { dispatch },
    { email, name, username, password, avatar = null }
  ) {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(res => {
        return dispatch('createUser', {
          id: res.user.uid,
          email,
          name,
          username,
          avatar
        });
      })
      .then(() => dispatch('fetchAuthUser'));
  },

  signInWithEmailAndPassword(context, { email, password }) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  },

  signInWithGoogle({ dispatch }) {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase
      .auth()
      .signInWithPopup(provider)
      .then(data => {
        const user = data.user;
        firebase
          .database()
          .ref('users')
          .child(user.uid)
          .once('value', snapshot => {
            if (!snapshot.exists()) {
              return dispatch('createUser', {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                username: user.email,
                avatar: user.photoURL
              }).then(() => dispatch('fetchAuthUser'));
            }
          });
      });
  },

  signOut({ commit }) {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        commit('setAuthId', null);
      });
  },

  createUser({ commit, state }, { id, email, name, username, avatar = null }) {
    return new Promise(resolve => {
      const registeredAt = Math.floor(Date.now() / 1000);
      const usernameLower = username.toLowerCase();
      email = email.toLowerCase();
      const user = {
        email,
        name,
        username,
        avatar,
        registeredAt,
        usernameLower
      };

      firebase
        .database()
        .ref('users')
        .child(id)
        .set(user)
        .then(() => {
          commit('setItem', { resource: 'users', id: id, item: user });
          resolve(state.users[id]);
        });
    });
  },

  updateUser({ commit }, user) {
    commit('setUser', { userId: user['.key'], user });
  },

  initAuthentication({ dispatch, commit, state }) {
    return new Promise(resolve => {
      if (state.unsubscribeAuthObserver) {
        state.unsubscribeAuthObserver();
      }
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        console.log('👣 the user has changed');
        if (user) {
          dispatch('fetchAuthUser').then(dbUser => resolve(dbUser));
        } else {
          resolve(null);
        }
      });
      commit('setUnsubscribeAuthObserver', unsubscribe);
    });
  },

  fetchAuthUser({ dispatch, commit }) {
    const userId = firebase.auth().currentUser.uid;
    return new Promise(resolve => {
      firebase
        .database()
        .ref('users')
        .child(userId)
        .once('value', snapshot => {
          if (snapshot.exists()) {
            return dispatch('fetchUser', { id: userId }).then(user => {
              commit('setAuthId', userId);
              resolve(user);
            });
          } else {
            return resolve(null);
          }
        });
    });
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
