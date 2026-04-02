import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  toBookingDisplayStatus
} from "../../../services/api/bookingsService";

function statusText(status: string) {
  const display = toBookingDisplayStatus(status);
  if (display === "ToCheck") return "To Check";
  if (display === "ToPay") return "To Pay";
  return display;
}

export default function BookingsDetailScreen() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [item, setItem] = useState<BookingEntity | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refresh = async () => {
    try {
      const next = await bookingsService.getById(id);
      setItem(next);
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Unable to load activity details." });
    }
  };

  useEffect(() => {
    if (!id) return;
    void refresh();
  }, [id]);

  const runTransition = async (action: "approve" | "reject" | "toPay" | "markOnline" | "refund" | "markRefunded") => {
    if (!item) return;
    try {
      if (action === "approve") await bookingsService.approve(item.id);
      if (action === "reject") await bookingsService.reject(item.id, rejectReason.trim());
      if (action === "toPay") await bookingsService.moveToPay(item.id);
      if (action === "markOnline") await bookingsService.markOnline(item.id);
      if (action === "refund") await bookingsService.requestRefund(item.id);
      if (action === "markRefunded") await bookingsService.markRefunded(item.id);
      setToast({ kind: "success", message: `Activity moved via ${action} action.` });
      setRejectPopupOpen(false);
      setRejectReason("");
      await refresh();
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Status update failed." });
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!canDeleteBooking(item.status)) {
      setToast({ kind: "error", message: `Delete is not allowed in ${statusText(item.status)} state.` });
      return;
    }
    const confirmed = window.confirm("Delete this activity?");
    if (!confirmed) return;
    try {
      await bookingsService.remove(item.id);
      navigate(ROUTES.bookings);
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Delete failed." });
    }
  };

  const editDisabledMessage = useMemo(() => {
    if (!item) return "";
    if (!canEditBooking(item)) {
      return "Past date-time or immutable status: editing is blocked.";
    }
    return "";
  }, [item]);

  return (
    <PageContainer title="Activity Details" subtitle="Community / Activities / Activity Details" showHeader={false}>
      <Card>
        <div className="bo-inline-actions">
          <Link to={ROUTES.bookings} className="bo-link-reset">
            <Button variant="secondary">Back</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => (item && canEditBooking(item) ? navigate(`${ROUTES.bookings}/${item.id}/edit`) : setError("Edit is not allowed for this activity."))}
          >
            Edit
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Card>

      {item ? (
        <Card>
          <div className="bo-activity-detail-grid">
            <div className="bo-activity-detail-main">
              <h3 className="bo-activity-detail-title">Activity Details</h3>
              <div className="bo-kv-grid">
                <div className="bo-kv-item">
                  <span className="bo-kv-key">Title</span>
                  <span className="bo-kv-value">{item.eventType}</span>
                </div>
                <div className="bo-kv-item">
                  <span className="bo-kv-key">Author</span>
                  <span className="bo-kv-value">{item.authorName ?? "Shanta Bai"}</span>
                </div>
                <div className="bo-kv-item">
                  <span className="bo-kv-key">Space</span>
                  <span className="bo-kv-value">{item.spaceType}</span>
                </div>
                <div className="bo-kv-item">
                  <span className="bo-kv-key">Visibility</span>
                  <span className="bo-kv-value">{item.visibility}</span>
                </div>
                <div className="bo-kv-item">
                  <span className="bo-kv-key">Booking Date</span>
                  <span className="bo-kv-value">
                    {item.bookingDate} {item.startTime}-{item.endTime}
                  </span>
                </div>
                <div className="bo-kv-item">
                  <span className="bo-kv-key">Status</span>
                  <span className="bo-kv-value">{statusText(item.status)}</span>
                </div>
              </div>

              <div className="bo-activity-action-row">
                <Button
                  variant="secondary"
                  disabled={toBookingDisplayStatus(item.status) !== "ToCheck"}
                  onClick={() => void runTransition("approve")}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  disabled={toBookingDisplayStatus(item.status) !== "ToCheck"}
                  onClick={() => {
                    setRejectReason("");
                    setRejectPopupOpen(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  disabled={toBookingDisplayStatus(item.status) !== "Approved"}
                  onClick={() => void runTransition("toPay")}
                >
                  Move To Pay
                </Button>
                <Button
                  variant="secondary"
                  disabled={toBookingDisplayStatus(item.status) !== "ToPay"}
                  onClick={() => void runTransition("markOnline")}
                >
                  Auto Mark Online
                </Button>
              </div>
              <div className="bo-activity-action-row">
                <Button
                  variant="secondary"
                  disabled={toBookingDisplayStatus(item.status) !== "Online"}
                  onClick={() => void runTransition("refund")}
                >
                  Initiate Refund
                </Button>
                <Button
                  variant="secondary"
                  disabled={toBookingDisplayStatus(item.status) !== "Refund"}
                  onClick={() => void runTransition("markRefunded")}
                >
                  Mark Refunded
                </Button>
              </div>
              {editDisabledMessage ? <p className="bo-form-hint">{editDisabledMessage}</p> : null}
            </div>

            <div className="bo-activity-payment-card">
              <h4 className="bo-activity-payment-title">Payment Details</h4>
              <div className="bo-activity-payment-line">
                <span>{item.spaceType}</span>
                <span>₹100/h</span>
              </div>
              <div className="bo-activity-payment-line">
                <span>Hours Booked</span>
                <span>2.3h</span>
              </div>
              <div className="bo-activity-payment-line">
                <span>Days Booked</span>
                <span>5d</span>
              </div>
              <div className="bo-activity-payment-total">
                <span>Total</span>
                <span>₹500</span>
              </div>
              <div className="bo-activity-payment-meta">
                <p>User payment Method</p>
                <strong>{item.paymentMethod === "InternalPA" ? "Internal PA Wallet" : "Razorpay Online (Credit card)"}</strong>
              </div>
              <div className="bo-activity-payment-meta">
                <p>Payment Status</p>
                <strong>{item.paymentStatus ?? "Unpaid"}</strong>
              </div>
              <div className="bo-activity-payment-actions">
                <Button variant="secondary" onClick={() => setToast({ kind: "success", message: "Invoice viewed." })}>
                  View Invoice
                </Button>
                <Button variant="secondary" onClick={() => setToast({ kind: "success", message: "Receipt viewed." })}>
                  View Receipt
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="bo-form-error">Record not found.</p>
        </Card>
      )}
      {rejectPopupOpen ? (
        <div className="bo-modal-overlay">
          <div className="bo-modal">
            <h3 className="bo-modal-title">Reject Activity</h3>
            <p className="bo-modal-subtitle">Please enter the reason for rejection.</p>
            <textarea
              className="bo-input bo-modal-textarea"
              placeholder="Reason is mandatory"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
            <div className="bo-modal-actions">
              <Button variant="secondary" onClick={() => setRejectPopupOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!rejectReason.trim()) {
                    setToast({ kind: "error", message: "Reject reason is mandatory." });
                    return;
                  }
                  void runTransition("reject");
                }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <Toast kind={toast.kind} message={toast.message} /> : null}
    </PageContainer>
  );
}
