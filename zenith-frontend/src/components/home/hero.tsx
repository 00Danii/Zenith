"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { DeviceMockup } from "../device-mockup";
import Link from "next/link";

function Hero() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [fondos, setFondos] = useState<
    { id: string; image: string; type: "desktop" | "mobile"; titulo?: string }[]
  >([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [fondo, setFondo] = useState<
    | { id: string; image: string; type: "desktop" | "mobile"; titulo?: string }
    | undefined
  >(undefined);

  // Cargar los fondos aleatorios
  useEffect(() => {
    const fetchFondos = async () => {
      try {
        const responseTotal = await fetch(`${API_URL}/api/fondos/total`);
        if (!responseTotal.ok) {
          throw new Error("Error al cargar el total de fondos");
        }
        const totalData = await responseTotal.json();

        const fondosAMostrar = 5;
        const maxOffset = Math.max(totalData - fondosAMostrar, 0);
        const randomOffset = Math.floor(Math.random() * (maxOffset + 1));

        const responseFondos = await fetch(
          `${API_URL}/api/fondos?limit=${fondosAMostrar}&offset=${randomOffset}`
        );
        const fondosBase = await responseFondos.json();

        const fondosConImagen = await Promise.all(
          fondosBase.map(async (fondo: any) => {
            let imageUrl = "/placeholder.svg";
            let type: "desktop" | "mobile" = "mobile";

            if (fondo.imagen) {
              const responseImagen = await fetch(
                `${API_URL}/api/imagenes/${fondo.imagen}`
              );
              if (responseImagen.ok) {
                const data = await responseImagen.json();
                imageUrl = data?.url || imageUrl;
                const isPortrait = (data?.height || 0) > (data?.width || 0);
                type = isPortrait ? "mobile" : "desktop";
              }
            }

            return {
              ...fondo,
              image: imageUrl,
              type,
            };
          })
        );

        setFondos(fondosConImagen);
        setFondo(fondosConImagen[0]);
      } catch (error) {
        console.error("Error al cargar los fondos destacados:", error);
      }
    };

    fetchFondos();
  }, [API_URL]);

  // Cambiar el fondo destacado cada 5 segundos
  useEffect(() => {
    if (fondos.length > 0) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => {
          const nextIndex = (prev + 1) % fondos.length;
          setFondo(fondos[nextIndex]);
          return nextIndex;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [fondos]);

  return (
    <div className="mx-auto lg:mx-0 relative hidden lg:block">
      {fondo && (
        <motion.div
          key={featuredIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Link href={`/fondos/${fondo.id}`} className="block">
            <DeviceMockup
              type={fondo.type}
              imageUrl={fondo.image}
              title={fondo.titulo || ""}
            />
          </Link>
        </motion.div>
      )}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {fondos.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === featuredIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            onClick={() => {
              setFeaturedIndex(i);
              setFondo(fondos[i]);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;
