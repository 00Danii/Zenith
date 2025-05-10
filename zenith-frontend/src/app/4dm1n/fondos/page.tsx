"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { WallpaperList } from "@/components/admin/wallpaper-list";

export default function WallpapersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fondos de Pantalla
          </h1>
          <p className="text-muted-foreground">
            Administra todos los fondos de pantalla disponibles en la
            plataforma.
          </p>
        </div>
        <Button asChild>
          <Link href="/4dm1n/fondos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Nuevo
          </Link>
        </Button>
      </div>

      <WallpaperList />
    </div>
  );
}
