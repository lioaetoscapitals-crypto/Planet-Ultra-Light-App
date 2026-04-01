import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import Button from "./Button";
import { societiesService } from "../../services/api";
import { getSelectedSocietyId, setSelectedSocietyId } from "../../services/societySelection";
import type { SocietyEntity } from "../../services/api/types";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  const { user, logout, isLoading } = useAuth();
  const { mode, setMode } = useTheme();
  const [societies, setSocieties] = useState<SocietyEntity[]>([]);
  const [selectedSocietyId, setSelectedSocietyIdState] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const items = await societiesService.list();
      setSocieties(items);
      if (items.length === 0) {
        setSelectedSocietyIdState("");
        return;
      }

      const current = getSelectedSocietyId();
      const valid = current && items.some((society) => society.id === current);
      const nextId = valid ? current : items[0].id;
      setSelectedSocietyIdState(nextId);
      setSelectedSocietyId(nextId);
    };
    void load();
  }, []);

  const selectedSocietyName = useMemo(() => {
    return societies.find((society) => society.id === selectedSocietyId)?.name ?? "Select Society";
  }, [selectedSocietyId, societies]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header className="bo-header">
      <div>
        <h2 className="bo-header-title">{title}</h2>
        <p className="bo-header-subtitle">Manage residents, operations and platform settings.</p>
      </div>
      <div className="bo-header-actions">
        <div className="bo-society-switch">
          <label htmlFor="bo-society-select" className="bo-input-label">Society</label>
          <select
            id="bo-society-select"
            className="bo-input bo-select"
            value={selectedSocietyId}
            onChange={(event) => {
              const next = event.target.value;
              setSelectedSocietyIdState(next);
              setSelectedSocietyId(next);
            }}
          >
            {societies.length === 0 ? <option value="">{selectedSocietyName}</option> : null}
            {societies.map((society) => (
              <option key={society.id} value={society.id}>
                {society.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bo-profile" ref={profileRef}>
          <button className="bo-profile-trigger" onClick={() => setProfileOpen((prev) => !prev)}>
            <span className="bo-header-user-name">{user?.name ?? "Admin"}</span>
            <span className="bo-header-user-role">{user?.role ?? "Admin"}</span>
          </button>
          {profileOpen ? (
            <div className="bo-profile-menu">
              <div className="bo-select-wrap">
                <label htmlFor="bo-theme-select" className="bo-input-label">Theme</label>
                <select
                  id="bo-theme-select"
                  className="bo-input bo-select"
                  value={mode}
                  onChange={(event) => setMode(event.target.value === "light" ? "light" : "dark")}
                >
                  <option value="dark">Dark</option>
                  <option value="light">White</option>
                </select>
              </div>
              <Button variant="secondary" onClick={() => void logout()} disabled={isLoading}>
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
