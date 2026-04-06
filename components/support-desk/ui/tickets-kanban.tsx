import type { SidebarItem } from "../support-desk.constants";
import type { Ticket, TicketStatus } from "../support-desk.types";
import styles from "../support-desk-page.module.css";
import primitiveStyles from "./primitives.module.css";
import { PriorityBadge, formatDate } from "./shared";

type KanbanColumn = {
  key: TicketStatus;
  title: string;
  className: string;
  tickets: Ticket[];
};

type TicketsKanbanProps = {
  selectedSidebarItem: SidebarItem;
  kanbanColumns: readonly KanbanColumn[];
  selectedTicket: Ticket | null;
  onOpenTicket: (ticket: Ticket) => void;
};

export function TicketsKanban({
  selectedSidebarItem,
  kanbanColumns,
  selectedTicket,
  onOpenTicket,
}: TicketsKanbanProps) {
  if (selectedSidebarItem !== "Tickets") {
    return null;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <span className={primitiveStyles.eyebrow}>Fluxo</span>
        <h2>Kanban de Tickets</h2>
        <p>Os tickets são agrupados por etapa para priorização da operação.</p>
      </div>

      <div className={styles.kanbanBoard}>
        {kanbanColumns.map((column) => (
          <section className={styles.kanbanColumn} key={column.key}>
            <div className={`${styles.kanbanColumnHeader} ${column.className}`}>
              <strong>{column.title}</strong>
              <span>{column.tickets.length}</span>
            </div>

            <div className={styles.kanbanColumnBody}>
              {column.tickets.length === 0 ? (
                <div className={styles.kanbanEmpty}>Nenhum ticket nesta etapa.</div>
              ) : (
                column.tickets.map((ticket) => (
                  <button
                    className={ticket.id === selectedTicket?.id ? styles.kanbanCardActive : styles.kanbanCard}
                    key={ticket.id}
                    onClick={() => onOpenTicket(ticket)}
                    type="button"
                  >
                    <div className={styles.kanbanCardTopline}>
                      <span>{ticket.protocol}</span>
                      <span>{formatDate(ticket.lastReplyAt ?? ticket.updatedAt)}</span>
                    </div>
                    <strong>{ticket.subject}</strong>
                    <div className={styles.kanbanMeta}>
                      <span>{ticket.customerName}</span>
                      <span>{ticket.category}</span>
                    </div>
                    <div className={styles.badges}>
                      <PriorityBadge label={ticket.priorityLabel} priority={ticket.priority} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
