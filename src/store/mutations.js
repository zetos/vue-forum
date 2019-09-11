import Vue from 'vue';

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

export default {
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
  appendContributorToThread: appendChildToParent({
    parent: 'threads',
    child: 'contributors'
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
};
