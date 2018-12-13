import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import DevLog from './views/DevLog.vue';
import Forum from './views/Forum.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/devlog/:id?',
      name: 'devlog',
      component: DevLog,
    },
    {
      path: '/forum',
      name: 'forum',
      component: Forum,
    },
  ],
});
