import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Sidebar } from '../components/layout/Sidebar';
import { Avatar } from '../components/ui/Avatar';
import { Spinner } from '../components/ui/Spinner';

export const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: (user as any)?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        workingHoursStart: (user as any)?.workingHoursStart || '',
        workingHoursEnd: (user as any)?.workingHoursEnd || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    toast.error('New passwords do not match');
                    setIsSaving(false);
                    return;
                }
                if (!formData.currentPassword) {
                    toast.error('Current password is required to change password');
                    setIsSaving(false);
                    return;
                }
            }

            const updateData: any = {
                fullName: formData.fullName,
                email: formData.email
            };
            if (formData.phone) updateData.phone = formData.phone;
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }
            if (user?.role === 'doctor') {
                updateData.workingHoursStart = formData.workingHoursStart;
                updateData.workingHoursEnd = formData.workingHoursEnd;
            }

            const response = await api.updateProfile(updateData);
            if (response.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: (user as any)?.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            workingHoursStart: (user as any)?.workingHoursStart || '',
            workingHoursEnd: (user as any)?.workingHoursEnd || ''
        });
    };

    const inputClass = `w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
        bg-white transition-all`;

    const readonlyField = (value: string) => (
        <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 text-sm">
            {value || '—'}
        </div>
    );

    return (
        <div className="page-bg">
            <Sidebar userRole={user?.role as any} userName={user?.fullName} />

            <div className="main-container">
                {/* Header */}
                <div className="app-header animate-slide-down">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">⚙️ Settings</h1>
                        <p className="text-sm text-gray-500">Manage your account settings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/${user?.role}`)}
                            className="btn-ghost text-sm"
                        >
                            ← Back to Dashboard
                        </button>
                        <button onClick={logout} className="btn-ghost text-sm">Logout</button>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-4 animate-slide-up">
                    {/* Profile Card */}
                    <div className="app-card">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold text-gray-700">Profile Information</h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-primary text-sm px-5"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Avatar + Name */}
                        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                            <Avatar name={user?.fullName} size="xl" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{user?.fullName}</h3>
                                <p className="text-gray-500 text-sm capitalize">{user?.role}</p>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    />
                                ) : readonlyField(user?.fullName || '')}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                    Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    />
                                ) : readonlyField(user?.email || '')}
                            </div>

                            {/* Phone (patient/doctor only) */}
                            {(user?.role === 'patient' || user?.role === 'doctor') && (
                                <div>
                                    <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            placeholder="Enter phone number"
                                        />
                                    ) : readonlyField((user as any)?.phone || 'Not provided')}
                                </div>
                            )}

                            {/* Date of Birth and Sex (patient/doctor only) */}
                            {(user?.role === 'patient' || user?.role === 'doctor') && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                            Date of Birth
                                        </label>
                                        {readonlyField(
                                            (user as any)?.dob
                                                ? new Date((user as any).dob).toLocaleDateString()
                                                : 'Not provided'
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                            Gender
                                        </label>
                                        {readonlyField(
                                            (user as any)?.sex === 'M' ? 'Male'
                                                : (user as any)?.sex === 'F' ? 'Female'
                                                    : (user as any)?.sex === 'O' ? 'Other'
                                                        : 'Not provided'
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Working Hours (doctor only) */}
                            {user?.role === 'doctor' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                            Working Hours Start
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="time"
                                                name="workingHoursStart"
                                                value={formData.workingHoursStart}
                                                onChange={handleInputChange}
                                                className={inputClass}
                                            />
                                        ) : readonlyField(formData.workingHoursStart)}
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                            Working Hours End
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="time"
                                                name="workingHoursEnd"
                                                value={formData.workingHoursEnd}
                                                onChange={handleInputChange}
                                                className={inputClass}
                                            />
                                        ) : readonlyField(formData.workingHoursEnd)}
                                    </div>
                                </div>
                            )}

                            {/* Role (read-only always) */}
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                    Role
                                </label>
                                {readonlyField(user?.role || '')}
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card (only when editing) */}
                    {isEditing && (
                        <div className="app-card animate-slide-up">
                            <h2 className="text-base font-bold text-gray-700 mb-4">Change Password</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wide">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <p className="text-gray-400 text-xs">Leave blank if you don't want to change your password</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 animate-slide-up">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="btn-ghost px-8"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="btn-green px-8 flex items-center gap-2"
                            >
                                {isSaving ? <><Spinner size="sm" /> Saving...</> : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
