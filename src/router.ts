import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import About from './views/About.vue';
import DevLog from './views/DevLog.vue';

// auth
import LogIn from './views/LogIn.vue';
import LogOut from './views/LogOut.vue';

// world
import World from '@/views/World.vue';
import Combat from '@/views/Combat.vue';
import Map from '@/views/Map.vue';

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
      path: '/login',
      name: 'login',
      component: LogIn,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogOut,
    },
    { path: '/world', redirect: '/world/travel' },
    {
      path: '/world/:view?',
      name: 'world',
      component: World,
    },
    {
      path: '/combat/:roomID',
      name: 'combatRoom',
      component: Combat,
    },
    {
      path: '/map',
      name: 'map',
      component: Map,
    },
    // 404
    { path: '*', redirect: '/' },
  ],
});
