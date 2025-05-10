"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  HomeIcon as House,
  MegaphoneIcon,
  Heart,
  User,
  UserPlus,
  LogOut,
  ChevronRight,
  Image,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ButtonTheme } from "../theme/themeButton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function Header() {
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  // const [activeLink, setActiveLink] = useState("/");
  const pathname = usePathname();

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar la ruta actual
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setActiveLink(window.location.pathname);
  //   }
  // }, []);

  const links = [
    ...(user?.role === "admin"
      ? [{ name: "4dm1n", href: "/4dm1n", icon: MegaphoneIcon }]
      : []),
    { name: "Inicio", href: "/", icon: House },
    { name: "Fondos", href: "/fondos", icon: Image },
    ...(user ? [{ name: "Favoritos", href: "/favoritos", icon: Heart }] : []),
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "h-16 bg-white/80 dark:bg-black/50 backdrop-blur-xs dark:backdrop-blur-sm shadow-md"
          : "h-20 bg-white/35 dark:bg-black/50 backdrop-blur-md"
      )}
    >
      <div className="max-w-[1575px] mx-auto h-full flex items-center justify-between px-4 md:px-6 relative">
        {/* MENU EN MÓVILES */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></span>
              <Menu className="h-6 w-6 transition-transform group-hover:rotate-12" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="overflow-auto border-r-primary/20"
          >
            <SheetHeader>
              <SheetTitle></SheetTitle>
              <Link href="/" className="flex justify-center items-center">
                <div className="relative">
                  <img
                    src="/zenith.svg"
                    className="h-16 mt-2 dark:invert transition-transform hover:scale-110"
                    alt="logotipo "
                    width={65}
                    height={100}
                  />
                </div>
                <span className="p-5 text-3xl font-bold tracking-tighter bg-clip-text ">
                  Zenith
                </span>
              </Link>
            </SheetHeader>

            <div className="mt-8 space-y-1 p-2">
              {links.map((link) => (
                <Link href={link.href} key={link.name}>
                  <div
                    className={cn(
                      "flex w-full items-center py-3 px-4 text-lg font-medium rounded-lg transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "hover:bg-muted"
                    )}
                  >
                    <link.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        pathname === link.href ? "text-primary" : ""
                      )}
                    />
                    {link.name}
                    <ChevronRight className="ml-auto h-5 w-5 opacity-50" />
                  </div>
                </Link>
              ))}

              {!loading && user && (
                <div
                  className="flex w-full items-center py-3 px-4 text-lg font-medium rounded-lg transition-colors text-red-500 hover:bg-red-500/10 cursor-pointer mt-4"
                  onClick={logout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Cerrar sesión
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* LOGO */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <img
                src="./zenith.svg"
                className="h-12 sm:h-14 dark:invert transition-all duration-300 group-hover:scale-110"
                alt="Zenith"
                width={55}
                height={90}
              />
            </div>
            <div className="ml-2 sm:ml-3 relative overflow-hidden">
              <span className="font-bold tracking-tight text-xl sm:text-2xl  bg-clip-text ">
                Zenith
              </span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>
          </Link>
        </div>

        {/* MENU EN PCS */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
          <NavigationMenu>
            <NavigationMenuList className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200 dark:border-neutral-800">
              {links.map((link, index) => (
                <NavigationMenuItem key={link.name}>
                  <Link href={link.href} legacyBehavior passHref>
                    <motion.a
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "relative px-4 py-2 rounded-full transition-colors",
                        pathname === link.href
                          ? "text-primary dark:text-primary"
                          : "text-foreground"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pathname === link.href && (
                        <motion.span
                          className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full z-0"
                          layoutId="activeBackground"
                          initial={false}
                          transition={{ type: "spring", duration: 0.6 }}
                        />
                      )}
                      <span className="flex items-center relative z-10">
                        <link.icon className="w-5 h-5 mr-2" />
                        <span>{link.name}</span>
                      </span>
                    </motion.a>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Link href="/login" legacyBehavior passHref>
                <motion.a
                  className="hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-muted"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="w-4 h-4 mr-2" />
                  <span>Login</span>
                </motion.a>
              </Link>
              <Link href="/registro" legacyBehavior passHref>
                <motion.a
                  className="hidden sm:flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span>Registro</span>
                </motion.a>
              </Link>

              {/* Mobile auth buttons */}
              <Link href="/login" className="sm:hidden">
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/registro" className="sm:hidden">
                <Button variant="ghost" size="icon" className="relative">
                  <UserPlus className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-2">
              <Link href="/perfil" legacyBehavior passHref>
                <motion.a
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-4 border-background">
                      <AvatarImage
                        src={user.profileImageUrl}
                        alt={user.nombre || "Usuario"}
                      />
                      <AvatarFallback className="text-xl bg-primary/20">
                        {user.nombre?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <span className="hidden md:block font-medium">
                    {user.nombre.split(" ")[0]}
                  </span>
                </motion.a>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 hidden sm:flex"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="ml-2">
            <ButtonTheme />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
