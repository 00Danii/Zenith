import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "@/providers/client-layout";

export const metadata: Metadata = {
  title: "Zenith",
  description: "Zenith",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
