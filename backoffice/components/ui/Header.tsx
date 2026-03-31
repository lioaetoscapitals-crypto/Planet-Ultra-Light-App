import { useEffect, useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Button from "./Button";
import { societiesService } from "../../services/api";
import { getSelectedSocietyId, setSelectedSocietyId } from "../../services/societySelection";
import type { SocietyEntity } from "../../services/api/types";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  const { user, logout, isLoading } = useAuth();
  const [societies, setSocieties] = useState<SocietyEntity[]>([]);
  const [selectedSocietyId, setSelectedSocietyIdState] = useState<string>("");

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
        <div className="bo-header-user">
          <span className="bo-header-user-name">{user?.name ?? "Admin"}</span>
          <span className="bo-header-user-role">{user?.role ?? "Admin"}</span>
        </div>
        <Button variant="secondary" onClick={() => void logout()} disabled={isLoading}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
