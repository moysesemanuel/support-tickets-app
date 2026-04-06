import type { Session, TicketForm, TicketPriority } from "../support-desk.types";
import primitiveStyles from "./primitives.module.css";
import styles from "../support-desk-page.module.css";

type NewTicketPanelProps = {
  isVisible: boolean;
  session: Session;
  ticketForm: TicketForm;
  isSubmitting: boolean;
  onTicketFormChange: <K extends keyof TicketForm>(field: K, value: TicketForm[K]) => void;
  onSubmit: () => void;
};

export function NewTicketPanel({
  isVisible,
  session,
  ticketForm,
  isSubmitting,
  onTicketFormChange,
  onSubmit,
}: NewTicketPanelProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <span className={primitiveStyles.eyebrow}>Abertura</span>
        <h2>Novo chamado</h2>
        <p>Registre a solicitação e ela entra imediatamente na fila de atendimento.</p>
      </div>

      <div className={primitiveStyles.formGrid}>
        <div className={primitiveStyles.formRow}>
          <input className={primitiveStyles.input} disabled value={session.name} />
          <input className={primitiveStyles.input} disabled value={session.email} />
        </div>
        <div className={primitiveStyles.formRow}>
          <input
            className={primitiveStyles.input}
            onChange={(event) => onTicketFormChange("customerPhone", event.target.value)}
            placeholder="Telefone"
            value={ticketForm.customerPhone}
          />
          <input
            className={primitiveStyles.input}
            onChange={(event) => onTicketFormChange("customerCompany", event.target.value)}
            placeholder="Empresa"
            value={ticketForm.customerCompany}
          />
        </div>
        <div className={primitiveStyles.formRow}>
          <input
            className={primitiveStyles.input}
            onChange={(event) => onTicketFormChange("subject", event.target.value)}
            placeholder="Assunto"
            value={ticketForm.subject}
          />
          <input
            className={primitiveStyles.input}
            onChange={(event) => onTicketFormChange("category", event.target.value)}
            placeholder="Categoria"
            value={ticketForm.category}
          />
        </div>
        <select
          className={primitiveStyles.select}
          onChange={(event) => onTicketFormChange("priority", event.target.value as TicketPriority)}
          value={ticketForm.priority}
        >
          <option value="LOW">Prioridade baixa</option>
          <option value="MEDIUM">Prioridade média</option>
          <option value="HIGH">Prioridade alta</option>
          <option value="URGENT">Prioridade urgente</option>
        </select>
        <textarea
          className={primitiveStyles.textarea}
          onChange={(event) => onTicketFormChange("description", event.target.value)}
          placeholder="Descreva o problema ou a solicitação"
          value={ticketForm.description}
        />
        <button className={primitiveStyles.primaryButton} disabled={isSubmitting} onClick={onSubmit} type="button">
          Abrir chamado
        </button>
      </div>
    </section>
  );
}
