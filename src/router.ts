import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import About from './views/About.vue';
import DevLog from './views/DevLog.vue';

// forum
import Forum from './views/forum/Forum.vue';
import Board from './views/forum/Board.vue';
import Post from './views/forum/Post.vue';

// submit
import submitPost from './views/submit/Post.vue';

// auth
import LogIn from './views/LogIn.vue';
import LogOut from './views/LogOut.vue';

// world
import World from './views/World/Main.vue';
import CombatHub from './views/World/Combat/Hub.vue';
import CombatRoom from './views/World/Combat/Room.vue';

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
    {
      path: '/board/:board_id',
      name: 'board',
      component: Board,
    },
    {
      path: '/post/:post_id',
      name: 'post',
      component: Post,
    },
    {
      path: '/submit/post/:board_id',
      name: 'submitPost',
      component: submitPost,
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
    {
      path: '/world',
      name: 'world',
      component: World,
    },
    {
      path: '/combat',
      name: 'combat',
      component: CombatHub,
    },
    {
      path: '/combat/:roomID',
      name: 'combatRoom',
      component: CombatRoom,
    },
    // 404
    { path: "*", redirect: '/' },
  ],
});
