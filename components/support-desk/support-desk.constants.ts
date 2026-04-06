import type { Session, TicketForm, TicketRouting, UserRole } from "./support-desk.types";

export const SESSION_STORAGE_KEY = "support-tickets-session";

export const DEMO_ACCOUNTS = {
  CLIENT: {
    name: "Atlas Engenharia",
    email: "compras@atlasengenharia.com.br",
    password: "cliente123",
    role: "CLIENT" as const,
  },
  TECHNICIAN: {
    name: "Marina Lopes",
    email: "marina.lopes@supportdesk.local",
    password: "tecnico123",
    role: "TECHNICIAN" as const,
  },
};

export const SIDEBAR_ITEMS = [
  "Dashboards",
  "Tickets",
  "Chat",
  "Tarefas",
  "Projetos BETA",
  "Relatórios",
  "Faturamento",
  "Base de conhecimento",
  "Cadastros",
  "Configurações",
  "Proteção Geral de Dados",
] as const;

export type SidebarItem = (typeof SIDEBAR_ITEMS)[number];

export const DESK_OPTIONS = [
  "TI - Plataformas",
  "TI - Infraestrutura",
  "Implantação",
  "Suporte N1",
] as const;

export const TICKET_TYPE_OPTIONS = [
  "Implantação",
  "Incidente",
  "Preventivo",
  "Problema",
] as const;

export const CATEGORY_OPTIONS = [
  "Acesso e Credenciais",
  "Redes e conectividade",
  "Sistemas Corporativos",
] as const;

export const OPERATOR_OPTIONS = [
  "Marina Lopes",
  "Igor Mendes",
  "Luana Xavier",
] as const;

export function createInitialTicketForm(session: Session | null): TicketForm {
  return {
    customerName: session?.role === "CLIENT" ? session.name : "",
    customerEmail: session?.role === "CLIENT" ? session.email : "",
    customerPhone: "",
    customerCompany: "",
    subject: "",
    category: "Sistema",
    priority: "MEDIUM",
    description: "",
  };
}

export function createInitialTicketRouting(): TicketRouting {
  return {
    desk: DESK_OPTIONS[0],
    operator: "",
    ticketType: "",
    category: "",
  };
}

export function getDemoAccount(role: UserRole) {
  return DEMO_ACCOUNTS[role];
}
