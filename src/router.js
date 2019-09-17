import Vue from 'vue';
import Router from 'vue-router';
import ViewHome from '@/views/ViewHome.vue';

Vue.use(Router);

export default new Router({
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
      component: () => import('@/views/ViewThreadEdit.vue')
    },
    {
      path: '/me',
      name: 'ViewProfile',
      props: true,
      component: () => import('@/views/ViewProfile.vue')
    },
    {
      path: '/me/edit',
      name: 'ProfileEdit',
      props: { edit: true },
      component: () => import('@/views/ViewProfile.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/ViewRegister.vue')
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: () => import('@/views/ViewSignIn.vue')
    },
    {
      path: '*',
      name: 'ViewNotFound',
      // redirect: { name: 'ViewHome' }
      component: () => import('@/views/ViewNotFound.vue')
    }
  ]
});
