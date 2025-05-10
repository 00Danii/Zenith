"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PopularFondos } from "@/components/admin/popularFondos";
import { RecentUploads } from "@/components/admin/recent-uploads";
import { StatsCards } from "@/components/admin/stats-cards";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const [downloadsData, setDownloadsData] = useState([]);
  const [recentFondos, setRecentFondos] = useState([]);
  const { user } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch de datos para el dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentResponse = await fetch(`${API_URL}/api/fondos?limit=7`);
        const downloadsResponse = await fetch(
          `${API_URL}/api/fondos/mas-descargados`
        );

        if (!recentResponse.ok || !downloadsResponse.ok)
          throw new Error("Error al cargar datos");

        const recentFondos = await recentResponse.json();
        const downloadsData = await downloadsResponse.json();

        setRecentFondos(recentFondos);
        setDownloadsData(downloadsData);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      }
    };

    fetchData();
  }, [API_URL]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido {user?.nombre}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido {user?.nombre} al panel de administración de Zenith.
        </p>  
      </div>

      <StatsCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Fondos más descargados</CardTitle>
            <CardDescription>Los fondos más populares</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <PopularFondos fondos={downloadsData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Fondos recientes</CardTitle>
            <CardDescription>
              Los últimos fondos agregados a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentUploads fondos={recentFondos} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
