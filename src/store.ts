import Vue from 'vue';
import Vuex from 'vuex';
import { State, User, World, CombatHub } from './types';

import io from 'socket.io-client';
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
    roomConnection: null,
  },
  world: {
    connected: false,
    loading: true,
    timeOfDay: 0,
    readableTimeOfDay: 'pending',
    users: {},
    connections: 0,
  },
  combatHub: {
    connected: false,
    loading: true,
    rooms: {},
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
  setUserUnauthorized(s: State) {
    s.user.loading = false;
  },
  setWorldConnected(s: State, bool: boolean) {
    s.world.connected = !!bool;
  },
  setWorldLoading(s: State, bool: boolean) {
    s.world.loading = !!bool;
  },
  /*
    Socket events
  */
  // Successful connection
  SET_SOCKET_CONNECTION (s: State, state: boolean) {
    s.world.loading = false;
    s.world.connected = state;
    // TODO: authenticate socket here
    console.log('Socket connected')
  },
  SET_SOCKET_LOADING (s: State) {
    s.world.loading = true;
  },
  SET_WORLD_STATE (s: State, worldState: World) {
    s.world = { ...s.world, ...worldState };
  },
  SET_COMBAT_HUB_STATE (s: State, combatHubState: CombatHub) {
    s.combatHub = { ...s.combatHub, ...combatHubState };
  },
};

let socket = io(`${api.getBaseURL()}/game`, { autoConnect: false });

const actions = {
  fetchUser({ commit }, JWT: string) {
    api.setHeader('Authorization', JWT);

    api.get('/auth')
    .then((res: ApiResponse<any>) => {
      if (res.ok) {
        // TODO: switch tokens here
        const user = res.data.payload;
        commit('setUser', {...user, currentJWT: JWT});
      } else if (res.status === 401 || res.status === 404) {
        localStorage.removeItem('grandquest:jwt');
        commit('setUserUnauthorized');
      } else {
        commit('setUserUnauthorized');
      }
    });
  },
  initializeSocket({ state, commit }) {
    socket.open();

    /*
      Authenticate connection
    */
    if (state.user.authenticated) {
      console.log('attempting authentication of user');
      socket.emit('AUTHENTICATE_SOCKET', state.user.currentJWT);
    }

    /* TODO: connect to rooms that we could have been connected to */
    // user.connectedRooms.forEach(roomName => socket.emit('JOIN_ROOM', roomName))
    
    /*
      Bind socket events
    */
    socket.on('connect', () => {
      commit('SET_SOCKET_CONNECTION', true);
      // authenticate
      // reconnect to rooms
    });
    socket.on('disconnect', () => {
      commit('SET_SOCKET_CONNECTION', false);
    });
    socket.on('connect_error', () => {
      commit('SET_SOCKET_CONNECTION', true);
    });
    socket.on('reconnect_attempt', () => {
      commit('SET_SOCKET_LOADING');
      console.log('Socket attempting reconnection');
    });
    socket.on('reconnect_error', () => {
      console.log('Socket reconnection Fail');
      // TODO: Limit amount of reconnection attempts
      /* world.reconnectionFails++; IF reconFails > n THEN socket.close() and world.connected = false */
    });

    // Events
    socket.on('WORLD_STATE', (worldState: World) => {
      commit('SET_WORLD_STATE', worldState);
    });
    socket.on('COMBAT_HUB_GAME_STATE', (combatHubState: CombatHub) => {
      commit('SET_COMBAT_HUB_GAME_STATE', combatHubState);
    });
    socket.on('COMBAT_HUB_CONNECT', (error: any) => {
      if (error) {
        console.log('Combat hub join error: ', error);
      } else {
        commit('SET_COMBAT_HUB_GAME_STATE', { connected: true });
      }
    });
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});;

