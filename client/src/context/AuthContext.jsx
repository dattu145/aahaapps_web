import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user'); // Simple check, ideally verify token with backend
            if (token && storedUser) {
                setUser({ username: storedUser });
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await api.post('/users/login', { username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', data.username);
            setUser({ username: data.username });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
