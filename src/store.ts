import Vue from 'vue';
import Vuex from 'vuex';
import { State, User } from './types';

import api from '@/api';
import { ApiResponse } from 'apisauce';

Vue.use(Vuex);

const state: State = {
  user: {
    id: null,
    username: '',
    loading: true,
    authenticated: false,
    currentJWT: '',
  },
};
const mutations = {
  setUser(state: State, user: User) {
    state.user = user;
    state.user.loading = false;
    state.user.authenticated = true;
  },
  setJWT(state: State, jwt: string) {
    state.user.currentJWT = jwt;
  },
  setUserUnauthorized(state: State) {
    state.user.loading = false;
  },
};
const actions = {
  fetchUser({ commit }, JWT: string) {
    api.setHeader('Authorization', JWT);

    api.get('/auth')
    .then((res: ApiResponse<any>) => {
      if (res.ok) {
        const user = res.data.payload;
        localStorage.setItem('grandquest:cache_user', JSON.stringify(user));
        commit('setUser', user);
      } else if (res.status == 401) {
        localStorage.removeItem('grandquest:jwt');
        localStorage.removeItem('grandquest:cache_user');
        commit('setUserUnauthorized');
      } else {
        const cachedUser = localStorage.getItem('grandquest:cache_user');
        
        if (cachedUser !== 'undefined') {
          commit('setUser', cachedUser);
        } else {
          commit('setUserUnauthorized');
        }
      }
    });
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
