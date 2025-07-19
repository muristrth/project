import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-500';
      case 'error':
        return 'bg-red-900 border-red-500';
      case 'warning':
        return 'bg-yellow-900 border-yellow-500';
      case 'info':
        return 'bg-blue-900 border-blue-500';
      default:
        return 'bg-blue-900 border-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg border backdrop-blur-sm ${getBackgroundColor(toast.type)} animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-center space-x-3">
            {getIcon(toast.type)}
            <p className="text-white text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;