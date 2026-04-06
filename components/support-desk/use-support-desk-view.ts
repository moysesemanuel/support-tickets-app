"use client";

import type { SidebarItem } from "./support-desk.constants";
import type { Ticket } from "./support-desk.types";

function matchesSidebarFilter(selectedSidebarItem: SidebarItem) {
  switch (selectedSidebarItem) {
    case "Dashboards":
    case "Tickets":
      return true;
    case "Chat":
    case "Tarefas":
    case "Projetos BETA":
    case "Relatórios":
    case "Faturamento":
    case "Base de conhecimento":
    case "Cadastros":
    case "Configurações":
    case "Proteção Geral de Dados":
      return false;
    default:
      return true;
  }
}

type UseSupportDeskViewOptions = {
  tickets: Ticket[];
  selectedSidebarItem: SidebarItem;
  searchTerm: string;
  selectedTicketId: string;
};

export function useSupportDeskView({
  tickets,
  selectedSidebarItem,
  searchTerm,
  selectedTicketId,
}: UseSupportDeskViewOptions) {
  const visibleTickets = tickets.filter((ticket) => {
    if (!matchesSidebarFilter(selectedSidebarItem)) {
      return false;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return [
      ticket.protocol,
      ticket.subject,
      ticket.customerName,
      ticket.category,
      ticket.customerEmail,
    ].some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  const selectedTicket =
    visibleTickets.find((ticket) => ticket.id === selectedTicketId) ?? visibleTickets[0] ?? null;

  const urgentCount = tickets.filter((ticket) => ticket.priority === "URGENT").length;
  const waitingCustomerCount = tickets.filter((ticket) => ticket.status === "WAITING_CUSTOMER").length;
  const unassignedCount = tickets.filter((ticket) => !ticket.assignedTechnicianName).length;

  const kanbanColumns = [
    {
      key: "OPEN" as const,
      title: "A FAZER",
      tickets: visibleTickets.filter((ticket) => ticket.status === "OPEN"),
    },
    {
      key: "IN_PROGRESS" as const,
      title: "ATENDENDO",
      tickets: visibleTickets.filter((ticket) => ticket.status === "IN_PROGRESS"),
    },
    {
      key: "WAITING_CUSTOMER" as const,
      title: "PAUSADO",
      tickets: visibleTickets.filter((ticket) => ticket.status === "WAITING_CUSTOMER"),
    },
    {
      key: "WAITING_THIRD_PARTY" as const,
      title: "AGUARDANDO TERCEIROS",
      tickets: visibleTickets.filter((ticket) => ticket.status === "WAITING_THIRD_PARTY"),
    },
    {
      key: "RESOLVED" as const,
      title: "FINALIZADO",
      tickets: visibleTickets.filter((ticket) => ticket.status === "RESOLVED"),
    },
  ] as const;

  return {
    kanbanColumns,
    selectedTicket,
    unassignedCount,
    urgentCount,
    visibleTickets,
    waitingCustomerCount,
  };
}
