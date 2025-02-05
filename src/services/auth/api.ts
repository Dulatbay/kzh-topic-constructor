import {baseApi} from "../baseApi.ts";
import {AuthRequest, AuthResponse} from "./types.ts";

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, AuthRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {useLoginMutation} = authApi;
