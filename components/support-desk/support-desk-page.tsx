"use client";

import { useState, useSyncExternalStore } from "react";
import {
  createInitialTicketForm,
  type SidebarItem,
} from "./support-desk.constants";
import type {
  TicketForm,
} from "./support-desk.types";
import { useProfileMenu } from "./use-profile-menu";
import { useSupportDeskView } from "./use-support-desk-view";
import { useSupportSession } from "./use-support-session";
import { useSupportTickets } from "./use-support-tickets";
import { useSupportToast } from "./use-support-toast";
import {
  HeaderBar,
  HydrationFallback,
  LoginView,
  NewTicketPanel,
  OpsPanel,
  OverviewRail,
  Sidebar,
  SidebarModuleView,
  TicketModal,
  TicketsKanban,
  TicketThread,
  ToastViewport,
} from "./support-desk-ui";
import legacyStyles from "./support-desk-page.module.css";
import layoutStyles from "./ui/layout.module.css";

export function SupportDeskPage() {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [ticketForm, setTicketForm] = useState<TicketForm>(createInitialTicketForm(null));
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem>("Tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpeningTicket, setIsOpeningTicket] = useState(false);
  const { showToast, toasts } = useSupportToast();
  const {
    isProfileMenuOpen,
    profileMenuRef,
    setIsProfileMenuOpen,
    setSiteLanguage,
    siteLanguage,
  } = useProfileMenu();

  function resetTicketForm(activeSession: Parameters<typeof createInitialTicketForm>[0]) {
    setTicketForm(createInitialTicketForm(activeSession));
  }

  const {
    loginForm,
    session,
    handleDemoLogin,
    handleLogin,
    handleLoginFormChange,
    handleLogout: logoutSession,
  } = useSupportSession({
    onResetTicketForm: resetTicketForm,
    showToast,
  });

  const supportTickets = useSupportTickets({
    isHydrated,
    session,
    showToast,
  });
  const view = useSupportDeskView({
    tickets: supportTickets.tickets,
    selectedSidebarItem,
    selectedTicketId: supportTickets.selectedTicketId,
    searchTerm,
  });

  const isTechnician = session?.role === "TECHNICIAN";
  const isClient = session?.role === "CLIENT";
  const isDashboardView = selectedSidebarItem === "Dashboards";
  const isTicketsView = selectedSidebarItem === "Tickets";
  const profileInitials =
    session?.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") ?? "US";

  const kanbanColumns = [
    {
      key: "OPEN" as const,
      title: "A FAZER",
      className: legacyStyles.kanbanTodo,
      tickets: view.kanbanColumns[0].tickets,
    },
    {
      key: "IN_PROGRESS" as const,
      title: "ATENDENDO",
      className: legacyStyles.kanbanDoing,
      tickets: view.kanbanColumns[1].tickets,
    },
    {
      key: "WAITING_CUSTOMER" as const,
      title: "PAUSADO",
      className: legacyStyles.kanbanPaused,
      tickets: view.kanbanColumns[2].tickets,
    },
    {
      key: "WAITING_THIRD_PARTY" as const,
      title: "AGUARDANDO TERCEIROS",
      className: legacyStyles.kanbanPaused,
      tickets: view.kanbanColumns[3].tickets,
    },
    {
      key: "RESOLVED" as const,
      title: "FINALIZADO",
      className: legacyStyles.kanbanDone,
      tickets: view.kanbanColumns[4].tickets,
    },
  ] as const;

  function handleTicketFormChange<K extends keyof TicketForm>(field: K, value: TicketForm[K]) {
    setTicketForm((current) => ({ ...current, [field]: value }));
  }

  function handleLogout() {
    supportTickets.clearTickets();
    supportTickets.clearSelection();
    supportTickets.clearReplies();
    logoutSession();
  }

  function handleOpenNewTicket() {
    supportTickets.setSelectedTicketId("");
    setSelectedSidebarItem("Tickets");
    setIsOpeningTicket(true);
    showToast("success", "Formulário de novo ticket pronto para preenchimento.");
  }

  function handleScheduleTicket() {
    showToast("success", "Agendamento do ticket registrado na demonstração.");
  }

  async function handleCreateTicket() {
    await supportTickets.handleCreateTicket(ticketForm, {
      onSuccess: () => {
        if (session?.role === "CLIENT") {
          resetTicketForm(session);
        }
      },
    });
  }

  if (!isHydrated) {
    return (
      <main className={layoutStyles.page}>
        <div className={layoutStyles.shell}>
          <ToastViewport toasts={toasts} />
          <HydrationFallback />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={layoutStyles.page}>
        <div className={layoutStyles.shell}>
          <ToastViewport toasts={toasts} />
          <LoginView
            loginForm={loginForm}
            onDemoLogin={handleDemoLogin}
            onLogin={handleLogin}
            onLoginFormChange={handleLoginFormChange}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={layoutStyles.page}>
      <div className={layoutStyles.shell}>
        <ToastViewport toasts={toasts} />
        <section className={layoutStyles.workspaceShell}>
          <Sidebar
            isTechnician={isTechnician}
            onSearchTermChange={setSearchTerm}
            onSidebarItemSelect={(item) => {
              setSelectedSidebarItem(item);
              setIsOpeningTicket(false);
            }}
            searchTerm={searchTerm}
            selectedSidebarItem={selectedSidebarItem}
          />

          <div className={layoutStyles.mainStage}>
            <HeaderBar
              isProfileMenuOpen={isProfileMenuOpen}
              isTechnician={isTechnician}
              onChangePassword={() => {
                showToast("success", "Fluxo de alteração de senha ainda não foi implementado.");
                setIsProfileMenuOpen(false);
              }}
              onLogout={handleLogout}
              onOpenNewTicket={handleOpenNewTicket}
              onSiteLanguageChange={(value) => {
                setSiteLanguage(value);
                showToast("success", `Idioma alterado para ${value}.`);
              }}
              onToggleProfileMenu={() => setIsProfileMenuOpen((current) => !current)}
              profileInitials={profileInitials}
              profileMenuRef={profileMenuRef}
              session={session}
              siteLanguage={siteLanguage}
            />

            <section
              className={isDashboardView ? layoutStyles.dashboardGrid : layoutStyles.dashboardGridTickets}
            >
              <OverviewRail
                onSelectTicket={supportTickets.setSelectedTicketId}
                selectedSidebarItem={selectedSidebarItem}
                selectedTicket={view.selectedTicket}
                visibleTickets={view.visibleTickets}
              />

              <div className={layoutStyles.contentStage}>
                <TicketsKanban
                  kanbanColumns={kanbanColumns}
                  onOpenTicket={supportTickets.openTicketModal}
                  selectedSidebarItem={selectedSidebarItem}
                  selectedTicket={view.selectedTicket}
                />

                <NewTicketPanel
                  isSubmitting={supportTickets.isSubmitting}
                  isVisible={Boolean(isClient && isOpeningTicket && isTicketsView)}
                  onSubmit={() => void handleCreateTicket()}
                  onTicketFormChange={handleTicketFormChange}
                  session={session}
                  ticketForm={ticketForm}
                />

                <OpsPanel
                  isVisible={Boolean(!isClient && !isOpeningTicket && isTicketsView)}
                  unassignedCount={view.unassignedCount}
                  urgentCount={view.urgentCount}
                  waitingCustomerCount={view.waitingCustomerCount}
                />

                <SidebarModuleView
                  selectedSidebarItem={selectedSidebarItem}
                  session={session}
                  tickets={supportTickets.tickets}
                />

                <TicketThread
                  clientReply={supportTickets.clientReply}
                  isSubmitting={supportTickets.isSubmitting}
                  isTechnician={Boolean(isTechnician)}
                  isVisible={isDashboardView}
                  onClientReplyChange={supportTickets.setClientReply}
                  onReply={(authorRole) => void supportTickets.handleReply(authorRole)}
                  onStatusUpdate={(status) => void supportTickets.handleStatusUpdate(status)}
                  onTechnicianReplyChange={supportTickets.setTechnicianReply}
                  selectedTicket={view.selectedTicket}
                  technicianReply={supportTickets.technicianReply}
                />
              </div>
            </section>
          </div>
        </section>

        {supportTickets.modalTicket ? (
          <TicketModal
            clientReply={supportTickets.clientReply}
            isSubmitting={supportTickets.isSubmitting}
            isTechnician={Boolean(isTechnician)}
            onClientReplyChange={supportTickets.setClientReply}
            onClose={supportTickets.closeTicketModal}
            onCloseTicket={() => void supportTickets.handleCloseTicket()}
            onReply={(authorRole) => void supportTickets.handleReply(authorRole)}
            onResolve={() => void supportTickets.handleResolveTicket()}
            onSchedule={handleScheduleTicket}
            onStart={() => void supportTickets.handleStartTicket()}
            onStatusUpdate={(status) => void supportTickets.handleStatusUpdate(status)}
            onTechnicianReplyChange={supportTickets.setTechnicianReply}
            onTicketRoutingChange={supportTickets.handleTicketRoutingChange}
            technicianReply={supportTickets.technicianReply}
            ticket={supportTickets.modalTicket}
            ticketRouting={supportTickets.ticketRouting}
          />
        ) : null}
      </div>
    </main>
  );
}
