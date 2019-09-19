import Vue from 'vue';

// High Order Mutation
export const appendChildToParent = ({ parent, child }) => (
  state,
  { childId, parentId }
) => {
  const resource = state[parent][parentId];
  if (!resource[child]) {
    Vue.set(resource, child, {});
  }
  Vue.set(resource[child], childId, childId);
};
