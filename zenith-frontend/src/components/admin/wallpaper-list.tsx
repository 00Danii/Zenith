"use client";

import {
  useState,
  useEffect,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  JSXElementConstructor,
  SetStateAction,
} from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Edit, Filter, MoreHorizontal, Search, Trash2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DeleteWallpaperDialog } from "./delete-wallpaper-dialog";
import { EditWallpaperDialog } from "./edit-wallpaper-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchFondos = async () => {
  try {
    const response = await fetch(`${API_URL}/api/fondos`);
    if (!response.ok) throw new Error("Error al obtener fondos");
    const fondos = await response.json();

    // Obtener etiquetas, colores e imágenes para cada fondo
    const fondosConDetalles = await Promise.all(
      fondos.map(
        async (fondo: {
          colores: string[];
          etiquetas: string[];
          imagen: any;
        }) => {
          const colores = await Promise.all(
            fondo.colores.map(async (colorId: any) => {
              const res = await fetch(`${API_URL}/api/colores/${colorId}`);
              return res.ok ? (await res.json()).nombre : "Desconocido";
            })
          );

          const etiquetas = await Promise.all(
            fondo.etiquetas.map(async (etiquetaId: string) => {
              const res = await fetch(`${API_URL}/api/etiquetas/${etiquetaId}`);
              return res.ok ? (await res.json()).nombre : "Desconocido";
            })
          );

          const imagen = await fetch(`${API_URL}/api/imagenes/${fondo.imagen}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data?.url || "/placeholder.svg");
          const imagenID = fondo.imagen;
          return { ...fondo, colores, etiquetas, imagen, imagenID };
        }
      )
    );

    return fondosConDetalles;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchEtiquetas = async () => {
  try {
    const response = await fetch(`${API_URL}/api/etiquetas`);
    if (!response.ok) throw new Error("Error al obtener etiquetas");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchColores = async () => {
  try {
    const response = await fetch(`${API_URL}/api/colores`);
    if (!response.ok) throw new Error("Error al obtener colores");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export function WallpaperList() {
  const [fondos, setFondos] = useState<
    {
      id: string;
      titulo?: string;
      etiquetas: string[];
      colores: string[];
      imagen: string;
      imagenID: string;
      descripcion?: string;
    }[]
  >([]);

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<{
    [key: string]: any;
    id: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [fondosData, etiquetasData, coloresData] = await Promise.all([
      fetchFondos(),
      fetchEtiquetas(),
      fetchColores(),
    ]);
    setFondos(fondosData);
    setEtiquetas(etiquetasData);
    setColores(coloresData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFondos = fondos.filter((fondo) => {
    // Filtrar por búsqueda (título, etiquetas o colores)
    const matchesSearch =
      searchQuery === "" ||
      fondo.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fondo.etiquetas.some((etiqueta) =>
        etiqueta.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      fondo.colores.some((color) =>
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

  const handleEtiquetaToggle = (etiqueta: string) => {
    setSelectedEtiquetas((prev) =>
      prev.includes(etiqueta)
        ? prev.filter((e) => e !== etiqueta)
        : [...prev, etiqueta]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColores((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleDeleteClick = (wallpaper: { id: string; [key: string]: any }) => {
    setSelectedWallpaper(wallpaper);
    setDeleteDialogOpen(true);
  };

  const handleWallpaperDeleted = () => {
    setFondos((prevFondos) =>
      prevFondos.filter(
        (f) => selectedWallpaper && f.id !== selectedWallpaper.id
      )
    );
  };

  const handleEditClick = (wallpaper: { id: string; [key: string]: any }) => {
    setSelectedWallpaper(wallpaper);
    setEditDialogOpen(true);
  };

  const handleWallpaperUpdated = () => {
    fetchData();
  };

  const clearFilters = () => {
    setSelectedEtiquetas([]);
    setSelectedColores([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, etiquetas o colores..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                      <Label htmlFor={`etiqueta-${etiqueta._id}`}>
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
                      <Label htmlFor={`color-${color._id}`}>
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
              className="flex items-center gap-1"
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
              className="flex items-center gap-1"
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
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredFondos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No se encontraron fondos que coincidan con los criterios de
            búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFondos.map((fondo) => (
            <Card key={fondo.id}>
              <CardContent className="p-4">
                <div className="relative">
                  <Image
                    src={fondo.imagen || "/placeholder.svg"}
                    alt={"Imagen de fondo"}
                    width={180}
                    height={180}
                    className="w-full rounded-md object-cover aspect-square"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70"
                        >
                          <MoreHorizontal className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEditClick(fondo)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(fondo)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">
                    {fondo.titulo == "null" ? "Sin título" : fondo.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fondo.descripcion == "null"
                      ? "Sin descripción"
                      : fondo.descripcion}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {fondo.etiquetas
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
                            key={String(tag)}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        )
                      )}
                    {fondo.etiquetas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{fondo.etiquetas.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {fondo.colores
                      .slice(0, 3)
                      .map(
                        (
                          color:
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
                            key={String(color)}
                            variant="outline"
                            className="text-xs"
                          >
                            {color}
                          </Badge>
                        )
                      )}
                    {fondo.colores.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{fondo.colores.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Diálogos */}
      <DeleteWallpaperDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        wallpaper={selectedWallpaper}
        onDeleted={handleWallpaperDeleted}
      />

      <EditWallpaperDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        wallpaper={selectedWallpaper}
        onUpdated={handleWallpaperUpdated}
      />
    </div>
  );
}
