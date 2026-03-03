import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { TokenTransaction } from '../../types';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { format } from 'date-fns';

export const AdminTokenTransactions: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tokens, setTokens] = useState<TokenTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        try {
            const response = await api.getAllTokens();
            if (response.success && response.data) {
                setTokens(response.data);
            }
        } catch (error: any) {
            console.error('Failed to load token transactions:', error);
            toast.error('Failed to load token transactions.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'WAITING': return 'waiting';
            case 'CALLED': return 'paused'; // Using paused for yellow/orange
            case 'SERVED': return 'active';
            case 'CANCELED': return 'ended';
            case 'NO_SHOW': return 'ended';
            default: return 'waiting';
        }
    };

    return (
        <div className="page-bg">
            <Sidebar userRole="admin" userName={user?.fullName} />

            <div className="main-container max-w-7xl mx-auto">
                {/* Header */}
                <div className="app-header animate-slide-down">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Token Transactions</h1>
                        <p className="text-sm text-gray-500">Monitor all system tokens in real-time.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin')} className="btn-ghost text-sm">← Back to Dashboard</button>
                        <button onClick={logout} className="btn-ghost text-sm">Logout</button>
                    </div>
                </div>

                <div className="app-card animate-slide-up overflow-hidden p-0">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800">All Transactions</h2>
                        <button onClick={loadTokens} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Refresh">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" />
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4 opacity-50">🎫</div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No Transactions Found</h3>
                            <p className="text-gray-500 text-sm">There are currently no recorded tokens in the system.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4">Token Info</th>
                                        <th className="px-6 py-4">Status & Timing</th>
                                        <th className="px-6 py-4">Patient Details</th>
                                        <th className="px-6 py-4">Doctor Details</th>
                                        <th className="px-6 py-4">System Metadata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {tokens.map((token) => (
                                        <tr key={token.id} className="hover:bg-blue-50/30 transition-colors group">
                                            {/* Token Info */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-base">#{token.tokenNo}</span>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        Date: {format(new Date(token.session.sessionDate), 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-1">ID: {token.id}</span>
                                                </div>
                                            </td>

                                            {/* Status & Timing */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <div><Badge variant={getStatusVariant(token.status) as any}>{token.status}</Badge></div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="w-16">Created:</span>
                                                            <span className="font-medium text-gray-700">{format(new Date(token.bookedAt), 'HH:mm:ss')}</span>
                                                        </div>
                                                        {token.calledAt && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className="w-16">Called:</span>
                                                                <span className="font-medium text-gray-700">{format(new Date(token.calledAt), 'HH:mm:ss')}</span>
                                                            </div>
                                                        )}
                                                        {token.servedAt && (
                                                            <div className="flex items-center gap-1 mt-0.5 text-green-600">
                                                                <span className="w-16">Served:</span>
                                                                <span className="font-medium">{format(new Date(token.servedAt), 'HH:mm:ss')}</span>
                                                            </div>
                                                        )}
                                                        {token.canceledAt && (
                                                            <div className="flex items-center gap-1 mt-0.5 text-red-600">
                                                                <span className="w-16">Cancelled:</span>
                                                                <span className="font-medium">{format(new Date(token.canceledAt), 'HH:mm:ss')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Patient Details */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800">{token.patient.fullName}</span>
                                                    <span className="text-xs text-gray-500 mt-1 group-hover:text-blue-600 transition-colors">{token.patient.email}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{token.patient.phone}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-1 mt-auto">ID: {token.patient.id}</span>
                                                </div>
                                            </td>

                                            {/* Doctor Details */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800">{token.doctor.fullName}</span>
                                                    <span className="text-xs text-blue-600 font-medium mt-1">{token.doctor.specialization}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-1 mt-auto">ID: {token.doctor.id}</span>
                                                </div>
                                            </td>

                                            {/* Session Metadata */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="text-xs">
                                                        <span className="text-gray-500">Session Status: </span>
                                                        <span className={`font-semibold ${token.session.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-700'}`}>
                                                            {token.session.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="text-gray-500">Current Token: </span>
                                                        <span className="font-medium text-gray-800">{token.session.currentTokenNo} / {token.session.maxTokenNo}</span>
                                                    </div>
                                                    <div className="text-xs mt-2 pt-2 border-t border-gray-100">
                                                        <span className="text-gray-500">Session ID: </span>
                                                        <span className="font-mono text-gray-400 text-[10px]">{token.session.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
