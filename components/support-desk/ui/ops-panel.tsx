import styles from "../support-desk-page.module.css";
import primitiveStyles from "./primitives.module.css";

type OpsPanelProps = {
  isVisible: boolean;
  urgentCount: number;
  unassignedCount: number;
  waitingCustomerCount: number;
};

export function OpsPanel({
  isVisible,
  urgentCount,
  unassignedCount,
  waitingCustomerCount,
}: OpsPanelProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.opsPanel}>
      <div className={styles.opsCard}>
        <span className={primitiveStyles.eyebrow}>Urgentes</span>
        <strong>{urgentCount}</strong>
        <p>Chamados que exigem ação imediata.</p>
      </div>
      <div className={styles.opsCard}>
        <span className={primitiveStyles.eyebrow}>Sem responsável</span>
        <strong>{unassignedCount}</strong>
        <p>Tickets ainda aguardando técnico.</p>
      </div>
      <div className={styles.opsCard}>
        <span className={primitiveStyles.eyebrow}>Aguardando cliente</span>
        <strong>{waitingCustomerCount}</strong>
        <p>Casos pausados por dependência externa.</p>
      </div>
    </section>
  );
}
