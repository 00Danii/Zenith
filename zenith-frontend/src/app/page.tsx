import FondosFeatured from "@/components/home/fondos-featured";
import Hero from "@/components/home/hero";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

function Home() {
  return (
    <div className="flex flex-col   min-h-screen py-2 w-full ">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background decorations */}
        {/* <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div> */}

        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Descubre fondos increíbles
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Personaliza tus dispositivos con fondos{" "}
                <span className="text-primary">espectaculares</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Encuentra los mejores fondos de pantalla para tu móvil y
                ordenador. Descarga y personaliza tus dispositivos con estilo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/fondos">
                    Explorar todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <Hero />
          </div>
        </div>
      </section>

      {/* Featured Wallpapers */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Fondos destacados
              </h2>
              <p className="text-muted-foreground">
                Descubre nuestra selección de los mejores fondos
              </p>
            </div>
          </div>

          <FondosFeatured />
        </div>
      </section>
    </div>
  );
}

export default Home;
