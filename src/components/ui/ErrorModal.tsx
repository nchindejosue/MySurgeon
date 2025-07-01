import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
  onRetry,
  showRetry = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <AlertTriangle className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className={`p-4 rounded-lg border ${getColors()}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        {showRetry && onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </Button>
        )}
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};