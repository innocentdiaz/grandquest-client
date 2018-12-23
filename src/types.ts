// Store
export interface State {
    user: User;
}

// Models
export interface User {
    id: number|null;
    username: string;
    loading: boolean;
    authenticated: boolean;
    currentJWT: string;
    created_at: string;
}
