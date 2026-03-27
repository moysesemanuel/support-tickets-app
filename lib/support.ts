import { prisma } from "@/lib/prisma";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MessageAuthorRole = "CLIENT" | "TECHNICIAN";

type CreateTicketInput = {
  subject: string;
  category: string;
  priority: TicketPriority;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCompany?: string | null;
  description: string;
};

type CreateMessageInput = {
  ticketId: string;
  authorRole: MessageAuthorRole;
  authorName: string;
  body: string;
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em atendimento",
  WAITING_CUSTOMER: "Aguardando cliente",
  RESOLVED: "Resolvido",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createProtocol(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `CH-${year}${month}${day}`;
}

async function getNextProtocol() {
  const base = createProtocol();
  const existingCount = await prisma.supportTicket.count({
    where: {
      protocol: {
        startsWith: base,
      },
    },
  });

  return `${base}-${String(existingCount + 1).padStart(3, "0")}`;
}

export async function ensureSupportSeedData() {
  const count = await prisma.supportTicket.count();

  if (count > 0) {
    return;
  }

  const firstProtocol = await getNextProtocol();

  await prisma.supportTicket.create({
    data: {
      protocol: firstProtocol,
      subject: "Primeiro chamado de demonstração",
      category: "Sistema",
      priority: "HIGH",
      status: "OPEN",
      customerName: "Cliente Demo",
      customerEmail: "cliente.demo@empresa.com",
      customerPhone: "41999990000",
      customerCompany: "Empresa Demo",
      description: "Chamado inicial criado automaticamente para demonstrar o fluxo do projeto.",
      messages: {
        create: [
          {
            authorRole: "CLIENT",
            authorName: "Cliente Demo",
            body: "Nosso caixa está apresentando lentidão para fechar pedidos.",
          },
        ],
      },
    },
  });
}

export async function listSupportTickets() {
  await ensureSupportSeedData();

  const tickets = await prisma.supportTicket.findMany({
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    protocol: ticket.protocol,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority as TicketPriority,
    priorityLabel: PRIORITY_LABELS[ticket.priority as TicketPriority] ?? ticket.priority,
    status: ticket.status as TicketStatus,
    statusLabel: STATUS_LABELS[ticket.status as TicketStatus] ?? ticket.status,
    customerName: ticket.customerName,
    customerEmail: ticket.customerEmail,
    customerPhone: ticket.customerPhone,
    customerCompany: ticket.customerCompany,
    description: ticket.description,
    assignedTechnicianName: ticket.assignedTechnicianName,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastReplyAt: ticket.lastReplyAt,
    messages: ticket.messages.map((message) => ({
      id: message.id,
      authorRole: message.authorRole as MessageAuthorRole,
      authorName: message.authorName,
      body: message.body,
      createdAt: message.createdAt,
    })),
  }));
}

export async function createSupportTicket(input: CreateTicketInput) {
  const protocol = await getNextProtocol();
  const ticket = await prisma.supportTicket.create({
    data: {
      protocol,
      subject: input.subject.trim(),
      category: input.category.trim(),
      priority: input.priority,
      status: "OPEN",
      customerName: input.customerName.trim(),
      customerEmail: normalizeEmail(input.customerEmail),
      customerPhone: input.customerPhone?.trim() || null,
      customerCompany: input.customerCompany?.trim() || null,
      description: input.description.trim(),
      messages: {
        create: [
          {
            authorRole: "CLIENT",
            authorName: input.customerName.trim(),
            body: input.description.trim(),
          },
        ],
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return ticket;
}

export async function addTicketMessage(input: CreateMessageInput) {
  const body = input.body.trim();
  const authorName = input.authorName.trim();

  if (!body || !authorName) {
    throw new Error("Mensagem e nome do autor são obrigatórios.");
  }

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.findUnique({
      where: { id: input.ticketId },
    });

    if (!ticket) {
      throw new Error("Chamado não encontrado.");
    }

    const message = await tx.supportTicketMessage.create({
      data: {
        ticketId: input.ticketId,
        authorRole: input.authorRole,
        authorName,
        body,
      },
    });

    await tx.supportTicket.update({
      where: { id: input.ticketId },
      data: {
        assignedTechnicianName:
          input.authorRole === "TECHNICIAN" ? authorName : ticket.assignedTechnicianName,
        lastReplyAt: message.createdAt,
        status: input.authorRole === "TECHNICIAN" ? "WAITING_CUSTOMER" : "OPEN",
      },
    });

    return message;
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus, technicianName?: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error("Chamado não encontrado.");
  }

  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      assignedTechnicianName: technicianName?.trim() || ticket.assignedTechnicianName,
      lastReplyAt: new Date(),
    },
  });
}

export function getTicketMetrics(tickets: Awaited<ReturnType<typeof listSupportTickets>>) {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "OPEN").length,
    inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
    resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
  };
}
