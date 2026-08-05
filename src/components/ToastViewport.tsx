import { useToastStore } from "../store";

const ToastViewport = () => {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          <span className="toast-icon" aria-hidden="true">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="toast-message">{t.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismissToast(t.id)}
            aria-label="Zamknij powiadomienie"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastViewport;
