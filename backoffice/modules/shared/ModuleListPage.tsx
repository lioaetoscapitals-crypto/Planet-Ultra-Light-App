import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageContainer from "../../components/common/PageContainer";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import type { ModuleKey } from "../../services/api/types";
import { moduleRegistry } from "./moduleRegistry";
import { subscribeSelectedSociety } from "../../services/societySelection";

type Props = {
  moduleKey: ModuleKey;
  baseRoute: string;
};

const PAGE_SIZE = 10;

function toCsvValue(value: unknown) {
  const raw = String(value ?? "-").replaceAll('"', '""');
  return `"${raw}"`;
}

export default function ModuleListPage({ moduleKey, baseRoute }: Props) {
  const navigate = useNavigate();
  const config = moduleRegistry[moduleKey];
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = async () => {
    const next = await config.service.list();
    setItems(next);
  };

  useEffect(() => {
    void refresh();
  }, [config.service]);

  useEffect(() => {
    return subscribeSelectedSociety(() => {
      setPage(1);
      void refresh();
    });
  }, [config.service]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let next = items;
    if (normalized) {
      next = next.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(normalized)));
    }
    if (config.roleFilter && roleFilter !== "all") {
      next = next.filter((item) => String(item.role ?? "").toLowerCase() === roleFilter);
    }
    return next;
  }, [config.roleFilter, items, query, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const handleDelete = async (id: string) => {
    if (!config.service.remove) return;
    const confirmed = window.confirm(`Delete this ${config.singularLabel.toLowerCase()}?`);
    if (!confirmed) return;
    setError("");
    try {
      await config.service.remove(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleExport = () => {
    if (filteredItems.length === 0) return;
    const headers = config.columns.map((column) => column.header);
    const keys = config.columns.map((column) => column.key);
    const csvLines = [
      headers.map(toCsvValue).join(","),
      ...filteredItems.map((item) => keys.map((key) => toCsvValue(item[key] ?? "-")).join(",")),
    ];
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.key}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (file: File) => {
    if (moduleKey !== "apartments") return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setError("CSV is empty. Expected header and rows.");
      return;
    }

    const rows = lines.slice(1).map((line) => line.split(",").map((value) => value.trim()));
    let createdCount = 0;
    for (const cols of rows) {
      const [societyId, towerId, unitNumber] = cols;
      if (!societyId || !towerId || !unitNumber) continue;
      try {
        await config.service.create({ societyId, towerId, unitNumber });
        createdCount += 1;
      } catch {
        // continue uploading remaining rows
      }
    }
    await refresh();
    setError(createdCount > 0 ? "" : "No apartments were created from CSV. Check format: societyId,towerId,unitNumber");
  };

  const tableRows: Array<Record<string, React.ReactNode>> = pagedItems.map((item) => {
    const row: Record<string, React.ReactNode> = {
      id: String(item.id ?? ""),
    };
    config.columns.forEach((column) => {
      if (column.key === "actions") {
        row[column.key] = (
          <div className="bo-row-actions">
            <Button variant="secondary" onClick={() => navigate(`${baseRoute}/${String(item.id)}`)}>View</Button>
            <Button variant="secondary" onClick={() => navigate(`${baseRoute}/${String(item.id)}/edit`)}>Edit</Button>
            <Button variant="secondary" onClick={() => navigate(`${baseRoute}/${String(item.id)}`)}>Settings</Button>
            {config.service.remove ? (
              <Button variant="ghost" onClick={() => void handleDelete(String(item.id))}>Delete</Button>
            ) : null}
          </div>
        );
      } else {
        row[column.key] = String(item[column.key] ?? "-");
      }
    });
    return row;
  });

  return (
    <PageContainer title={config.label} subtitle={config.subtitle ?? `${config.singularLabel} list view with filterable records.`} showHeader={false}>
      <Card>
        <div className="bo-toolbar">
          <div className="bo-list-filters">
            {config.roleFilter ? (
              <div className="bo-select-wrap">
                <label htmlFor={`role-filter-${moduleKey}`} className="bo-input-label">Select Role</label>
                <select
                  id={`role-filter-${moduleKey}`}
                  className="bo-input bo-select"
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="guest">Guest</option>
                  <option value="resident">Resident</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ) : null}
            <Input
              label="Search"
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Search"
            />
          </div>
          <div className="bo-list-actions">
            <Link to={`${baseRoute}/new`} className="bo-link-reset">
              <Button>{config.createLabel ?? `Create ${config.singularLabel}`}</Button>
            </Link>
            {config.secondaryLabel ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (moduleKey === "apartments") {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {config.secondaryLabel}
                </Button>
                {moduleKey === "apartments" ? (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="bo-hidden-input"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleBulkUpload(file);
                      }
                      event.target.value = "";
                    }}
                  />
                ) : null}
              </>
            ) : null}
            {config.tertiaryLabel ? <Button variant="secondary" onClick={handleExport}>{config.tertiaryLabel}</Button> : null}
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <p className="bo-form-error">{error}</p>
        </Card>
      ) : null}

      <Card title={`${config.label} Table`}>
        <Table columns={config.columns} rows={tableRows} />
        <div className="bo-pagination">
          <span className="bo-pagination-meta">
            Showing {(page - 1) * PAGE_SIZE + (pagedItems.length > 0 ? 1 : 0)}-{(page - 1) * PAGE_SIZE + pagedItems.length} of {filteredItems.length}
          </span>
          <div className="bo-pagination-actions">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            <span className="bo-pagination-page">Page {page} / {totalPages}</span>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
