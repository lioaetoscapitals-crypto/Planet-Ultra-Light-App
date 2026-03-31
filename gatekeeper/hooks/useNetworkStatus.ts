import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline };
}
