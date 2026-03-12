import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { isOGSWebView, getDeviceId, onDeviceIdChange } from './core';

interface NotificationContextValue {
  isInOGSApp: boolean;
  isSupported: boolean;
  deviceId: string | null;
}

const NotificationContext = createContext<NotificationContextValue>({
  isInOGSApp: false,
  isSupported: false,
  deviceId: null,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(() => getDeviceId());
  const isInOGSApp = isOGSWebView();

  useEffect(() => {
    if (!isInOGSApp) return;
    const unsubscribe = onDeviceIdChange(setDeviceId);
    return unsubscribe;
  }, [isInOGSApp]);

  return (
    <NotificationContext.Provider value={{
      isInOGSApp,
      isSupported: isInOGSApp && deviceId !== null,
      deviceId,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

export { NotificationContext };
