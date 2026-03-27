import { NextRequest, NextResponse } from "next/server";
import { updateTicketStatus, type TicketStatus } from "@/lib/support";

type UpdateStatusBody = {
  status?: TicketStatus;
  technicianName?: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> },
) {
  try {
    const body = (await request.json()) as UpdateStatusBody;
    const params = await context.params;

    if (!body.status) {
      return NextResponse.json({ error: "Status é obrigatório." }, { status: 400 });
    }

    const ticket = await updateTicketStatus(params.ticketId, body.status, body.technicianName);
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Não foi possível atualizar o chamado.",
      },
      { status: 400 },
    );
  }
}
