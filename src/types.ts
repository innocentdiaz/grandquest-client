// Store
export interface State {
    user: User;
    world: World;
    combatHub: CombatHub;
    socket: SocketState;
}

// Models
export interface User {
    id:             number|null;
    username:       string;
    loading:        boolean;
    authenticated:  boolean;
    currentJWT:     string;
    created_at:     string;
    is_admin:       boolean;
}
export interface World {
    // connected:         boolean;
    // loading:           boolean;
    timeOfDay:         number;
    readableTimeOfDay: string;
    users: { [id: string]: User },
    connections:       number;
}
export interface CombatHub {
    rooms: {
        [id: string]: CombatRoom,
    }
}
export interface CombatRoom {
    id:          string;
    title:       string;
    playerCount: number;
    maxPlayers:  number;
}
export interface SocketState {
    connected:  boolean;
    loading:    boolean;
    room:       string|null;
}