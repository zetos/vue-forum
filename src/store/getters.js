import { countObjectProperties } from '@/utils';

export default {
  authUser() {
    // return state.users[state.authId];
    return {};
  },
  // Dynamic Getter
  userThreadsCount: state => id =>
    countObjectProperties(state.users[id].threads),
  userPostsCount: state => id => countObjectProperties(state.users[id].posts),
  threadRepliesCount: state => id =>
    countObjectProperties(state.threads[id].posts) - 1
};
