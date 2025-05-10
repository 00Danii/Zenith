"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SuggestedWallpapersProps {
  currentId: string;
  tags: string[];
  colors: string[];
}

export function SuggestedWallpapers({
  currentId,
  tags,
  colors,
}: SuggestedWallpapersProps) {
  interface Wallpaper {
    id: any;
    titulo: string;
    colores: string[];
    etiquetas: string[];
    imagen: string;
    descargas: any;
    resolucion: { width: number; height: number };
    tipo: string;
  }

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedWallpapers, setLikedWallpapers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSuggestedWallpapers = async () => {
      try {
        setLoading(true);

        // Construir la URL con parámetros para filtrar por etiquetas y colores
        let url = `${API_URL}/api/fondos/recomendados`;

        if (tags && tags.length > 0) {
          url += `?etiquetas=${encodeURIComponent(tags.join(","))}`;
        }

        if (colors && colors.length > 0) {
          // url += `?colores=${encodeURIComponent(colors.join(","))}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Error al obtener fondos sugeridos");
        }

        let data = await response.json();

        // Limitar a 8 fondos como máximo
        const fondosData = Array.isArray(data) ? data.slice(0, 8) : [];

        // Procesar los fondos para obtener detalles adicionales
        const fondosConDetalles = (
          await Promise.all(
            fondosData.map(async (fondo) => {
              try {
                // Obtener colores
                const colores = await Promise.all(
                  (fondo.colores || []).map(async (colorId: any) => {
                    try {
                      const res = await fetch(
                        `${API_URL}/api/colores/${colorId}`
                      );
                      return res.ok ? (await res.json()).nombre : "Desconocido";
                    } catch (error) {
                      return "Desconocido";
                    }
                  })
                );

                // Obtener etiquetas
                const etiquetas = await Promise.all(
                  (fondo.etiquetas || []).map(async (etiquetaId: any) => {
                    try {
                      const res = await fetch(
                        `${API_URL}/api/etiquetas/${etiquetaId}`
                      );
                      return res.ok ? (await res.json()).nombre : "Desconocido";
                    } catch (error) {
                      return "Desconocido";
                    }
                  })
                );

                // Obtener imagen
                let imagen = "/placeholder.svg";
                let width = 0;
                let height = 0;
                let tipo = "desktop";

                if (fondo.imagen) {
                  try {
                    const res = await fetch(
                      `${API_URL}/api/imagenes/${fondo.imagen}`
                    );
                    if (res.ok) {
                      const data = await res.json();
                      imagen = data?.url || "/placeholder.svg";

                      // Extraer información de resolución y tipo
                      width = data?.width || 0;
                      height = data?.height || 0;

                      // Determinar si es móvil o escritorio
                      tipo =
                        height > width || height / width > 0.6
                          ? "mobile"
                          : "desktop";
                    }
                  } catch (error) {
                    console.error("Error al obtener imagen:", error);
                  }
                }

                return {
                  id: fondo.id,
                  titulo: fondo.titulo || "Sin título",
                  colores,
                  etiquetas,
                  imagen,
                  descargas: fondo.numero_descargas,
                  resolucion: { width, height },
                  tipo,
                };
              } catch (error) {
                console.error("Error procesando fondo:", error);
                return null;
              }
            })
          )
        ).filter((wallpaper): wallpaper is Wallpaper => wallpaper !== null);

        // Filtrar el fondo actual si está presente
        const filteredWallpapers = fondosConDetalles.filter(
          (wallpaper) => wallpaper?.id !== currentId
        );

        setWallpapers(filteredWallpapers);

        // // Cargar likes del localStorage
        // try {
        //   const savedLikes = localStorage.getItem("likedWallpapers");
        //   if (savedLikes) {
        //     const parsedLikes = JSON.parse(savedLikes);
        //     if (Array.isArray(parsedLikes)) {
        //       setLikedWallpapers(parsedLikes);
        //     }
        //   }
        // } catch (storageError) {
        //   console.error("Error al cargar likes:", storageError);
        // }
        try {
          const storageKey = `likedWallpapers-${user?.email}`;
          const savedLikes = localStorage.getItem(storageKey);
          if (savedLikes) {
            const parsedLikes = JSON.parse(savedLikes);
            if (Array.isArray(parsedLikes)) {
              setLikedWallpapers(parsedLikes);
            }
          }
        } catch (storageError) {
          console.error("Error al cargar likes del usuario:", storageError);
        }
      } catch (error) {
        console.error("Error al obtener fondos sugeridos:", error);
        setWallpapers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedWallpapers();
  }, [currentId, tags, colors]);

  // const toggleLike = (id) => {
  //   setLikedWallpapers((prev) => {
  //     const newLikes = prev.includes(id)
  //       ? prev.filter((wallpaperId) => wallpaperId !== id)
  //       : [...prev, id];

  //     // Guardar en localStorage
  //     localStorage.setItem("likedWallpapers", JSON.stringify(newLikes));
  //     return newLikes;
  //   });
  // };

  const toggleLike = (id: string) => {
    if (!user) return; // Asegúrate de que hay un usuario

    setLikedWallpapers((prev) => {
      const storageKey = `likedWallpapers-${user.email}`;

      const newLikes = prev.includes(id)
        ? prev.filter((wallpaperId) => wallpaperId !== id)
        : [...prev, id];

      localStorage.setItem(storageKey, JSON.stringify(newLikes));
      return newLikes;
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="space-y-3">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No se encontraron fondos similares.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {wallpapers.map((wallpaper) => (
        <div
          key={wallpaper.id}
          className="group relative overflow-hidden rounded-lg aspect-[3/4]"
        >
          <Link href={`/fondos/${wallpaper.id}`} className="block h-full">
            <Image
              src={wallpaper.imagen || "/placeholder.svg"}
              alt={
                wallpaper.titulo === "null" ? "Sin título" : wallpaper.titulo
              }
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Información de resolución y tipo */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge
                variant="secondary"
                className="bg-black/50 hover:bg-black/60 text-white border-none"
              >
                {wallpaper.tipo === "mobile" ? "Móvil" : "Escritorio"}
              </Badge>
              {wallpaper.resolucion.width > 0 && (
                <Badge
                  variant="outline"
                  className="bg-black/50 hover:bg-black/60 text-white border-none"
                >
                  {wallpaper.resolucion.width}x{wallpaper.resolucion.height}
                </Badge>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                {user && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(wallpaper.id);
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        likedWallpapers.includes(wallpaper.id)
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      )}
                    />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  asChild
                >
                  <div>
                    <Download className="h-4 w-4 mr-1" />
                    <span>{wallpaper.descargas || 0}</span>
                  </div>
                </Button>
              </div>

              <h3 className="font-medium line-clamp-1 drop-shadow-md text-white hover:underline">
                {wallpaper.titulo === "null" ? "" : wallpaper.titulo}
              </h3>

              <div className="flex flex-wrap gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {wallpaper.etiquetas.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs capitalize bg-black/50 hover:bg-black/70 text-white border-none"
                  >
                    {tag}
                  </Badge>
                ))}
                {wallpaper.etiquetas.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-black/50 hover:bg-black/70 text-white border-none"
                  >
                    +{wallpaper.etiquetas.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
