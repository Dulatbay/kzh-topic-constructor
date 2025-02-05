import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {setCredentials} from "../redux/authSlice.ts";
import {useLoginMutation} from "../services/auth/api.ts";

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, {isLoading}] = useLoginMutation();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data = await login({emailOrUsername, password}).unwrap();
            dispatch(setCredentials({token: data.access_token}));
            navigate('/modules');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            setError('Неправильный логин или пароль.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-[400px] bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Вход</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-white mb-1">Email или логин</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-gray-700 rounded-md text-white"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white mb-1">Пароль</label>
                        <input
                            type="password"
                            className="w-full p-3 bg-gray-700 rounded-md text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full p-3 font-bold text-white rounded-md transition ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'ВОЙТИ'}
                    </button>
                </form>
            </div>
        </div>
    );
}
