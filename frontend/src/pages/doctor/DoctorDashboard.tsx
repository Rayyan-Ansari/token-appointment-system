import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import type { Session } from '../../types';
import toast from 'react-hot-toast';

export const DoctorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        try {
            if (user?.id) {
                const response = await api.getDoctorSession(user.id);
                console.log('📊 Session response:', response);
                if (response.success && response.data?.session) {
                    setSession(response.data.session);
                }
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSession = async () => {
        console.log('🚀 Starting session...');
        setActionLoading(true);
        try {
            console.log('📡 Calling API...');
            const response = await api.startSession();
            console.log('✅ API Response:', response);
            if (response.success && response.data) {
                setSession(response.data);
                toast.success('Session started!');
            } else {
                console.error('❌ Invalid response:', response);
                toast.error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('❌ Error starting session:', error);
            toast.error(error.response?.data?.message || 'Failed to start session');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePauseSession = async () => {
        setActionLoading(true);
        try {
            await api.pauseSession();
            await loadSession();
            toast.success('Session paused');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to pause session');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResumeSession = async () => {
        setActionLoading(true);
        try {
            await api.resumeSession();
            await loadSession();
            toast.success('Session resumed');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resume session');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCallNext = async () => {
        setActionLoading(true);
        try {
            const response = await api.callNextToken();
            if (response.success) {
                await loadSession();
                toast.success('Next token called!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to call next token');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!confirm('Are you sure you want to end this session?')) return;

        setActionLoading(true);
        try {
            await api.endSession();
            await loadSession();
            toast.success('Session ended');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to end session');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            ENDED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };
        return colors[status as keyof typeof colors] || colors.NOT_STARTED;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold gradient-text">👩‍⚕️ Doctor Portal</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 dark:text-gray-300">Dr. {user?.fullName}</span>
                        <Button variant="ghost" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="py-12">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Session Status */}
                        <Card className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Today's Session
                            </h2>

                            {session ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                {session.currentTokenNo === 0 ? (
                                                    <>
                                                        <span className="text-blue-600 dark:text-blue-400">Next: 1</span>
                                                        <span className="text-gray-400"> / {session.maxTokenNo}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-green-600 dark:text-green-400">{session.currentTokenNo}</span>
                                                        <span className="text-gray-400"> / {session.maxTokenNo}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {session.currentTokenNo === 0 ? 'Next Token / Total' : 'Current Token / Total'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {session.status === 'NOT_STARTED' && (
                                            <Button onClick={handleStartSession} isLoading={actionLoading}>
                                                Start Session
                                            </Button>
                                        )}
                                        {session.status === 'ACTIVE' && (
                                            <>
                                                <Button onClick={handleCallNext} isLoading={actionLoading}>
                                                    📞 Call Next Token
                                                </Button>
                                                <Button variant="secondary" onClick={handlePauseSession} isLoading={actionLoading}>
                                                    ⏸️ Pause
                                                </Button>
                                                <Button variant="danger" onClick={handleEndSession} isLoading={actionLoading}>
                                                    ⏹️ End Session
                                                </Button>
                                            </>
                                        )}
                                        {session.status === 'PAUSED' && (
                                            <>
                                                <Button onClick={handleResumeSession} isLoading={actionLoading}>
                                                    ▶️ Resume
                                                </Button>
                                                <Button variant="danger" onClick={handleEndSession} isLoading={actionLoading}>
                                                    ⏹️ End Session
                                                </Button>
                                            </>
                                        )}
                                        {session.status === 'ENDED' && (
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Session has ended. Start a new session tomorrow.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        No active session for today
                                    </p>
                                    <Button onClick={handleStartSession} isLoading={actionLoading}>
                                        Start Today's Session
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Quick Stats */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="text-center">
                                <div className="text-4xl mb-2">👥</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {session?.maxTokenNo || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients Today</div>
                            </Card>

                            <Card className="text-center">
                                <div className="text-4xl mb-2">✅</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {session?.currentTokenNo || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Patients Served</div>
                            </Card>

                            <Card className="text-center">
                                <div className="text-4xl mb-2">⏳</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {session ? session.maxTokenNo - session.currentTokenNo : 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Waiting</div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
