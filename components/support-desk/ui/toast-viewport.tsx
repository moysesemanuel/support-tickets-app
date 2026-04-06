import type { Toast } from "../support-desk.types";
import styles from "./toast-viewport.module.css";

export function ToastViewport({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.toastViewport} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          className={toast.kind === "success" ? styles.toastSuccess : styles.toastError}
          key={toast.id}
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
