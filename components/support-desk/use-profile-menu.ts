"use client";

import { useEffect, useRef, useState } from "react";

export function useProfileMenu() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [siteLanguage, setSiteLanguage] = useState("pt-BR");
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isProfileMenuOpen]);

  return {
    isProfileMenuOpen,
    profileMenuRef,
    setIsProfileMenuOpen,
    setSiteLanguage,
    siteLanguage,
  };
}
