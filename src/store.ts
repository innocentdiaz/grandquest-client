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
  },
  world: {
    timeOfDay: 0,
    readableTimeOfDay: 'pending',
    users: {},
    connections: 0,
  },
  combatHub: {
    rooms: {},
  },
  socket: {
    connected: false,
    loading: false,
    room: null,
  }
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
  /*
    Socket events
  */
  // Successful connection
  SET_SOCKET_CONNECTION (s: State, state: boolean) {
    s.socket.loading = false;
    s.socket.connected = state;
    // TODO: authenticate socket here
    console.log('Socket connected')
  },
  SET_SOCKET_LOADING (s: State) {
    s.socket.loading = true;
  },
  SET_SOCKET_ROOM (s: State, roomName: string|null) {
    s.socket.room = roomName;
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
  fetchUser({ commit, dispatch }, JWT: string) {
    api.setHeader('Authorization', JWT);

    api.get('/auth')
    .then((res: ApiResponse<any>) => {
      if (res.ok) {
        // TODO: switch tokens here
        const user = res.data.payload;
        commit('setUser', {...user, currentJWT: JWT});
        dispatch('socketSetUp');

        return true;
      } else if (res.status === 401 || res.status === 404) {
        localStorage.removeItem('grandquest:jwt');
      }
      commit('setUserUnauthorized');
    });
  },
  socketSetUp({ commit, dispatch }) {
    socket.open();
    console.log('Socket set up');
    
    /*
      Socket events
    */
    socket.on('connect', () => {
      commit('SET_SOCKET_CONNECTION', true);

      dispatch('initializeSocket');
    });
    socket.on('disconnect', () => {
      commit('SET_SOCKET_CONNECTION', false);
    });
    socket.on('connect_error', () => {
      commit('SET_SOCKET_CONNECTION', false);
    });
    socket.on('reconnect_attempt', () => {
      commit('SET_SOCKET_LOADING', true);
      console.log('Socket attempting reconnection');
    });
    socket.on('reconnect_error', () => {
      commit('SET_SOCKET_CONNECTION', false);
      console.log('Socket reconnection Fail');
      // TODO: Limit amount of reconnection attempts
      /* world.reconnectionFails++; IF reconFails > n THEN socket.close() and world.connected = false */
    });

    /*
      Server events
    */
    socket.on('WORLD_STATE', (worldState: World) => {
      commit('SET_WORLD_STATE', worldState);
    });
    socket.on('COMBAT_HUB_STATE', (combatHubState: CombatHub) => {
      commit('SET_COMBAT_HUB_STATE', combatHubState);
    });
    socket.on('COMBAT_HUB_CONNECT', (error: any) => {
      if (error) {
        console.log('Combat hub join error: ', error);
      } else {
        commit('SET_COMBAT_HUB_GAME_STATE', { connected: true });
      }
    });
  },
  initializeSocket({ state, dispatch }) {
    console.log('initializeSocket');

    /*
      Authenticate socket
    */
    if (state.user.authenticated) {
      console.log('attempting authentication of socket');

      socket.emit('AUTHENTICATE_SOCKET', state.user.currentJWT, (err) => {
        if (err) {
          return console.log('! socket auth error = ', err);
        } else if (state.socket.room) {
          /*
            Join rooms
          */
          console.log('joining disconnected rooms ');
          dispatch('socketJoinRoom', state.socket.room);
        }
      });
    }
  },
  socketJoinRoom({ commit }, room: string, extraParam?: any) {
    if (!socket.connected) console.warn('Attempted to join room before socket connected');

    const event = `${room.toUpperCase()}_CONNECT`;
    const cb = (err: any) => {
      if (err) console.log(`room "${room}" error = `, err);
      else commit(`SET_SOCKET_ROOM`, room.toUpperCase());
    }

    // if we have a parameter
    if (typeof extraParam !== 'undefined') {
      socket.emit(event, extraParam, cb);
    } else {
      socket.emit(event, cb);
    }
  },
  socketLeaveRoom({ commit }, room: string) {
    if (!socket.connected) console.warn('Attempted to leave room before socket connected');

    socket.emit(`${room.toUpperCase()}_DISCONNECT`);
    commit(`SET_SOCKET_ROOM`, null);
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});;

