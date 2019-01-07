// Store
export interface State {
    user: User;
    world: World;
    combatHub: CombatHub;
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
    roomConnection: string|null;
}
export interface World {
    connected:         boolean;
    loading:           boolean;
    timeOfDay:         number;
    readableTimeOfDay: string;
    users: { [id: string]: User },
    connections:       number;
}
export interface CombatHub {
    connected:  boolean;
    loading:    boolean;
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