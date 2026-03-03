import React from 'react';
import { Token } from '../../types';
import { Avatar } from '../ui/Avatar';

interface PatientDetailsModalProps {
    token: Token;
    onClose: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ token, onClose }) => {
    const patient = token.patient;

    if (!patient) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Patient Details</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar name={patient.fullName} size="lg" />
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">{patient.fullName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${token.status === 'SERVED' ? 'bg-green-100 text-green-700' :
                                    token.status === 'CALLED' ? 'bg-purple-100 text-purple-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    Token {token.tokenNo}
                                </span>
                                <span className="text-sm text-gray-500 capitalize">{token.status.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Gender</div>
                                <div className="text-sm font-medium text-gray-800">
                                    {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex === 'O' ? 'Other' : '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
                                <div className="text-sm font-medium text-gray-800">
                                    {patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <h5 className="text-sm font-bold text-gray-700">Contact Information</h5>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="text-sm text-gray-800 flex-1">{patient.address || 'Address not provided'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
