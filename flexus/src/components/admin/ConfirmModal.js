const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  loadingLabel = "Working...",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  confirmVariant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div
        className="admin-modal-card admin-modal-card-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">{title}</h3>
            <p className="admin-modal-subtitle">{message}</p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onCancel}
            aria-label="Close"
            disabled={isLoading}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${
              confirmVariant === "primary" ? "btn-brand-primary" : "btn-danger"
            } admin-btn-with-spinner`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="admin-btn-spinner" aria-hidden="true"></span>
            )}
            <span>{isLoading ? loadingLabel : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
