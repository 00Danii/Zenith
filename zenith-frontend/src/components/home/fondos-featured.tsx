"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Función para enriquecer fondos
async function processFondos(fondos: any[]) {
  return Promise.all(
    fondos.map(async (fondo) => {
      const etiquetas = await Promise.all(
        (fondo.etiquetas || []).map(async (etiquetaId: string) => {
          try {
            const res = await fetch(`${API_URL}/api/etiquetas/${etiquetaId}`, {
              next: { revalidate: 3600 },
            });
            if (!res.ok) return "Desconocido";
            const data = await res.json();
            return data?.nombre || "Desconocido";
          } catch {
            return "Desconocido";
          }
        })
      );

      const colores = await Promise.all(
        (fondo.colores || []).map(async (colorId: string) => {
          try {
            const res = await fetch(`${API_URL}/api/colores/${colorId}`, {
              next: { revalidate: 3600 },
            });
            if (!res.ok) return "Desconocido";
            const data = await res.json();
            return data?.nombre || "Desconocido";
          } catch {
            return "Desconocido";
          }
        })
      );

      let thumbnail = "/placeholder.svg";
      let width = 0;
      let height = 0;
      let tipo = "";

      if (fondo.imagen) {
        try {
          const res = await fetch(`${API_URL}/api/imagenes/${fondo.imagen}`);
          if (res.ok) {
            const data = await res.json();
            thumbnail = data.url;
            width = data.width || 0;
            height = data.height || 0;
            tipo = height > width ? "mobile" : "desktop";
          }
        } catch {}
      }

      const date = fondo.fecha_publicacion
        ? formatDistanceToNow(new Date(fondo.fecha_publicacion), {
            addSuffix: true,
            locale: es,
          })
        : "Fecha desconocida";
      const resolucion = width && height ? `${width}x${height}` : null;

      return {
        id: fondo.id,
        titulo:
          fondo.titulo === "null" ? "Sin título" : fondo.titulo || "Sin título",
        etiquetas,
        colores,
        tipo,
        date,
        thumbnail,
        resolucion,
        descargas: fondo.numero_descargas || 0,
      };
    })
  );
}

// Componente de Skeleton para los fondos
function FondosSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg aspect-[3/4] animate-pulse"
        >
          {/* Fondo del skeleton */}
          <Skeleton className="absolute inset-0 bg-muted" />

          {/* Badge de tipo (móvil/escritorio) */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Título y etiquetas */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex flex-wrap gap-1 mt-1">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FondosFeatured() {
  interface Fondo {
    id: any;
    titulo: string;
    etiquetas: string[];
    colores: string[];
    tipo: string;
    date: string;
    thumbnail: string;
    resolucion: string | null;
    descargas: number;
  }

  const [populares, setPopulares] = useState<Fondo[]>([]);
  const [recientes, setRecientes] = useState<Fondo[]>([]);
  const [destacados, setDestacados] = useState<Fondo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFondos = async () => {
      try {
        // Cargar todos los datos al mismo tiempo
        const [resPop, resRec, responseTotal] = await Promise.all([
          fetch(`${API_URL}/api/fondos/mas-descargados`),
          fetch(`${API_URL}/api/fondos?offset=0&limit=15`),
          fetch(`${API_URL}/api/fondos/total`),
        ]);

        if (!responseTotal.ok)
          throw new Error("Error al cargar el total de fondos");

        const [dataPop, dataRec, totalData] = await Promise.all([
          resPop.json(),
          resRec.json(),
          responseTotal.json(),
        ]);

        // Procesar fondos destacados
        const fondosAMostrar = 15;
        const maxOffset = Math.max(totalData - fondosAMostrar, 0);
        const randomOffset = Math.floor(Math.random() * (maxOffset + 1));

        const resDest = await fetch(
          `${API_URL}/api/fondos?offset=${randomOffset}&limit=${fondosAMostrar}`
        );
        const dataDest = await resDest.json();

        // Procesar todos los datos en paralelo
        const [popProcesados, recProcesados, destProcesados] =
          await Promise.all([
            processFondos(dataPop),
            processFondos(dataRec),
            processFondos(dataDest),
          ]);

        setPopulares(popProcesados);
        setRecientes(recProcesados);
        setDestacados(destProcesados);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los fondos", error);
        setLoading(false);
      }
    };

    fetchFondos();
  }, []);

  const renderFondos = (fondos: any[]) => {
    if (loading) {
      return <FondosSkeleton />;
    }

    if (fondos.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron fondos</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {fondos.map((fondo) => (
          <div
            key={fondo.id}
            className="group relative overflow-hidden rounded-lg aspect-[3/4]"
          >
            <Link href={`/fondos/${fondo.id}`} className="block h-full">
              <Image
                src={fondo.thumbnail || "/placeholder.svg"}
                alt={fondo.titulo === "null" ? "Sin título" : fondo.titulo}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-2 right-2 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/60 text-white border-none"
                >
                  {fondo.tipo === "mobile" ? "Móvil" : "Escritorio"}
                </Badge>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                <h3 className="font-medium line-clamp-1 drop-shadow-md text-white hover:underline">
                  {fondo.titulo === "null" ? "" : fondo.titulo}
                </h3>

                <div className="flex flex-wrap gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {fondo.etiquetas?.slice(0, 3).map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs capitalize bg-black/50 hover:bg-black/70 text-white border-none"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {fondo.etiquetas?.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-black/50 hover:bg-black/70 text-white border-none"
                    >
                      +{fondo.etiquetas.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="featured" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="featured" className="flex items-center">
          <Sparkles className="mr-2 h-4 w-4" />
          Destacados
        </TabsTrigger>
        <TabsTrigger value="popular" className="flex items-center">
          <TrendingUp className="mr-2 h-4 w-4" />
          Populares
        </TabsTrigger>
        <TabsTrigger value="new" className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          Recientes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="featured" className="space-y-4">
        {renderFondos(destacados)}
      </TabsContent>

      <TabsContent value="popular" className="space-y-4">
        {renderFondos(populares)}
      </TabsContent>

      <TabsContent value="new" className="space-y-4">
        {renderFondos(recientes)}
      </TabsContent>

      <div className="flex justify-center mt-8">
        <Link href="/fondos">
          <Button asChild>
            <div>
              Ver todos los fondos
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Button>
        </Link>
      </div>
    </Tabs>
  );
}

export default FondosFeatured;
