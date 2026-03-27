import { NextRequest, NextResponse } from "next/server";
import { createSupportTicket, getTicketMetrics, listSupportTickets, type TicketPriority } from "@/lib/support";

type CreateTicketBody = {
  subject?: string;
  category?: string;
  priority?: TicketPriority;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  description?: string;
};

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    const tickets = await listSupportTickets();
    const filteredTickets = email
      ? tickets.filter((ticket) => ticket.customerEmail.toLowerCase() === email)
      : tickets;

    return NextResponse.json({
      tickets: filteredTickets,
      metrics: getTicketMetrics(tickets),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Não foi possível carregar os chamados.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTicketBody;

    if (!body.subject?.trim() || !body.customerName?.trim() || !body.customerEmail?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: "Assunto, nome, e-mail e descrição são obrigatórios." },
        { status: 400 },
      );
    }

    const ticket = await createSupportTicket({
      subject: body.subject,
      category: body.category?.trim() || "Geral",
      priority: body.priority ?? "MEDIUM",
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerCompany: body.customerCompany,
      description: body.description,
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Não foi possível abrir o chamado.",
      },
      { status: 400 },
    );
  }
}
