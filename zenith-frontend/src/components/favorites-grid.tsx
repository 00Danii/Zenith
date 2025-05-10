"use client";

import {
  useState,
  useEffect,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, Download } from "lucide-react";
// import { Link } from "@/components/transition-link";
import Masonry from "react-masonry-css";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function FavoritesGrid() {
  const { user } = useAuth();
  interface Fondo {
    id: string;
    titulo: string;
    colores: string[];
    etiquetas: string[];
    imagen: string;
    imagenID: string;
    descargas: number;
    resolucion: { width: number; height: number };
    tipo: string;
  }

  const [fondos, setFondos] = useState<Fondo[]>([]);
  const [filteredFondos, setFilteredFondos] = useState<Fondo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [likedWallpapers, setLikedWallpapers] = useState<string[]>([]);

  // Configuración de breakpoints para el masonry
  const breakpointColumnsObj = {
    default: 4, // Número de columnas por defecto (pantallas grandes)
    1280: 4, // 4 columnas en pantallas >= 1280px
    1024: 3, // 3 columnas en pantallas >= 1024px
    768: 2, // 2 columnas en pantallas >= 768px
    640: 1, // 1 columna en pantallas pequeñas
  };

  // Cargar los fondos favoritos
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);

      try {
        // // Obtener IDs de favoritos del localStorage
        // const savedLikes = localStorage.getItem("likedWallpapers");
        // let likedIds = [];

        // if (savedLikes) {
        //   try {
        //     const parsed = JSON.parse(savedLikes);
        //     if (Array.isArray(parsed)) {
        //       likedIds = parsed.reverse();
        //       setLikedWallpapers(parsed);
        //     }
        //   } catch (error) {
        //     console.error("Error al parsear likes guardados:", error);
        //   }
        // }

        if (!user) return;

        const storageKey = `likedWallpapers-${user.email}`;
        const savedLikes = localStorage.getItem(storageKey);
        let likedIds = [];

        if (savedLikes) {
          try {
            const parsed = JSON.parse(savedLikes);
            if (Array.isArray(parsed)) {
              likedIds = parsed.reverse();
              setLikedWallpapers(parsed);
            }
          } catch (error) {
            console.error("Error al parsear likes guardados:", error);
          }
        }

        // Si no hay favoritos, terminar
        if (likedIds.length === 0) {
          setFondos([]);
          setFilteredFondos([]);
          setLoading(false);
          return;
        }

        // Obtener detalles de cada fondo favorito
        const fondosPromises = likedIds.map(async (id) => {
          try {
            const response = await fetch(`${API_URL}/api/fondos/${id}`);
            if (!response.ok) return null;

            const fondo = await response.json();

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

            // Obtener colores
            const colores = await Promise.all(
              (fondo.colores || []).map(async (colorId: any) => {
                try {
                  const res = await fetch(`${API_URL}/api/colores/${colorId}`);
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
                  width = data?.width || 0;
                  height = data?.height || 0;
                  tipo = height > width ? "mobile" : "desktop";
                }
              } catch (error) {
                console.error("Error al obtener imagen:", error);
              }
            }

            return {
              id: fondo.id,
              titulo: fondo.titulo || "",
              colores,
              etiquetas,
              imagen,
              imagenID: fondo.imagen,
              descargas: fondo.numero_descargas,
              resolucion: { width, height },
              tipo,
            };
          } catch (error) {
            console.error(`Error al obtener fondo ${id}:`, error);
            return null;
          }
        });

        const fondosData = await Promise.all(fondosPromises);
        const validFondos: Fondo[] = fondosData.filter(
          (fondo): fondo is Fondo => fondo !== null
        );

        setFondos(validFondos);
        setFilteredFondos(validFondos);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Filtrar fondos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFondos(fondos);
      return;
    }

    const filtered = fondos.filter((fondo) => {
      const matchesSearch =
        fondo.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fondo.etiquetas.some((etiqueta: string) =>
          etiqueta.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        fondo.colores.some((color: string) =>
          color.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });

    setFilteredFondos(filtered);
  }, [searchQuery, fondos]);

  // const toggleLike = (id) => {
  //   setLikedWallpapers((prev) => {
  //     const newLikes = prev.filter((wallpaperId) => wallpaperId !== id);

  //     // Guardar en localStorage
  //     localStorage.setItem("likedWallpapers", JSON.stringify(newLikes));

  //     // Actualizar la lista de fondos mostrados
  //     setFondos((prevFondos) => prevFondos.filter((fondo) => fondo.id !== id));
  //     setFilteredFondos((prevFiltered) =>
  //       prevFiltered.filter((fondo) => fondo.id !== id)
  //     );

  //     return newLikes;
  //   });
  // };

  const toggleLike = (id: any) => {
    if (!user) return; // Asegúrate de tener un usuario antes de continuar

    const storageKey = `likedWallpapers-${user.email}`;

    setLikedWallpapers((prev) => {
      const isLiked = prev.includes(id);
      let newLikes;

      if (isLiked) {
        // Si ya está en likes, lo quitamos
        newLikes = prev.filter((wallpaperId) => wallpaperId !== id);

        // Actualizamos también los fondos visibles
        setFondos((prevFondos) =>
          prevFondos.filter((fondo) => fondo.id !== id)
        );
        setFilteredFondos((prevFiltered) =>
          prevFiltered.filter((fondo) => fondo.id !== id)
        );
      } else {
        // Si no está en likes, lo agregamos
        newLikes = [...prev, id];
      }

      // Guardar en localStorage
      localStorage.setItem(storageKey, JSON.stringify(newLikes));

      return newLikes;
    });
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex w-full items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en tus favoritos..."
          className="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Mostrar mensaje si no hay favoritos */}
      {!loading && filteredFondos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {fondos.length === 0
              ? "No has marcado ningún fondo como favorito aún."
              : "No se encontraron fondos que coincidan con tu búsqueda."}
          </p>
          {fondos.length === 0 && (
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/fondos">Explorar fondos</Link>
            </Button>
          )}
        </div>
      )}

      {/* Mostrar fondos favoritos */}
      {loading ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              suppressHydrationWarning
              key={`skeleton-${index}`}
              className="bg-muted animate-pulse rounded-md overflow-hidden mb-4"
              style={{
                height: `${Math.floor(Math.random() * 200) + 200}px`,
              }}
            />
          ))}
        </Masonry>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {filteredFondos.map((wallpaper) => (
            <div
              key={wallpaper.id}
              className="group relative overflow-hidden rounded-md mb-4"
            >
              <Link href={`/fondos/${wallpaper.id}`} className="block h-full">
                <div
                  className="relative w-full"
                  style={{
                    aspectRatio:
                      wallpaper.tipo === "mobile"
                        ? wallpaper.resolucion.width &&
                          wallpaper.resolucion.height
                          ? `${wallpaper.resolucion.width}/${wallpaper.resolucion.height}`
                          : "9/16"
                        : wallpaper.resolucion.width &&
                          wallpaper.resolucion.height
                        ? `${wallpaper.resolucion.width}/${wallpaper.resolucion.height}`
                        : "16/9",
                  }}
                >
                  <Image
                    src={wallpaper.imagen || "/placeholder.svg"}
                    alt={wallpaper.titulo === "null" ? "" : wallpaper.titulo}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{
                      viewTransitionName: `wallpaper-${wallpaper.id}`,
                    }}
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
                        {wallpaper.resolucion.width}x
                        {wallpaper.resolucion.height}
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(wallpaper.id);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
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
                      {wallpaper.etiquetas
                        .slice(0, 3)
                        .map(
                          (
                            tag:
                              | boolean
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | Promise<
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | ReactPortal
                                  | ReactElement<
                                      unknown,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | null
                                  | undefined
                                >
                              | Key
                              | null
                              | undefined
                          ) => (
                            <Badge
                              key={
                                typeof tag === "string" ||
                                typeof tag === "number"
                                  ? tag
                                  : undefined
                              }
                              variant="secondary"
                              className="text-xs capitalize bg-black/50 hover:bg-black/70 text-white border-none"
                            >
                              {tag}
                            </Badge>
                          )
                        )}
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
                </div>
              </Link>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}
