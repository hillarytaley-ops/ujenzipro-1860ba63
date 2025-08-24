import { useState, useEffect } from 'react';

interface OfflineDetectorProps {
  children: React.ReactNode;
}

export const OfflineDetector: React.FC<OfflineDetectorProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {showOfflineMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-2 text-center text-sm">
          ⚠️ You're currently offline. Some features may not work as expected.
        </div>
      )}
      <div className={showOfflineMessage ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  );
};

// Hook for checking online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};