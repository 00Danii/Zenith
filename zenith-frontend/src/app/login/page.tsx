"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { is } from "date-fns/locale";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, user, loading } = useAuth();

  //Validar si el usuario ya está logueado
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, router, loading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      await login(values.email, values.password);

      toast.success("Inicio de sesión exitoso", {
        description: "Has iniciado sesión correctamente.",
      });

      router.push("/");
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast.error("Ocurrió un error al iniciar sesión", {
        description:
          error instanceof Error
            ? error.message
            : "Credenciales incorrectas o error de conexión.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen grid lg:grid-cols-2 animate-pulse">
        {/* Skeleton de la imagen */}
        <div className="hidden lg:block bg-black"></div>

        {/* Skeleton del contenido del login */}
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-6">
            <Skeleton className="h-6 w-1/3 mx-auto" />
            <Skeleton className="h-5 w-2/3 mx-auto" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );

  if (user) return <></>; // ya sabemos que no está autenticado
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Fondo visual y texto de bienvenida */}
      <div className="relative hidden lg:flex items-center justify-center bg-black">
        {/* Imagen de fondo */}
        <Image
          src="/ilustracion2.jpg"
          alt="Fondo visual"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="absolute inset-0 z-0 opacity-50"
        />

        {/* Contenido encima */}
        <div className="relative z-10 text-center p-10 text-white max-w-md ">
          <h2 className="text-3xl font-bold mb-4 tracking-wide">ZENITH</h2>
          <p className="text-lg leading-relaxed">
            Un toque, miles de fondos. Solo falta que entres.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-script mb-6">Zenith</h1>
            <h2 className="text-xl text-gray-500">Bienvenido a Zenith</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                ¿Nuevo en Zenith?{" "}
                <Link
                  href="/registro"
                  className="hover:text-black dark:hover:text-white"
                >
                  Crear cuenta
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
