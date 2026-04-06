import type {
  MessageAuthorRole,
  Session,
  Ticket,
  TicketForm,
  TicketStatus,
} from "./support-desk.types";

type ApiErrorPayload = {
  error?: string;
};

type TicketsResponse = {
  tickets?: Ticket[];
} & ApiErrorPayload;

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function getErrorMessage(payload: ApiErrorPayload, fallback: string) {
  return payload.error ?? fallback;
}

export async function fetchTickets(session: Session) {
  const params =
    session.role === "CLIENT"
      ? `?email=${encodeURIComponent(session.email.trim().toLowerCase())}`
      : "";
  const response = await fetch(`/api/tickets${params}`, { cache: "no-store" });
  const payload = await readJson<TicketsResponse>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Não foi possível carregar os chamados."));
  }

  return payload.tickets ?? [];
}

export async function createTicket(session: Session, ticketForm: TicketForm) {
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...ticketForm,
      customerName: session.name,
      customerEmail: session.email,
    }),
  });
  const payload = await readJson<ApiErrorPayload>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Não foi possível abrir o chamado."));
  }
}

export async function createTicketMessage(
  ticketId: string,
  authorRole: MessageAuthorRole,
  authorName: string,
  body: string,
) {
  const response = await fetch(`/api/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authorRole,
      authorName,
      body,
    }),
  });
  const payload = await readJson<ApiErrorPayload>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Não foi possível enviar a resposta."));
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  technicianName: string,
) {
  const response = await fetch(`/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      technicianName,
    }),
  });
  const payload = await readJson<ApiErrorPayload>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Não foi possível atualizar o status."));
  }
}
