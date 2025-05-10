"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HomeIcon as House,
  Heart,
  User,
  Image,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const links = [
    { name: "Inicio", href: "/", icon: House },
    {name: "Fondos", href: "/fondos", icon: Image },
    ...(user ? [{ name: "Favoritos", href: "/favoritos", icon: Heart }] : []),
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-20">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="./zenith.svg"
                className="h-10 dark:invert"
                alt="Zenith"
                width={40}
                height={40}
              />
              <span className="font-bold tracking-tight text-xl ">Zenith</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Descubre y descarga los mejores fondos de pantalla para
              personalizar tus dispositivos.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-medium mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/perfil"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Mi perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* <div className="md:col-span-1">
            <h3 className="text-lg font-medium mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/fondos?categoria=naturaleza"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Naturaleza
                </Link>
              </li>
              <li>
                <Link
                  href="/fondos?categoria=abstracto"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Abstracto
                </Link>
              </li>
              <li>
                <Link
                  href="/fondos?categoria=minimalista"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Minimalista
                </Link>
              </li>
              <li>
                <Link
                  href="/fondos?categoria=tecnologia"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tecnología
                </Link>
              </li>
              <li>
                <Link
                  href="/fondos?categoria=paisajes"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Paisajes
                </Link>
              </li>
            </ul>
          </div> */}

          {/* <div className="md:col-span-1">
            <h3 className="text-lg font-medium mb-4">Suscríbete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Recibe notificaciones sobre nuevos fondos y actualizaciones.
            </p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="tu@email.com" className="h-9" />
              <Button size="sm" className="h-9">
                <Mail className="h-4 w-4 mr-2" />
                <span>Suscribir</span>
              </Button>
            </div>
          </div> */}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Zenith. Todos los derechos reservados.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link
              href="/terminos"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Términos de servicio
            </Link>
            <Link
              href="/privacidad"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de privacidad
            </Link>
            <Link
              href="/contacto"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
