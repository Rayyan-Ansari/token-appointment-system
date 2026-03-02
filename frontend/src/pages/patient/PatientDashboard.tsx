import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { socketService } from '../../services/socket';
import type { Token } from '../../types';
import { format } from 'date-fns';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';
import { NotificationModal } from '../../components/ui/NotificationModal';
import toast from 'react-hot-toast';

export const PatientDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');

    // Notification State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificationData, setNotificationData] = useState<{ doctorName: string; tokenNumber: number | string } | null>(null);

    // Selected Token for Modal
    const [selectedTokenDetails, setSelectedTokenDetails] = useState<Token | null>(null);

    // Keep a ref of tokens to access latest state inside socket callbacks without stale closures
    const tokensRef = useRef(tokens);
    useEffect(() => {
        tokensRef.current = tokens;
    }, [tokens]);

    useEffect(() => {
        loadTokens();

        const handleMyTokenUpdated = (data: any) => {
            if (data.status === 'CALLED') {
                // Check if this token belongs to the current patient
                const patientToken = tokensRef.current.find(t => t.id === data.tokenId);
                if (patientToken) {
                    toast.success('Your Token has been called!', { duration: 5000 });
                    setNotificationData({
                        doctorName: patientToken.session?.doctor?.fullName || 'Doctor',
                        tokenNumber: patientToken.tokenNo
                    });
                    setIsNotificationOpen(true);
                }
            }
            loadTokens();
        };

        const handleQueueUpdate = () => {
            loadTokens();
        };

        socketService.on('mytoken:updated', handleMyTokenUpdated);
        ['token:next', 'token:booked', 'session:started', 'session:paused', 'session:resumed', 'session:ended'].forEach(event => {
            socketService.on(event, handleQueueUpdate);
        });

        return () => {
            socketService.off('mytoken:updated', handleMyTokenUpdated);
            ['token:next', 'token:booked', 'session:started', 'session:paused', 'session:resumed', 'session:ended'].forEach(event => {
                socketService.off(event, handleQueueUpdate);
            });

            // Leave all doctor rooms on unmount
            const uniqueDoctorIds = [...new Set(tokensRef.current.map(t => t.session?.doctor?.id).filter(Boolean))];
            uniqueDoctorIds.forEach(doctorId => {
                if (doctorId) socketService.leaveDoctorRoom(doctorId.toString());
            });
        };
    }, []);

    const loadTokens = async () => {
        try {
            const response = await api.getMyTokens();
            if (response.success && response.data) {
                setTokens(response.data);

                // Join doctor rooms for real-time queue updates
                const uniqueDoctorIds = [...new Set(response.data.map((t: any) => t.session?.doctor?.id).filter(Boolean))];
                uniqueDoctorIds.forEach(doctorId => {
                    if (doctorId) socketService.joinDoctorRoom(doctorId.toString());
                });
            }
        } catch (error) {
            console.error('Failed to load tokens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, any> = {
            WAITING: { variant: 'waiting', label: 'Waiting' },
            CALLED: { variant: 'appoint', label: 'Called' },
            SERVED: { variant: 'served', label: 'Served' },
            CANCELED: { variant: 'reject', label: 'Canceled' },
            NO_SHOW: { variant: 'reject', label: 'No Show' },
        };
        return map[status] || { variant: 'waiting', label: status };
    };

    const activeTokens = tokens.filter(t => t.status === 'WAITING' || t.status === 'CALLED');
    const completedTokens = tokens.filter(t => t.status === 'SERVED');

    return (
        <div className="page-bg">
            <Sidebar userRole="patient" userName={user?.fullName} />

            <div className="main-container relative">

                {/* Notification Modal Mount Point */}
                <NotificationModal
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    doctorName={notificationData?.doctorName || 'Doctor'}
                    tokenNumber={notificationData?.tokenNumber || ''}
                />

                {/* Token Details Modal */}
                {selectedTokenDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Appointment Details
                                </h2>
                                <button onClick={() => setSelectedTokenDetails(null)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-xl transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-5 overflow-y-auto max-h-[80vh]">
                                <div className="flex items-center gap-4 mb-5 border border-blue-100 bg-blue-50/30 p-4 rounded-xl">
                                    <Avatar name={selectedTokenDetails.session?.doctor?.fullName} size="xl" />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{selectedTokenDetails.session?.doctor?.fullName || 'Doctor'}</h3>
                                        <p className="text-blue-600 text-sm font-medium">{selectedTokenDetails.session?.doctor?.specialization}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-0.5">Your Token No</p>
                                            <p className="font-bold text-gray-800 text-xl text-blue-600">#{selectedTokenDetails.tokenNo}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-0.5">Booking Status</p>
                                            <Badge variant={getStatusBadge(selectedTokenDetails.status).variant}>{getStatusBadge(selectedTokenDetails.status).label}</Badge>
                                        </div>
                                    </div>

                                    {(selectedTokenDetails.status === 'WAITING' || selectedTokenDetails.status === 'CALLED') && (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                                Live Queue Status
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-indigo-50">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Now Serving</p>
                                                    <p className="text-xl font-bold text-indigo-700">{selectedTokenDetails.session?.currentTokenNo || '-'}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-indigo-50">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Tokens Ahead</p>
                                                    <p className="text-xl font-bold text-gray-800">
                                                        {selectedTokenDetails.session?.currentTokenNo
                                                            ? Math.max(0, selectedTokenDetails.tokenNo - selectedTokenDetails.session.currentTokenNo)
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor Information</h4>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🎓</span>
                                                <div>
                                                    <p className="text-xs text-gray-500">Experience</p>
                                                    <p className="text-sm font-medium text-gray-800">{selectedTokenDetails.session?.doctor?.yearsExperience || 0}+ Years</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">✉️</span>
                                                <div>
                                                    <p className="text-xs text-gray-500">Contact Email</p>
                                                    <p className="text-sm font-medium text-gray-800 break-all">{(selectedTokenDetails.session?.doctor as any)?.user?.email || selectedTokenDetails.session?.doctor?.email || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🏥</span>
                                                <div>
                                                    <p className="text-xs text-gray-500">Clinic Address</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {(selectedTokenDetails.session?.doctor as any)?.address || 'Address not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button onClick={() => setSelectedTokenDetails(null)} className="btn-primary">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="app-header animate-slide-down">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Patient Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome, {user?.fullName}!</p>
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

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        My Profile
                    </button>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="space-y-5 animate-slide-up">
                        {/* Active Tokens */}
                        <div>
                            <h2 className="text-base font-bold text-gray-700 mb-3">Active Tokens</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="stat-card-blue">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold">{activeTokens.length}</div>
                                    <div className="text-white/80 text-sm mt-1">Active Tokens</div>
                                </div>
                                <div className="stat-card-green">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold">{completedTokens.length}</div>
                                    <div className="text-white/80 text-sm mt-1">Completed</div>
                                </div>
                            </div>
                        </div>

                        {/* Book Appointment */}
                        <button
                            onClick={() => navigate('/patient/book')}
                            className="w-full app-card app-card-hover flex items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="font-semibold text-blue-600">Book New Appointment</span>
                        </button>

                        {/* My Appointments */}
                        <div>
                            <h2 className="text-base font-bold text-gray-700 mb-3">My Appointments</h2>
                            {isLoading ? (
                                <div className="app-card flex justify-center py-10"><Spinner size="lg" /></div>
                            ) : tokens.length === 0 ? (
                                <div className="app-card text-center py-10">
                                    <div className="text-5xl mb-3">📅</div>
                                    <p className="text-gray-500 mb-4">No appointments yet</p>
                                    <button onClick={() => navigate('/patient/book')} className="btn-primary">
                                        Book Your First Appointment
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tokens.map((token) => {
                                        const statusInfo = getStatusBadge(token.status);
                                        return (
                                            <div
                                                key={token.id}
                                                onClick={() => setSelectedTokenDetails(token)}
                                                className="app-card app-card-hover animate-slide-up flex items-center gap-4 cursor-pointer"
                                            >
                                                <div className={`token-badge ${token.status === 'SERVED' ? 'token-badge-green' : token.status === 'CALLED' ? 'token-badge-purple' : 'token-badge-blue'}`}>
                                                    <span className="text-[10px]">Token</span>
                                                    <span className="text-sm">#{token.tokenNo}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="font-semibold text-gray-800 text-sm">
                                                            {token.session?.doctor?.fullName || 'Doctor'}
                                                        </h3>
                                                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                                    </div>
                                                    <p className="text-gray-500 text-xs">{token.session?.doctor?.specialization || 'Specialist'}</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">
                                                        Booked: {format(new Date(token.bookedAt), 'PPp')}
                                                    </p>
                                                    {(token.status === 'WAITING' || token.status === 'CALLED') && token.session?.currentTokenNo !== undefined && (
                                                        <div className="mt-1.5 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg">
                                                            <span>Now Serving:</span>
                                                            <span className="font-bold">Token #{token.session.currentTokenNo}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-4 animate-slide-up">
                        <div className="app-card">
                            <div className="flex items-center gap-4 mb-5">
                                <Avatar name={user?.fullName} size="xl" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{user?.fullName}</h2>
                                    <p className="text-gray-500 text-sm">{user?.email}</p>
                                    <div className="mt-1"><Badge variant="active">Patient</Badge></div>
                                </div>
                            </div>
                            <div className="space-y-3 border-t border-gray-100 pt-4">
                                {[
                                    { label: 'Email', value: user?.email },
                                    { label: 'Role', value: 'Patient' },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">{item.label}</span>
                                        <span className="font-medium text-gray-800 text-sm capitalize">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="app-card">
                            <h3 className="font-bold text-gray-700 mb-3">Statistics</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-blue-600">{tokens.length}</div>
                                    <div className="text-gray-500 text-xs mt-1">Total Appointments</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-green-600">{completedTokens.length}</div>
                                    <div className="text-gray-500 text-xs mt-1">Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
