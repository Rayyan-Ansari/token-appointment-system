import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import type { AuthUser, LoginData, RegisterPatientData, RegisterDoctorData, UserRole } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginData, role: UserRole) => Promise<void>;
    registerPatient: (data: RegisterPatientData) => Promise<void>;
    registerDoctor: (data: RegisterDoctorData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                socketService.connect(token);
            } catch (error) {
                console.error('Failed to parse saved user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setIsLoading(false);
    }, []);

    const login = async (data: LoginData, role: UserRole) => {
        try {
            let response;

            switch (role) {
                case 'patient':
                    response = await api.loginPatient(data);
                    break;
                case 'doctor':
                    response = await api.loginDoctor(data);
                    break;
                case 'admin':
                    response = await api.loginAdmin(data);
                    break;
                default:
                    throw new Error('Invalid role');
            }

            if (response.success && response.data) {
                const { token, user, doctor, admin } = response.data;
                const userData = user || doctor || admin;

                if (token && userData) {
                    // Add role to user data
                    const userWithRole = { ...userData, role };

                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userWithRole));
                    setUser(userWithRole);
                    socketService.connect(token);
                    toast.success('Login successful!');
                } else {
                    throw new Error('Invalid response format');
                }
            } else {
                throw new Error('Login failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const registerPatient = async (data: RegisterPatientData) => {
        try {
            const response = await api.registerPatient(data);

            if (response.success) {
                toast.success('Registration successful! Please login.');
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const registerDoctor = async (data: RegisterDoctorData) => {
        try {
            const response = await api.registerDoctor(data);

            if (response.success) {
                toast.success('Registration successful! Please wait for admin approval.');
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        socketService.disconnect();
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                registerPatient,
                registerDoctor,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
