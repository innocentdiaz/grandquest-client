import Vue from 'vue';
import Vuex from 'vuex';
import { State } from './types';

Vue.use(Vuex);

const state: State = {
  user: {
    id: null,
    username: '',
    loading: true,
    authenticated: false,
  },
};

export default new Vuex.Store({
  state,
});
