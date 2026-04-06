import {
  CATEGORY_OPTIONS,
  DESK_OPTIONS,
  OPERATOR_OPTIONS,
  TICKET_TYPE_OPTIONS,
} from "../support-desk.constants";
import type {
  MessageAuthorRole,
  Ticket,
  TicketRouting,
  TicketStatus,
} from "../support-desk.types";
import styles from "../support-desk-page.module.css";
import primitiveStyles from "./primitives.module.css";
import { formatDate } from "./shared";

type TicketModalProps = {
  ticket: Ticket;
  isTechnician: boolean;
  isSubmitting: boolean;
  ticketRouting: TicketRouting;
  technicianReply: string;
  clientReply: string;
  onClose: () => void;
  onStart: () => void;
  onSchedule: () => void;
  onResolve: () => void;
  onCloseTicket: () => void;
  onTicketRoutingChange: <K extends keyof TicketRouting>(field: K, value: TicketRouting[K]) => void;
  onTechnicianReplyChange: (value: string) => void;
  onClientReplyChange: (value: string) => void;
  onStatusUpdate: (status: TicketStatus) => void;
  onReply: (authorRole: MessageAuthorRole) => void;
};

export function TicketModal({
  ticket,
  isTechnician,
  isSubmitting,
  ticketRouting,
  technicianReply,
  clientReply,
  onClose,
  onStart,
  onSchedule,
  onResolve,
  onCloseTicket,
  onTicketRoutingChange,
  onTechnicianReplyChange,
  onClientReplyChange,
  onStatusUpdate,
  onReply,
}: TicketModalProps) {
  return (
    <div className={styles.ticketModalOverlay} onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        className={styles.ticketModal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.ticketModalHeader}>
          <div className={styles.ticketModalTitle}>
            <span className={styles.ticketFlag} aria-hidden="true">
              ⚑
            </span>
            <div>
              <strong>Ticket #{ticket.protocol}</strong>
              <h2>{ticket.subject}</h2>
              <p>{ticket.description}</p>
            </div>
          </div>

          <div className={styles.ticketModalActions}>
            <button className={styles.playButton} onClick={onStart} type="button">
              Play
            </button>
            <button className={styles.scheduleButton} onClick={onSchedule} type="button">
              Agendar
            </button>
            <button className={styles.closeButton} onClick={onClose} type="button">
              Fechar
            </button>
          </div>
        </div>

        <div className={styles.ticketModalBody}>
          <div className={styles.ticketModalFilters}>
            <label className={styles.ticketField}>
              <span>Mesa</span>
              <select
                className={primitiveStyles.select}
                onChange={(event) => onTicketRoutingChange("desk", event.target.value)}
                value={ticketRouting.desk}
              >
                {DESK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.ticketField}>
              <span>Operador</span>
              <select
                className={primitiveStyles.select}
                onChange={(event) => onTicketRoutingChange("operator", event.target.value)}
                value={ticketRouting.operator}
              >
                <option value="">Selecione</option>
                {OPERATOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.ticketField}>
              <span>Tipo de ticket</span>
              <select
                className={primitiveStyles.select}
                onChange={(event) => onTicketRoutingChange("ticketType", event.target.value)}
                value={ticketRouting.ticketType}
              >
                <option value="">Selecione</option>
                {TICKET_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.ticketField}>
              <span>Categorias</span>
              <select
                className={primitiveStyles.select}
                onChange={(event) => onTicketRoutingChange("category", event.target.value)}
                value={ticketRouting.category}
              >
                <option value="">Selecione</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.ticketChat}>
            <div className={styles.ticketChatIntro}>
              <span className={styles.eyebrow}>Comentários</span>
              <div className={styles.ticketChatStats}>
                <span>{ticket.messages.length} interações</span>
                <span>{formatDate(ticket.lastReplyAt ?? ticket.updatedAt)}</span>
              </div>
            </div>

            <div className={styles.ticketChatList}>
              {ticket.messages.map((message) => {
                const authorInitials = message.authorName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("");

                return (
                  <article className={styles.ticketChatItem} key={message.id}>
                    <div className={styles.ticketChatAvatar}>{authorInitials}</div>
                    <div className={styles.ticketChatCard}>
                      <div className={styles.ticketChatMeta}>
                        <strong>{message.authorName}</strong>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      <p>{message.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className={styles.ticketChatComposer}>
            <div className={styles.ticketChatComposerHeader}>
              <span className={primitiveStyles.eyebrow}>{isTechnician ? "Resposta técnica" : "Nova mensagem"}</span>
              <p>
                {isTechnician
                  ? "Responda o chamado e mantenha o histórico no próprio atendimento."
                  : "Envie informações adicionais para a equipe responsável."}
              </p>
            </div>

            <textarea
              className={primitiveStyles.textarea}
              onChange={(event) =>
                isTechnician
                  ? onTechnicianReplyChange(event.target.value)
                  : onClientReplyChange(event.target.value)
              }
              placeholder={isTechnician ? "Escreva a atualização técnica" : "Descreva o complemento do chamado"}
              value={isTechnician ? technicianReply : clientReply}
            />

            <div className={styles.ticketChatComposerActions}>
              {isTechnician ? (
                <>
                  <button
                    className={primitiveStyles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={() => onStatusUpdate("WAITING_CUSTOMER")}
                    type="button"
                  >
                    Pausar
                  </button>
                  <button
                    className={primitiveStyles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={() => onStatusUpdate("WAITING_THIRD_PARTY")}
                    type="button"
                  >
                    Aguardar terceiros
                  </button>
                  <button
                    className={primitiveStyles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={onResolve}
                    type="button"
                  >
                    Resolver
                  </button>
                  <button
                    className={primitiveStyles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={onCloseTicket}
                    type="button"
                  >
                    Encerrar
                  </button>
                </>
              ) : null}

              <button
                className={primitiveStyles.primaryButton}
                disabled={isSubmitting}
                onClick={() => onReply(isTechnician ? "TECHNICIAN" : "CLIENT")}
                type="button"
              >
                Enviar mensagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
