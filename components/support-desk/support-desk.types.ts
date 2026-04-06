export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER"
  | "WAITING_THIRD_PARTY"
  | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MessageAuthorRole = "CLIENT" | "TECHNICIAN";
export type UserRole = "CLIENT" | "TECHNICIAN";

export type TicketMessage = {
  id: string;
  authorRole: MessageAuthorRole;
  authorName: string;
  body: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  protocol: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  priorityLabel: string;
  status: TicketStatus;
  statusLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerCompany: string | null;
  description: string;
  assignedTechnicianName: string | null;
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string | null;
  messages: TicketMessage[];
};

export type Session = {
  name: string;
  email: string;
  role: UserRole;
};

export type LoginForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type TicketForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  description: string;
};

export type TicketRouting = {
  desk: string;
  operator: string;
  ticketType: string;
  category: string;
};

export type Toast = {
  id: number;
  kind: "success" | "error";
  message: string;
};
