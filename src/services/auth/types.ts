export interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

export interface AuthRequest {
    emailOrUsername: string;
    password: string;
}