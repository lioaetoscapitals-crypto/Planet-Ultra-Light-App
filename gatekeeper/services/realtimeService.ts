type Listener = (payload: unknown) => void;

const listeners = new Map<string, Set<Listener>>();

export const realtimeService = {
  subscribe(channel: string, listener: Listener) {
    const set = listeners.get(channel) ?? new Set<Listener>();
    set.add(listener);
    listeners.set(channel, set);
    return () => {
      const existing = listeners.get(channel);
      existing?.delete(listener);
    };
  },
  emit(channel: string, payload: unknown) {
    const set = listeners.get(channel);
    if (!set) return;
    set.forEach((listener) => listener(payload));
  }
};
