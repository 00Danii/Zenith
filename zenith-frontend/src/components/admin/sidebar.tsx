"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Image, LayoutDashboard, LogOut } from "lucide-react";
import { ButtonTheme } from "../theme/themeButton";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/4dm1n",
    pattern: /^\/4dm1n$/,
  },
  {
    label: "Fondos de Pantalla",
    icon: Image,
    href: "/4dm1n/fondos",
    pattern: /^\/4dm1n\/fondos(?!\/nuevo)/,
  },
  {
    label: "Agregar Nuevo",
    icon: Image,
    href: "/4dm1n/fondos/nuevo",
    pattern: /^\/4dm1n\/fondos\/nuevo/,
  },
  // {
  //   label: "Estadísticas",
  //   icon: BarChart3,
  //   href: "/4dm1n/estadisticas",
  //   pattern: /^\/4dm1n\/estadisticas/,
  // },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed   flex h-screen flex-col  bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/4dm1n" className="flex items-center gap-2 font-semibold">
          <span>Zenith 4dm1n</span>
          <div className="ml-12">
            <ButtonTheme />
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant={route.pattern.test(pathname) ? "secondary" : "ghost"}
              className="justify-start"
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/">
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Link>
        </Button>
      </div>
    </div>
  );
}
