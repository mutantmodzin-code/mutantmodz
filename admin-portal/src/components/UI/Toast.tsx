import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
    id: string;
    message: string;
    type: 'success' | 'error';
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full duration-300 ${type === 'success' ? 'bg-zinc-900 border border-green-500/50 text-white' : 'bg-red-950 border border-red-500/50 text-white'
            }`}>
            {type === 'success' ? (
                <CheckCircle className="text-green-500" size={20} />
            ) : (
                <AlertCircle className="text-red-500" size={20} />
            )}
            <p className="text-sm font-bold min-w-[200px]">{message}</p>
            <button onClick={() => onClose(id)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};
