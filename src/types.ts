import { CombatCharacter, CombatEvent } from '@/game/types';

// Store
export interface State {
    headerVisibility: boolean;
    user: User;
    world: World;
    combatHub: CombatHub;
    combatGame: CombatGame;
    socket: SocketState;
}
// Action Context
export interface ActionContext {
    state: State;
    dispatch: any;
    commit: any;
}

// Models
export interface User {
    id: number|null;
    username: string;
    role: string;
    gold: number;
    createdAt: string;
    isAdmin: boolean;
    token: string|null;
    authenticated: boolean;
    level: number;
    xp: number;
    nextLevelXp: number;
    socketLock?: string;
}
export interface World {
    timeOfDay: number;
    connections: number;
    inCombat: number;
}
export interface CombatHub {
    rooms: {
        [id: string]: CombatRoom,
    };
}
export interface CombatRoom {
    id: string;
    title: string;
    playerCount: number;
    maxPlayers: number;
    turn: number;
    level: number;
    playState: number;
    players: {
        [id: string]: CombatCharacter,
    };
    enemies: {
        [id: string]: CombatCharacter,
    };
    queuedEvents: CombatEvent[];
    turnEvents: { // TODO: probably should make an interface for ``
        [turnIndex: string]: [CombatEvent],
    };
    readyToContinue: {
        [userId: string]: boolean;
    };
    levelRecord: {
        [userId: string]: {
            killed: {
                id: { total: number; times: number; reward: number };
            }
            healed: {
                id: { total: number; times: number; reward: number };
            };
            gold: number;
            damageDealt: number;
            damageReceived: number;
        },
    };
}
export interface CombatGame {
    gameState: CombatRoom;
    selectionMode: string;
}
export interface SocketState {
    connected: boolean;
    loading: boolean;
    room: null | {
        name: string;
        id?: string;
    };
}
