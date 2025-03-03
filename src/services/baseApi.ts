// store/baseApi.ts
// "Полноценно рабочий" интерцептор для RTK Query на основе fetchBaseQuery
// с автоматической логикой рефреша и обновлением токена. Если что-то пойдёт не так — редиректим на /login.

import { createApi, fetchBaseQuery, BaseQueryApi, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import {logout, setCredentials} from "../redux/authSlice.ts";
import {AuthResponse} from "./auth/types.ts";

// Базовый запрос (RTK Query)
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Обёртка для перехвата 401 и рефреша
const baseQueryWithReauth = async (
    args: FetchArgs | string,
    api: BaseQueryApi,
    extraOptions: Record<string, unknown>
) => {
    // 1) Выполняем обычный запрос
    let result = await baseQuery(args, api, extraOptions);

    // 2) Проверяем код ошибки
    if (result.error && (result.error as FetchBaseQueryError).status === 401) {
        // 2.1) Получаем refreshToken
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            // Если нет refreshToken, просто уходим на /login
            api.dispatch(logout()); // Сброс в Redux (если нужно)
            window.location.href = '/login';
            return result; // Выходим
        }

        // 2.2) Пробуем обновить токен
        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh-token', // Ваш URL для рефреша
                method: 'POST',
                // Обычно body: { refreshToken }, но у вас может быть без тела, проверьте по API
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        // 2.3) Если рефреш сработал — используем новые токены
        if (refreshResult.data && (refreshResult.data as AuthResponse).access_token) {
            const { access_token, refresh_token } = refreshResult.data as AuthResponse;

            // Обновляем localStorage
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);

            // Если используете Redux для хранения токена:
            api.dispatch(setCredentials({ token: access_token }));

            // Повторяем исходный запрос с новым токеном
            result = await baseQuery(args, api, extraOptions);

            // Если снова будет 401, условие может повториться (в зависимости от структуры кода)
        } else {
            // Если рефреш не вернул access_token
            console.warn('Refresh token invalid. Logging out...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            api.dispatch(logout()); // Redux logout
            window.location.href = '/login';
        }
    }

    // 3) Возвращаем результат запроса
    return result;
};

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
});