import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "gatekeeper.offline.queue";

export type OfflineAction = {
  id: string;
  type: "create_entry" | "check_in" | "check_out";
  payload: unknown;
  createdAt: string;
};

export async function getQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [] as OfflineAction[];
  try {
    return JSON.parse(raw) as OfflineAction[];
  } catch {
    return [] as OfflineAction[];
  }
}

export async function enqueueAction(action: OfflineAction) {
  const queue = await getQueue();
  queue.push(action);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
