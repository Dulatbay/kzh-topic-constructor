import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    roles: 'USER' | 'ADMIN';
    exp: number;
}

interface AuthState {
    token: string | null;
    role: 'USER' | 'ADMIN' | null;
}

const getTokenFromStorage = () => localStorage.getItem('accessToken');

const getRoleFromToken = (token: string | null): 'USER' | 'ADMIN' | null => {
    if (!token) return null;
    try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.roles || null;
    } catch (error) {
        console.error('Ошибка декодирования токена:', error);
        return null;
    }
};

const initialState: AuthState = {
    token: getTokenFromStorage(),
    role: getRoleFromToken(getTokenFromStorage()),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string }>) => {
            state.token = action.payload.token;
            state.role = getRoleFromToken(action.payload.token);
            localStorage.setItem('accessToken', action.payload.token);
        },
        logout: (state) => {
            state.token = null;
            state.role = null;
            localStorage.removeItem('accessToken');
        },
    },
});

export const {setCredentials, logout} = authSlice.actions;
export default authSlice.reducer;
