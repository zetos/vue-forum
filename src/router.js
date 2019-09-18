import Vue from 'vue';
import Router from 'vue-router';
import ViewHome from '@/views/ViewHome.vue';
import store from '@/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'ViewHome',
      component: ViewHome
    },
    {
      path: '/about',
      name: 'ViewAbout',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ './views/ViewAbout.vue')
    },
    {
      path: '/category/:id',
      name: 'ViewCategory',
      props: true,
      component: () => import('./views/ViewCategory.vue')
    },
    {
      path: '/forum/:id',
      name: 'ViewForum',
      props: true,
      component: () => import('@/views/ViewForum.vue')
    },
    {
      path: '/thread/create/:forumId',
      name: 'ViewThreadCreate',
      props: true,
      meta: { requiresAuth: true },
      component: () => import('@/views/ViewThreadCreate.vue')
    },
    {
      path: '/thread/:id',
      name: 'ViewThreadRead',
      props: true,
      component: () => import('@/views/ViewThreadRead.vue')
    },
    {
      path: '/thread/:id/edit',
      name: 'ViewThreadEdit',
      props: true,
      meta: { requiresAuth: true },
      component: () => import('@/views/ViewThreadEdit.vue')
    },
    {
      path: '/me',
      name: 'ViewProfile',
      props: true,
      meta: { requiresAuth: true },
      component: () => import('@/views/ViewProfile.vue')
    },
    {
      path: '/me/edit',
      name: 'ProfileEdit',
      props: { edit: true },
      meta: { requiresAuth: true },
      component: () => import('@/views/ViewProfile.vue')
    },
    {
      path: '/register',
      name: 'Register',
      meta: { requiresGuest: true },
      component: () => import('@/views/ViewRegister.vue')
    },
    {
      path: '/signin',
      name: 'SignIn',
      meta: { requiresGuest: true },
      component: () => import('@/views/ViewSignIn.vue')
    },
    {
      path: '/logout',
      name: 'SignOut',
      meta: { requiresAuth: true },
      beforeEnter(to, from, next) {
        store.dispatch('signOut').then(() => next({ name: 'ViewHome' }));
      }
    },
    {
      path: '*',
      name: 'ViewNotFound',
      // redirect: { name: 'ViewHome' }
      component: () => import('@/views/ViewNotFound.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  console.log(`🚦 navigating to ${to.name} from ${from.name}`);
  // add check of 'requiresAuth' to nested routes
  store.dispatch('initAuthentication').then(user => {
    if (to.matched.some(route => route.meta.requiresAuth)) {
      if (user) {
        next();
      } else {
        next({ name: 'SignIn' });
      }
    } else if (to.matched.some(route => route.meta.requiresGuest)) {
      if (!user) {
        next();
      } else {
        next({ name: 'ViewHome' });
      }
    } else {
      next();
    }
  });
});

export default router;
