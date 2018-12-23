import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import DevLog from './views/DevLog.vue';
import Forum from './views/forum/Forum.vue';
import Board from './views/forum/Board.vue';
import Post from './views/forum/Post.vue';
import LogIn from './views/LogIn.vue';

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
      path: '/forum/:forum/:board_id',
      name: 'board',
      component: Board,
    },
    {
      path: '/forum/:forum/:board_id/:post_id',
      name: 'post',
      component: Post,
    },
    {
      path: '/login',
      name: 'login',
      component: LogIn,
    },
  ],
});
