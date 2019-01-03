import Vue from 'vue';
import Vuex from 'vuex';
import { State, User, World } from './types';

import api from '@/api';
import { ApiResponse } from 'apisauce';
import moment from 'moment';

Vue.use(Vuex);

const state: State = {
  user: {
    id: null,
    username: '',
    loading: true,
    authenticated: false,
    currentJWT: '',
    created_at: '',
    is_admin: false,
  },
  world: {
    connected: false,
    loading: true,
    timeOfDay: 0,
    readableTimeOfDay: 'pending',
    users: {},
    connections: 0,
  },
};
const getters = {
  userJoinDate: (s: State) => {
    if (!s.user.authenticated) {
      return null;
    } else {
      return moment(s.user.created_at).fromNow();
    }
  },
};
const mutations = {
  setUser(s: State, user: User) {
    s.user = {
      ...s.user, 
      ...user, 
      loading: false, 
      authenticated: true
    }
  },
  setJWT(s: State, jwt: string) {
    s.user.currentJWT = jwt;
  },
  setUserUnauthorized(s: State) {
    s.user.loading = false;
  },
  setWorldConnected(s: State, bool: boolean) {
    s.world.connected = !!bool;
  },
  setWorldLoading(s: State, bool: boolean) {
    s.world.loading = !!bool;
  },
  'SOCKET_WORLD_STATE' (s: State, worldState: World) {
    s.world = { ...s.world, ...worldState };
  }
};
const actions = {
  fetchUser({ commit }, JWT: string) {
    api.setHeader('Authorization', JWT);

    api.get('/auth')
    .then((res: ApiResponse<any>) => {
      if (res.ok) {
        // TODO: switch tokens here
        const user = res.data.payload;
        commit('setUser', user);
        commit('setJWT', JWT);
      } else if (res.status === 401 || res.status === 404) {
        localStorage.removeItem('grandquest:jwt');
        commit('setUserUnauthorized');
      } else {
        commit('setUserUnauthorized');
      }
    });
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
