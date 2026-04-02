type ToastProps = {
  kind: "success" | "error";
  message: string;
};

export default function Toast({ kind, message }: ToastProps) {
  return (
    <div className={`bo-toast bo-toast-${kind}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
