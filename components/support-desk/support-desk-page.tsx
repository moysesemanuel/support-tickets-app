"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import styles from "./support-desk-page.module.css";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type MessageAuthorRole = "CLIENT" | "TECHNICIAN";
type UserRole = "CLIENT" | "TECHNICIAN";

type TicketMessage = {
  id: string;
  authorRole: MessageAuthorRole;
  authorName: string;
  body: string;
  createdAt: string;
};

type Ticket = {
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

type Metrics = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
};

type Session = {
  name: string;
  email: string;
  role: UserRole;
};

type LoginForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type Toast = {
  id: number;
  kind: "success" | "error";
  message: string;
};

const SESSION_STORAGE_KEY = "support-tickets-session";
const DEMO_ACCOUNTS = {
  CLIENT: {
    name: "Atlas Engenharia",
    email: "compras@atlasengenharia.com.br",
    password: "cliente123",
    role: "CLIENT" as const,
  },
  TECHNICIAN: {
    name: "Marina Lopes",
    email: "marina.lopes@supportdesk.local",
    password: "tecnico123",
    role: "TECHNICIAN" as const,
  },
};

const SIDEBAR_ITEMS = [
  "Dashboards",
  "Tickets",
  "Chat",
  "Tarefas",
  "Projetos BETA",
  "Relatórios",
  "Faturamento",
  "Base de conhecimento",
  "Cadastros",
  "Configurações",
  "Proteção Geral de Dados",
] as const;

type SidebarItem = (typeof SIDEBAR_ITEMS)[number];

function formatDate(value: string | null) {
  if (!value) {
    return "Sem atualização";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return styles.badgeOpen;
    case "IN_PROGRESS":
      return styles.badgeProgress;
    case "WAITING_CUSTOMER":
      return styles.badgeWaiting;
    case "RESOLVED":
      return styles.badgeResolved;
    default:
      return styles.badge;
  }
}

function getPriorityBadge(priority: TicketPriority) {
  switch (priority) {
    case "LOW":
      return styles.badgeLow;
    case "MEDIUM":
      return styles.badgeMedium;
    case "HIGH":
      return styles.badgeHigh;
    case "URGENT":
      return styles.badgeUrgent;
    default:
      return styles.badge;
  }
}

function getLocalMetrics(sourceTickets: Ticket[]): Metrics {
  return {
    total: sourceTickets.length,
    open: sourceTickets.filter((ticket) => ticket.status === "OPEN").length,
    inProgress: sourceTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
    resolved: sourceTickets.filter((ticket) => ticket.status === "RESOLVED").length,
  };
}

