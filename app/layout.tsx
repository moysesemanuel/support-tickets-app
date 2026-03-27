import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Desk",
  description: "Projeto isolado de chamados com visão de cliente e técnico.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
