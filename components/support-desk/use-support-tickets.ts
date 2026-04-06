"use client";

import { useEffect, useState, useTransition } from "react";
import { CATEGORY_OPTIONS, DESK_OPTIONS, createInitialTicketRouting } from "./support-desk.constants";
import {
  createTicket,
  createTicketMessage,
  fetchTickets,
  updateTicketStatus,
} from "./support-desk-api";
import type {
  MessageAuthorRole,
  Session,
  Ticket,
  TicketRouting,
  TicketStatus,
} from "./support-desk.types";

type UseSupportTicketsOptions = {
  isHydrated: boolean;
  session: Session | null;
  showToast: (kind: "success" | "error", message: string) => void;
};

export function useSupportTickets({ isHydrated, session, showToast }: UseSupportTicketsOptions) {
  const [, startLoadingTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [clientReply, setClientReply] = useState("");
  const [technicianReply, setTechnicianReply] = useState("");
  const [modalTicketId, setModalTicketId] = useState<string | null>(null);
  const [ticketRouting, setTicketRouting] = useState<TicketRouting>(createInitialTicketRouting());
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0] ?? null;

  async function loadTickets(activeSession: Session) {
    const nextTickets = await fetchTickets(activeSession);
    setTickets(nextTickets);
    setSelectedTicketId((current) => {
      if (current && nextTickets.some((ticket) => ticket.id === current)) {
        return current;
      }

      return nextTickets[0]?.id ?? "";
    });
  }

  useEffect(() => {
    if (!isHydrated || !session) {
      return;
    }

    startLoadingTransition(() => {
      void loadTickets(session).catch((error: unknown) => {
        showToast("error", error instanceof Error ? error.message : "Falha ao carregar os chamados.");
      });
    });
  }, [isHydrated, session]);

  useEffect(() => {
    if (!modalTicketId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalTicketId(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalTicketId]);

  const modalTicket = tickets.find((ticket) => ticket.id === modalTicketId) ?? null;

  function clearTickets() {
    setTickets([]);
  }

  function clearSelection() {
    setSelectedTicketId("");
    setModalTicketId(null);
  }

  function clearReplies() {
    setClientReply("");
    setTechnicianReply("");
  }

  function handleTicketRoutingChange<K extends keyof TicketRouting>(field: K, value: TicketRouting[K]) {
    setTicketRouting((current) => ({ ...current, [field]: value }));
  }

  function openTicketModal(ticket: Ticket) {
    setSelectedTicketId(ticket.id);
    setModalTicketId(ticket.id);
    setTicketRouting({
      desk: DESK_OPTIONS[0],
      operator: ticket.assignedTechnicianName ?? session?.name ?? "",
      ticketType: "",
      category: CATEGORY_OPTIONS.includes(ticket.category as (typeof CATEGORY_OPTIONS)[number])
        ? ticket.category
        : "",
    });
  }

  function closeTicketModal() {
    setModalTicketId(null);
  }

  async function handleCreateTicket(
    ticketForm: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerCompany: string;
    subject: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    description: string;
    },
    options?: {
      onSuccess?: () => void;
    },
  ) {
    if (!session || session.role !== "CLIENT") {
      return;
    }

    startSubmitTransition(() => {
      void createTicket(session, ticketForm)
        .then(async () => {
          await loadTickets(session);
          options?.onSuccess?.();
          showToast("success", "Chamado aberto com sucesso.");
        })
        .catch((error: unknown) => {
          showToast("error", error instanceof Error ? error.message : "Falha ao abrir o chamado.");
        });
    });
  }

  async function handleReply(authorRole: MessageAuthorRole) {
    if (!selectedTicket || !session) {
      return;
    }

    const body = authorRole === "CLIENT" ? clientReply : technicianReply;

    startSubmitTransition(() => {
      void createTicketMessage(selectedTicket.id, authorRole, session.name, body)
        .then(async () => {
          if (authorRole === "CLIENT") {
            setClientReply("");
          } else {
            setTechnicianReply("");
          }

          await loadTickets(session);
          showToast(
            "success",
            authorRole === "CLIENT" ? "Atualização enviada pelo cliente." : "Resposta técnica enviada.",
          );
        })
        .catch((error: unknown) => {
          showToast("error", error instanceof Error ? error.message : "Falha ao enviar a mensagem.");
        });
    });
  }

  async function handleStatusUpdate(
    status: TicketStatus,
    options?: {
      successMessage?: string;
      onSuccess?: () => void;
    },
  ) {
    if (!selectedTicket || !session || session.role !== "TECHNICIAN") {
      return;
    }

    const statusMessageByAction: Record<TicketStatus, string> = {
      OPEN: "Chamado reaberto.",
      IN_PROGRESS: "Atendimento assumido.",
      WAITING_CUSTOMER: "Chamado marcado como aguardando cliente.",
      WAITING_THIRD_PARTY: "Chamado marcado como aguardando terceiros.",
      RESOLVED: "Chamado resolvido.",
    };

    startSubmitTransition(() => {
      void updateTicketStatus(selectedTicket.id, status, session.name)
        .then(async () => {
          await loadTickets(session);
          showToast("success", options?.successMessage ?? statusMessageByAction[status]);
          options?.onSuccess?.();
        })
        .catch((error: unknown) => {
          showToast("error", error instanceof Error ? error.message : "Falha ao atualizar o status.");
        });
    });
  }

  async function handleStartTicket() {
    if (!modalTicket) {
      return;
    }

    setSelectedTicketId(modalTicket.id);
    await handleStatusUpdate("IN_PROGRESS");
  }

  async function handleResolveTicket() {
    if (!modalTicket) {
      return;
    }

    setSelectedTicketId(modalTicket.id);
    await handleStatusUpdate("RESOLVED", {
      successMessage: "Ticket resolvido.",
    });
  }

  async function handleCloseTicket() {
    if (!modalTicket) {
      return;
    }

    setSelectedTicketId(modalTicket.id);
    await handleStatusUpdate("RESOLVED", {
      successMessage: "Ticket encerrado.",
      onSuccess: closeTicketModal,
    });
  }

  return {
    clientReply,
    isSubmitting,
    modalTicket,
    selectedTicketId,
    technicianReply,
    ticketRouting,
    tickets,
    clearReplies,
    clearSelection,
    clearTickets,
    closeTicketModal,
    handleCloseTicket,
    handleCreateTicket,
    handleReply,
    handleResolveTicket,
    handleStartTicket,
    handleStatusUpdate,
    handleTicketRoutingChange,
    loadTickets,
    openTicketModal,
    setClientReply,
    setSelectedTicketId,
    setTechnicianReply,
    setTickets,
  };
}
