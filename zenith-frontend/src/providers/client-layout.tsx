"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/navBar/Header";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/4dm1n");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {!isAdminRoute && <Header />}
        {children}
        {!isAdminRoute && <Footer />}
        <Toaster richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
