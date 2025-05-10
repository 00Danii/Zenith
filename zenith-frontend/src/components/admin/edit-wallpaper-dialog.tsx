"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Upload, Plus, X, Edit, Check, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Funciones para interactuar con la API
const fetchTags = async () => {
  try {
    const response = await fetch(`${API_URL}/api/etiquetas`);
    if (!response.ok) throw new Error("Error al obtener etiquetas");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchColors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/colores`);
    if (!response.ok) throw new Error("Error al obtener colores");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const addTag = async (name: string) => {
  try {
    const response = await fetch(`${API_URL}/api/etiquetas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre: name }),
    });

    if (!response.ok) throw new Error("Error al agregar etiqueta");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateTag = async (_id: string, nombre: string) => {
  try {
    const response = await fetch(`${API_URL}/api/etiquetas/${_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
    });

    if (!response.ok) throw new Error("Error al actualizar la etiqueta");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const addColor = async (name: string) => {
  try {
    const response = await fetch(`${API_URL}/api/colores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre: name }),
    });

    if (!response.ok) throw new Error("Error al agregar el color");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateColor = async (_id: string, nombre: string) => {
  try {
    const response = await fetch(`${API_URL}/api/colores/${_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
    });

    if (!response.ok) throw new Error("Error al actualizar el color");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

type Tag = {
  _id: string;
  nombre: string;
};

type Color = {
  _id: string;
  nombre: string;
};

interface EditWallpaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallpaper: any | null;
  onUpdated: () => void;
}

export function EditWallpaperDialog({
  open,
  onOpenChange,
  wallpaper,
  onUpdated,
}: EditWallpaperDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingColors, setLoadingColors] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [editingColorValue, setEditingColorValue] = useState("");
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [showAddColorDialog, setShowAddColorDialog] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [addingColor, setAddingColor] = useState(false);
  const [updatingTag, setUpdatingTag] = useState(false);
  const [updatingColor, setUpdatingColor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageId, setOriginalImageId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      titulo: "",
      descripcion: "",
    },
  });

  // Cargar datos del fondo cuando se abre el diálogo
  useEffect(() => {
    // console.log(wallpaper);
    if (open && wallpaper) {
      setIsLoading(true);

      // Cargar datos del formulario
      form.reset({
        titulo: wallpaper.titulo == "null" ? "" : wallpaper.titulo,
        descripcion:
          wallpaper.descripcion == "null" ? "" : wallpaper.descripcion,
      });

      // Cargar imagen
      setPreview(wallpaper.imagen || null);
      setOriginalImageId(wallpaper.imagenID || null);

      // Cargar etiquetas y colores
      const fetchData = async () => {
        try {
          // Obtener todas las etiquetas y colores
          const [etiquetasData, coloresData] = await Promise.all([
            fetchTags(),
            fetchColors(),
          ]);

          setAllTags(etiquetasData);
          setAllColors(coloresData);

          // Configurar etiquetas seleccionadas
          const selectedEtiquetas = etiquetasData.filter((etiqueta: Tag) =>
            wallpaper.etiquetas.includes(etiqueta.nombre)
          );
          setSelectedTags(selectedEtiquetas);

          // Configurar colores seleccionados
          const selectedColores = coloresData.filter((color: Color) =>
            wallpaper.colores.includes(color.nombre)
          );
          setSelectedColors(selectedColores);
        } catch (error) {
          console.error(error);

          toast.error("No se pudieron cargar los datos del fondo");
        } finally {
          setLoadingTags(false);
          setLoadingColors(false);
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [open, wallpaper, form]);

  const handleUpload = async () => {
    if (!file) {
      // Si no hay un nuevo archivo, devolver el ID de la imagen original
      return { _id: originalImageId };
    }

    setIsLoadingFile(true);

    const formData = new FormData();
    formData.append("imagen", file); // 'imagen' debe coincidir con el backend

    try {
      const response = await fetch(`${API_URL}/api/imagenes/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error("Error al subir la imagen");
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      setUploadedImage(data.url);
      return data;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al subir la imagen");
      return null;
    } finally {
      setIsLoadingFile(false);
    }
  };

  const onSubmit = async (values: any) => {
    if (!wallpaper) return;

    // Validar que se haya seleccionado al menos una etiqueta y un color
    if (selectedTags.length === 0) {
      toast.error("Por favor selecciona al menos una etiqueta.");
      return;
    }

    if (selectedColors.length === 0) {
      toast.error("Por favor selecciona al menos un color.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Subir imagen si hay una nueva
      const imagen = await handleUpload();
      if (!imagen) {
        setIsSubmitting(false);
        return;
      }

      const imagenId = imagen._id;

      // console.log(imagenId, "ID de la imagen subida");
      // console.log(originalImageId, "ID de la imagen original");

      // Preparar datos para enviar
      const etiquetasSeleccionadasId = selectedTags.map((tag) => tag._id);
      const coloresSeleccionadosId = selectedColors.map((color) => color._id);

      const titulo = values.titulo.trim() || "null";
      const descripcion = values.descripcion.trim() || "null";

      const formData = {
        titulo,
        descripcion,
        etiquetas: etiquetasSeleccionadasId,
        colores: coloresSeleccionadosId,
        imagen: imagenId,
      };

      const response = await fetch(`${API_URL}/api/fondos/${wallpaper.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error("Error", {
          description: `${errorText}`,
        });
        // throw new Error("Error al actualizar el fondo");
      }

      const data = await response.json();

      toast.success("Fondo actualizado correctamente.");

      onUpdated();
      onOpenChange(false);
    } catch (error) {
      // console.error(error);
      // toast.error("Error", {
      //   description: "No se pudo actualizar el fondo. Inténtalo de nuevo.",
      // });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagsOpen(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag._id !== tagId));
  };

  const handleSelectColor = (color: Color) => {
    if (!selectedColors.some((c) => c._id === color._id)) {
      setSelectedColors([...selectedColors, color]);
    }
    setColorsOpen(false);
  };

  const handleRemoveColor = (colorId: string) => {
    setSelectedColors(selectedColors.filter((color) => color._id !== colorId));
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setAddingTag(true);
      const newTag = await addTag(newTagName);
      setAllTags([...allTags, newTag]);
      setSelectedTags([...selectedTags, newTag]);
      setNewTagName("");
      setTagsOpen(false);
      toast.success("Etiqueta agregada correctamente.");
    } catch (error) {
      toast.error("No se pudo agregar la etiqueta");
    } finally {
      setAddingTag(false);
    }
  };

  const handleAddNewColor = async () => {
    if (!newColorName.trim()) return;

    try {
      setAddingColor(true);
      const newColor = await addColor(newColorName);
      setAllColors([...allColors, newColor]);
      setSelectedColors([...selectedColors, newColor]);
      setNewColorName("");
      setColorsOpen(false);
      toast.success("El color ha sido agregado correctamente.");
    } catch (error) {
      toast.error("No se pudo agregar el color");
    } finally {
      setAddingColor(false);
    }
  };

  const startEditingTag = (tag: Tag) => {
    setEditingTagId(tag._id);
    setEditingTagValue(tag.nombre);
  };

  const saveEditingTag = async () => {
    if (!editingTagId || !editingTagValue.trim()) return;

    try {
      setUpdatingTag(true);
      const updatedTag = await updateTag(editingTagId, editingTagValue);

      // Actualizar en la lista global
      setAllTags(
        allTags.map((tag) => (tag._id === editingTagId ? updatedTag : tag))
      );

      // Actualizar en seleccionados si está presente
      setSelectedTags(
        selectedTags.map((tag) => (tag._id === editingTagId ? updatedTag : tag))
      );

      toast.success("Etiqueta actualizada correctamente.");
    } catch (error) {
      toast.error("No se pudo actualizar la etiqueta");
    } finally {
      setEditingTagId(null);
      setUpdatingTag(false);
    }
  };

  const startEditingColor = (color: Color) => {
    setEditingColorId(color._id);
    setEditingColorValue(color.nombre);
  };

  const saveEditingColor = async () => {
    if (!editingColorId || !editingColorValue.trim()) return;

    try {
      setUpdatingColor(true);
      const updatedColor = await updateColor(editingColorId, editingColorValue);

      // Actualizar en la lista global
      setAllColors(
        allColors.map((color) =>
          color._id === editingColorId ? updatedColor : color
        )
      );

      // Actualizar en seleccionados si está presente
      setSelectedColors(
        selectedColors.map((color) =>
          color._id === editingColorId ? updatedColor : color
        )
      );

      toast.success("Color actualizado correctamente.");
    } catch (error) {
      toast.error("No se pudo actualizar el color");
    } finally {
      setEditingColorId(null);
      setUpdatingColor(false);
    }
  };

  const handleAddGlobalTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setAddingTag(true);
      const newTag = await addTag(newTagName);
      setAllTags([...allTags, newTag]);
      setNewTagName("");
      setShowAddTagDialog(false);

      toast.success("Etiqueta agregada correctamente.");
    } catch (error) {
      toast.error("No se pudo agregar la etiqueta");
    } finally {
      setAddingTag(false);
    }
  };

  const handleAddGlobalColor = async () => {
    if (!newColorName.trim()) return;

    try {
      setAddingColor(true);
      const newColor = await addColor(newColorName);
      setAllColors([...allColors, newColor]);
      setNewColorName("");
      setShowAddColorDialog(false);

      toast.success(
        `El color ${newColor.nombre} ha sido agregado correctamente.`
      );
    } catch (error) {
      toast.error("No se pudo agregar el color");
    } finally {
      setAddingColor(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] ">
        <DialogHeader>
          <DialogTitle>Editar fondo</DialogTitle>
          <DialogDescription>
            Actualiza la información del fondo de pantalla.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <FormLabel>Imagen</FormLabel>
                <div className="mt-2 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/50 p-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    {preview ? (
                      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        Arrastra y suelta o haz clic para cambiar la imagen
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sube una imagen.
                      </p>
                    </div>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="wallpaper-edit-upload"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("wallpaper-edit-upload")?.click()
                    }
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingresa un título para el fondo"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el fondo de pantalla"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Etiquetas</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddTagDialog(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Añadir nueva
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag._id}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {editingTagId === tag._id ? (
                          <div className="flex items-center">
                            <Input
                              value={editingTagValue}
                              onChange={(e) =>
                                setEditingTagValue(e.target.value)
                              }
                              className="h-5 w-24 mr-1"
                            />
                            <button
                              type="button"
                              onClick={saveEditingTag}
                              className="text-green-500 hover:text-green-700"
                              disabled={updatingTag}
                            >
                              {updatingTag ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <>
                            {tag.nombre}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag._id)}
                              className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={tagsOpen}
                        className="w-full justify-between"
                        type="button"
                      >
                        Seleccionar o editar etiquetas
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar etiqueta..."
                          value={newTagName}
                          onValueChange={setNewTagName}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {loadingTags ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cargando...
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                className="flex items-center w-full justify-start px-2 py-1"
                                onClick={handleAddNewTag}
                                disabled={addingTag}
                              >
                                {addingTag ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="mr-2 h-4 w-4" />
                                )}
                                Agregar "{newTagName}"
                              </Button>
                            )}
                          </CommandEmpty>

                          {selectedTags.length > 0 && (
                            <>
                              <CommandGroup heading="Etiquetas seleccionadas">
                                {selectedTags.map((tag) => (
                                  <CommandItem
                                    key={`selected-${tag._id}`}
                                    className="flex justify-between"
                                  >
                                    <span>{tag.nombre}</span>
                                    <div className="flex items-center">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditingTag(tag);
                                          setTagsOpen(false);
                                        }}
                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveTag(tag._id);
                                        }}
                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandSeparator />
                            </>
                          )}

                          <CommandGroup heading="Etiquetas disponibles">
                            {loadingTags ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cargando etiquetas...
                              </div>
                            ) : (
                              allTags
                                .filter(
                                  (tag) =>
                                    !selectedTags.some((t) => t._id === tag._id)
                                )
                                .map((tag) => (
                                  <CommandItem
                                    key={tag._id}
                                    className="flex justify-between"
                                    onSelect={() => handleSelectTag(tag)}
                                  >
                                    <span>{tag.nombre}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditingTag(tag);
                                        setTagsOpen(false);
                                      }}
                                      className="ml-2 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  </CommandItem>
                                ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Colores</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddColorDialog(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Añadir nuevo
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedColors.map((color) => (
                      <Badge
                        key={color._id}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {editingColorId === color._id ? (
                          <div className="flex items-center">
                            <Input
                              value={editingColorValue}
                              onChange={(e) =>
                                setEditingColorValue(e.target.value)
                              }
                              className="h-5 w-24 mr-1"
                            />
                            <button
                              type="button"
                              onClick={saveEditingColor}
                              className="text-green-500 hover:text-green-700"
                              disabled={updatingColor}
                            >
                              {updatingColor ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <>
                            {color.nombre}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(color._id)}
                              className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                  <Popover open={colorsOpen} onOpenChange={setColorsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={colorsOpen}
                        className="w-full justify-between"
                        type="button"
                      >
                        Seleccionar o editar colores
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar color..."
                          value={newColorName}
                          onValueChange={setNewColorName}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {loadingColors ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cargando...
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                className="flex items-center w-full justify-start px-2 py-1"
                                onClick={handleAddNewColor}
                                disabled={addingColor}
                              >
                                {addingColor ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="mr-2 h-4 w-4" />
                                )}
                                Agregar "{newColorName}"
                              </Button>
                            )}
                          </CommandEmpty>

                          {selectedColors.length > 0 && (
                            <>
                              <CommandGroup heading="Colores seleccionados">
                                {selectedColors.map((color) => (
                                  <CommandItem
                                    key={`selected-${color._id}`}
                                    className="flex justify-between"
                                  >
                                    <span>{color.nombre}</span>
                                    <div className="flex items-center">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditingColor(color);
                                          setColorsOpen(false);
                                        }}
                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveColor(color._id);
                                        }}
                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandSeparator />
                            </>
                          )}

                          <CommandGroup heading="Colores disponibles">
                            {loadingColors ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cargando colores...
                              </div>
                            ) : (
                              allColors
                                .filter(
                                  (color) =>
                                    !selectedColors.some(
                                      (c) => c._id === color._id
                                    )
                                )
                                .map((color) => (
                                  <CommandItem
                                    key={color._id}
                                    className="flex justify-between"
                                    onSelect={() => handleSelectColor(color)}
                                  >
                                    <span>{color.nombre}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditingColor(color);
                                        setColorsOpen(false);
                                      }}
                                      className="ml-2 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  </CommandItem>
                                ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingFile}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Diálogo para añadir nueva etiqueta global */}
        <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir nueva etiqueta</DialogTitle>
              <DialogDescription>
                Agrega una nueva etiqueta a la lista global de etiquetas
                disponibles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Nueva etiqueta"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value.toLowerCase())}
                />
                <Button
                  type="button"
                  onClick={handleAddGlobalTag}
                  disabled={
                    !newTagName.trim() ||
                    addingTag ||
                    allTags.some((tag) => tag.nombre === newTagName.trim())
                  }
                >
                  {addingTag ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Agregar
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddTagDialog(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para añadir nuevo color global */}
        <Dialog open={showAddColorDialog} onOpenChange={setShowAddColorDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir nuevo color</DialogTitle>
              <DialogDescription>
                Agrega un nuevo color a la lista global de colores disponibles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Nuevo color"
                  value={newColorName}
                  onChange={(e) =>
                    setNewColorName(e.target.value.toLowerCase())
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddGlobalColor}
                  disabled={
                    !newColorName.trim() ||
                    addingColor ||
                    allColors.some(
                      (color) => color.nombre === newColorName.trim()
                    )
                  }
                >
                  {addingColor ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Agregar
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddColorDialog(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
