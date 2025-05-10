"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, Monitor, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface RecentUploadsProps {
  fondos: any[];
}

export function RecentUploads({ fondos }: RecentUploadsProps) {
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUploads() {
      if (fondos && fondos.length > 0) {
        const processed = await processUploads(fondos);
        setRecentUploads(processed);
      }
      setLoading(false);
    }

    loadUploads();
  }, [fondos]);

  if (loading) {
    return (
      <div className="grid  gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-3 border rounded-lg"
          >
            <Skeleton className="h-[80px] w-[80px] rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentUploads.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          No hay fondos recientes disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid  gap-4">
      {recentUploads.map((upload) => (
        <Link href={`/fondos/${upload.id}`} key={upload.id} className="group">
          <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="relative">
              <Image
                src={upload.thumbnail || "/placeholder.svg"}
                alt={upload.name}
                width={80}
                height={80}
                className="rounded-md object-cover "
                style={{ viewTransitionName: `wallpaper-${upload.id}` }}
              />
            </div>
            <div className="space-y-1 overflow-hidden">
              <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">
                {upload.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {upload.category}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{upload.date}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Función para procesar los fondos y obtener los detalles necesarios
async function processUploads(fondos: any[]) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  return Promise.all(
    fondos.map(async (fondo) => {
      // Obtener la primera etiqueta como categoría
      let category = "Sin categoría";
      if (fondo.etiquetas && fondo.etiquetas.length > 0) {
        try {
          const etiquetaResponse = await fetch(
            `${API_URL}/api/etiquetas/${fondo.etiquetas[0]}`
          );
          if (etiquetaResponse.ok) {
            const etiqueta = await etiquetaResponse.json();
            category = etiqueta.nombre;
          }
        } catch (error) {
          console.error("Error al obtener etiqueta:", error);
        }
      }

      // Obtener la imagen y determinar tipo
      let thumbnail = "/placeholder.svg?height=80&width=80";
      let tipo = "desktop";

      if (fondo.imagen) {
        try {
          const imagenResponse = await fetch(
            `${API_URL}/api/imagenes/${fondo.imagen}`
          );
          if (imagenResponse.ok) {
            const imagen = await imagenResponse.json();
            thumbnail = imagen.url;

            // Determinar tipo basado en dimensiones
            if (imagen.width && imagen.height) {
              tipo =
                imagen.height > imagen.width ||
                imagen.height / imagen.width > 0.6
                  ? "mobile"
                  : "desktop";
            }
          }
        } catch (error) {
          console.error("Error al obtener imagen:", error);
        }
      }

      // Formatear la fecha
      const date = fondo.fecha_publicacion
        ? formatDistanceToNow(new Date(fondo.fecha_publicacion), {
            addSuffix: true,
            locale: es,
          })
        : "Fecha desconocida";

      // Formatear tipo para mostrar
      const tipoDisplay = tipo === "mobile" ? "Móvil" : "Escritorio";

      return {
        id: fondo.id,
        name:
          fondo.titulo === "null" ? "Sin título" : fondo.titulo || "Sin título",
        category: category,
        date: date,
        thumbnail: thumbnail,
        tipo: tipoDisplay,
      };
    })
  );
}
