"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, Heart } from "lucide-react";
import { SuggestedWallpapers } from "@/components/suggested-wallpapers";
import { DeviceMockup } from "@/components/device-mockup";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("URL copiada al portapapeles", {
      description: "¡Comparte este fondo de pantalla con tus amigos!",
    });
  } catch (err) {
    toast.error("Error al copiar la URL", {
      description: "Intenta nuevamente.",
    });
  }
};

const descargarImagen = async (
  id: string,
  calidad: string,
  fondoID: string,
  setWallpaper: React.Dispatch<React.SetStateAction<any>>
) => {
  // Actualizar el número de descargas primero
  try {
    const response = await fetch(`${API_URL}/api/fondos/${fondoID}/descargas`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ incremento: 1 }), // Incrementar en 1
    });

    if (!response.ok) {
      throw new Error("No se pudo actualizar el número de descargas.");
    }

    // Actualizar el estado local del número de descargas
    setWallpaper((prev: any) => ({
      ...prev,
      descargas: prev.descargas + 1,
    }));

    // Mostrar un toast de confirmación
    toast.success("Descarga completada", {
      description: "El fondo se descargó correctamente.",
    });

    // Solo si la actualización fue exitosa, proceder con la descarga
    const downloadUrl = `${API_URL}/api/imagenes/${calidad}/${id}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.log(API_URL);
    console.error("Error al actualizar el número de descargas:", error);
  }
};

async function getWallpaper(id: string) {
  try {
    const response = await fetch(`${API_URL}/api/fondos/${id}`);
    if (!response.ok) throw new Error("Error al obtener el fondo");

    const fondo = await response.json();

    const colores = await Promise.all(
      (fondo.colores || []).map(async (colorId: string) => {
        try {
          const res = await fetch(`${API_URL}/api/colores/${colorId}`);
          if (!res.ok) return "Desconocido";
          const data = await res.json();
          return data?.nombre || "Desconocido";
        } catch {
          return "Desconocido";
        }
      })
    );

    const etiquetas = await Promise.all(
      (fondo.etiquetas || []).map(async (etiquetaId: string) => {
        try {
          const res = await fetch(`${API_URL}/api/etiquetas/${etiquetaId}`);
          if (!res.ok) return "Desconocido";
          const data = await res.json();
          return data?.nombre || "Desconocido";
        } catch {
          return "Desconocido";
        }
      })
    );

    let imagen = "/placeholder.svg?height=800&width=1200";
    let width = 0;
    let height = 0;
    let tipo: "desktop" | "mobile" = "mobile";

    if (fondo.imagen) {
      const res = await fetch(`${API_URL}/api/imagenes/${fondo.imagen}`);
      if (res.ok) {
        const data = await res.json();
        imagen = data?.url || imagen;
        width = data?.width || 0;
        height = data?.height || 0;
        tipo = height > width ? "mobile" : "desktop";
      }
    }

    return {
      id: fondo.id,
      titulo: fondo.titulo || "Sin título",
      descripcion: fondo.descripcion || "Sin descripción",
      imagen,
      imagenID: fondo.imagen,
      etiquetas,
      colores,
      descargas: fondo.numero_descargas,
      fecha: fondo.fecha_publicacion,
      dimensiones: {
        ancho: width || 3840,
        alto: height || 2160,
      },
      tipo,
    };
  } catch (error) {
    console.log("NO existe el fondo o Error al cargar fondo:", error);
    return null;
  }
}

export default function WallpaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [wallpaper, setWallpaper] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    if (!user) return;

    const likedWallpapers = JSON.parse(
      localStorage.getItem(`likedWallpapers-${user.email}`) || "[]"
    );

    if (likedWallpapers.includes(wallpaper.id)) {
      setIsLiked(false);
      localStorage.setItem(
        `likedWallpapers-${user.email}`,
        JSON.stringify(
          likedWallpapers.filter((id: string) => id !== wallpaper.id)
        )
      );
    } else {
      setIsLiked(true);
      localStorage.setItem(
        `likedWallpapers-${user.email}`,
        JSON.stringify([...likedWallpapers, wallpaper.id])
      );
    }
  };

  useEffect(() => {
    // if (!user || !id) return; // Esperar a que user esté disponible
    const fetchData = async () => {
      const data = await getWallpaper(id);
      if (!data) router.push("/404");
      else setWallpaper(data);

      const likedWallpapers = JSON.parse(
        localStorage.getItem(`likedWallpapers-${user?.email}`) || "[]"
      );
      setIsLiked(likedWallpapers.includes(id));
    };

    fetchData();
  }, [id, user, router]);

  if (!wallpaper) {
    return (
      <div className="space-y-8 mt-28 px-4 sm:px-8 lg:px-16 animate-pulse">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* <DeviceMockup
            type={wallpaper?.tipo || "mobile"}
            imageUrl={wallpaper?.imagen || "/placeholder.svg"}
            title={wallpaper?.titulo || "Sin título"}
          /> */}

          {/* Skeleton para el mockup del dispositivo */}
          <div className="relative overflow-hidden rounded-lg p-6 shadow-lg bg-muted/30 ">
            <div className="aspect-square md:aspect-[4/3] w-full bg-muted rounded-lg" />
          </div>

          {/* Skeleton para la información del wallpaper */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>

            <Skeleton className="h-20 w-full" />

            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>

            <Skeleton className="h-px w-full" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>

            <div className="space-x-4 flex">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>

        <Skeleton className="h-px w-full" />

        {/* Skeleton para la sección de sugerencias */}
        <div>
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-28 px-4 sm:px-8 lg:px-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <DeviceMockup
            type={wallpaper.tipo}
            imageUrl={wallpaper.imagen}
            title={wallpaper.titulo}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {" "}
              {wallpaper.titulo === "null" ? "Sin título" : wallpaper.titulo}
            </h1>
            <p className="text-muted-foreground mt-1">
              Subido el {new Date(wallpaper.fecha).toLocaleDateString()}
            </p>
          </div>

          <p className="text-lg">
            {wallpaper.descripcion === "null"
              ? "Sin descripción"
              : wallpaper.descripcion}
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {wallpaper.etiquetas.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Colores
              </h3>
              <div className="flex flex-wrap gap-2">
                {wallpaper.colores.map((color: string) => (
                  <Badge key={color} variant="outline" className="capitalize">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Resolución
              </h3>
              <p className="font-medium">
                {wallpaper.dimensiones.ancho} x {wallpaper.dimensiones.alto}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Descargas
              </h3>
              <p className="font-medium">{wallpaper.descargas}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Descargar
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 cursor-pointer"
                disabled={!user}
                onClick={() =>
                  descargarImagen(
                    wallpaper.imagenID,
                    "original",
                    wallpaper.id,
                    setWallpaper
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar HD
              </Button>
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() =>
                  descargarImagen(
                    wallpaper.imagenID,
                    "resized",
                    wallpaper.id,
                    setWallpaper
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Normal
              </Button>
            </div>
          </div>

          <div className="space-x-4">
            <Button
              variant="outline"
              className="text-muted-foreground cursor-pointer"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button
              variant="ghost"
              className={`cursor-pointer text-muted-foreground ${
                isLiked ? "text-red-500" : ""
              }`}
              disabled={!user}
              onClick={toggleLike}
            >
              {isLiked && user ? (
                <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              {isLiked && user ? "En favoritos" : "Añadir a favoritos"}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-8 pt-5">Te podría interesar</h2>
        <SuggestedWallpapers
          currentId={wallpaper.id}
          tags={wallpaper.etiquetas}
          colors={wallpaper.colores}
        />
      </div>
    </div>
  );
}
