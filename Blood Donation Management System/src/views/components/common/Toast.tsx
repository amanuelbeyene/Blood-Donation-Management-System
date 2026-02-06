import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        // Start exit animation slightly before standard timeout if controlled internally, 
        // but here parent controls removal. We just animate entry.
    }, []);

    const config = {
        success: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-green-500',
            iconColor: 'text-green-500',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        error: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-red-500',
            iconColor: 'text-red-500',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        info: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-blue-500',
            iconColor: 'text-blue-500',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        warning: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-amber-500',
            iconColor: 'text-amber-500',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        }
    };

    const style = config[type];

    return (
        <div
            className={`
                flex items-center gap-4 px-4 py-4 rounded-lg shadow-xl 
                min-w-[320px] max-w-md transform transition-all duration-300 ease-out
                ${style.bg} ${style.border} 
                ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
                backdrop-blur-sm bg-opacity-95 border-gray-100 ring-1 ring-black ring-opacity-5
            `}
            role="alert"
        >
            <div className={`flex-shrink-0 ${style.iconColor}`}>
                {style.icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 capitalize">
                    {type}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                    {message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                title="Close"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
