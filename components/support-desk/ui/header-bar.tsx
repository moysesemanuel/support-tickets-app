import type { RefObject } from "react";
import type { Session } from "../support-desk.types";
import primitiveStyles from "./primitives.module.css";
import styles from "./header-bar.module.css";

type HeaderBarProps = {
  isTechnician: boolean;
  profileInitials: string;
  profileMenuRef: RefObject<HTMLDivElement | null>;
  isProfileMenuOpen: boolean;
  session: Session;
  siteLanguage: string;
  onOpenNewTicket: () => void;
  onToggleProfileMenu: () => void;
  onChangePassword: () => void;
  onSiteLanguageChange: (value: string) => void;
  onLogout: () => void;
};

export function HeaderBar({
  isTechnician,
  profileInitials,
  profileMenuRef,
  isProfileMenuOpen,
  session,
  siteLanguage,
  onOpenNewTicket,
  onToggleProfileMenu,
  onChangePassword,
  onSiteLanguageChange,
  onLogout,
}: HeaderBarProps) {
  return (
    <section className={styles.headerBar}>
      <div className={styles.headerUtilityBar}>
        <button className={primitiveStyles.primaryButton} onClick={onOpenNewTicket} type="button">
          Novo Ticket
        </button>

        <div className={styles.profileMenuWrap} ref={profileMenuRef}>
          <button className={styles.profileButton} onClick={onToggleProfileMenu} type="button">
            <span className={styles.profileAvatar}>{profileInitials}</span>
          </button>

          {isProfileMenuOpen ? (
            <div className={styles.profileMenu}>
              <div className={styles.profileMenuHeader}>
                <strong>{session.name}</strong>
                <span>{session.email}</span>
              </div>

              <button className={styles.profileMenuAction} onClick={onChangePassword} type="button">
                Alterar senha
              </button>

              <label className={styles.languageField}>
                <span>Idioma do site</span>
                <select
                  className={styles.languageSelect}
                  onChange={(event) => onSiteLanguageChange(event.target.value)}
                  value={siteLanguage}
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </label>

              <button className={styles.profileMenuLogout} onClick={onLogout} type="button">
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.headerCopy}>
        <span className={primitiveStyles.eyebrow}>Central de atendimento</span>
        <h1>{isTechnician ? "Mesa de atendimento" : "Portal de chamados"}</h1>
        <p>
          {isTechnician
            ? "Triagem, resposta e resolução em uma única fila operacional."
            : "Acompanhe seus chamados, histórico e retorno do suporte em tempo real."}
        </p>
      </div>
    </section>
  );
}
