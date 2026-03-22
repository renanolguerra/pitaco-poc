import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import MobileWarning from "@/components/layout/MobileWarning";

export const metadata: Metadata = {
  title: "Pitaco — Feedback colaborativo em roadmaps",
  description: "Plataforma de feedback colaborativo para roadmaps de produto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          <MobileWarning />
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
