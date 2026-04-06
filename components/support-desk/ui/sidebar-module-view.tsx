import type { SidebarItem } from "../support-desk.constants";
import type { Session, Ticket } from "../support-desk.types";
import styles from "../support-desk-page.module.css";
import primitiveStyles from "./primitives.module.css";
import { PriorityBadge, formatDate, getStatusBadge } from "./shared";

type SidebarModuleViewProps = {
  selectedSidebarItem: SidebarItem;
  session: Session;
  tickets: Ticket[];
};

function getRecentMessages(tickets: Ticket[]) {
  return tickets
    .flatMap((ticket) =>
      ticket.messages.map((message) => ({
        ...message,
        ticketProtocol: ticket.protocol,
        ticketSubject: ticket.subject,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
}

export function SidebarModuleView({
  selectedSidebarItem,
  session,
  tickets,
}: SidebarModuleViewProps) {
  if (selectedSidebarItem === "Dashboards" || selectedSidebarItem === "Tickets") {
    return null;
  }

  const unresolvedTickets = tickets.filter((ticket) => ticket.status !== "RESOLVED");
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED");
  const urgentTickets = tickets.filter((ticket) => ticket.priority === "URGENT");
  const waitingThirdParty = tickets.filter((ticket) => ticket.status === "WAITING_THIRD_PARTY");
  const categories = Array.from(new Set(tickets.map((ticket) => ticket.category)));
  const assignedTechnicians = Array.from(
    new Set(tickets.map((ticket) => ticket.assignedTechnicianName).filter(Boolean)),
  );
  const recentMessages = getRecentMessages(tickets);

  switch (selectedSidebarItem) {
    case "Chat":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Chat operacional</span>
            <h2>Conversa recente da operação</h2>
            <p>Centraliza as últimas interações entre clientes e equipe técnica em uma única visão.</p>
          </div>

          <div className={styles.ticketChat}>
            <div className={styles.ticketChatIntro}>
              <div>
                <strong>Últimas mensagens</strong>
                <p>Mensagens mais recentes associadas aos tickets em andamento.</p>
              </div>
              <div className={styles.ticketChatStats}>
                <span>{recentMessages.length} mensagens</span>
                <span>{unresolvedTickets.length} tickets ativos</span>
              </div>
            </div>

            <div className={styles.ticketChatList}>
              {recentMessages.map((message) => {
                const initials = message.authorName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("");

                return (
                  <article className={styles.ticketChatItem} key={message.id}>
                    <div className={styles.ticketChatAvatar}>{initials}</div>
                    <div className={styles.ticketChatCard}>
                      <div className={styles.ticketChatMeta}>
                        <strong>{message.authorName}</strong>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      <p>{message.body}</p>
                      <span className={styles.moduleInlineMeta}>
                        {message.ticketProtocol} • {message.ticketSubject}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );

    case "Tarefas":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Tarefas</span>
            <h2>Fila de trabalho priorizada</h2>
            <p>Transforma os tickets em ações objetivas para acompanhar execução, prioridade e dono.</p>
          </div>

          <div className={styles.opsPanel}>
            <div className={styles.opsCard}>
              <span className={primitiveStyles.eyebrow}>Em aberto</span>
              <strong>{unresolvedTickets.length}</strong>
              <p>Chamados que ainda exigem ação da operação.</p>
            </div>
            <div className={styles.opsCard}>
              <span className={primitiveStyles.eyebrow}>Críticas</span>
              <strong>{urgentTickets.length}</strong>
              <p>Itens com maior impacto e necessidade de resposta rápida.</p>
            </div>
            <div className={styles.opsCard}>
              <span className={primitiveStyles.eyebrow}>Sem responsável</span>
              <strong>{tickets.filter((ticket) => !ticket.assignedTechnicianName).length}</strong>
              <p>Tickets que ainda precisam de direcionamento interno.</p>
            </div>
          </div>

          <div className={styles.ticketCards}>
            {unresolvedTickets.slice(0, 6).map((ticket) => (
              <article className={styles.ticketCard} key={ticket.id}>
                <div className={styles.ticketCardTopline}>
                  <span>{ticket.protocol}</span>
                  <span>{formatDate(ticket.updatedAt)}</span>
                </div>
                <div className={styles.ticketHeader}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <div className={styles.ticketMeta}>
                      <span>{ticket.customerName}</span>
                      <span>{ticket.assignedTechnicianName ?? "Sem técnico"}</span>
                    </div>
                  </div>
                  <div className={styles.badges}>
                    <span className={getStatusBadge(ticket.status)}>{ticket.statusLabel}</span>
                    <PriorityBadge label={ticket.priorityLabel} priority={ticket.priority} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      );

    case "Projetos BETA":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Projetos BETA</span>
            <h2>Iniciativas conectadas ao suporte</h2>
            <p>Organiza frentes de melhoria contínua e evolução de produto a partir do histórico de chamados.</p>
          </div>

          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Implantações</span>
              <strong>{tickets.filter((ticket) => ticket.category === "Implantação").length}</strong>
              <p>Tickets ligados a onboarding, setup e entrada de operação.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Dependências externas</span>
              <strong>{waitingThirdParty.length}</strong>
              <p>Demandas que ainda aguardam fornecedor, cliente ou integração parceira.</p>
            </article>
          </div>

          <div className={styles.moduleGrid}>
            <article className={styles.insightCard}>
              <span className={primitiveStyles.eyebrow}>Roadmap atual</span>
              <strong>Painel do cliente</strong>
              <p>Consolidar autosserviço, comentários e acompanhamento em uma visão única.</p>
            </article>
            <article className={styles.insightCard}>
              <span className={primitiveStyles.eyebrow}>Próxima entrega</span>
              <strong>Relatórios de SLA</strong>
              <p>Expor métricas operacionais para gestão, faturamento e clientes estratégicos.</p>
            </article>
            <article className={styles.insightCard}>
              <span className={primitiveStyles.eyebrow}>Risco mapeado</span>
              <strong>Integrações pendentes</strong>
              <p>Chamados em espera indicam onde a operação depende de terceiros para evoluir.</p>
            </article>
          </div>
        </section>
      );

    case "Relatórios":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Relatórios</span>
            <h2>Indicadores para acompanhar volume, resposta e resolução</h2>
            <p>Mostra rapidamente onde a operação está acelerando, acumulando ou travando.</p>
          </div>

          <div className={styles.metricsStrip}>
            <article className={styles.metricCard}>
              <span className={primitiveStyles.eyebrow}>Total</span>
              <strong>{tickets.length}</strong>
              <p>Chamados carregados nesta demonstração.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={primitiveStyles.eyebrow}>Resolvidos</span>
              <strong>{resolvedTickets.length}</strong>
              <p>Itens concluídos e finalizados pela equipe.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={primitiveStyles.eyebrow}>Aguardando</span>
              <strong>{waitingThirdParty.length}</strong>
              <p>Dependências externas que afetam o SLA operacional.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={primitiveStyles.eyebrow}>Urgentes</span>
              <strong>{urgentTickets.length}</strong>
              <p>Chamados críticos que exigem atenção imediata.</p>
            </article>
          </div>
        </section>
      );

    case "Faturamento":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Faturamento</span>
            <h2>Prévia operacional para cobrança e fechamento mensal</h2>
            <p>Usa os chamados concluídos como base para apontamento de horas e eventos faturáveis.</p>
          </div>

          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Itens faturáveis</span>
              <strong>{resolvedTickets.length}</strong>
              <p>Chamados concluídos que podem entrar na apuração do período.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Base estimada</span>
              <strong>R$ {(resolvedTickets.length * 180).toLocaleString("pt-BR")}</strong>
              <p>Simulação simples para visualizar potencial de fechamento mensal.</p>
            </article>
          </div>

          <div className={styles.panelMuted}>
            <span className={primitiveStyles.eyebrow}>Observação</span>
            <p>
              Este módulo demonstra como o suporte pode alimentar faturamento por ticket resolvido,
              categoria atendida e volume de horas direcionadas por cliente.
            </p>
          </div>
        </section>
      );

    case "Base de conhecimento":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Base de conhecimento</span>
            <h2>Artigos recomendados a partir dos chamados mais frequentes</h2>
            <p>Ajuda a transformar reincidência em conteúdo reutilizável para clientes e equipe.</p>
          </div>

          <div className={styles.ticketCards}>
            {categories.map((category) => (
              <article className={styles.ticketCard} key={category}>
                <div className={styles.ticketCardTopline}>
                  <span>{category}</span>
                  <span>
                    {tickets.filter((ticket) => ticket.category === category).length} ocorrência(s)
                  </span>
                </div>
                <strong>Guia rápido para {category.toLowerCase()}</strong>
                <div className={styles.ticketMeta}>
                  <span>Checklist de atendimento</span>
                  <span>Passo a passo de abertura</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      );

    case "Cadastros":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Cadastros</span>
            <h2>Visão rápida das entidades operacionais</h2>
            <p>Resume técnicos, categorias e empresas ativas que já aparecem na rotina do suporte.</p>
          </div>

          <div className={styles.opsPanel}>
            <div className={styles.opsCard}>
              <span className={primitiveStyles.eyebrow}>Técnicos</span>
              <strong>{assignedTechnicians.length}</strong>
              <p>Profissionais vinculados aos chamados atuais.</p>
            </div>
            <div className={styles.opsCard}>
              <span className={primitiveStyles.eyebrow}>Categorias</span>
              <strong>{categories.length}</strong>
              <p>Tipos de demanda recorrentes no ambiente.</p>
            </div>
            <div className={styles.opsCard}>
              <span className={primitiveStyles.eyebrow}>Clientes</span>
              <strong>{new Set(tickets.map((ticket) => ticket.customerEmail)).size}</strong>
              <p>Contatos distintos com tickets registrados.</p>
            </div>
          </div>
        </section>
      );

    case "Configurações":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Configurações</span>
            <h2>Controles que ajustam o comportamento da central</h2>
            <p>Concentra preferências operacionais, idioma, filas e padrões de atendimento.</p>
          </div>

          <div className={styles.moduleGrid}>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Idioma atual</span>
              <strong>{session.role === "TECHNICIAN" ? "Painel técnico" : "Portal cliente"}</strong>
              <p>O idioma do site já pode ser alterado pelo menu de perfil.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Padrão de fila</span>
              <strong>Kanban operacional</strong>
              <p>Fluxo com etapas abertas, em progresso, pausadas, externas e resolvidas.</p>
            </article>
          </div>
        </section>
      );

    case "Proteção Geral de Dados":
      return (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={primitiveStyles.eyebrow}>Proteção Geral de Dados</span>
            <h2>Controles de privacidade e rastreabilidade do atendimento</h2>
            <p>Ajuda a visualizar onde existem dados pessoais e quais fluxos exigem mais cuidado.</p>
          </div>

          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Contatos com e-mail</span>
              <strong>{tickets.filter((ticket) => Boolean(ticket.customerEmail)).length}</strong>
              <p>Registros com dado pessoal presente na fila atual.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={primitiveStyles.eyebrow}>Dados com telefone</span>
              <strong>{tickets.filter((ticket) => Boolean(ticket.customerPhone)).length}</strong>
              <p>Casos em que o canal adicional também foi informado.</p>
            </article>
          </div>

          <div className={styles.panelMuted}>
            <span className={primitiveStyles.eyebrow}>Checklist mínimo</span>
            <ul className={styles.moduleList}>
              <li>Limitar acesso por perfil e contexto operacional.</li>
              <li>Registrar histórico de resposta e mudança de status.</li>
              <li>Revisar retenção de dados de tickets resolvidos.</li>
            </ul>
          </div>
        </section>
      );

    default:
      return null;
  }
}
