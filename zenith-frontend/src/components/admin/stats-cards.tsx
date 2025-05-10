"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, File, Image, Palette } from "lucide-react";

export function StatsCards() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [totalDescargas, setTotalDescargas] = useState<number | null>(null);
  const [totalFondos, setTotalFondos] = useState<number | null>(null);
  const [etiquetasPopulares, setEtiquetasPopulares] = useState<any[]>([]);
  const [coloresPopulares, setColoresPopulares] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [descargasRes, fondosRes, etiquetasRes, coloresRes] =
          await Promise.all([
            fetch(`${API_URL}/api/fondos/total-descargas`),
            fetch(`${API_URL}/api/fondos/total`),
            fetch(`${API_URL}/api/fondos/etiquetas-populares`),
            fetch(`${API_URL}/api/fondos/colores-populares`),
          ]);

        const [descargas, fondos, etiquetas, colores] = await Promise.all([
          descargasRes.json(),
          fondosRes.json(),
          etiquetasRes.json(),
          coloresRes.json(),
        ]);

        setTotalDescargas(descargas);
        setTotalFondos(fondos);
        setEtiquetasPopulares(etiquetas);
        setColoresPopulares(colores);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };

    fetchData();
  }, [API_URL]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Descargas</CardTitle>
          <Download className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalDescargas !== null ? totalDescargas : "Cargando..."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fondos Activos</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalFondos !== null ? totalFondos : "Cargando..."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Etiqueta más Popular
          </CardTitle>
          <File className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {etiquetasPopulares.length > 0
              ? etiquetasPopulares[0].etiqueta
              : "Cargando..."}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Color más Popular
          </CardTitle>
          <Palette className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {coloresPopulares.length > 0
              ? coloresPopulares[0].color
              : "Cargando..."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
