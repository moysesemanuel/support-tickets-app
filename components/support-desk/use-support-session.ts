"use client";

import { useState } from "react";
import { SESSION_STORAGE_KEY, getDemoAccount } from "./support-desk.constants";
import type { LoginForm, Session, TicketForm, UserRole } from "./support-desk.types";

function getInitialSession() {
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
}

type UseSupportSessionOptions = {
  onResetTicketForm: (session: Session | null) => void;
  showToast: (kind: "success" | "error", message: string) => void;
};

export function useSupportSession({
  onResetTicketForm,
  showToast,
}: UseSupportSessionOptions) {
  const initialSession = getInitialSession();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    name: initialSession?.name ?? "",
    email: initialSession?.email ?? "",
    password: "",
    role: initialSession?.role ?? "CLIENT",
  });

  function setSessionStorage(nextSession: Session | null) {
    if (!nextSession) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }

  function handleLoginFormChange(field: keyof LoginForm, value: string) {
    setLoginForm((current) => ({
      ...current,
      [field]: field === "role" ? (value as UserRole) : value,
    }));
  }

  function handleLogin() {
    const name = loginForm.name.trim();
    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.password.trim();

    if (!name || !email || !password) {
      showToast("error", "Preencha nome, e-mail, senha e perfil para entrar.");
      return;
    }

    const matchedAccount = Object.values({
      CLIENT: getDemoAccount("CLIENT"),
      TECHNICIAN: getDemoAccount("TECHNICIAN"),
    }).find(
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

    setSessionStorage(nextSession);
    setSession(nextSession);
    setLoginForm((current) => ({ ...current, password: "" }));
    onResetTicketForm(nextSession);
    showToast(
      "success",
      nextSession.role === "CLIENT"
        ? "Login de cliente realizado. Seus chamados foram filtrados pelo e-mail informado."
        : "Login de técnico realizado. A fila completa foi liberada para atendimento.",
    );
  }

  function handleDemoLogin(role: UserRole) {
    const account = getDemoAccount(role);

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

    setSessionStorage(nextSession);
    setSession(nextSession);
    onResetTicketForm(nextSession);
    showToast(
      "success",
      role === "CLIENT"
        ? "Conta de cliente carregada para demonstração."
        : "Conta de técnico carregada para demonstração.",
    );
  }

  function handleLogout() {
    setSessionStorage(null);
    setSession(null);
    onResetTicketForm(null);
    showToast("success", "Sessão encerrada.");
  }

  return {
    initialSession,
    loginForm,
    session,
    handleDemoLogin,
    handleLogin,
    handleLoginFormChange,
    handleLogout,
    setSession,
  };
}
