import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  timestamp: number;
  read: boolean;
  location?: string;
  severity?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  alertCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setAlertCount: (count: number) => void;
  incrementAlertCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Sound effect for notifications
const playNotificationSound = () => {
  try {
    // Try to play the alert sound file first
    const audio = new Audio('/assets/alert.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Fallback: Use Web Audio API to generate a notification sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create oscillator for the notification beep
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure sound - two-tone alert
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2); // A5
        
        oscillator.type = 'sine';
        
        // Envelope
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } catch (e) {
        console.log('Audio notification not supported');
      }
    });
  } catch (e) {
    console.log('Audio notification failed');
  }
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertCount, setAlertCount] = useState(8); // Initial count from mock data
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    
    // Play sound for new notifications
    playNotificationSound();
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  }, []);
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const incrementAlertCount = useCallback(() => {
    setAlertCount(prev => prev + 1);
  }, []);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      alertCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      setAlertCount,
      incrementAlertCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
