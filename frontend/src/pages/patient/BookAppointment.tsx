import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import type { Doctor, Session } from '../../types';
import toast from 'react-hot-toast';


export const BookAppointment: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [sessions, setSessions] = useState<{ [key: string]: Session }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState<string | null>(null);

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const response = await api.getDoctors();
            console.log('📋 Doctors response:', response);
            if (response.success && response.data?.doctors) {
                const activeDoctors = response.data.doctors.filter((d: Doctor) => d.isActive);
                setDoctors(activeDoctors);

                // Load sessions for each doctor
                for (const doctor of activeDoctors) {
                    loadDoctorSession(doctor.id);
                }
            }
        } catch (error) {
            console.error('Failed to load doctors:', error);
            toast.error('Failed to load doctors');
        } finally {
            setIsLoading(false);
        }
    };

    const loadDoctorSession = async (doctorId: string) => {
        try {
            const response = await api.getDoctorSession(doctorId);
            if (response.success && response.data?.session) {
                const sessionData = response.data.session;
                setSessions(prev => ({ ...prev, [doctorId]: sessionData }));
            }
        } catch (error) {
            console.error(`Failed to load session for doctor ${doctorId}:`, error);
        }
    };

    const handleBookToken = async (doctorId: string) => {
        const session = sessions[doctorId];
        if (!session || session.status !== 'ACTIVE') {
            toast.error('Doctor session is not active');
            return;
        }

        setBookingLoading(doctorId);
        try {
            const response = await api.bookToken(doctorId);
            if (response.success) {
                toast.success('Token booked successfully!');
                navigate('/patient');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to book token');
        } finally {
            setBookingLoading(null);
        }
    };

    const getSessionStatus = (doctorId: string) => {
        const session = sessions[doctorId];
        if (!session) return { text: 'No session', color: 'text-gray-500', canBook: false };

        switch (session.status) {
            case 'ACTIVE':
                const remaining = session.maxTokenNo - session.currentTokenNo;
                return {
                    text: `Active - ${remaining} slots left`,
                    color: 'text-green-600 dark:text-green-400',
                    canBook: remaining > 0
                };
            case 'PAUSED':
                return { text: 'Paused', color: 'text-yellow-600 dark:text-yellow-400', canBook: false };
            case 'ENDED':
                return { text: 'Session ended', color: 'text-red-600 dark:text-red-400', canBook: false };
            default:
                return { text: 'Not started', color: 'text-gray-500', canBook: false };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold gradient-text">📅 Book Appointment</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/patient')}>
                            ← Back to Dashboard
                        </Button>
                        <span className="text-gray-700 dark:text-gray-300">{user?.fullName}</span>
                        <Button variant="ghost" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Available Doctors
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Select a doctor with an active session to book your token
                    </p>
                </Card>

                {isLoading ? (
                    <div className="py-12">
                        <Spinner size="lg" />
                    </div>
                ) : doctors.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                No doctors available at the moment
                            </p>
                            <Button onClick={() => navigate('/patient')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => {
                            const sessionStatus = getSessionStatus(doctor.id);
                            const session = sessions[doctor.id];

                            return (
                                <Card key={doctor.id} className="hover:shadow-xl transition-shadow">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {doctor.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                Dr. {doctor.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {doctor.specialization}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Qualification:</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {doctor.qualification}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {doctor.yearsExperience} years
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${sessionStatus.color}`}>
                                                {sessionStatus.text}
                                            </span>
                                        </div>
                                        {session && session.status === 'ACTIVE' && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Current Token:</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {session.currentTokenNo} / {session.maxTokenNo}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => handleBookToken(doctor.id)}
                                        disabled={!sessionStatus.canBook}
                                        isLoading={bookingLoading === doctor.id}
                                        className="w-full"
                                    >
                                        {sessionStatus.canBook ? 'Book Token' : 'Not Available'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
