import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { monitorNetworkStatus, isOnline } from "../utils/errorHandling";

interface NetworkStatusProps {
  showOfflineOnly?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showOfflineOnly = false,
}) => {
  const [online, setOnline] = useState(isOnline());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setOnline(false);
      setVisible(true);
    };

    const handleOnline = () => {
      setOnline(true);
      // Keep the "back online" message visible for a moment
      setTimeout(() => {
        if (showOfflineOnly) {
          setVisible(false);
        }
      }, 3000);
    };

    // Initialize visibility based on current status and props
    setVisible(!online || !showOfflineOnly);

    // Set up network monitoring
    const cleanup = monitorNetworkStatus(handleOffline, handleOnline);
    return cleanup;
  }, [showOfflineOnly]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md px-4 py-2 shadow-lg ${online ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
    >
      {online ? (
        <>
          <Wifi size={18} />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span>You are offline</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
