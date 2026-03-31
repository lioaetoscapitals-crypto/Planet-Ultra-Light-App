const STORAGE_KEY = "planet.backoffice.selectedSocietyId";
const EVENT_NAME = "planet:bo:society-changed";

export function getSelectedSocietyId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setSelectedSocietyId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: id }));
}

export function subscribeSelectedSociety(callback: (id: string | null) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => callback(getSelectedSocietyId());
  window.addEventListener(EVENT_NAME, handler as EventListener);
  return () => {
    window.removeEventListener(EVENT_NAME, handler as EventListener);
  };
}
