import Vue from 'vue';

// High Order Mutation
export const appendChildToParent = ({ child }) => (
  state,
  { childId, parentId }
) => {
  const resource = state.items[parentId];
  if (!resource[child]) {
    Vue.set(resource, child, {});
  }
  Vue.set(resource[child], childId, childId);
};
