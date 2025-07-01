import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ErrorModal } from '../components/ui/ErrorModal';

interface ErrorInfo {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  showRetry?: boolean;
}

interface ErrorContextType {
  showError: (error: ErrorInfo) => void;
  showFirebaseError: (operation: string, error?: any) => void;
  showServiceUnavailable: (service: string, operation: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showError = (error: ErrorInfo) => {
    setErrorInfo(error);
    setIsModalOpen(true);
  };

  const showFirebaseError = (operation: string, error?: any) => {
    const errorMessage = error?.message || 'Unknown error occurred';
    
    let userFriendlyMessage = '';
    
    if (errorMessage.includes('auth/user-not-found')) {
      userFriendlyMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
    } else if (errorMessage.includes('auth/wrong-password')) {
      userFriendlyMessage = 'Incorrect password. Please try again.';
    } else if (errorMessage.includes('auth/email-already-in-use')) {
      userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
    } else if (errorMessage.includes('auth/weak-password')) {
      userFriendlyMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (errorMessage.includes('auth/invalid-email')) {
      userFriendlyMessage = 'Please enter a valid email address.';
    } else if (errorMessage.includes('Firebase not available')) {
      userFriendlyMessage = 'Authentication service is currently unavailable. Please check your internet connection and try again.';
    } else {
      userFriendlyMessage = `Failed to ${operation}. ${errorMessage}`;
    }

    showError({
      title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} Failed`,
      message: userFriendlyMessage,
      type: 'error',
      showRetry: true,
      onRetry: () => {
        setIsModalOpen(false);
        // The retry logic will be handled by the calling component
      }
    });
  };

  const showServiceUnavailable = (service: string, operation: string) => {
    showError({
      title: `${service} Service Unavailable`,
      message: `The ${service} service is currently unavailable. You can continue using the app, but ${operation} functionality will be limited. Please check your internet connection and try again later.`,
      type: 'warning',
      showRetry: true,
      onRetry: () => {
        setIsModalOpen(false);
        window.location.reload(); // Simple retry by reloading
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorInfo(null);
  };

  const handleRetry = () => {
    if (errorInfo?.onRetry) {
      errorInfo.onRetry();
    }
    closeModal();
  };

  return (
    <ErrorContext.Provider value={{ showError, showFirebaseError, showServiceUnavailable }}>
      {children}
      {errorInfo && (
        <ErrorModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={errorInfo.title}
          message={errorInfo.message}
          type={errorInfo.type}
          onRetry={errorInfo.showRetry ? handleRetry : undefined}
          showRetry={errorInfo.showRetry}
        />
      )}
    </ErrorContext.Provider>
  );
};