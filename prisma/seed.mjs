import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.supportTicketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();

  const ticketOne = await prisma.supportTicket.create({
    data: {
      protocol: "CH-20260326-001",
      subject: "Erro ao emitir venda no caixa",
      category: "Sistema",
      priority: "HIGH",
      status: "IN_PROGRESS",
      customerName: "Atlas Engenharia",
      customerEmail: "compras@atlasengenharia.com.br",
      customerPhone: "41999990001",
      customerCompany: "Atlas Engenharia",
      description: "O operador informa que a venda trava ao confirmar o pagamento no PDV.",
      assignedTechnicianName: "Marina Lopes",
      lastReplyAt: new Date("2026-03-26T11:15:00.000Z"),
      messages: {
        create: [
          {
            authorRole: "CLIENT",
            authorName: "Atlas Engenharia",
            body: "A venda congela quando tentamos confirmar no caixa 02.",
            createdAt: new Date("2026-03-26T10:40:00.000Z"),
          },
          {
            authorRole: "TECHNICIAN",
            authorName: "Marina Lopes",
            body: "Recebi o chamado e estou validando os logs do PDV.",
            createdAt: new Date("2026-03-26T11:15:00.000Z"),
          },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      protocol: "CH-20260326-002",
      subject: "Solicitação de treinamento para equipe nova",
      category: "Treinamento",
      priority: "MEDIUM",
      status: "OPEN",
      customerName: "Grupo Nexo",
      customerEmail: "financeiro@gruponexo.com.br",
      customerPhone: "41999990002",
      customerCompany: "Grupo Nexo",
      description: "Precisamos agendar treinamento para a equipe administrativa ainda esta semana.",
      messages: {
        create: [
          {
            authorRole: "CLIENT",
            authorName: "Grupo Nexo",
            body: "Queremos alinhar um treinamento remoto para 6 pessoas.",
            createdAt: new Date("2026-03-26T09:05:00.000Z"),
          },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      protocol: "CH-20260326-003",
      subject: "Dúvida sobre integração de impressora",
      category: "Implantação",
      priority: "LOW",
      status: "RESOLVED",
      customerName: "Costa Telecom",
      customerEmail: "vendas@costatelecom.com.br",
      customerPhone: "41999990004",
      customerCompany: "Costa Telecom",
      description: "Precisávamos confirmar o modelo homologado para a impressora térmica.",
      assignedTechnicianName: "Igor Mendes",
      lastReplyAt: new Date("2026-03-25T18:20:00.000Z"),
      messages: {
        create: [
          {
            authorRole: "CLIENT",
            authorName: "Costa Telecom",
            body: "Qual modelo de impressora térmica está homologado?",
            createdAt: new Date("2026-03-25T17:50:00.000Z"),
          },
          {
            authorRole: "TECHNICIAN",
            authorName: "Igor Mendes",
            body: "Para este ambiente, homologamos os modelos Epson TM-T20X e Elgin i9.",
            createdAt: new Date("2026-03-25T18:20:00.000Z"),
          },
        ],
      },
    },
  });

  console.log(`Seeded tickets: ${ticketOne.protocol}, CH-20260326-002, CH-20260326-003`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
