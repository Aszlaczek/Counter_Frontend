type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Usuń",
  cancelLabel = "Anuluj",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: Props) => {
  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={loading ? undefined : onCancel} />
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="confirm-dialog-content">
          <h3 id="confirm-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
          <div className="confirm-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn-confirm ${danger ? "btn-danger" : "btn-primary"}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Proszę czekać..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
