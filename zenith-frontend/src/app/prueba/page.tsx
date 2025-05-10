"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PaginaProtegida() {
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
    <div className="flex flex-col items-center justify-center h-screen text-center mt-28">
      <h1 className="mt-52">Bienvenido 🎉</h1>
      <p>Esta es una página protegida</p>
    </div>
  );
}
