"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Simulación de API para etiquetas y colores
const fetchTags = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/etiquetas`
    );

    if (!response.ok) {
      throw new Error("Error al obtener etiquetas");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchColors = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/colores`
    );

    if (!response.ok) {
      throw new Error("Error al obtener colores");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const addTag = async (name: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/etiquetas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: name }),
      }
    );

    console.log(response);

    if (!response.ok) {
      throw new Error("Error al agregar etiqueta");
      // toast.error("No se pudo agregar la etiqueta");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateTag = async (_id: string, nombre: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/etiquetas/${_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar la etiqueta");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const addColor = async (name: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/colores`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: name }),
      }
    );

    console.log(response);

    if (!response.ok) {
      throw new Error("Error al agregar el color");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateColor = async (_id: string, nombre: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/colores/${_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar el color");
    }

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

export function WallpaperForm() {
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

  const [file, setFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      titulo: "",
      descripcion: "",
      colores: [],
      etiquetas: [],
      imagen: null, // Asegúrate de inicializarlo correctamente
    },
  });

  const handleReset = () => {
    form.reset({
      titulo: "",
      descripcion: "",
      colores: [],
      etiquetas: [],
      imagen: null, // Reinicia el archivo
    });

    setSelectedColors([]); // Si usas estado para los colores, reinícialo
    setSelectedTags([]); // Si usas estado para las etiquetas, reinícialo
    setPreview(null); // Si usas preview de imagen, reinícialo
  };

  // Cargar etiquetas y colores al iniciar
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchTags();
        setAllTags(tags);
      } catch (error) {
        // toast({
        //   title: "Error",
        //   description: "No se pudieron cargar las etiquetas",
        //   variant: "destructive",
        // });
        toast.error("Error", {
          description: "No se pudieron cargar las etiquetas",
        });
      } finally {
        setLoadingTags(false);
      }
    };

    const loadColors = async () => {
      try {
        const colors = await fetchColors();
        setAllColors(colors);
      } catch (error) {
        // toast({
        //   title: "Error",
        //   description: "No se pudieron cargar los colores",
        //   variant: "destructive",
        // });
        toast.error("No se pudieron cargar los colores");
      } finally {
        setLoadingColors(false);
      }
    };

    loadTags();
    loadColors();
  }, []);

  async function onSubmit(values: any) {
    // Validar que se haya seleccionado al menos una etiqueta y un color
    if (selectedTags.length === 0) {
      // alert("Por favor selecciona al menos una etiqueta.");
      toast.error("Error", {
        description: "Por favor selecciona al menos una etiqueta.",
      });
      return;
    }
    if (selectedColors.length === 0) {
      // alert("Por favor selecciona al menos un color.");
      toast.error("Error", {
        description: "Por favor selecciona al menos un color.",
      });
      return;
    }
    const imagen = await handleUpload();
    // console.log(imagen);
    const imagenId = imagen._id;

    const etiquetasSeleccionadasId = selectedTags.map((tag) => tag._id);
    const coloresSeleccioandosId = selectedColors.map((color) => color._id);

    const titulo = values.titulo.trim() || "null";
    const descripcion = values.descripcion.trim() || "null";

    const formData = {
      titulo,
      descripcion,
      etiquetas: etiquetasSeleccionadasId,
      colores: coloresSeleccioandosId,
      imagen: imagenId,
    };

    console.log(formData);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fondos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Error al enviar los datos");

      const data = await response.json();
      // console.log("Respuesta del servidor:", data);

      // alert("Datos enviados correctamente!");
      toast.success("Fondo agregado correctamente", {
        description: (
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });

      // handleReset(); // Reiniciar el formulario después de enviar
    } catch (error) {
      // console.error("Error:", error);
      // alert("Error al enviar los datos.");
      toast.error("Error", {
        description: "Error al enviar los datos.",
      });
    }

    // toast({
    //   title: "Fondo agregado correctamente",
    //   description: (
    //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
    //       <code className="text-white">
    //         {JSON.stringify(formData, null, 2)}
    //       </code>
    //     </pre>
    //   ),
    // });
    // toast.success("Fondo agregado correctamente", {
    //   description: (
    //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
    //       <code className="text-white">
    //         {JSON.stringify(formData, null, 2)}
    //       </code>
    //     </pre>
    //   ),
    // });
  }

  // Manejar selección de archivo y vista previa
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

  // Subir la imagen al backend
  const handleUpload = async () => {
    if (!file) {
      // alert("Por favor selecciona una imagen.");
      toast.error("Error", {
        description: "Por favor selecciona una imagen.",
      });
      return;
    }

    setIsLoadingFile(true);

    const formData = new FormData();
    formData.append("imagen", file); // 'imagen' debe coincidir con el backend

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/imagenes/`,
        {
          method: "POST",
          body: formData,
        }
      );

      // if (!response.ok) throw new Error("Error al subir la imagen");
      if (!response.ok)
        toast.error("Error", {
          description: "Error al subir la imagen",
        });

      const data = await response.json();
      // console.log(data);
      setUploadedImage(data.url); // Guardamos la URL de la imagen subida
      return data;
    } catch (error) {
      // console.error("Error:", error);
      toast.error("Error", {
        description: "Error al subir la imagen",
      });
    } finally {
      setIsLoadingFile(false);
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
      // toast({
      //   title: "Etiqueta agregada",
      //   description: `La etiqueta "${newTag.name}" ha sido agregada correctamente.`,
      // });
      toast.success(`La etiqueta ha sido agregada correctamente.`);
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo agregar la etiqueta",
      //   variant: "destructive",
      // });
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
      // toast({
      //   title: "Color agregado",
      //   description: `El color "${newColor.nombre}" ha sido agregado correctamente.`,
      // });
      toast.success(`El color ha sido agregado correctamente.`);
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo agregar el color",
      //   variant: "destructive",
      // });
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

      // toast({
      //   title: "Etiqueta actualizada",
      //   description: `La etiqueta ha sido actualizada correctamente.`,
      // });
      toast.success("La etiqueta ha sido actualizada correctamente.");
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo actualizar la etiqueta",
      //   variant: "destructive",
      // });
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

      // toast({
      //   title: "Color actualizado",
      //   description: `El color ha sido actualizado correctamente.`,
      // });
      toast.success("El color ha sido actualizado correctamente.");
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo actualizar el color",
      //   variant: "destructive",
      // });
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
      // toast({
      //   title: "Etiqueta agregada",
      //   description: `La etiqueta "${newTag.name}" ha sido agregada correctamente.`,
      // });
      toast.success(
        `La etiqueta "${newTag.nombre}" ha sido agregada correctamente.`
      );
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo agregar la etiqueta",
      //   variant: "destructive",
      // });
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
      // toast({
      //   title: "Color agregado",
      //   description: `El color "${newColor.nombre}" ha sido agregado correctamente.`,
      // });
      toast.success(
        `El color "${newColor.nombre}" ha sido agregado correctamente.`
      );
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "No se pudo agregar el color",
      //   variant: "destructive",
      // });
      toast.error("No se pudo agregar el color");
    } finally {
      setAddingColor(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <FormLabel>Imagen</FormLabel>
              <div className="mt-2 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/50 p-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  {preview ? (
                    <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-90 lg:h-115 overflow-hidden rounded-lg">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt="Vista previa"
                        fill
                        className="object-cover "
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="wallpaper-upload"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("wallpaper-upload")?.click()
                  }
                >
                  Seleccionar archivo
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-6">
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
                          onChange={(e) => setEditingTagValue(e.target.value)}
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
                          onChange={(e) => setEditingColorValue(e.target.value)}
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
                                !selectedColors.some((c) => c._id === color._id)
                            )
                            .map((color) => (
                              <CommandItem
                                key={color._id}
                                className="flex justify-between"
                                onSelect={() => handleSelectColor(color)}
                              >
                                <span>{color.nombre}</span>
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Cancelar
          </Button>
          <Button type="submit">Guardar fondo</Button>
        </div>
      </form>

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
                onChange={(e) => setNewColorName(e.target.value.toLowerCase())}
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
    </Form>
  );
}
