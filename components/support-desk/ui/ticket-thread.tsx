import type { MessageAuthorRole, Ticket, TicketStatus } from "../support-desk.types";
import styles from "../support-desk-page.module.css";
import primitiveStyles from "./primitives.module.css";
import { PriorityBadge, formatDate, getStatusBadge } from "./shared";

type TicketThreadProps = {
  isVisible: boolean;
  selectedTicket: Ticket | null;
  isTechnician: boolean;
  isSubmitting: boolean;
  clientReply: string;
  technicianReply: string;
  onClientReplyChange: (value: string) => void;
  onTechnicianReplyChange: (value: string) => void;
  onReply: (authorRole: MessageAuthorRole) => void;
  onStatusUpdate: (status: TicketStatus) => void;
};

export function TicketThread({
  isVisible,
  selectedTicket,
  isTechnician,
  isSubmitting,
  clientReply,
  technicianReply,
  onClientReplyChange,
  onTechnicianReplyChange,
  onReply,
  onStatusUpdate,
}: TicketThreadProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.rightStage}>
      <section className={styles.thread}>
        {selectedTicket ? (
          <>
            <div className={styles.threadHeader}>
              <span className={primitiveStyles.eyebrow}>Ticket em foco</span>
              <h3>{selectedTicket.subject}</h3>
              <p>
                {selectedTicket.protocol} • {selectedTicket.customerName} •{" "}
                {selectedTicket.customerCompany ?? "Sem empresa informada"}
              </p>
              <div className={styles.badges}>
                <span className={getStatusBadge(selectedTicket.status)}>{selectedTicket.statusLabel}</span>
                <PriorityBadge label={selectedTicket.priorityLabel} priority={selectedTicket.priority} />
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <span className={primitiveStyles.eyebrow}>Contato</span>
                <strong className={styles.contactEmail}>{selectedTicket.customerEmail}</strong>
                <p>{selectedTicket.customerPhone ?? "Telefone não informado"}</p>
              </div>
              <div className={styles.summaryCard}>
                <span className={primitiveStyles.eyebrow}>Última atualização</span>
                <strong>{formatDate(selectedTicket.lastReplyAt ?? selectedTicket.updatedAt)}</strong>
                <p>
                  {selectedTicket.assignedTechnicianName
                    ? `Técnico: ${selectedTicket.assignedTechnicianName}`
                    : "Aguardando responsável"}
                </p>
              </div>
              <div className={styles.summaryCard}>
                <span className={primitiveStyles.eyebrow}>Categoria</span>
                <strong>{selectedTicket.category}</strong>
                <p>{selectedTicket.customerCompany ?? "Sem empresa informada"}</p>
              </div>
            </div>

            <div className={styles.panelMuted}>
              <span className={primitiveStyles.eyebrow}>Descrição inicial</span>
              <p>{selectedTicket.description}</p>
            </div>

            <div className={styles.messages}>
              {selectedTicket.messages.map((message) => (
                <article
                  className={message.authorRole === "TECHNICIAN" ? styles.messageBubbleTech : styles.messageBubble}
                  key={message.id}
                >
                  <div className={styles.messageMeta}>
                    <span>{message.authorName}</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <p>{message.body}</p>
                </article>
              ))}
            </div>

            {isTechnician ? (
              <div className={styles.actionPanel}>
                <div className={styles.sectionHeader}>
                  <span className={primitiveStyles.eyebrow}>Resposta técnica</span>
                  <p>Seu login identifica automaticamente o autor e o perfil do atendimento.</p>
                </div>
                <textarea
                  className={primitiveStyles.textarea}
                  onChange={(event) => onTechnicianReplyChange(event.target.value)}
                  placeholder="Escreva a resposta técnica"
                  value={technicianReply}
                />
                <div className={styles.actionRow}>
                  <button
                    className={primitiveStyles.primaryButton}
                    disabled={isSubmitting}
                    onClick={() => onReply("TECHNICIAN")}
                    type="button"
                  >
                    Responder como técnico
                  </button>
                  <button
                    className={primitiveStyles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={() => onStatusUpdate("IN_PROGRESS")}
                    type="button"
                  >
                    Assumir atendimento
                  </button>
                </div>
                <div className={styles.statusRow}>
                  <button className={primitiveStyles.statusButton} onClick={() => onStatusUpdate("WAITING_CUSTOMER")} type="button">
                    Aguardar cliente
                  </button>
                  <button className={primitiveStyles.statusButton} onClick={() => onStatusUpdate("WAITING_THIRD_PARTY")} type="button">
                    Aguardar terceiros
                  </button>
                  <button className={primitiveStyles.statusButton} onClick={() => onStatusUpdate("RESOLVED")} type="button">
                    Resolver
                  </button>
                  {selectedTicket.status === "RESOLVED" ? (
                    <button className={primitiveStyles.statusButton} onClick={() => onStatusUpdate("OPEN")} type="button">
                      Reabrir
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className={styles.actionPanel}>
                <div className={styles.sectionHeader}>
                  <span className={primitiveStyles.eyebrow}>Responder chamado</span>
                  <p>Como cliente, você envia complemento apenas para os tickets do seu login.</p>
                </div>
                <textarea
                  className={primitiveStyles.textarea}
                  onChange={(event) => onClientReplyChange(event.target.value)}
                  placeholder="Adicione informações para o técnico"
                  value={clientReply}
                />
                <button
                  className={primitiveStyles.primaryButton}
                  disabled={isSubmitting}
                  onClick={() => onReply("CLIENT")}
                  type="button"
                >
                  Enviar resposta
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyStage}>
            <span className={primitiveStyles.eyebrow}>Sem seleção</span>
            <h3>Nenhum chamado aberto</h3>
            <p>Escolha um item da lista para visualizar o histórico e as ações disponíveis.</p>
          </div>
        )}
      </section>
    </div>
  );
}
