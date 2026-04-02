import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { ROUTES } from "../../../utils/constants";
import { type BookingEntity } from "../../../services/api/types";
import {
  bookingsService,
  canDeleteBooking,
  canEditBooking,
  canOpenBookingDetails,
  toBookingDisplayStatus,
  type BookingDisplayStatus
} from "../../../services/api/bookingsService";

const PAGE_SIZE = 8;
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function statusBadgeClass(status: BookingDisplayStatus) {
  if (status === "Approved" || status === "Online") return "bo-activity-status bo-activity-status-approved";
  if (status === "ToPay") return "bo-activity-status bo-activity-status-topay";
  if (status === "Rejected") return "bo-activity-status bo-activity-status-rejected";
  if (status === "Refund") return "bo-activity-status bo-activity-status-refund";
  if (status === "Refunded") return "bo-activity-status bo-activity-status-refunded";
  return "bo-activity-status bo-activity-status-waiting";
}

function statusLabel(status: BookingDisplayStatus) {
  if (status === "ToCheck") return "To Check";
  if (status === "ToPay") return "To Pay";
  return status;
}

function actionIcon(symbol: string, title: string) {
  return (
    <span className="bo-activity-icon" aria-hidden="true" title={title}>
      {symbol}
    </span>
  );
}

export default function BookingsListScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<BookingEntity[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ToCheck");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refresh = async () => {
    try {
      const next = await bookingsService.list();
      setItems(next);
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Unable to load activities." });
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const displayStatus = toBookingDisplayStatus(item.status);
      const statusMatches = statusFilter === "All" || displayStatus === statusFilter;
      if (!statusMatches) return false;
      if (!normalized) return true;
      return [item.eventType, item.authorName, item.visibility, item.bookingDate, item.paymentLabel, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleCopyQr = async (booking: BookingEntity) => {
      const qrLink = `${window.location.origin}/invite/${booking.id}`;
      await navigator.clipboard.writeText(qrLink);
      setToast({ kind: "success", message: `QR link copied for ${booking.eventType}.` });
  };

  const handleDelete = async (booking: BookingEntity) => {
    const displayStatus = toBookingDisplayStatus(booking.status);
    if (!canDeleteBooking(displayStatus)) {
      setToast({ kind: "error", message: `Delete is not allowed for ${statusLabel(displayStatus)}.` });
      return;
    }
    const confirmed = window.confirm(`Delete activity "${booking.eventType}"?`);
    if (!confirmed) return;
    try {
      await bookingsService.remove(booking.id);
      setToast({ kind: "success", message: `Activity "${booking.eventType}" deleted.` });
      await refresh();
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Unable to delete activity." });
    }
  };

  const handleEdit = (booking: BookingEntity) => {
    if (!canEditBooking(booking)) {
      setToast({ kind: "error", message: "This activity is not editable for current status/date." });
      return;
    }
    navigate(`${ROUTES.bookings}/${booking.id}/edit`);
  };

  const handleOpen = (booking: BookingEntity) => {
    if (!canOpenBookingDetails(booking.status)) {
      setToast({ kind: "error", message: "Only waiting activities can be opened from list." });
      return;
    }
    navigate(`${ROUTES.bookings}/${booking.id}`);
  };

  const handleExport = () => {
    if (filteredItems.length === 0) {
      setToast({ kind: "error", message: "No activities available to export." });
      return;
    }
    const header = ["Title", "Author", "Visibility", "Activity Date", "Payment", "Status"];
    const lines = [
      header.join(","),
      ...filteredItems.map((item) =>
        [
          item.eventType,
          item.authorName ?? "-",
          item.visibility,
          item.bookingDate,
          item.paymentLabel ?? item.apartmentId,
          statusLabel(toBookingDisplayStatus(item.status))
        ]
          .map((value) => `"${String(value).split('"').join('""')}"`)
          .join(",")
      )
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activities-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ kind: "success", message: "Activity list exported." });
  };

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, BookingEntity[]>();
    for (const item of filteredItems) {
      const key = item.bookingDate;
      const existing = groups.get(key) ?? [];
      existing.push(item);
      groups.set(key, existing);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredItems]);

  const activityByDate = useMemo(() => {
    return new Map(groupedByDate);
  }, [groupedByDate]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const cells: Array<{ key: string; date: Date; inCurrentMonth: boolean }> = [];

    for (let i = 0; i < 42; i += 1) {
      const dayIndex = i - startOffset + 1;
      let date: Date;
      let inCurrentMonth = true;

      if (dayIndex <= 0) {
        date = new Date(year, month - 1, daysInPreviousMonth + dayIndex);
        inCurrentMonth = false;
      } else if (dayIndex > daysInMonth) {
        date = new Date(year, month + 1, dayIndex - daysInMonth);
        inCurrentMonth = false;
      } else {
        date = new Date(year, month, dayIndex);
      }

      cells.push({ key: `${i}-${toIsoDate(date)}`, date, inCurrentMonth });
    }

    return cells;
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentMonth);
  }, [currentMonth]);

  const selectedDayActivities = activityByDate.get(selectedDate) ?? [];

  return (
    <PageContainer title="Activities" subtitle="Planet Housing Society / Community / Activities" showHeader={false}>
      <Card>
        <div className="bo-activity-toolbar-rows">
          <div className="bo-activity-toolbar-row bo-activity-toolbar-row-top">
            <div className="bo-activity-segment">
              <button
                type="button"
                className={`bo-activity-segment-button ${viewMode === "list" ? "is-active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
              <button
                type="button"
                className={`bo-activity-segment-button ${viewMode === "calendar" ? "is-active" : ""}`}
                onClick={() => setViewMode("calendar")}
              >
                Calendar
              </button>
            </div>
            <div className="bo-activity-top-actions">
              <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/invite`)}>
                Generate QR Link
              </Button>
              <Button variant="secondary" onClick={() => window.alert("Condition of use opened.")}>
                Condition of use
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                Export
              </Button>
              <Button onClick={() => navigate(`${ROUTES.bookings}/new`)}>Create</Button>
            </div>
          </div>

          <div className="bo-activity-toolbar-row bo-activity-toolbar-row-bottom">
            <div className="bo-activity-filter-left">
              <Button variant="secondary">Filter By</Button>
              <select
                className="bo-input bo-activity-select"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All</option>
                <option value="ToCheck">To Check</option>
                <option value="Approved">Approved</option>
                <option value="ToPay">To Pay</option>
                <option value="Rejected">Rejected</option>
                <option value="Refund">Refund</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="bo-activity-filter-right">
              <input
                className="bo-input bo-activity-search"
                type="text"
                value={query}
                placeholder="Search activity title, author, payment or date"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {viewMode === "list" ? (
        <Card>
          <div className="bo-table-wrap">
            <table className="bo-table bo-activity-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Visibility</th>
                  <th>Activity Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action(s)</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item) => {
                  const displayStatus = toBookingDisplayStatus(item.status);
                  return (
                    <tr key={item.id}>
                      <td>{item.eventType}</td>
                      <td>{item.authorName ?? "Shanta Bai"}</td>
                      <td>{item.visibility === "Public" ? "Test Resident" : "Private Resident"}</td>
                      <td>{item.paymentLabel ?? `${item.bookingDate} ${item.startTime}`}</td>
                      <td>{item.apartmentId === "apt-a-102" ? "A-101" : item.apartmentId}</td>
                      <td>
                        <span className={statusBadgeClass(displayStatus)}>{statusLabel(displayStatus)}</span>
                      </td>
                      <td>
                        <div className="bo-activity-actions">
                          {canOpenBookingDetails(item.status) ? (
                            <button type="button" className="bo-activity-action-btn" onClick={() => handleOpen(item)} title="Open Activity">
                              {actionIcon("👁", "Open")}
                            </button>
                          ) : (
                            <span className="bo-activity-action-placeholder" />
                          )}
                          {canEditBooking(item) ? (
                            <button type="button" className="bo-activity-action-btn" onClick={() => handleEdit(item)} title="Edit">
                              {actionIcon("✎", "Edit")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="bo-activity-action-btn is-disabled"
                              onClick={() => setToast({ kind: "error", message: "Edit is not allowed for this activity." })}
                              title="Edit Disabled"
                            >
                              {actionIcon("✎", "Edit disabled")}
                            </button>
                          )}
                          {canDeleteBooking(item.status) ? (
                            <button type="button" className="bo-activity-action-btn" onClick={() => void handleDelete(item)} title="Delete">
                              {actionIcon("🗑", "Delete")}
                            </button>
                          ) : (
                            <span className="bo-activity-action-placeholder" />
                          )}
                          {["ToCheck", "Approved", "ToPay", "Rejected"].includes(displayStatus) ? (
                            <button type="button" className="bo-activity-action-btn" onClick={() => void handleCopyQr(item)} title="Generate QR">
                              {actionIcon("⌗", "QR")}
                            </button>
                          ) : (
                            <span className="bo-activity-action-placeholder" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bo-pagination">
            <span className="bo-pagination-meta">
              Showing {(page - 1) * PAGE_SIZE + (pagedItems.length > 0 ? 1 : 0)}-{(page - 1) * PAGE_SIZE + pagedItems.length} of{" "}
              {filteredItems.length}
            </span>
            <div className="bo-pagination-actions">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <span className="bo-pagination-page">
                Page {page} / {totalPages}
              </span>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Activity Calendar">
          <div className="bo-activity-calendar-layout">
            <div className="bo-activity-month-card">
              <div className="bo-activity-month-header">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  Prev
                </Button>
                <p className="bo-activity-month-title">{monthLabel}</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                  Next
                </Button>
              </div>

              <div className="bo-activity-week-grid">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="bo-activity-week-cell">
                    {day}
                  </div>
                ))}
              </div>

              <div className="bo-activity-date-grid">
                {calendarCells.map((cell) => {
                  const iso = toIsoDate(cell.date);
                  const dayActivities = activityByDate.get(iso) ?? [];
                  const isSelected = selectedDate === iso;
                  const isToday = toIsoDate(new Date()) === iso;
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      className={`bo-activity-date-cell ${cell.inCurrentMonth ? "" : "is-outside"} ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`}
                      onClick={() => setSelectedDate(iso)}
                    >
                      <span className="bo-activity-date-number">{cell.date.getDate()}</span>
                      {dayActivities.length > 0 ? <span className="bo-activity-date-dot">{dayActivities.length}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bo-activity-calendar-side">
              <p className="bo-activity-calendar-selected-date">Activities on {selectedDate}</p>
              {selectedDayActivities.length === 0 ? (
                <p className="bo-form-hint">No activities scheduled for this date.</p>
              ) : (
                <div className="bo-activity-calendar-items">
                  {selectedDayActivities.map((record) => (
                    <div key={record.id} className="bo-activity-calendar-item-wrap">
                      <button
                        type="button"
                        className="bo-activity-calendar-item"
                      onClick={() =>
                        canOpenBookingDetails(record.status)
                          ? navigate(`${ROUTES.bookings}/${record.id}`)
                            : setToast({ kind: "error", message: "Only waiting activities can be opened." })
                        }
                      >
                        <span>{record.eventType}</span>
                        <span className={statusBadgeClass(toBookingDisplayStatus(record.status))}>
                          {statusLabel(toBookingDisplayStatus(record.status))}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
      {toast ? <Toast kind={toast.kind} message={toast.message} /> : null}
    </PageContainer>
  );
}
