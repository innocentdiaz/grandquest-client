// Store
export interface State {
    user: User;
    world: World;
}

// Models
export interface User {
    id: number|null;
    username: string;
    loading: boolean;
    authenticated: boolean;
    currentJWT: string;
    created_at: string;
    is_admin: boolean;
}
export interface World {
    connected:         boolean;
    loading:           boolean;
    timeOfDay:         number;
    readableTimeOfDay: string;
    connections:       { [socketID: string]: User };
}
