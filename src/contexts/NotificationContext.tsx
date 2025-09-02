import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  };

  const showInfo = (message: string) => {
    toast.info(message, {
      duration: 4000,
    });
  };

  const showWarning = (message: string) => {
    toast.warning(message, {
      duration: 4500,
    });
  };

  const value: NotificationContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}