import type { TicketPriority, TicketStatus } from "../support-desk.types";
import styles from "../support-desk-page.module.css";

export function formatDate(value: string | null) {
  if (!value) {
    return "Sem atualização";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return styles.badgeOpen;
    case "IN_PROGRESS":
      return styles.badgeProgress;
    case "WAITING_CUSTOMER":
    case "WAITING_THIRD_PARTY":
      return styles.badgeWaiting;
    case "RESOLVED":
      return styles.badgeResolved;
    default:
      return styles.badge;
  }
}

function getPriorityBadge(priority: TicketPriority) {
  switch (priority) {
    case "LOW":
      return styles.badgeLow;
    case "MEDIUM":
      return styles.badgeMedium;
    case "HIGH":
      return styles.badgeHigh;
    case "URGENT":
      return styles.badgeUrgent;
    default:
      return styles.badge;
  }
}

export function PriorityBadge({ label, priority }: { label: string; priority: TicketPriority }) {
  return <span className={`${styles.priorityBadge} ${getPriorityBadge(priority)}`}>{label}</span>;
}