export function SupportDeskPage() {
  const getInitialSession = (): Session | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const savedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!savedSession) {
      return null;
    }

    try {
      return JSON.parse(savedSession) as Session;
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  };

  const initialSession = getInitialSession();
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [, startLoadingTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    name: initialSession?.name ?? "",
    email: initialSession?.email ?? "",
    password: "",
    role: initialSession?.role ?? "CLIENT",
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ticketForm, setTicketForm] = useState({
    customerName: initialSession?.role === "CLIENT" ? initialSession.name : "",
    customerEmail: initialSession?.role === "CLIENT" ? initialSession.email : "",
    customerPhone: "",
    customerCompany: "",
    subject: "",
    category: "Sistema",
    priority: "MEDIUM" as TicketPriority,
    description: "",
  });
  const [clientReply, setClientReply] = useState("");
  const [technicianReply, setTechnicianReply] = useState("");
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem>("Tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [siteLanguage, setSiteLanguage] = useState("pt-BR");

  const isTechnician = session?.role === "TECHNICIAN";
  const isClient = session?.role === "CLIENT";

  function showToast(kind: Toast["kind"], message: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, kind, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function matchesSidebarFilter() {
    switch (selectedSidebarItem) {
      case "Dashboards":
      case "Tickets":
        return true;
      case "Chat":
      case "Tarefas":
      case "Projetos BETA":
      case "Relatórios":
      case "Faturamento":
      case "Base de conhecimento":
      case "Cadastros":
      case "Configurações":
      case "Proteção Geral de Dados":
        return false;
      default:
        return true;
    }
  }

  async function loadTickets(activeSession: Session) {
    const params =
      activeSession.role === "CLIENT"
        ? `?email=${encodeURIComponent(activeSession.email.trim().toLowerCase())}`
        : "";
    const response = await fetch(`/api/tickets${params}`, { cache: "no-store" });
    const payload = (await response.json()) as { tickets?: Ticket[]; metrics?: Metrics; error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "Não foi possível carregar os chamados.");
    }

    const nextTickets = payload.tickets ?? [];
    setTickets(nextTickets);
    setMetrics(
      activeSession.role === "TECHNICIAN"
        ? payload.metrics ?? getLocalMetrics(nextTickets)
        : getLocalMetrics(nextTickets),
    );
    setSelectedTicketId((current) => {
      if (current && nextTickets.some((ticket) => ticket.id === current)) {
        return current;
      }

      return nextTickets[0]?.id ?? "";
    });
  }

  useEffect(() => {
    if (!isHydrated || !session) {
      return;
    }

    startLoadingTransition(() => {
      void loadTickets(session).catch((error: unknown) => {
        showToast("error", error instanceof Error ? error.message : "Falha ao carregar os chamados.");
      });
    });
  }, [isHydrated, session]);

  const visibleTickets = tickets.filter((ticket) => {
    if (!matchesSidebarFilter()) {
      return false;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return [
      ticket.protocol,
      ticket.subject,
      ticket.customerName,
      ticket.category,
      ticket.customerEmail,
    ].some((value) => value.toLowerCase().includes(normalizedSearch));
  });
  const selectedTicket =
    visibleTickets.find((ticket) => ticket.id === selectedTicketId) ?? visibleTickets[0] ?? null;
  const urgentCount = tickets.filter((ticket) => ticket.priority === "URGENT").length;
  const waitingCustomerCount = tickets.filter((ticket) => ticket.status === "WAITING_CUSTOMER").length;
  const unassignedCount = tickets.filter((ticket) => !ticket.assignedTechnicianName).length;

  function resetTicketForm(activeSession: Session | null = session) {
    setTicketForm({
      customerName: activeSession?.role === "CLIENT" ? activeSession.name : "",
      customerEmail: activeSession?.role === "CLIENT" ? activeSession.email : "",
      customerPhone: "",
      customerCompany: "",
      subject: "",
      category: "Sistema",
      priority: "MEDIUM",
      description: "",
    });
  }

  function handleLogin() {
    const name = loginForm.name.trim();
    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.password.trim();

    if (!name || !email || !password) {
      showToast("error", "Preencha nome, e-mail, senha e perfil para entrar.");
      return;
    }

    const matchedAccount = Object.values(DEMO_ACCOUNTS).find(
      (account) =>
        account.role === loginForm.role &&
        account.email === email &&
        account.password === password &&
        account.name === name,
    );

    if (!matchedAccount) {
      showToast(
        "error",
        loginForm.role === "CLIENT"
          ? "Use a conta de cliente de teste para acessar esta área."
          : "Use a conta de técnico de teste para acessar esta área.",
      );
      return;
    }

    const nextSession: Session = {
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: matchedAccount.role,
    };

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setLoginForm((current) => ({ ...current, password: "" }));
    resetTicketForm(nextSession);
    showToast(
      "success",
      nextSession.role === "CLIENT"
        ? "Login de cliente realizado. Seus chamados foram filtrados pelo e-mail informado."
        : "Login de técnico realizado. A fila completa foi liberada para atendimento.",
    );
  }

  function handleDemoLogin(role: UserRole) {
    const account = DEMO_ACCOUNTS[role];

    setLoginForm({
      name: account.name,
      email: account.email,
      password: "",
      role: account.role,
    });

    const nextSession: Session = {
      name: account.name,
      email: account.email,
      role: account.role,
    };

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    resetTicketForm(nextSession);
    showToast(
      "success",
      role === "CLIENT"
        ? "Conta de cliente carregada para demonstração."
        : "Conta de técnico carregada para demonstração.",
    );
  }

  function handleLogout() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setTickets([]);
    setMetrics({ total: 0, open: 0, inProgress: 0, resolved: 0 });
    setSelectedTicketId("");
    setClientReply("");
    setTechnicianReply("");
    resetTicketForm(null);
    showToast("success", "Sessão encerrada.");
  }

  function handleOpenNewTicket() {
    setSelectedTicketId("");
    setSelectedSidebarItem("Tickets");
    showToast("success", "Formulário de novo ticket pronto para preenchimento.");
  }

  async function handleCreateTicket() {
    if (!session || session.role !== "CLIENT") {
      return;
    }

    startSubmitTransition(() => {
      void fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...ticketForm,
          customerName: session.name,
          customerEmail: session.email,
        }),
      })
        .then(async (response) => {
          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(payload.error ?? "Não foi possível abrir o chamado.");
          }

          resetTicketForm(session);
          await loadTickets(session);
          showToast("success", "Chamado aberto com sucesso.");
        })
        .catch((error: unknown) => {
          showToast("error", error instanceof Error ? error.message : "Falha ao abrir o chamado.");
        });
    });
  }

  async function handleReply(authorRole: MessageAuthorRole) {
    if (!selectedTicket || !session) {
      return;
    }

    const authorName = authorRole === "CLIENT" ? session.name : session.name;
    const body = authorRole === "CLIENT" ? clientReply : technicianReply;

    startSubmitTransition(() => {
      void fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorRole,
          authorName,
          body,
        }),
      })
        .then(async (response) => {
          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(payload.error ?? "Não foi possível enviar a resposta.");
          }

          if (authorRole === "CLIENT") {
            setClientReply("");
          } else {
            setTechnicianReply("");
          }

          await loadTickets(session);
          showToast(
            "success",
            authorRole === "CLIENT" ? "Atualização enviada pelo cliente." : "Resposta técnica enviada.",
          );
        })
        .catch((error: unknown) => {
          showToast("error", error instanceof Error ? error.message : "Falha ao enviar a mensagem.");
        });
    });
  }

  async function handleStatusUpdate(status: TicketStatus) {
    if (!selectedTicket || !session || session.role !== "TECHNICIAN") {
      return;
    }

    const statusMessageByAction: Record<TicketStatus, string> = {
      OPEN: "Chamado reaberto.",
      IN_PROGRESS: "Atendimento assumido.",
      WAITING_CUSTOMER: "Chamado marcado como aguardando cliente.",
      RESOLVED: "Chamado resolvido.",
    };

    startSubmitTransition(() => {
      void fetch(`/api/tickets/${selectedTicket.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          technicianName: session.name,
        }),
      })
        .then(async (response) => {
          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(payload.error ?? "Não foi possível atualizar o status.");
          }

          await loadTickets(session);
          showToast("success", statusMessageByAction[status]);
        })
        .catch((error: unknown) => {
          showToast("error", error instanceof Error ? error.message : "Falha ao atualizar o status.");
        });
    });
  }

  const toastViewport =
    toasts.length > 0 ? (
      <div className={styles.toastViewport} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            className={toast.kind === "success" ? styles.toastSuccess : styles.toastError}
            key={toast.id}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    ) : null;

  if (!isHydrated) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          {toastViewport}
          <section className={styles.loginShell}>
            <div className={styles.loginCard}>
              <span className={styles.eyebrow}>Support Desk</span>
              <h1>Preparando ambiente...</h1>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          {toastViewport}
          <section className={styles.loginShell}>
            <article className={styles.loginPromo}>
              <span className={styles.eyebrow}>Novo template</span>
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

              <div className={styles.formGrid}>
                <input
                  className={styles.input}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nome"
                  value={loginForm.name}
                />
                <input
                  className={styles.input}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="E-mail"
                  value={loginForm.email}
                />
                <input
                  className={styles.input}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Senha"
                  type="password"
                  value={loginForm.password}
                />
                <select
                  className={styles.select}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      role: event.target.value as UserRole,
                    }))
                  }
                  value={loginForm.role}
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="TECHNICIAN">Técnico</option>
                </select>
                <button className={styles.primaryButton} onClick={handleLogin} type="button">
                  Entrar no portal
                </button>
              </div>

              <div className={styles.demoAccounts}>
                <button
                  className={styles.demoAccountCard}
                  onClick={() => handleDemoLogin("CLIENT")}
                  type="button"
                >
                  <span className={styles.eyebrow}>Cliente teste</span>
                  <strong>{DEMO_ACCOUNTS.CLIENT.name}</strong>
                  <p>Entrar direto como cliente e ver somente os chamados desse cadastro.</p>
                </button>
                <button
                  className={styles.demoAccountCard}
                  onClick={() => handleDemoLogin("TECHNICIAN")}
                  type="button"
                >
                  <span className={styles.eyebrow}>Técnico teste</span>
                  <strong>{DEMO_ACCOUNTS.TECHNICIAN.name}</strong>
                  <p>Entrar direto como técnico e liberar a fila completa de atendimento.</p>
                </button>
              </div>

            </article>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        {toastViewport}
        <section className={styles.workspaceShell}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBrand}>
              <span className={styles.sidebarEyebrow}>Help Desk</span>
              <strong>Milvus Desk</strong>
              <p>{isTechnician ? "Operação técnica" : "Área do cliente"}</p>
            </div>

            <nav className={styles.sidebarMenu} aria-label="Navegação de tickets">
              <div className={styles.sidebarSearchWrap}>
                <span className={styles.sidebarSearchIcon} aria-hidden="true">
                  &#128269;
                </span>
                <input
                  className={styles.sidebarSearchInput}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar"
                  type="search"
                  value={searchTerm}
                />
              </div>

              {SIDEBAR_ITEMS.map((item) => (
                <button
                  className={
                    item === selectedSidebarItem ? styles.sidebarMenuButtonActive : styles.sidebarMenuButton
                  }
                  key={item}
                  onClick={() => setSelectedSidebarItem(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>

          <div className={styles.mainStage}>
            <section className={styles.headerBar}>
              <div className={styles.headerUtilityBar}>
                <button className={styles.primaryButton} onClick={handleOpenNewTicket} type="button">
                  Novo Ticket
                </button>

                <div className={styles.profileMenuWrap}>
                  <button
                    className={styles.profileButton}
                    onClick={() => setIsProfileMenuOpen((current) => !current)}
                    type="button"
                  >
                    <span className={styles.profileGreeting}>Olá, {session.name.split(" ")[0]}</span>
                    <span className={styles.profileRole}>
                      {isTechnician ? "Perfil técnico" : "Perfil cliente"}
                    </span>
                  </button>

                  {isProfileMenuOpen ? (
                    <div className={styles.profileMenu}>
                      <div className={styles.profileMenuHeader}>
                        <strong>{session.name}</strong>
                        <span>{session.email}</span>
                      </div>

                      <button
                        className={styles.profileMenuAction}
                        onClick={() => {
                          showToast("success", "Fluxo de alteração de senha ainda não foi implementado.");
                          setIsProfileMenuOpen(false);
                        }}
                        type="button"
                      >
                        Alterar senha
                      </button>

                      <label className={styles.languageField}>
                        <span>Idioma do site</span>
                        <select
                          className={styles.languageSelect}
                          onChange={(event) => {
                            setSiteLanguage(event.target.value);
                            showToast("success", `Idioma alterado para ${event.target.value}.`);
                          }}
                          value={siteLanguage}
                        >
                          <option value="pt-BR">Português (BR)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                        </select>
                      </label>

                      <button
                        className={styles.profileMenuLogout}
                        onClick={handleLogout}
                        type="button"
                      >
                        Sair
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.headerCopy}>
                <span className={styles.eyebrow}>Central de atendimento</span>
                <h1>{isTechnician ? "Mesa de atendimento" : "Portal de chamados"}</h1>
                <p>
                  {isTechnician
                    ? "Triagem, resposta e resolução em uma única fila operacional."
                    : "Acompanhe seus chamados, histórico e retorno do suporte em tempo real."}
                </p>
              </div>

              <div className={styles.metricsStrip}>
                <div className={styles.metricCard}>
                  <span className={styles.eyebrow}>{isTechnician ? "Fila total" : "Meus chamados"}</span>
                  <strong>{metrics.total}</strong>
                  <p>{isTechnician ? "Volume disponível para triagem." : "Tickets vinculados ao seu login."}</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.eyebrow}>Abertos</span>
                  <strong>{metrics.open}</strong>
                  <p>Itens aguardando primeiro movimento.</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.eyebrow}>Em andamento</span>
                  <strong>{metrics.inProgress}</strong>
                  <p>Atendimentos ativos na operação.</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.eyebrow}>Resolvidos</span>
                  <strong>{metrics.resolved}</strong>
                  <p>Casos encerrados com histórico salvo.</p>
                </div>
              </div>
            </section>

            <section className={styles.dashboardGrid}>
              <div className={styles.queueRail}>
                <section className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.eyebrow}>Visão atual</span>
                    <h2>{selectedSidebarItem}</h2>
                    <p>
                      {visibleTickets.length > 0
                        ? `${visibleTickets.length} registro(s) disponível(is) nesta visão.`
                        : "Nenhum chamado encontrado para este perfil."}
                    </p>
                  </div>

                  {selectedSidebarItem === "Tickets" || selectedSidebarItem === "Dashboards" ? (
                    <div className={styles.ticketCards}>
                      {visibleTickets.length === 0 ? (
                        <div className={styles.emptyState}>Nenhum chamado disponível.</div>
                      ) : (
                        visibleTickets.map((ticket) => (
                          <button
                            className={ticket.id === selectedTicket?.id ? styles.ticketCardActive : styles.ticketCard}
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            type="button"
                          >
                            <div className={styles.ticketCardTopline}>
                              <span>{ticket.protocol}</span>
                              <span>{formatDate(ticket.lastReplyAt ?? ticket.updatedAt)}</span>
                            </div>
                            <div className={styles.ticketHeader}>
                              <div>
                                <strong>{ticket.subject}</strong>
                                <div className={styles.ticketMeta}>
                                  <span>{ticket.customerName}</span>
                                  <span>{ticket.category}</span>
                                </div>
                              </div>
                              <div className={styles.badges}>
                                <span className={getStatusBadge(ticket.status)}>{ticket.statusLabel}</span>
                                <span className={getPriorityBadge(ticket.priority)}>{ticket.priorityLabel}</span>
                              </div>
                            </div>
                            <div className={styles.ticketFooterMeta}>
                              {ticket.assignedTechnicianName
                                ? `Responsável: ${ticket.assignedTechnicianName}`
                                : "Sem técnico responsável"}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      Este módulo ainda não possui conteúdo nesta demonstração.
                    </div>
                  )}
                </section>
              </div>

              <div className={styles.contentStage}>
                {isClient ? (
                  <section className={styles.panel}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.eyebrow}>Abertura</span>
                      <h2>Novo chamado</h2>
                      <p>Registre a solicitação e ela entra imediatamente na fila de atendimento.</p>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formRow}>
                        <input className={styles.input} disabled value={session.name} />
                        <input className={styles.input} disabled value={session.email} />
                      </div>
                      <div className={styles.formRow}>
                        <input
                          className={styles.input}
                          onChange={(event) =>
                            setTicketForm((current) => ({ ...current, customerPhone: event.target.value }))
                          }
                          placeholder="Telefone"
                          value={ticketForm.customerPhone}
                        />
                        <input
                          className={styles.input}
                          onChange={(event) =>
                            setTicketForm((current) => ({ ...current, customerCompany: event.target.value }))
                          }
                          placeholder="Empresa"
                          value={ticketForm.customerCompany}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <input
                          className={styles.input}
                          onChange={(event) =>
                            setTicketForm((current) => ({ ...current, subject: event.target.value }))
                          }
                          placeholder="Assunto"
                          value={ticketForm.subject}
                        />
                        <input
                          className={styles.input}
                          onChange={(event) =>
                            setTicketForm((current) => ({ ...current, category: event.target.value }))
                          }
                          placeholder="Categoria"
                          value={ticketForm.category}
                        />
                      </div>
                      <select
                        className={styles.select}
                        onChange={(event) =>
                          setTicketForm((current) => ({
                            ...current,
                            priority: event.target.value as TicketPriority,
                          }))
                        }
                        value={ticketForm.priority}
                      >
                        <option value="LOW">Prioridade baixa</option>
                        <option value="MEDIUM">Prioridade média</option>
                        <option value="HIGH">Prioridade alta</option>
                        <option value="URGENT">Prioridade urgente</option>
                      </select>
                      <textarea
                        className={styles.textarea}
                        onChange={(event) =>
                          setTicketForm((current) => ({ ...current, description: event.target.value }))
                        }
                        placeholder="Descreva o problema ou a solicitação"
                        value={ticketForm.description}
                      />
                      <button
                        className={styles.primaryButton}
                        disabled={isSubmitting}
                        onClick={() => void handleCreateTicket()}
                        type="button"
                      >
                        Abrir chamado
                      </button>
                    </div>
                  </section>
                ) : (
                  <section className={styles.opsPanel}>
                    <div className={styles.opsCard}>
                      <span className={styles.eyebrow}>Urgentes</span>
                      <strong>{urgentCount}</strong>
                      <p>Chamados que exigem ação imediata.</p>
                    </div>
                    <div className={styles.opsCard}>
                      <span className={styles.eyebrow}>Sem responsável</span>
                      <strong>{unassignedCount}</strong>
                      <p>Tickets ainda aguardando técnico.</p>
                    </div>
                    <div className={styles.opsCard}>
                      <span className={styles.eyebrow}>Aguardando cliente</span>
                      <strong>{waitingCustomerCount}</strong>
                      <p>Casos pausados por dependência externa.</p>
                    </div>
                  </section>
                )}

                <div className={styles.rightStage}>
                  <section className={styles.thread}>
              {selectedTicket ? (
                <>
                  <div className={styles.threadHeader}>
                    <span className={styles.eyebrow}>Ticket em foco</span>
                    <h3>{selectedTicket.subject}</h3>
                    <p>
                      {selectedTicket.protocol} • {selectedTicket.customerName} •{" "}
                      {selectedTicket.customerCompany ?? "Sem empresa informada"}
                    </p>
                    <div className={styles.badges}>
                      <span className={getStatusBadge(selectedTicket.status)}>{selectedTicket.statusLabel}</span>
                      <span className={getPriorityBadge(selectedTicket.priority)}>{selectedTicket.priorityLabel}</span>
                    </div>
                  </div>

                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                      <span className={styles.eyebrow}>Contato</span>
                      <strong className={styles.contactEmail}>{selectedTicket.customerEmail}</strong>
                      <p>{selectedTicket.customerPhone ?? "Telefone não informado"}</p>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.eyebrow}>Última atualização</span>
                      <strong>{formatDate(selectedTicket.lastReplyAt ?? selectedTicket.updatedAt)}</strong>
                      <p>
                        {selectedTicket.assignedTechnicianName
                          ? `Técnico: ${selectedTicket.assignedTechnicianName}`
                          : "Aguardando responsável"}
                      </p>
                    </div>
                    <div className={styles.summaryCard}>
                      <span className={styles.eyebrow}>Categoria</span>
                      <strong>{selectedTicket.category}</strong>
                      <p>{selectedTicket.customerCompany ?? "Sem empresa informada"}</p>
                    </div>
                  </div>

                  <div className={styles.panelMuted}>
                    <span className={styles.eyebrow}>Descrição inicial</span>
                    <p>{selectedTicket.description}</p>
                  </div>

                  <div className={styles.messages}>
                    {selectedTicket.messages.map((message) => (
                      <article
                        className={
                          message.authorRole === "TECHNICIAN"
                            ? styles.messageBubbleTech
                            : styles.messageBubble
                        }
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
                        <span className={styles.eyebrow}>Resposta técnica</span>
                        <p>Seu login identifica automaticamente o autor e o perfil do atendimento.</p>
                      </div>
                      <textarea
                        className={styles.textarea}
                        onChange={(event) => setTechnicianReply(event.target.value)}
                        placeholder="Escreva a resposta técnica"
                        value={technicianReply}
                      />
                      <div className={styles.actionRow}>
                        <button
                          className={styles.primaryButton}
                          disabled={isSubmitting}
                          onClick={() => void handleReply("TECHNICIAN")}
                          type="button"
                        >
                          Responder como técnico
                        </button>
                        <button
                          className={styles.secondaryButton}
                          disabled={isSubmitting}
                          onClick={() => void handleStatusUpdate("IN_PROGRESS")}
                          type="button"
                        >
                          Assumir atendimento
                        </button>
                      </div>
                      <div className={styles.statusRow}>
                        <button className={styles.statusButton} onClick={() => void handleStatusUpdate("WAITING_CUSTOMER")} type="button">
                          Aguardar cliente
                        </button>
                        <button className={styles.statusButton} onClick={() => void handleStatusUpdate("RESOLVED")} type="button">
                          Resolver
                        </button>
                        {selectedTicket.status === "RESOLVED" ? (
                          <button className={styles.statusButton} onClick={() => void handleStatusUpdate("OPEN")} type="button">
                            Reabrir
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.actionPanel}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.eyebrow}>Responder chamado</span>
                        <p>Como cliente, você envia complemento apenas para os tickets do seu login.</p>
                      </div>
                      <textarea
                        className={styles.textarea}
                        onChange={(event) => setClientReply(event.target.value)}
                        placeholder="Adicione informações para o técnico"
                        value={clientReply}
                      />
                      <button
                        className={styles.primaryButton}
                        disabled={isSubmitting}
                        onClick={() => void handleReply("CLIENT")}
                        type="button"
                      >
                        Enviar resposta
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyStage}>
                  <span className={styles.eyebrow}>Sem seleção</span>
                  <h3>Nenhum chamado aberto</h3>
                  <p>Escolha um item da lista para visualizar o histórico e as ações disponíveis.</p>
                </div>
              )}
                  </section>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
