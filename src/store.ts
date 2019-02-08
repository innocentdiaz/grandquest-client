import Vue from 'vue';
import Vuex from 'vuex';
import {
  State,
  ActionContext,
  Player,
  World,
  CombatHub,
  CombatRoom,
} from './types';

import io from 'socket.io-client';
import api from '@/api';
import moment from 'moment';

Vue.use(Vuex);

const initialState = {
  headerVisibility: true,
  player: {
    id: null,
    username: '',
    gold: 0,
    role: '',
    authenticated: false,
    currentJWT: '',
    created_at: '',
    token: null,
    is_admin: false,
    weapon_health: 0,
    weapon_id: '',
  },
  world: {
    timeOfDay: 0,
    connections: 0,
    inCombat: 0,
  },
  combatHub: {
    rooms: {},
  },
  combatGame: {
    gameState: {
      id: '',
      title: '',
      playerCount: 0,
      maxPlayers: 4,
      players: {},
      enemies: {},
      turn: -1,
      level: 0,
      turnEvents: {},
      playState: 1,
      readyToContinue: {},
      levelRecord: {},
    },
    selectionMode: 'TARGET',
  },
  socket: {
    connected: false,
    loading: false,
    room: null,
  }
};

const state: State = {...initialState};

const getters = {
  playerJoinDate: (s: State) => {
    if (!s.player.authenticated) {
      return null;
    } else {
      return moment(s.player.created_at).fromNow();
    }
  },
};
const mutations = {
  SET_HEADER_VISIBILITY(s: State, b: boolean) {
    s.headerVisibility = b;
  },
  /*
    Socket events
  */
  SET_SOCKET_CONNECTION (s: State, state: boolean) {
    s.socket.loading = false;
    s.socket.connected = state;
  },
  SET_SOCKET_LOADING (s: State) {
    s.socket.loading = true;
  },
  SET_INITIAL_STATES(s: State) {
    s.world = initialState.world;
    s.combatGame = initialState.combatGame;
    s.combatHub = initialState.combatHub;
  },
  UPDATE_SOCKET_PLAYER (s: State, player: Player) {
    s.player = { ...s.player, ...player };
  },
  SET_SOCKET_ROOM (s: State, room: any) {
    s.socket.room = room;
  },
  SET_WORLD_STATE (s: State, worldState: World) {
    s.world = { ...s.world, ...worldState };
  },
  SET_COMBAT_HUB_STATE (s: State, combatHubState: CombatHub) {
    s.combatHub = { ...s.combatHub, ...combatHubState };
  },
  RESET_GAME_STATE(s: State, name: string) {
    switch(name) {
      case 'COMBAT_ROOM':
        s.combatGame = { ...initialState.combatGame };
        break;
      default:
        return;
    }
  },
  SET_COMBAT_GAME_STATE (s: State, combatRoomState: CombatRoom) {
    s.combatGame.gameState = { ...s.combatGame.gameState, ...combatRoomState };
  },
  SET_COMBAT_GAME_SELECTION_MODE(s: State, selectionMode: string) {
    s.combatGame.selectionMode = selectionMode;
  }
};

let socket = io(`${api.getBaseURL()}/game`, { autoConnect: false });

const actions = {
  OPEN_SOCKET({ commit, dispatch }: ActionContext) {
    socket.open();
    /*
      Socket events
    */
    socket.on('connect', () => {
      commit('SET_SOCKET_CONNECTION', true);
      commit('SET_INITIAL_STATES');
      dispatch('INIT_SOCKET');
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
    socket.on('PLAYER_STATE', (player: Player) => {
      commit('UPDATE_SOCKET_PLAYER', player);
    });
    socket.on('COMBAT_ROOM_STATE', (combatRoomState: CombatRoom) => {
      commit('SET_COMBAT_GAME_STATE', combatRoomState);
    });
  },
  INIT_SOCKET({ state, dispatch, commit }: ActionContext) {
    /*
      Authenticate socket
    */
    const JWT = localStorage.getItem('grandquest:jwt');
    console.log(JWT);
    if (JWT) {
      socket.emit('AUTHENTICATE_SOCKET', JWT, (err: any) => {
        if (!err) {
          commit('UPDATE_SOCKET_PLAYER', { authenticated: true, token: JWT });
          // join disconnected rooms IF they exist
          if (state.socket.room) {
            console.log('vuex > initializeSocket > "joining disconnected rooms"');
            dispatch('socketJoinRoom', state.socket.room);
          }
        } else {
          console.log(`vuex > initializeSocket > "socket auth error = '${err}'"`);
          localStorage.removeItem('grandquest:jwt');
        }
      });
    };
  },
  SOCKET_EMIT(ac: any, info: { name: string, params: object|undefined }) {
    const params = Array.isArray(info.params) ? info.params : [];

    socket.emit(info.name, ...params);
  },
  socketJoinRoom({ commit }: ActionContext, room: { name: string, parameter: any }) {
    if (!socket.connected) console.warn('Attempted to join room before socket connected');
    const { name, parameter } = room;
    console.log(`vuex > socketJoinRoom > "attempting to join room '${name}'..."`);

    const event = `${name.toUpperCase()}_CONNECT`;
    const cb = (err: any) => {
      if   (err) console.log(`vuex > socketJoinRoom > "room '${room.name}' join error = ${err} "`);
      else commit(`SET_SOCKET_ROOM`, room);
    }

    // if we have a parameter
    if (typeof parameter !== 'undefined') {
      socket.emit(event, parameter, cb);
    } else {
      socket.emit(event, cb);
    }
  },
  socketLeaveRoom({ commit }: ActionContext, room: string) {
    if (!socket.connected) console.warn('vuex > socketLeaveRoom > "Attempted to leave room before socket connected"');

    socket.emit(`${room.toUpperCase()}_LEAVE`);
    commit(`SET_SOCKET_ROOM`, null);
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
