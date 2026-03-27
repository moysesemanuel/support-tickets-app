import { NextRequest, NextResponse } from "next/server";
import { addTicketMessage, type MessageAuthorRole } from "@/lib/support";

type CreateMessageBody = {
  authorRole?: MessageAuthorRole;
  authorName?: string;
  body?: string;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> },
) {
  try {
    const body = (await request.json()) as CreateMessageBody;
    const params = await context.params;

    if (!body.authorRole || !body.authorName?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "Perfil, nome e mensagem são obrigatórios." },
        { status: 400 },
      );
    }

    const message = await addTicketMessage({
      ticketId: params.ticketId,
      authorRole: body.authorRole,
      authorName: body.authorName,
      body: body.body,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Não foi possível enviar a resposta.",
      },
      { status: 400 },
    );
  }
}
