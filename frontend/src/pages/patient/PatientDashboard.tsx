import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import type { Token } from '../../types';
import { format } from 'date-fns';

export const PatientDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        try {
            const response = await api.getMyTokens();
            if (response.success && response.data) {
                setTokens(response.data);
            }
        } catch (error) {
            console.error('Failed to load tokens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            WAITING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            CALLED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            SERVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            NO_SHOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        return colors[status as keyof typeof colors] || colors.WAITING;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold gradient-text">🏥 Patient Portal</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 dark:text-gray-300">Welcome, {user?.fullName}</span>
                        <Button variant="ghost" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="text-center">
                        <div className="text-4xl mb-2">📅</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {tokens.filter(t => t.status === 'WAITING').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active Tokens</div>
                    </Card>

                    <Card className="text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {tokens.filter(t => t.status === 'SERVED').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    </Card>

                    <Card className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {tokens.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</div>
                    </Card>
                </div>

                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Appointments</h2>
                        <Button onClick={() => window.location.href = '/patient/book'}>
                            + Book New Token
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">No appointments yet</p>
                            <Button onClick={() => window.location.href = '/patient/book'}>
                                Book Your First Appointment
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tokens.map((token) => (
                                <div
                                    key={token.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                            Token #{token.tokenNo}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {token.session?.doctor?.fullName || 'Doctor'} - {token.session?.doctor?.specialization}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            Booked: {format(new Date(token.bookedAt), 'PPp')}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(token.status)}`}>
                                            {token.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
