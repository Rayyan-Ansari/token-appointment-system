import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { DoctorApproval, AdminStats, DoctorDetails, PatientDetails } from '../../types';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';

type TabType = 'approvals' | 'doctors' | 'patients';

const BACKEND_URL = 'http://localhost:5000';

// ─── Shared Detail Row Helper ───────────────────────────────────────────────
const DetailRow: React.FC<{ icon: string; label: string; value: string; bg?: string }> = ({ icon, label, value, bg = 'bg-gray-50' }) => (
    <div className={`${bg} rounded-xl p-3`}>
        <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5"><span>{icon}</span>{label}</div>
        <div className="text-sm font-semibold text-gray-700 break-all">{value}</div>
    </div>
);

// ─── License Document Viewer ────────────────────────────────────────────────
const LicenseViewer: React.FC<{ path?: string | null }> = ({ path }) => {
    if (!path) return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">📂</div>
            <p className="text-amber-700 text-sm font-medium">No document uploaded</p>
        </div>
    );
    const url = `${BACKEND_URL}/uploads/${path}`;
    const isPdf = url.toLowerCase().endsWith('.pdf');
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            {isPdf ? (
                <>
                    <iframe src={url} className="w-full h-64 border-0" title="License Document" />
                    <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-xs text-gray-500">📄 PDF Document</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Open in new tab ↗</a>
                    </div>
                </>
            ) : (
                <>
                    <img src={url} alt="License" className="w-full object-contain max-h-80" />
                    <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-xs text-gray-500">🖼️ Image Document</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Open full size ↗</a>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Patient Detail Modal ────────────────────────────────────────────────────
interface PatientModalProps {
    patient: PatientDetails;
    actionLoading: string | null;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, actionLoading, onDelete, onClose }) => {
    const sexLabel = patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex === 'O' ? 'Other' : '—';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Avatar name={patient.fullName} size="lg" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{patient.fullName}</h2>
                            <p className="text-gray-500 text-sm">{patient.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <DetailRow icon="👤" label="Full Name" value={patient.fullName} />
                            <DetailRow icon="✉️" label="Email" value={patient.email} />
                            <DetailRow icon="📞" label="Phone" value={patient.phone || '—'} />
                            <DetailRow icon="⚤" label="Sex" value={sexLabel} />
                            <DetailRow icon="🎂" label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
                            <DetailRow icon="📅" label="Registered" value={patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} />
                        </div>
                    </div>
                    {/* Address */}
                    {patient.address && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Address</h3>
                            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2">
                                <span className="text-lg mt-0.5">📍</span>
                                <p className="text-sm font-medium text-gray-700">{patient.address}</p>
                            </div>
                        </div>
                    )}
                    {/* Delete */}
                    <button
                        onClick={() => onDelete(patient.id)}
                        disabled={actionLoading === patient.id}
                        className="w-full py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60"
                    >
                        {actionLoading === patient.id ? <Spinner size="sm" /> : '🗑 Delete This Patient'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Active Doctor Detail Modal ─────────────────────────────────────────────
interface ActiveDoctorModalProps {
    doctor: DoctorDetails;
    actionLoading: string | null;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const ActiveDoctorModal: React.FC<ActiveDoctorModalProps> = ({ doctor, actionLoading, onDelete, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Avatar name={doctor.fullName} size="lg" />
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{doctor.fullName}</h2>
                        <p className="text-gray-500 text-sm">{doctor.specialization}</p>
                    </div>
                    <Badge variant="approve">Active</Badge>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="p-6 space-y-5">
                {/* Personal */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <DetailRow icon="👤" label="Full Name" value={doctor.fullName} />
                        <DetailRow icon="✉️" label="Email" value={doctor.email} />
                        <DetailRow icon="📞" label="Phone" value={doctor.phone || '—'} />
                        <DetailRow icon="📅" label="Joined" value={doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} />
                    </div>
                </div>
                {/* Professional */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <DetailRow icon="🎓" label="Qualification" value={doctor.qualification || '—'} bg="bg-blue-50" />
                        <DetailRow icon="🏥" label="Specialization" value={doctor.specialization || '—'} bg="bg-blue-50" />
                        <DetailRow icon="⏱️" label="Experience" value={doctor.yearsExperience != null ? `${doctor.yearsExperience} Years` : '—'} bg="bg-blue-50" />
                        <DetailRow icon="📋" label="License No." value={doctor.licenseNumber || '—'} bg="bg-blue-50" />
                    </div>
                </div>
                {/* License Document */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">License Document</h3>
                    <LicenseViewer path={doctor.licenseDocumentPath} />
                </div>
                {/* Delete */}
                <button
                    onClick={() => onDelete(doctor.id)}
                    disabled={actionLoading === doctor.id}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60"
                >
                    {actionLoading === doctor.id ? <Spinner size="sm" /> : '🗑 Delete This Doctor'}
                </button>
            </div>
        </div>
    </div>
);

// ─── Pending Approval Modal ──────────────────────────────────────────────────
interface DoctorDetailModalProps {
    approval: DoctorApproval;
    actionLoading: string | null;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onClose: () => void;
}

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ approval, actionLoading, onApprove, onReject, onClose }) => {
    const doc = approval.doctor as any;
    const licenseUrl = doc?.licenseDocumentPath
        ? `${BACKEND_URL}/uploads/${doc.licenseDocumentPath}`
        : null;
    const isPdf = licenseUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Avatar name={doc?.fullName} size="lg" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{doc?.fullName}</h2>
                            <p className="text-gray-500 text-sm">{doc?.specialization}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Full Name', value: doc?.fullName, icon: '👤' },
                                { label: 'Email', value: doc?.email, icon: '✉️' },
                                { label: 'Phone', value: doc?.phone || '—', icon: '📞' },
                                { label: 'Registered', value: approval.createdAt ? new Date(approval.createdAt as any).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—', icon: '📅' },
                            ].map(item => (
                                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                                    <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
                                        <span>{item.icon}</span>{item.label}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700 break-all">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Qualification', value: doc?.qualification || '—', icon: '🎓' },
                                { label: 'Specialization', value: doc?.specialization || '—', icon: '🏥' },
                                { label: 'Experience', value: doc?.yearsExperience != null ? `${doc.yearsExperience} Years` : '—', icon: '⏱️' },
                                { label: 'License No.', value: doc?.licenseNumber || '—', icon: '📋' },
                            ].map(item => (
                                <div key={item.label} className="bg-blue-50 rounded-xl p-3">
                                    <div className="text-xs text-blue-400 mb-0.5 flex items-center gap-1.5">
                                        <span>{item.icon}</span>{item.label}
                                    </div>
                                    <div className="text-sm font-semibold text-blue-800">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* License Document */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">License Document</h3>
                        {licenseUrl ? (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {isPdf ? (
                                    <div>
                                        <iframe
                                            src={licenseUrl}
                                            className="w-full h-64 border-0"
                                            title="License Document"
                                        />
                                        <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7 2C5.34 2 4 3.34 4 5v14c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V8l-6-6H7zm0 2h6v5h5v11H7V4zm2 7v1h6v-1H9zm0 3v1h6v-1H9zm0 3v1h4v-1H9z" />
                                                </svg>
                                                PDF Document
                                            </span>
                                            <a href={licenseUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                                Open in new tab ↗
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <img src={licenseUrl} alt="License Document" className="w-full object-contain max-h-80" />
                                        <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                            <span className="text-xs text-gray-500">Image Document</span>
                                            <a href={licenseUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                                Open full size ↗
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                <div className="text-2xl mb-1">📂</div>
                                <p className="text-amber-700 text-sm font-medium">No document uploaded</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => onReject(approval.id)}
                            disabled={actionLoading === approval.id}
                            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60"
                        >
                            {actionLoading === approval.id ? <Spinner size="sm" /> : '✕ Reject Registration'}
                        </button>
                        <button
                            onClick={() => onApprove(approval.id)}
                            disabled={actionLoading === approval.id}
                            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
                        >
                            {actionLoading === approval.id ? <Spinner size="sm" /> : '✓ Approve Doctor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('approvals');
    const [pendingApprovals, setPendingApprovals] = useState<DoctorApproval[]>([]);
    const [doctors, setDoctors] = useState<DoctorDetails[]>([]);
    const [patients, setPatients] = useState<PatientDetails[]>([]);
    const [stats, setStats] = useState<AdminStats>({ activeDoctors: 0, pendingApprovals: 0, totalPatients: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedApproval, setSelectedApproval] = useState<DoctorApproval | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        if (activeTab === 'doctors' && doctors.length === 0) loadDoctors();
        else if (activeTab === 'patients' && patients.length === 0) loadPatients();
    }, [activeTab]);

    const loadData = async () => {
        try {
            const [approvalsRes, statsRes] = await Promise.all([api.getPendingApprovals(), api.getDashboardStats()]);
            if (approvalsRes.success && approvalsRes.data) setPendingApprovals(approvalsRes.data);
            if (statsRes.success && statsRes.data) setStats(statsRes.data);
        } catch { toast.error('Failed to load dashboard data'); }
        finally { setIsLoading(false); }
    };

    const loadDoctors = async () => {
        try {
            const r = await api.getAllDoctors();
            if (r.success && r.data) setDoctors(r.data);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to load doctors'); }
    };

    const loadPatients = async () => {
        try {
            const r = await api.getAllPatients();
            if (r.success && r.data) setPatients(r.data);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to load patients'); }
    };

    const handleApprove = async (approvalId: string) => {
        setActionLoading(approvalId);
        try {
            const r = await api.approveDoctor(approvalId);
            if (r.success) { toast.success('Doctor approved!'); setSelectedApproval(null); await loadData(); }
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to approve'); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (approvalId: string) => {
        const note = prompt('Enter rejection reason (optional):');
        setActionLoading(approvalId);
        try {
            const r = await api.rejectDoctor(approvalId, note || undefined);
            if (r.success) { toast.success('Registration rejected'); setSelectedApproval(null); await loadData(); }
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to reject'); }
        finally { setActionLoading(null); }
    };

    const handleDeleteDoctor = async (doctorId: string) => {
        if (!confirm('Delete this doctor?')) return;
        setActionLoading(doctorId);
        try {
            const r = await api.deleteDoctor(doctorId);
            if (r.success) { toast.success('Doctor deleted'); setDoctors(doctors.filter(d => d.id !== doctorId)); setSelectedDoctor(null); await loadData(); }
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to delete'); }
        finally { setActionLoading(null); }
    };

    const handleDeletePatient = async (patientId: string) => {
        if (!confirm('Delete this patient?')) return;
        setActionLoading(patientId);
        try {
            const r = await api.deletePatient(patientId);
            if (r.success) { toast.success('Patient deleted'); setPatients(patients.filter(p => p.id !== patientId)); setSelectedPatient(null); await loadData(); }
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to delete'); }
        finally { setActionLoading(null); }
    };

    const statItems = [
        { label: 'Total Doctors', value: stats.activeDoctors, icon: '👨‍⚕️', color: 'blue', onClick: () => setActiveTab('doctors') },
        { label: 'Pending Approvals', value: stats.pendingApprovals, icon: '⏳', color: 'amber', onClick: () => setActiveTab('approvals') },
        { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: 'purple', onClick: () => setActiveTab('patients') },
        { label: 'Token Transactions', value: 'Live', icon: '🎫', color: 'green', onClick: () => window.location.href = '/admin/tokens' },
    ];

    return (
        <div className="page-bg">
            <Sidebar userRole="admin" userName={user?.fullName} />

            {/* Patient Modal */}
            {selectedPatient && (
                <PatientModal
                    patient={selectedPatient}
                    actionLoading={actionLoading}
                    onDelete={handleDeletePatient}
                    onClose={() => setSelectedPatient(null)}
                />
            )}

            {/* Active Doctor Modal */}
            {selectedDoctor && (
                <ActiveDoctorModal
                    doctor={selectedDoctor}
                    actionLoading={actionLoading}
                    onDelete={handleDeleteDoctor}
                    onClose={() => setSelectedDoctor(null)}
                />
            )}

            {/* Pending Approval Modal */}
            {selectedApproval && (
                <DoctorDetailModal
                    approval={selectedApproval}
                    actionLoading={actionLoading}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClose={() => setSelectedApproval(null)}
                />
            )}

            <div className="main-container">
                {/* Header */}
                <div className="app-header animate-slide-down">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome, {user?.fullName}!</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Online
                        </div>
                        <button onClick={logout} className="btn-ghost text-sm">Logout</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                    {statItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={item.onClick}
                            className="app-card app-card-hover flex items-center gap-4 cursor-pointer"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${item.color === 'blue' ? 'bg-blue-100' :
                                    item.color === 'amber' ? 'bg-amber-100' :
                                        item.color === 'green' ? 'bg-green-100' :
                                            'bg-purple-100'
                                }`}>{item.icon}</div>
                            <div className="flex-1">
                                <div className={`text-2xl font-bold ${item.color === 'blue' ? 'text-blue-600' :
                                        item.color === 'amber' ? 'text-amber-600' :
                                            item.color === 'green' ? 'text-green-600' :
                                                'text-purple-600'
                                    }`}>{item.value}</div>
                                <div className="text-gray-500 text-sm">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    {([
                        { id: 'approvals', label: `Pending (${stats.pendingApprovals})` },
                        { id: 'doctors', label: `Doctors (${stats.activeDoctors})` },
                        { id: 'patients', label: `Patients (${stats.totalPatients})` },
                    ] as { id: TabType; label: string }[]).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="custom-scrollbar" style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>

                    {/* ── Pending Approvals ── */}
                    {activeTab === 'approvals' && (
                        <div className="space-y-3 animate-slide-up">
                            <h2 className="text-base font-bold text-gray-700">Pending Doctor Registrations</h2>
                            {isLoading ? (
                                <div className="app-card flex justify-center py-10"><Spinner size="lg" /></div>
                            ) : pendingApprovals.length === 0 ? (
                                <div className="app-card text-center py-10">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">No pending approvals</p>
                                </div>
                            ) : (
                                pendingApprovals.map((approval) => (
                                    <div key={approval.id} className="app-card app-card-hover flex items-center gap-4">
                                        <Avatar name={approval.doctor?.fullName} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800">{approval.doctor?.fullName}</h3>
                                            <p className="text-gray-500 text-sm">{(approval.doctor as any)?.qualification} · {approval.doctor?.specialization}</p>
                                            <p className="text-gray-400 text-xs">{approval.doctor?.email}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            {/* VIEW DETAILS */}
                                            <button
                                                onClick={() => setSelectedApproval(approval)}
                                                className="text-blue-600 hover:bg-blue-50 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleApprove(approval.id)}
                                                disabled={actionLoading === approval.id}
                                                className="btn-green text-sm px-4"
                                            >
                                                {actionLoading === approval.id ? '...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(approval.id)}
                                                disabled={actionLoading === approval.id}
                                                className="btn-red text-sm px-4"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── All Doctors ── */}
                    {activeTab === 'doctors' && (
                        <div className="space-y-3 animate-slide-up">
                            <h2 className="text-base font-bold text-gray-700">All Doctors</h2>
                            {doctors.length === 0 ? (
                                <div className="app-card text-center py-10">
                                    <div className="text-5xl mb-3">👨‍⚕️</div>
                                    <p className="text-gray-500">No doctors found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {doctors.map((doctor) => (
                                        <div
                                            key={doctor.id}
                                            className="app-card app-card-hover flex items-start gap-4 cursor-pointer"
                                            onClick={() => setSelectedDoctor(doctor)}
                                        >
                                            <Avatar name={doctor.fullName} size="lg" status={(doctor as any).isOnline ? 'online' : 'offline'} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-800 text-sm">{doctor.fullName}</h3>
                                                <p className="text-gray-500 text-xs">{doctor.specialization}</p>
                                                <p className="text-gray-400 text-xs truncate">{doctor.email}</p>
                                                <div className="mt-1.5 flex gap-1.5">
                                                    <Badge variant="approve">Active</Badge>
                                                    {(doctor as any).isOnline && <Badge variant="active">Online</Badge>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteDoctor(doctor.id); }}
                                                disabled={actionLoading === doctor.id}
                                                className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors flex-shrink-0"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── All Patients ── */}
                    {activeTab === 'patients' && (
                        <div className="space-y-3 animate-slide-up">
                            <h2 className="text-base font-bold text-gray-700">All Patients</h2>
                            {patients.length === 0 ? (
                                <div className="app-card text-center py-10">
                                    <div className="text-5xl mb-3">👥</div>
                                    <p className="text-gray-500">No patients found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {patients.map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="app-card app-card-hover cursor-pointer"
                                            onClick={() => setSelectedPatient(patient)}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Avatar name={patient.fullName} size="md" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 text-sm truncate">{patient.fullName}</h3>
                                                    <p className="text-gray-400 text-xs truncate">{patient.email}</p>
                                                    <p className="text-gray-400 text-xs">{patient.phone}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id); }}
                                                    disabled={actionLoading === patient.id}
                                                    className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors flex-shrink-0"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Admin profile */}
                <div className="mt-5 app-card flex items-center justify-between cursor-pointer app-card-hover">
                    <div className="flex items-center gap-3">
                        <Avatar name={user?.fullName} size="md" />
                        <div>
                            <div className="font-semibold text-gray-800 text-sm">{user?.fullName}</div>
                            <div className="text-gray-400 text-xs">My Profile</div>
                        </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
