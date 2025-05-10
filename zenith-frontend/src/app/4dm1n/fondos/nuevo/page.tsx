"use client";

import { WallpaperForm } from "@/components/admin/wallpaper-form";

export default function NewWallpaperPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Agregar Nuevo Fondo
        </h1>
        <p className="text-muted-foreground">
          Completa el formulario para agregar un nuevo fondo de pantalla a la
          plataforma.
        </p>
      </div>

      <WallpaperForm />
    </div>
  );
}
