import { useEffect, useState } from "react";
import { getQueue, type OfflineAction } from "../services/offlineQueueService";

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineAction[]>([]);

  useEffect(() => {
    void getQueue().then(setQueue);
  }, []);

  return {
    queue,
    queueCount: queue.length
  };
}
