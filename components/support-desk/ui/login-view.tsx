import { DEMO_ACCOUNTS } from "../support-desk.constants";
import type { LoginForm, UserRole } from "../support-desk.types";
import primitiveStyles from "./primitives.module.css";
import styles from "./login-view.module.css";

type LoginViewProps = {
  loginForm: LoginForm;
  onLoginFormChange: (field: keyof LoginForm, value: string) => void;
  onLogin: () => void;
  onDemoLogin: (role: UserRole) => void;
};

export function LoginView({
  loginForm,
  onLoginFormChange,
  onLogin,
  onDemoLogin,
}: LoginViewProps) {
  return (
    <section className={styles.loginShell}>
      <article className={styles.loginPromo}>
        <span className={`${primitiveStyles.eyebrow} ${styles.loginPromoEyebrow}`}>Novo template</span>
        <h1>Entre no portal e escolha seu perfil de acesso.</h1>
        <p>
          O login agora inclui o campo de perfil para distinguir cliente e técnico logo na
          entrada. A interface muda conforme o papel selecionado.
        </p>
        <div className={styles.promoGrid}>
          <div className={styles.promoCard}>
            <strong>Cliente</strong>
            <p>Abre chamado, acompanha protocolo e responde apenas os próprios tickets.</p>
          </div>
          <div className={styles.promoCard}>
            <strong>Técnico</strong>
            <p>Enxerga a fila completa, assume atendimento, responde e encerra chamados.</p>
          </div>
        </div>
      </article>

      <article className={styles.loginCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Acesso</span>
          <h2>Login</h2>
          <p>Escolha um perfil de teste para entrar direto ou use o formulário manual.</p>
        </div>

        <div className={primitiveStyles.formGrid}>
          <input
            className={primitiveStyles.input}
            onChange={(event) => onLoginFormChange("name", event.target.value)}
            placeholder="Nome"
            value={loginForm.name}
          />
          <input
            className={primitiveStyles.input}
            onChange={(event) => onLoginFormChange("email", event.target.value)}
            placeholder="E-mail"
            value={loginForm.email}
          />
          <input
            className={primitiveStyles.input}
            onChange={(event) => onLoginFormChange("password", event.target.value)}
            placeholder="Senha"
            type="password"
            value={loginForm.password}
          />
          <select
            className={primitiveStyles.select}
            onChange={(event) => onLoginFormChange("role", event.target.value)}
            value={loginForm.role}
          >
            <option value="CLIENT">Cliente</option>
            <option value="TECHNICIAN">Técnico</option>
          </select>
          <button className={primitiveStyles.primaryButton} onClick={onLogin} type="button">
            Entrar no portal
          </button>
        </div>

        <div className={styles.demoAccounts}>
          <button className={styles.demoAccountCard} onClick={() => onDemoLogin("CLIENT")} type="button">
            <span className={primitiveStyles.eyebrow}>Cliente teste</span>
            <strong>{DEMO_ACCOUNTS.CLIENT.name}</strong>
            <p>Entrar direto como cliente e ver somente os chamados desse cadastro.</p>
          </button>
          <button className={styles.demoAccountCard} onClick={() => onDemoLogin("TECHNICIAN")} type="button">
            <span className={primitiveStyles.eyebrow}>Técnico teste</span>
            <strong>{DEMO_ACCOUNTS.TECHNICIAN.name}</strong>
            <p>Entrar direto como técnico e liberar a fila completa de atendimento.</p>
          </button>
        </div>
      </article>
    </section>
  );
}
