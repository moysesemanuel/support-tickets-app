"use client";

import { useState } from "react";
import type { Toast } from "./support-desk.types";

export function useSupportToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(kind: Toast["kind"], message: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, kind, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  return {
    showToast,
    toasts,
  };
}
