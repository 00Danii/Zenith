"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, X, Heart, Download } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Masonry from "react-masonry-css";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Restaurando las funciones originales
const fetchEtiquetas = async () => {
  try {
    const response = await fetch(`${API_URL}/api/etiquetas`);
    if (!response.ok) {
      throw new Error("Failed to fetch etiquetas");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching etiquetas:", error);
    return [];
  }
};

const fetchColores = async () => {
  try {
    const response = await fetch(`${API_URL}/api/colores`);
    if (!response.ok) {
      throw new Error("Failed to fetch colores");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching colores:", error);
    return [];
  }
};

// Modificar la función fetchFondos para que no aplique límites cuando hay filtros
const fetchFondos = async (
  limit = 12,
  offset = 0,
  filters: {
    search?: string;
    etiquetas?: string[];
    colores?: string[];
  } | null = null
) => {
  try {
    // Construir la URL base
    let url = `${API_URL}/api/fondos`;

    // Si hay filtros activos, no aplicamos limit ni offset para obtener todos los resultados
    const hasActiveFilters =
      filters &&
      (filters.search ||
        (filters.etiquetas && filters.etiquetas.length > 0) ||
        (filters.colores && filters.colores.length > 0));

    if (!hasActiveFilters) {
      // Solo aplicamos paginación cuando no hay filtros
      url += `?limit=${limit}&offset=${offset}`;
    }

    // Añadir parámetros de filtro si existen
    if (filters) {
      const separator = url.includes("?") ? "&" : "?";

      if (filters.search) {
        url += `${separator}search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.etiquetas && filters.etiquetas.length > 0) {
        url += `${url.includes("?") ? "&" : "?"}etiquetas=${encodeURIComponent(
          filters.etiquetas.join(",")
        )}`;
      }
      if (filters.colores && filters.colores.length > 0) {
        url += `${url.includes("?") ? "&" : "?"}colores=${encodeURIComponent(
          filters.colores.join(",")
        )}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener fondos");

    const fondos = await response.json();

    // Asumimos que los fondos vienen directamente como un array
    const fondosData = Array.isArray(fondos) ? fondos : [];

    // Obtener etiquetas, colores e imágenes para cada fondo
    const fondosConDetalles = await Promise.all(
      fondosData.map(async (fondo) => {
        try {
          const colores = await Promise.all(
            (fondo.colores || []).map(async (colorId: string) => {
              try {
                const res = await fetch(`${API_URL}/api/colores/${colorId}`);
                return res.ok ? (await res.json()).nombre : "Desconocido";
              } catch (error) {
                return "Desconocido";
              }
            })
          );

          const etiquetas = await Promise.all(
            (fondo.etiquetas || []).map(async (etiquetaId: string) => {
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

          let imagen = "/placeholder.svg";
          let width = 0;
          let height = 0;
          let tipo = "desktop"; // Por defecto asumimos escritorio

          try {
            if (fondo.imagen) {
              const res = await fetch(
                `${API_URL}/api/imagenes/${fondo.imagen}`
              );
              if (res.ok) {
                const data = await res.json();
                imagen = data?.url || "/placeholder.svg";

                // Extraer información de resolución y tipo
                width = data?.width || 0;
                height = data?.height || 0;

                // Determinar si es móvil o escritorio basado en la relación de aspecto
                // Si la altura es mayor que el ancho
                tipo = height > width ? "mobile" : "desktop";
              }
            }
          } catch (error) {
            console.error("Error al obtener imagen:", error);
          }

          const imagenID = fondo.imagen;

          return {
            ...fondo,
            colores,
            etiquetas,
            imagen,
            imagenID,
            descargas: fondo.numero_descargas,
            resolucion: { width, height },
            tipo,
          };
        } catch (error) {
          console.error("Error procesando fondo:", error);
          return null;
        }
      })
    ).then((results) => results.filter(Boolean));

    // Determinar si hay más páginas basado en si recibimos menos elementos que el límite
    const hasMore = !hasActiveFilters && fondosConDetalles.length === limit;

    // Obtener el total de fondos
    const responseTotal = await fetch(`${API_URL}/api/fondos/total`);
    const totalFondos = await responseTotal.json();

    return {
      fondos: fondosConDetalles,
      hasMore,
      total: totalFondos,
      hasActiveFilters,
    };
  } catch (error) {
    console.error("Error en fetchFondos:", error);
    return { fondos: [], hasMore: false, total: 0, hasActiveFilters: false };
  }
};

// Modificar el componente WallpaperGrid para manejar la visualización sin paginación cuando hay filtros
export function WallpaperGrid() {
  const { user } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectingRef = useRef(false);

  const [fondos, setFondos] = useState<any[]>([]);
  interface Etiqueta {
    _id: string;
    nombre: string;
  }

  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  interface Color {
    _id: string;
    nombre: string;
  }

  const [colores, setColores] = useState<Color[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<string[]>([]);
  const [selectedColores, setSelectedColores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedWallpapers, setLikedWallpapers] = useState<string[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [pageValidated, setPageValidated] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalFondos, setTotalFondos] = useState(0);
  const [itemsPerPage] = useState(24);

  // Añadir un estado para los filtros actuales
  const [activeFilters, setActiveFilters] = useState<{
    search: string;
    etiquetas: string[];
    colores: string[];
  }>({
    search: "",
    etiquetas: [],
    colores: [],
  });

  // Añadir un estado para el total de resultados filtrados
  const [totalFilteredFondos, setTotalFilteredFondos] = useState(0);

  // Añadir un estado para saber si hay filtros activos
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Configuración de breakpoints para el masonry
  const breakpointColumnsObj = {
    default: 4, // Número de columnas por defecto (pantallas grandes)
    1280: 4, // 4 columnas en pantallas >= 1280px
    1024: 3, // 3 columnas en pantallas >= 1024px
    768: 2, // 2 columnas en pantallas >= 768px
    640: 2, // 1 columna en pantallas pequeñas
  };

  // Leer la página actual de la URL al cargar el componente
  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      const pageNumber = Number.parseInt(page, 10);
      // Verificar que el número de página sea válido (positivo)
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      } else {
        // Si la página es inválida (negativa o no es un número), redirigir a 404
        redirectingRef.current = true;
        router.push("/404");
        return;
      }
    } else {
      // Si no hay parámetro de página, estamos en la página 1
      setCurrentPage(1);
      // Marcar la página como validada ya que la página 1 siempre es válida
      setPageValidated(true);
    }
  }, [searchParams, router]);

  // Modificar fetchData para usar los filtros
  const fetchData = async (page = currentPage, filters = activeFilters) => {
    // Si ya estamos redirigiendo, no hacer nada
    if (redirectingRef.current) return;

    setLoading(true);
    const offset = (page - 1) * itemsPerPage;

    try {
      const [fondosResult, etiquetasData, coloresData] = await Promise.all([
        fetchFondos(itemsPerPage, offset, filters),
        fetchEtiquetas(),
        fetchColores(),
      ]);

      // Actualizar el estado de filtros activos
      setHasActiveFilters(!!fondosResult.hasActiveFilters);

      // Si no hay filtros activos, verificar si la página solicitada existe
      if (!fondosResult.hasActiveFilters) {
        const totalPages = Math.ceil(fondosResult.total / itemsPerPage);

        // Si la página no es válida y no es la página 1, redirigir a 404
        if (page > totalPages && page !== 1 && initialLoadComplete) {
          redirectingRef.current = true;
          router.push("/404");
          return;
        }
      }

      // Si llegamos aquí, la página es válida
      setPageValidated(true);
      setFondos(fondosResult.fondos);
      setHasMorePages(fondosResult.hasMore);
      setTotalFondos(fondosResult.total);

      // Actualizar el total de resultados filtrados
      if (
        filters &&
        (filters.search ||
          filters.etiquetas.length > 0 ||
          filters.colores.length > 0)
      ) {
        setTotalFilteredFondos(fondosResult.fondos.length);
      } else {
        setTotalFilteredFondos(0); // Resetear cuando no hay filtros
      }

      setEtiquetas(etiquetasData);
      setColores(coloresData);

      // Cargar likes del localStorage
      const storageKey = `likedWallpapers-${user?.email}`;
      const savedLikes = localStorage.getItem(storageKey);
      if (savedLikes) {
        try {
          const parsed = JSON.parse(savedLikes);
          if (Array.isArray(parsed)) {
            setLikedWallpapers(parsed);
          }
        } catch (error) {
          console.error("Error al parsear likes guardados:", error);
        }
      }

      // Marcar que la carga inicial se ha completado
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      // Si hay un error, aún marcamos la página como validada para mostrar un mensaje de error
      setPageValidated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Resetear el estado de validación de página cuando cambia la página
    if (currentPage !== 1) {
      setPageValidated(false);
    }
    fetchData();
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedEtiquetas,
    selectedColores,
  ]);

  useEffect(() => {
    let frames = 0;
    const waitForFrames = () => {
      if (frames < 5) {
        frames++;
        requestAnimationFrame(waitForFrames);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    requestAnimationFrame(waitForFrames);
  }, [currentPage]);

  // Verificar si la página existe después de conocer el total de fondos
  useEffect(() => {
    if (initialLoadComplete && totalFondos > 0 && !redirectingRef.current) {
      const totalPages = Math.ceil(totalFondos / itemsPerPage);
      if (currentPage > totalPages && currentPage !== 1) {
        redirectingRef.current = true;
        router.push("/404");
      }
    }
  }, [totalFondos, currentPage, itemsPerPage, initialLoadComplete, router]);

  // Función para cambiar de página y actualizar la URL
  const handlePageChange = (page: number) => {
    // Asegurarse de que la página sea un número positivo
    if (page < 1) return;

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalFondos / itemsPerPage);

    // No permitir navegar más allá de la última página
    if (page > totalPages) return;

    // Actualizar el estado
    setCurrentPage(page);

    // Actualizar la URL
    updateUrlWithPage(page);

    // Scroll al inicio
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para actualizar la URL con el número de página
  const updateUrlWithPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete("page"); // Eliminar el parámetro page si es la página 1
    } else {
      params.set("page", page.toString());
    }

    // Construir la nueva URL
    const pathname = window.location.pathname;
    const query = params.toString();
    const url = pathname + (query ? `?${query}` : "");

    // Actualizar la URL sin recargar la página
    router.push(url, { scroll: false });
  };

  // Generar array de páginas a mostrar con el total conocido
  const generatePagination = () => {
    // Calcular el número total de páginas basado en los datos filtrados o totales
    const totalItems =
      totalFilteredFondos > 0 ? totalFilteredFondos : totalFondos;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Si no hay páginas, mostrar al menos una
    if (totalPages === 0) return [1];

    // Si hay 7 o menos páginas, mostrar todas
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Si la página actual está entre las primeras 3
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    // Si la página actual está entre las últimas 3
    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    // Si la página actual está en el medio
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // Resto del código de filtrado...
  const filteredFondos = fondos.filter((fondo) => {
    // Filtrar por búsqueda (título, etiquetas o colores)
    const matchesSearch =
      searchQuery === "" ||
      fondo.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fondo.etiquetas.some((etiqueta: string) =>
        etiqueta.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      fondo.colores.some((color: string) =>
        color.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Filtrar por etiquetas seleccionadas
    const matchesEtiquetas =
      selectedEtiquetas.length === 0 ||
      selectedEtiquetas.some((etiqueta) => fondo.etiquetas.includes(etiqueta));

    // Filtrar por colores seleccionados
    const matchesColores =
      selectedColores.length === 0 ||
      selectedColores.some((color) => fondo.colores.includes(color));

    return matchesSearch && matchesEtiquetas && matchesColores;
  });

  // Cuando se aplican filtros, volver a la primera página
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateUrlWithPage(1);
    }
  }, [searchQuery, selectedEtiquetas, selectedColores]);

  // Actualizar las funciones de manejo de filtros
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Actualizar los filtros activos
    const newFilters = {
      ...activeFilters,
      search: value,
    };
    setActiveFilters(newFilters);

    // Volver a la página 1 y cargar datos con los nuevos filtros
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateUrlWithPage(1);
    }

    // Cargar datos con los nuevos filtros
    fetchData(1, newFilters);
  };

  const handleEtiquetaToggle = (etiqueta: string) => {
    const newSelectedEtiquetas = selectedEtiquetas.includes(etiqueta)
      ? selectedEtiquetas.filter((e) => e !== etiqueta)
      : [...selectedEtiquetas, etiqueta];

    setSelectedEtiquetas(newSelectedEtiquetas);

    // Actualizar los filtros activos
    const newFilters = {
      ...activeFilters,
      etiquetas: newSelectedEtiquetas,
    };
    setActiveFilters(newFilters);

    // Volver a la página 1 y cargar datos con los nuevos filtros
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateUrlWithPage(1);
    }

    // Cargar datos con los nuevos filtros
    fetchData(1, newFilters);
  };

  const handleColorToggle = (color: string) => {
    const newSelectedColores = selectedColores.includes(color)
      ? selectedColores.filter((c) => c !== color)
      : [...selectedColores, color];

    setSelectedColores(newSelectedColores);

    // Actualizar los filtros activos
    const newFilters = {
      ...activeFilters,
      colores: newSelectedColores,
    };
    setActiveFilters(newFilters);

    // Volver a la página 1 y cargar datos con los nuevos filtros
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateUrlWithPage(1);
    }

    // Cargar datos con los nuevos filtros
    fetchData(1, newFilters);
  };

  const clearFilters = () => {
    setSelectedEtiquetas([]);
    setSelectedColores([]);

    // Actualizar los filtros activos
    const newFilters = {
      ...activeFilters,
      etiquetas: [],
      colores: [],
    };
    setActiveFilters(newFilters);

    // Volver a la página 1 y cargar datos con los nuevos filtros
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateUrlWithPage(1);
    }

    // Cargar datos con los nuevos filtros
    fetchData(1, newFilters);
  };

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
      // const storageKey = `likedWallpapers-${user.email}`;

      const newLikes = prev.includes(id)
        ? prev.filter((wallpaperId) => wallpaperId !== id)
        : [...prev, id];

      localStorage.setItem(
        `likedWallpapers-${user.email}`,
        JSON.stringify(newLikes)
      );
      return newLikes;
    });
  };

  // Mostrar un estado de carga extendido mientras validamos la página
  if (loading && !pageValidated) {
    return (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {Array.from({ length: 12 }).map((_, index) => (
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
    );
  }

  // Agregar el componente de paginación al final del return
  return (
    <div className="space-y-4" id="wallpaper-grid-container">
      {/* Código existente de búsqueda y filtros... */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, etiquetas o colores..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {(selectedEtiquetas.length > 0 || selectedColores.length > 0) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedEtiquetas.length + selectedColores.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                {(selectedEtiquetas.length > 0 ||
                  selectedColores.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpiar
                  </Button>
                )}
              </div>

              <div>
                <h5 className="mb-2 text-sm font-medium">Etiquetas</h5>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {etiquetas.map((etiqueta) => (
                    <div
                      key={etiqueta._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`etiqueta-${etiqueta._id}`}
                        checked={selectedEtiquetas.includes(etiqueta.nombre)}
                        onCheckedChange={() =>
                          handleEtiquetaToggle(etiqueta.nombre)
                        }
                      />
                      <Label
                        htmlFor={`etiqueta-${etiqueta._id}`}
                        className="capitalize"
                      >
                        {etiqueta.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h5 className="mb-2 text-sm font-medium">Colores</h5>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {colores.map((color) => (
                    <div
                      key={color._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`color-${color._id}`}
                        checked={selectedColores.includes(color.nombre)}
                        onCheckedChange={() => handleColorToggle(color.nombre)}
                      />
                      <Label
                        htmlFor={`color-${color._id}`}
                        className="capitalize"
                      >
                        {color.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mostrar filtros activos */}
      {(selectedEtiquetas.length > 0 || selectedColores.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedEtiquetas.map((etiqueta) => (
            <Badge
              key={etiqueta}
              variant="secondary"
              className="flex items-center gap-1 capitalize"
            >
              {etiqueta}
              <button
                onClick={() => handleEtiquetaToggle(etiqueta)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedColores.map((color) => (
            <Badge
              key={color}
              variant="outline"
              className="flex items-center gap-1 capitalize"
            >
              {color}
              <button
                onClick={() => handleColorToggle(color)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {(selectedEtiquetas.length > 0 || selectedColores.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Reemplazar la sección de renderizado de la cuadrícula con el diseño Masonry */}
      {loading ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {Array.from({ length: 12 }).map((_, index) => (
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
      ) : filteredFondos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron fondos que coincidan con los criterios de
            búsqueda.
          </p>
        </div>
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
                    style={{ viewTransitionName: `wallpaper-${wallpaper.id}` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                      {wallpaper.etiquetas.slice(0, 3).map((tag: string) => (
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
                </div>
              </Link>
            </div>
          ))}
        </Masonry>
      )}

      {/* Paginación - solo mostrar cuando NO hay filtros activos */}
      {!loading && filteredFondos.length > 0 && !hasActiveFilters && (
        <div className="flex justify-center items-center gap-1 py-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="sr-only">Página anterior</span>
          </Button>

          {generatePagination().map((page, i) =>
            page === "..." ? (
              <Button
                key={`ellipsis-${i}`}
                variant="outline"
                size="icon"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
                <span className="sr-only">Más páginas</span>
              </Button>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() =>
                  typeof page === "number" && handlePageChange(page)
                }
              >
                {page}
                <span className="sr-only">Página {page}</span>
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= Math.ceil(totalFondos / itemsPerPage)}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="sr-only">Página siguiente</span>
          </Button>
        </div>
      )}

      {/* Mostrar un mensaje cuando hay resultados filtrados */}
      {!loading && filteredFondos.length > 0 && hasActiveFilters && (
        <div className="text-center text-sm text-muted-foreground py-2">
          Mostrando {filteredFondos.length} resultados
        </div>
      )}
    </div>
  );
}
