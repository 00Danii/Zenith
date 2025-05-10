"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  Heart,
  User,
  Settings,
  Calendar,
  Mail,
  Edit,
  Camera,
  Trash2,
  Upload,
} from "lucide-react";
import { ProfileHeader } from "@/components/profile-header";
import { FavoritesGrid } from "@/components/favorites-grid";
import { useAuth } from "@/context/AuthContext";
import { ButtonTheme } from "@/components/theme/themeButton";
import Masonry from "react-masonry-css";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

// Configuración de breakpoints para el masonry
const breakpointColumnsObj = {
  default: 4, // Número de columnas por defecto (pantallas grandes)
  1280: 4, // 4 columnas en pantallas >= 1280px
  1024: 3, // 3 columnas en pantallas >= 1024px
  768: 2, // 2 columnas en pantallas >= 768px
  640: 1, // 1 columna en pantallas pequeñas
};

const profileSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Debe ser un correo electrónico válido"),
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 8, {
        message: "La contraseña debe tener al menos 8 caracteres",
      }),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading, logout, token, updateUser } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploadAvatarOpen, setIsUploadAvatarOpen] = useState(false);
  const [isUploadCoverOpen, setIsUploadCoverOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
    null
  );
  const [bannerCrop, setBannerCrop] = useState({ x: 0, y: 0 });
  const [bannerZoom, setBannerZoom] = useState(1);
  const [bannerCroppedAreaPixels, setBannerCroppedAreaPixels] =
    useState<Area | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // const handleCropImage = async () => {
  //   if (!selectedFile || !croppedAreaPixels) return;

  //   try {
  //     const croppedImage = await getCroppedImg(
  //       URL.createObjectURL(selectedFile),
  //       croppedAreaPixels
  //     );

  //     // Convertir la imagen recortada a un archivo
  //     const croppedFile = new File([croppedImage], selectedFile.name, {
  //       type: selectedFile.type,
  //     });

  //     setSelectedFile(croppedFile);
  //     setPreview(URL.createObjectURL(croppedFile));
  //     toast.success("Imagen recortada correctamente");
  //   } catch (error) {
  //     console.error("Error al recortar la imagen:", error);
  //     toast.error("Error al recortar la imagen");
  //   }
  // };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedBannerFile(e.target.files[0]);
    }
  };

  const handleBannerUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBannerFile) {
      toast.error("Selecciona una imagen primero");
      return;
    }

    let fileToUpload = selectedBannerFile;

    // Si hay un recorte pendiente, realiza el recorte
    if (bannerCroppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(
          URL.createObjectURL(selectedBannerFile),
          bannerCroppedAreaPixels
        );

        // Convertir la imagen recortada a un archivo
        fileToUpload = new File([croppedImage], selectedBannerFile.name, {
          type: selectedBannerFile.type,
        });

        toast.success("Imagen recortada correctamente");
      } catch (error) {
        console.error("Error al recortar la imagen:", error);
        toast.error("Error al recortar la imagen");
        return;
      }
    }

    // Subir la imagen (recortada o no) al servidor
    const formData = new FormData();
    formData.append("imagen", fileToUpload);

    try {
      const response = await fetch(`${API_URL}/api/user/upload/cover-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const result = await response.json();
      toast.success("Imagen de portada actualizada");

      // Actualizar el contexto del usuario
      updateUser();

      // Cerrar el diálogo
      setIsUploadCoverOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Inicializar datos del formulario cuando el usuario está disponible
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar los datos del formulario
      const validatedData = profileSchema.parse(formData);

      // Elimina el campo confirmPassword antes de enviar al backend
      const { confirmPassword, password, ...rest } = validatedData;

      const dataToSend = {
        ...rest,
        ...(password && password.length > 0 ? { password } : {}),
      };

      const response = await fetch(`${API_URL}/api/user/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }

      // Actualizar la clave de favoritos en localStorage
      if (user?.email !== validatedData.email) {
        const oldKey = `likedWallpapers-${user?.email}`;
        const newKey = `likedWallpapers-${validatedData.email}`;
        const favorites = localStorage.getItem(oldKey);

        if (favorites) {
          localStorage.setItem(newKey, favorites);
          localStorage.removeItem(oldKey);
        }
      }

      toast.success("Perfil actualizado correctamente");
      setIsEditProfileOpen(false);

      // Actualizar el contexto con los nuevos datos del usuario
      updateUser();
      return await response.json();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error(error);
        toast.error("Error al actualizar el perfil");
      }
    }
  };

  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Entra en la funcion handle avatar upload");
    if (!selectedFile) {
      toast.error("Selecciona una imagen primero");
      return;
    }

    let fileToUpload = selectedFile;

    // Si hay un recorte pendiente, realiza el recorte
    if (croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(
          URL.createObjectURL(selectedFile),
          croppedAreaPixels
        );

        // Convertir la imagen recortada a un archivo
        fileToUpload = new File([croppedImage], selectedFile.name, {
          type: selectedFile.type,
        });

        toast.success("Imagen recortada correctamente");
      } catch (error) {
        console.error("Error al recortar la imagen:", error);
        toast.error("Error al recortar la imagen");
        return;
      }
    }

    // Subir la imagen (recortada o no) al servidor
    const formData = new FormData();
    formData.append("imagen", fileToUpload);

    try {
      const response = await fetch(`${API_URL}/api/user/upload/profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Asegúrate de tener el token
        },
        body: formData,
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const result = await response.json();
      console.log(result);
      toast.success("Imagen de perfil actualizada");
      updateUser();
      setIsUploadAvatarOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  //mostrar skeleton mientras carga
  if (loading) {
    return (
      <div className="min-h-screen mt-20 m-4 lg:mx-20">
        <div className="container mx-auto">
          {/* Skeleton para ProfileHeader */}
          <div className="relative">
            {/* Banner skeleton */}
            <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden relative bg-gray-200 dark:bg-neutral-800 animate-pulse"></div>

            {/* Avatar y datos de usuario skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 px-4 relative z-10">
              {/* Avatar skeleton */}
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-800 overflow-hidden bg-gray-300 dark:bg-neutral-700 animate-pulse"></div>

              {/* Información del usuario skeleton */}
              <div className="flex-1 pb-4 pt-2">
                <div className="h-8 w-48 bg-gray-300 dark:bg-neutral-700 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-600 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Skeleton para Tabs */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="grid w-full max-w-md grid-cols-3 gap-2 h-10 bg-gray-200 dark:bg-neutral-800 rounded-lg p-1 animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded-md"></div>
                <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded-md"></div>
                <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded-md"></div>
              </div>
            </div>

            {/* Skeleton para contenido de favoritos */}
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
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <></>; // ya sabemos que no está autenticado

  return (
    <div className="min-h-screen mt-20 m-4 lg:mx-20">
      <div className="container mx-auto  ">
        {/* Profile Header */}
        <div className="relative">
          {/* Banner */}
          <div
            className="h-48 sm:h-64 w-full rounded-xl overflow-hidden relative bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20"
            style={{
              backgroundImage: user.coverImageUrl
                ? `url(${user.coverImageUrl})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

            {/* Botón para cambiar banner */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
              onClick={() => setIsUploadCoverOpen(true)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* Avatar y datos de usuario */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 px-4 relative z-10">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-32 h-32  border-4 border-background">
                <AvatarImage
                  src={user.profileImageUrl}
                  alt={user.nombre || "Usuario"}
                  className="aspect-square"
                />
                <AvatarFallback className="text-4xl bg-primary/20">
                  {user.nombre?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md"
                onClick={() => setIsUploadAvatarOpen(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Información del usuario */}
            <div className="flex-1 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {user.nombre || "Usuario"}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto h-8 gap-1 px-3 sm:self-start"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="text-xs">Editar perfil</span>
                </Button>
              </div>
              <p className="text-muted-foreground">
                {user.email || "email@ejemplo.com"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="favoritos" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger
                  value="favoritos"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Favoritos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ajustes"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajustes</span>
                </TabsTrigger>
                <TabsTrigger value="cuenta" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Cuenta</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="favoritos" className="mt-6">
              <FavoritesGrid />
            </TabsContent>

            <TabsContent value="ajustes">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">
                      Ajustes de la aplicación
                    </h3>
                    <p className="text-muted-foreground">
                      Esta sección está en desarrollo. Próximamente podrás
                      personalizar tu experiencia.
                    </p>

                    <div className="grid gap-4 mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificaciones</h4>
                          <p className="text-sm text-muted-foreground">
                            Recibir alertas sobre nuevos fondos
                          </p>
                        </div>
                        <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-not-allowed opacity-50">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Tema oscuro</h4>
                          <p className="text-sm text-muted-foreground">
                            Cambiar entre tema claro y oscuro
                          </p>
                        </div>
                        {/* <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-not-allowed opacity-50">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                        </div> */}
                        <ButtonTheme />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cuenta">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-medium">
                        Información de la cuenta
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setIsEditProfileOpen(true)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </Button>
                    </div>

                    <div className="grid gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Nombre
                          </p>
                          <p className="font-medium">
                            {user.nombre || "Nombre no disponible"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Correo electrónico
                          </p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Miembro desde
                          </p>
                          <p className="font-medium">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog para subir avatar */}
      <Dialog open={isUploadAvatarOpen} onOpenChange={setIsUploadAvatarOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar foto de perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAvatarUpload} className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4  ">
              {selectedFile ? (
                <div className="relative w-full h-64">
                  <Cropper
                    image={URL.createObjectURL(selectedFile)}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Relación de aspecto 1:1
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                </div>
              ) : (
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src={user.profileImageUrl || "/placeholder.svg"}
                    alt={user.nombre || "Usuario"}
                  />
                  <AvatarFallback className="text-4xl bg-primary/20">
                    {user.nombre?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Input para seleccionar archivo */}
              <div className="grid w-full gap-2">
                <Label htmlFor="avatar">Seleccionar imagen</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setIsUploadAvatarOpen(false);
                }}
              >
                Cancelar
              </Button>

              <Button type="submit">
                <Upload className="h-4 w-4 mr-2" />
                Subir
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar perfil */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Tu nombre"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Sección para cambiar contraseña */}
            <Separator />
            <DialogHeader>
              <DialogTitle>Cambiar contraseña</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Nueva contraseña"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirmar nueva contraseña"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para subir portada */}
      <Dialog open={isUploadCoverOpen} onOpenChange={setIsUploadCoverOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar imagen de portada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBannerUpload} className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4">
              {selectedBannerFile ? (
                <div className="relative w-full h-64">
                  <Cropper
                    image={URL.createObjectURL(selectedBannerFile)}
                    crop={bannerCrop}
                    zoom={bannerZoom}
                    aspect={3} // Relación de aspecto 3:1 para el banner
                    onCropChange={setBannerCrop}
                    onZoomChange={setBannerZoom}
                    onCropComplete={(croppedArea, croppedAreaPixels) =>
                      setBannerCroppedAreaPixels(croppedAreaPixels)
                    }
                  />
                </div>
              ) : (
                <div
                  className="w-full h-32 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 flex items-center justify-center"
                  style={{
                    backgroundImage: user.coverImageUrl
                      ? `url(${user.coverImageUrl})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              )}
              <div className="grid w-full gap-2">
                <Label htmlFor="banner">Seleccionar imagen</Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedBannerFile(null);
                  setIsUploadCoverOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                <Upload className="h-4 w-4 mr-2" />
                Subir
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
