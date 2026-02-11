import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { DoctorApproval, AdminStats, DoctorDetails, PatientDetails } from '../../types';
import toast from 'react-hot-toast';

type TabType = 'approvals' | 'doctors' | 'patients';

export const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('approvals');
    const [pendingApprovals, setPendingApprovals] = useState<DoctorApproval[]>([]);
    const [doctors, setDoctors] = useState<DoctorDetails[]>([]);
    const [patients, setPatients] = useState<PatientDetails[]>([]);
    const [stats, setStats] = useState<AdminStats>({
        activeDoctors: 0,
        pendingApprovals: 0,
        totalPatients: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'doctors' && doctors.length === 0) {
            loadDoctors();
        } else if (activeTab === 'patients' && patients.length === 0) {
            loadPatients();
        }
    }, [activeTab]);

    const loadData = async () => {
        try {
            const [approvalsRes, statsRes] = await Promise.all([
                api.getPendingApprovals(),
                api.getDashboardStats()
            ]);

            if (approvalsRes.success && approvalsRes.data) {
                setPendingApprovals(approvalsRes.data);
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadDoctors = async () => {
        try {
            const response = await api.getAllDoctors();
            console.log('Doctors API response:', response);
            if (response.success && response.data) {
                setDoctors(response.data);
            } else {
                console.error('Doctors API returned unsuccessful response:', response);
                toast.error('Failed to load doctors - API returned error');
            }
        } catch (error: any) {
            console.error('Failed to load doctors:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            toast.error(`Failed to load doctors: ${error.response?.data?.message || error.message}`);
        }
    };

    const loadPatients = async () => {
        try {
            const response = await api.getAllPatients();
            console.log('Patients API response:', response);
            if (response.success && response.data) {
                setPatients(response.data);
            } else {
                console.error('Patients API returned unsuccessful response:', response);
                toast.error('Failed to load patients - API returned error');
            }
        } catch (error: any) {
            console.error('Failed to load patients:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            toast.error(`Failed to load patients: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleApprove = async (approvalId: string) => {
        setActionLoading(approvalId);
        try {
            const response = await api.approveDoctor(approvalId);
            if (response.success) {
                toast.success('Doctor approved successfully!');
                await loadData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (approvalId: string) => {
        const note = prompt('Enter rejection reason (optional):');

        setActionLoading(approvalId);
        try {
            const response = await api.rejectDoctor(approvalId, note || undefined);
            if (response.success) {
                toast.success('Doctor registration rejected');
                await loadData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteDoctor = async (doctorId: string) => {
        if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            return;
        }

        setActionLoading(doctorId);
        try {
            const response = await api.deleteDoctor(doctorId);
            if (response.success) {
                toast.success('Doctor deleted successfully');
                setDoctors(doctors.filter(d => d.id !== doctorId));
                await loadData(); // Refresh stats
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePatient = async (patientId: string) => {
        if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            return;
        }

        setActionLoading(patientId);
        try {
            const response = await api.deletePatient(patientId);
            if (response.success) {
                toast.success('Patient deleted successfully');
                setPatients(patients.filter(p => p.id !== patientId));
                await loadData(); // Refresh stats
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete patient');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold gradient-text">🛡️ Admin Portal</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 dark:text-gray-300">Admin: {user?.fullName}</span>
                        <Button variant="ghost" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div onClick={() => setActiveTab('doctors')} className="cursor-pointer">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-2">👩‍⚕️</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeDoctors}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Active Doctors</div>
                        </Card>
                    </div>

                    <div onClick={() => setActiveTab('approvals')} className="cursor-pointer">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-2">⏳</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.pendingApprovals}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</div>
                        </Card>
                    </div>

                    <div onClick={() => setActiveTab('patients')} className="cursor-pointer">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-2">👥</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients</div>
                        </Card>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={activeTab === 'approvals' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('approvals')}
                    >
                        Pending Approvals ({stats.pendingApprovals})
                    </Button>
                    <Button
                        variant={activeTab === 'doctors' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('doctors')}
                    >
                        Doctors ({stats.activeDoctors})
                    </Button>
                    <Button
                        variant={activeTab === 'patients' ? 'primary' : 'ghost'}
                        onClick={() => setActiveTab('patients')}
                    >
                        Patients ({stats.totalPatients})
                    </Button>
                </div>

                {/* Pending Doctor Approvals Tab */}
                {activeTab === 'approvals' && (
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Pending Doctor Approvals
                        </h2>

                        {isLoading ? (
                            <div className="py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : pendingApprovals.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">✅</div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    No pending approvals at the moment
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingApprovals.map((approval) => (
                                    <div
                                        key={approval.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {approval.doctor?.fullName}
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>📧 {approval.doctor?.email}</p>
                                                    <p>🏥 {approval.doctor?.specialization}</p>
                                                    <p>🎓 {approval.doctor?.qualification}</p>
                                                    <p>📅 {approval.doctor?.yearsExperience} years experience</p>
                                                    <p>📞 {approval.doctor?.phone}</p>
                                                    <p>🆔 License: {approval.doctor?.licenseNumber}</p>
                                                    {approval.doctor?.licenseDocumentPath && (
                                                        <div className="mt-2">
                                                            <a
                                                                href={`http://localhost:5000/uploads/${approval.doctor.licenseDocumentPath}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                                            >
                                                                📄 View License Document
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                                        Submitted: {new Date(approval.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    onClick={() => handleApprove(approval.id)}
                                                    isLoading={actionLoading === approval.id}
                                                    disabled={actionLoading !== null}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    ✅ Approve
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleReject(approval.id)}
                                                    isLoading={actionLoading === approval.id}
                                                    disabled={actionLoading !== null}
                                                >
                                                    ❌ Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Doctors Tab */}
                {activeTab === 'doctors' && (
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Active Doctors
                        </h2>

                        {doctors.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">👨‍⚕️</div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    No active doctors found
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {doctor.fullName}
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>📧 {doctor.email}</p>
                                                    <p>🏥 {doctor.specialization}</p>
                                                    <p>🎓 {doctor.qualification}</p>
                                                    <p>📅 {doctor.yearsExperience} years experience</p>
                                                    <p>📞 {doctor.phone}</p>
                                                    <p>🆔 License: {doctor.licenseNumber}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        Joined: {new Date(doctor.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setSelectedDoctor(doctor)}
                                                >
                                                    👁️ View Details
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteDoctor(doctor.id)}
                                                    isLoading={actionLoading === doctor.id}
                                                    disabled={actionLoading !== null}
                                                >
                                                    🗑️ Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Patients Tab */}
                {activeTab === 'patients' && (
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            All Patients
                        </h2>

                        {patients.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">👥</div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    No patients found
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {patients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {patient.fullName}
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>📧 {patient.email}</p>
                                                    <p>📞 {patient.phone}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        Registered: {new Date(patient.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setSelectedPatient(patient)}
                                                >
                                                    👁️ View Details
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeletePatient(patient.id)}
                                                    isLoading={actionLoading === patient.id}
                                                    disabled={actionLoading !== null}
                                                >
                                                    🗑️ Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoctor(null)}>
                    <div onClick={(e: React.MouseEvent) => e.stopPropagation()} className="w-full max-w-3xl animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header with Grainient */}
                            <div className="relative p-8 overflow-hidden">
                                {/* Grainient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"></div>
                                <div
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'repeat',
                                        mixBlendMode: 'overlay'
                                    }}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <button
                                        onClick={() => setSelectedDoctor(null)}
                                        className="absolute top-0 right-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg">
                                            <div className="text-5xl">👨‍⚕️</div>
                                        </div>
                                        <div className="text-white">
                                            <h2 className="text-3xl font-bold mb-1 drop-shadow-lg">{selectedDoctor.fullName}</h2>
                                            <p className="text-blue-100 text-lg drop-shadow">{selectedDoctor.specialization}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedDoctor.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedDoctor.phone}</p>
                                    </div>

                                    {/* Qualification */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qualification</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedDoctor.qualification}</p>
                                    </div>

                                    {/* Experience */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Experience</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedDoctor.yearsExperience} years</p>
                                    </div>

                                    {/* License */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">License</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedDoctor.licenseNumber}</p>
                                    </div>

                                    {/* Joined Date */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-pink-100 dark:bg-pink-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-pink-600 dark:text-pink-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{new Date(selectedDoctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPatient(null)}>
                    <div onClick={(e: React.MouseEvent) => e.stopPropagation()} className="w-full max-w-2xl animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header with Grainient */}
                            <div className="relative p-8 overflow-hidden">
                                {/* Grainient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500"></div>
                                <div
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'repeat',
                                        mixBlendMode: 'overlay'
                                    }}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="absolute top-0 right-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg">
                                            <div className="text-5xl">👤</div>
                                        </div>
                                        <div className="text-white">
                                            <h2 className="text-3xl font-bold mb-1 drop-shadow-lg">{selectedPatient.fullName}</h2>
                                            <p className="text-green-100 text-lg drop-shadow">Patient</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedPatient.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                                                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{selectedPatient.phone}</p>
                                    </div>

                                    {/* Registered Date */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Registered</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium ml-11">{new Date(selectedPatient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
