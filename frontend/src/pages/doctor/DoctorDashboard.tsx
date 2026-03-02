import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { socketService } from '../../services/socket';
import type { Session, Token } from '../../types';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';

export const DoctorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [session, setSession] = useState<Session | null>(null);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadSession();

        // Listen for new token bookings to update the queue in real-time
        const handleTokenBooked = () => {
            loadSession(false);
        };
        socketService.on('token:booked', handleTokenBooked);

        return () => {
            socketService.off('token:booked', handleTokenBooked);
            if (user?.id) {
                socketService.leaveDoctorRoom(user.id);
            }
        };
    }, [user?.id]);

    const loadSession = async (showErrors = false) => {
        try {
            if (user?.id) {
                const response = await api.getDoctorSession(user.id);
                if (response.success && response.data?.session) {
                    setSession(response.data.session);
                    if (response.data.session.id) {
                        await loadSessionTokens(response.data.session.id);
                        socketService.joinDoctorRoom(user.id); // Join doctor room for live updates
                    }
                }
            }
        } catch (error) {
            if (showErrors) console.error('Failed to load session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSessionTokens = async (sessionId: string) => {
        try {
            const response = await api.getSessionTokens(sessionId);
            if (response.success && response.data) {
                setTokens(response.data);
            }
        } catch (error) {
            console.error('Failed to load tokens:', error);
        }
    };

    const handleStartSession = async () => {
        setActionLoading(true);
        try {
            const response = await api.startSession();
            if (response.success && response.data) {
                setSession(response.data);
                toast.success('Session started!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to start session');
        } finally { setActionLoading(false); }
    };

    const handlePauseSession = async () => {
        setActionLoading(true);
        try {
            await api.pauseSession();
            await loadSession();
            toast.success('Session paused');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to pause session');
        } finally { setActionLoading(false); }
    };

    const handleResumeSession = async () => {
        setActionLoading(true);
        try {
            await api.resumeSession();
            await loadSession();
            toast.success('Session resumed');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resume session');
        } finally { setActionLoading(false); }
    };

    const handleCallNext = async () => {
        setActionLoading(true);
        try {
            const response = await api.callNextToken();
            if (response.success) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await loadSession(true);
                toast.success('Next token called!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to call next token');
        } finally { setActionLoading(false); }
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
        } finally { setActionLoading(false); }
    };

    const todayTokens = tokens || [];
    const servedTokens = todayTokens.filter((t: Token) => t.status === 'SERVED');
    const waitingTokens = todayTokens.filter((t: Token) => t.status === 'WAITING');

    if (isLoading) {
        return (
            <div className="page-bg flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="page-bg">
            <Sidebar userRole="doctor" userName={user?.fullName} />

            <div className="main-container">
                {/* Header */}
                <div className="app-header animate-slide-down">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Doctor Dashboard</h1>
                        <p className="text-sm text-gray-500">{(user as any)?.specialization || 'Medical Specialist'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <button onClick={logout} className="btn-ghost text-sm">Logout</button>
                    </div>
                </div>

                {/* Doctor Profile Card */}
                <div className="now-serving-banner mb-5 animate-slide-down">
                    <div className="flex items-center gap-4 mb-5">
                        <Avatar name={user?.fullName} size="xl" status={session?.status === 'ACTIVE' ? 'online' : 'offline'} />
                        <div className="text-left">
                            <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                            <p className="text-white/75 text-sm">{(user as any)?.specialization} with {(user as any)?.yearsExperience || 10} Years Experience</p>
                        </div>
                    </div>

                    {/* Now Serving */}
                    <div className="bg-white/10 rounded-xl px-5 py-3 flex items-center justify-between mb-4">
                        <span className="text-white/80 font-medium">Now Serving:</span>
                        <span className="text-2xl font-bold">
                            {session?.status === 'ACTIVE' && session?.currentTokenNo ? `Token #${session.currentTokenNo}` : '--'}
                        </span>
                    </div>

                    {/* Session Controls */}
                    <div className="flex gap-3 justify-center flex-wrap">
                        {!session || session.status === 'NOT_STARTED' || session.status === 'ENDED' ? (
                            <button onClick={handleStartSession} disabled={actionLoading} className="btn-green px-6">
                                {actionLoading ? 'Starting...' : '▶ Start Session'}
                            </button>
                        ) : session.status === 'ACTIVE' ? (
                            <>
                                <button onClick={handlePauseSession} disabled={actionLoading} className="btn-orange">
                                    ⏸ Pause
                                </button>
                                <button
                                    onClick={handleCallNext}
                                    disabled={actionLoading || (waitingTokens.length === 0 && !todayTokens.some((t: Token) => t.status === 'CALLED'))}
                                    className="btn-primary px-6"
                                >
                                    {waitingTokens.length === 0 && todayTokens.some((t: Token) => t.status === 'CALLED') ? 'Mark as Served' : 'Next Token'}
                                </button>
                                <button onClick={handleEndSession} disabled={actionLoading} className="btn-red">
                                    End Session
                                </button>
                            </>
                        ) : session.status === 'PAUSED' ? (
                            <>
                                <button onClick={handleResumeSession} disabled={actionLoading} className="btn-green px-6">
                                    ▶ Resume
                                </button>
                                <button onClick={handleEndSession} disabled={actionLoading} className="btn-red">
                                    End Session
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="app-card flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">{todayTokens.length}</div>
                            <div className="text-xs text-gray-500">Today's Patients</div>
                        </div>
                    </div>
                    <div className="app-card flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">{servedTokens.length}</div>
                            <div className="text-xs text-gray-500">This Week</div>
                        </div>
                    </div>
                </div>

                {/* Today's Queue */}
                <div className="mb-5">
                    <h2 className="text-base font-bold text-gray-700 mb-3">Today's Queue</h2>
                    {todayTokens.length === 0 ? (
                        <div className="app-card text-center py-10">
                            <div className="text-5xl mb-3">📋</div>
                            <p className="text-gray-500">No tokens today</p>
                        </div>
                    ) : (
                        <div className="space-y-2 custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {todayTokens.slice().reverse().map((token) => (
                                <div key={token.id} className="app-card app-card-hover flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`token-badge ${token.status === 'SERVED' ? 'token-badge-green' : token.status === 'CALLED' ? 'token-badge-purple' : 'token-badge-blue'}`}>
                                            <span className="text-[10px]">Token</span>
                                            <span className="text-sm">{token.tokenNo}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">Token {token.tokenNo}</div>
                                            <div className="text-xs text-gray-500">
                                                {token.status === 'SERVED' ? 'Served' : token.status === 'CALLED' ? 'Called' : 'Waiting'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={token.status === 'SERVED' ? 'served' : token.status === 'CALLED' ? 'active' : 'waiting'}>
                                        {token.status === 'SERVED' ? 'Served' : token.status === 'CALLED' ? 'Called' : 'Waiting'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Stats */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-gray-700">Today's Tokens</h2>
                        <button onClick={() => loadSession(true)} className="text-blue-600 text-xs font-medium hover:underline">Refresh</button>
                    </div>
                    <div className="space-y-2">
                        {[
                            { label: 'This Week', sublabel: 'This Week', value: servedTokens.length },
                            { label: 'This Month', sublabel: 'This Month', value: todayTokens.length },
                        ].map(stat => (
                            <div key={stat.label} className="app-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {stat.value}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">{stat.label}</div>
                                    <div className="text-xs text-gray-400">{stat.sublabel}</div>
                                </div>
                                <div className="ml-auto text-2xl font-bold text-gray-800">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
