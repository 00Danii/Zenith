"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Download, Monitor, Smartphone, Calendar, Eye } from "lucide-react";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PopularFondosProps {
  fondos: any[];
}

export function PopularFondos({ fondos }: PopularFondosProps) {
  const [processedFondos, setProcessedFondos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFondos() {
      if (fondos && fondos.length > 0) {
        const processed = await processFondos(fondos.slice(0, 5));
        setProcessedFondos(processed);
      }
      setLoading(false);
    }

    loadFondos();
  }, [fondos]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
            <Skeleton className="h-[100px] w-[200px] rounded-md" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex flex-wrap gap-2 mt-1">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (processedFondos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No hay fondos populares disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {processedFondos.map((fondo) => (
        <Link
          href={`/fondos/${fondo.id}`}
          key={fondo.id}
          className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
        >
          <div className="relative w-full sm:w-auto">
            <Image
              src={fondo.thumbnail || "/placeholder.svg"}
              alt={fondo.name}
              width={200}
              height={100}
              className="rounded-md object-cover w-full sm:w-[200px] aspect-square"
              style={{ viewTransitionName: `wallpaper-${fondo.id}` }}
            />
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-black/50 text-white border-none"
            >
              {fondo.tipo === "Móvil" ? (
                <Smartphone className="h-3 w-3 mr-1" />
              ) : (
                <Monitor className="h-3 w-3 mr-1" />
              )}
              {fondo.tipo}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 flex-1 mt-3 sm:mt-0">
            <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
              {fondo.name}
            </h3>

            <div className="flex flex-wrap gap-2 mt-1">
              {fondo.etiquetas.slice(0, 4).map((etiqueta: string) => (
                <Badge
                  key={etiqueta}
                  variant="secondary"
                  className="capitalize"
                >
                  {etiqueta}
                </Badge>
              ))}
              {fondo.etiquetas.length > 4 && (
                <Badge variant="outline">+{fondo.etiquetas.length - 4}</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {fondo.colores.slice(0, 3).map((color: string) => (
                <Badge key={color} variant="outline" className="capitalize">
                  {color}
                </Badge>
              ))}
              {fondo.colores.length > 3 && (
                <Badge variant="outline">+{fondo.colores.length - 3}</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{fondo.date}</span>
              </div>

              {fondo.resolucion && (
                <div className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  <span>{fondo.resolucion}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{fondo.descargas.toLocaleString()} descargas</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function processFondos(fondos: any[]) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  return Promise.all(
    fondos.map(async (fondo) => {
      // Procesar etiquetas
      const etiquetas = await Promise.all(
        (fondo.etiquetas || []).map(async (etiquetaId: string) => {
          try {
            const res = await fetch(`${API_URL}/api/etiquetas/${etiquetaId}`, {
              next: { revalidate: 3600 },
            });
            if (!res.ok) return "Desconocido";
            const data = await res.json();
            return data?.nombre || "Desconocido";
          } catch (error) {
            console.error("Error al obtener etiqueta:", error);
            return "Desconocido";
          }
        })
      );

      // Procesar colores
      const colores = await Promise.all(
        (fondo.colores || []).map(async (colorId: string) => {
          try {
            const res = await fetch(`${API_URL}/api/colores/${colorId}`, {
              next: { revalidate: 3600 },
            });
            if (!res.ok) return "Desconocido";
            const data = await res.json();
            return data?.nombre || "Desconocido";
          } catch (error) {
            console.error("Error al obtener color:", error);
            return "Desconocido";
          }
        })
      );

      // Obtener imagen y datos adicionales
      let thumbnail = "/placeholder.svg";
      let width = 0;
      let height = 0;
      let tipo = fondo.tipo || "desktop";

      if (fondo.imagen) {
        try {
          const res = await fetch(`${API_URL}/api/imagenes/${fondo.imagen}`);
          if (res.ok) {
            const data = await res.json();
            thumbnail = data.url;
            width = data.width || 0;
            height = data.height || 0;

            // Determinar tipo basado en dimensiones si no está especificado
            if (!fondo.tipo) {
              tipo = height > width ? "mobile" : "desktop";
            }
          }
        } catch (err) {
          console.error("Error cargando imagen", err);
        }
      }

      // Formatear tipo para mostrar
      const tipoDisplay = tipo === "mobile" ? "Móvil" : "Escritorio";

      // Formatear fecha
      const date = fondo.fecha_publicacion
        ? formatDistanceToNow(new Date(fondo.fecha_publicacion), {
            addSuffix: true,
            locale: es,
          })
        : "Fecha desconocida";

      // Formatear resolución
      const resolucion = width && height ? `${width}x${height}` : null;

      return {
        id: fondo.id,
        name:
          fondo.titulo === "null" ? "Sin título" : fondo.titulo || "Sin título",
        etiquetas,
        colores,
        tipo: tipoDisplay,
        date,
        thumbnail,
        resolucion,
        descargas: fondo.numero_descargas || 0,
      };
    })
  );
}
