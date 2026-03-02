import React from 'react';
import { Button } from './Button';
import { BellAlertIcon } from '@heroicons/react/24/outline';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorName: string;
    tokenNumber: number | string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    doctorName,
    tokenNumber
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop Blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 p-8 text-center animate-slide-up">

                {/* Bell Icon Circle */}
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative mb-6">
                    {/* Pulsing ring behind the bell */}
                    <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
                    <BellAlertIcon className="w-10 h-10 text-blue-600 relative z-10 animate-bounce" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                    It's Your Turn!
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    You are called by <strong className="text-slate-800 font-semibold">{doctorName}</strong>.
                    Please proceed to the consultation room.
                </p>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8">
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">Your Token</p>
                    <p className="text-4xl font-extrabold text-blue-600">#{tokenNumber}</p>
                </div>

                <Button
                    variant="primary"
                    className="w-full py-3.5 text-lg"
                    onClick={onClose}
                >
                    Okay, I'm going
                </Button>
            </div>
        </div>
    );
};
