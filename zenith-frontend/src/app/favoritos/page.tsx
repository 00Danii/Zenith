"use client";

import { FavoritesGrid } from "@/components/favorites-grid";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function FavoritosPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login"); // solo redirige cuando ya se sabe
    }
  }, [token, loading, router]);

  if (loading) return <p>Cargando...</p>; // 🌀 spinner opcional aquí

  if (!token) return <p>No ENTRO</p>; // ya sabemos que no está autenticado

  return (
    <div className="space-y-6 mt-28 px-4 sm:px-8 lg:px-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis Favoritos</h1>
        <p className="text-muted-foreground">
          Los fondos de pantalla que has marcado como favoritos
        </p>
      </div>

      <FavoritesGrid />
    </div>
  );
}
