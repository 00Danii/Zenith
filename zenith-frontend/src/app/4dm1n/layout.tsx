"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { useAuth } from "@/context/AuthContext";
import { notFound, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      notFound();
    } else if (user && user.role !== "admin") {
      notFound();
    }
  }, [loading, user, router]);

  if (!user || loading) return null;
  if (user && user.role !== "admin") return null;

  return (
    <div className="grid min-h-screen w-full">
      <Sidebar />
      <main className="ml-60 p-5">{children}</main>
    </div>
  );
}
