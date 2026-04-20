import React from 'react';
import useToastStore from '../store/useToastStore';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ id, message, type, removeToast }) => {
  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-rose-500" />,
    warning: <AlertCircle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={`flex items-center gap-3 p-4 pr-12 rounded-2xl border shadow-xl animate-in fade-in slide-in-from-right-8 duration-300 pointer-events-auto min-w-[300px] relative ${bgColors[type] || 'bg-white border-slate-200'}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="text-sm font-bold text-slate-700">{message}</div>
      <button 
        onClick={() => removeToast(id)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-400"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} removeToast={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
