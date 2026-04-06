import type { SidebarItem } from "../support-desk.constants";
import type { Ticket } from "../support-desk.types";
import styles from "../support-desk-page.module.css";
import primitiveStyles from "./primitives.module.css";
import { PriorityBadge, formatDate, getStatusBadge } from "./shared";

type OverviewRailProps = {
  selectedSidebarItem: SidebarItem;
  visibleTickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticketId: string) => void;
};

export function OverviewRail({
  selectedSidebarItem,
  visibleTickets,
  selectedTicket,
  onSelectTicket,
}: OverviewRailProps) {
  if (selectedSidebarItem !== "Dashboards") {
    return null;
  }

  return (
    <div className={styles.queueRail}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <span className={primitiveStyles.eyebrow}>Visão atual</span>
          <h2>{selectedSidebarItem}</h2>
          <p>
            {visibleTickets.length > 0
              ? `${visibleTickets.length} registro(s) disponível(is) nesta visão.`
              : "Nenhum chamado encontrado para este perfil."}
          </p>
        </div>

        <div className={styles.ticketCards}>
          {visibleTickets.length === 0 ? (
            <div className={styles.emptyState}>Nenhum chamado disponível.</div>
          ) : (
            visibleTickets.map((ticket) => (
              <button
                className={ticket.id === selectedTicket?.id ? styles.ticketCardActive : styles.ticketCard}
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                type="button"
              >
                <div className={styles.ticketCardTopline}>
                  <span>{ticket.protocol}</span>
                  <span>{formatDate(ticket.lastReplyAt ?? ticket.updatedAt)}</span>
                </div>
                <div className={styles.ticketHeader}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <div className={styles.ticketMeta}>
                      <span>{ticket.customerName}</span>
                      <span>{ticket.category}</span>
                    </div>
                  </div>
                  <div className={styles.badges}>
                    <span className={getStatusBadge(ticket.status)}>{ticket.statusLabel}</span>
                    <PriorityBadge label={ticket.priorityLabel} priority={ticket.priority} />
                  </div>
                </div>
                <div className={styles.ticketFooterMeta}>
                  {ticket.assignedTechnicianName
                    ? `Responsável: ${ticket.assignedTechnicianName}`
                    : "Sem técnico responsável"}
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
