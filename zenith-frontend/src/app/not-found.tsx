"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Create glitch effect at random intervals
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, Math.random() * 3000 + 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background">
      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12 max-w-md mx-auto">
        <motion.div
          className={`${isGlitching ? "glitch" : ""}`}
          animate={
            isGlitching
              ? {
                  x: [0, -5, 5, -2, 0],
                  opacity: [1, 0.8, 0.9, 0.7, 1],
                }
              : {}
          }
          transition={{ duration: 0.2 }}
        >
          <h1
            className="text-9xl font-bold mb-6 relative glitch-text"
            data-text="404"
          >
            <span className="relative inline-block">
              4
              <motion.span
                className="absolute top-0 left-0 text-pink-500"
                animate={{ opacity: [0, 1, 0], x: [0, 2, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  repeatType: "reverse",
                }}
              >
                4
              </motion.span>
            </span>
            <span className="relative inline-block">
              0
              <motion.span
                className="absolute top-0 left-0 text-blue-500"
                animate={{ opacity: [0, 1, 0], x: [0, -2, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2.5,
                  repeatType: "reverse",
                }}
              >
                0
              </motion.span>
            </span>
            <span className="relative inline-block">
              4
              <motion.span
                className="absolute top-0 left-0 text-green-500"
                animate={{ opacity: [0, 1, 0], x: [0, 2, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3.5,
                  repeatType: "reverse",
                }}
              >
                4
              </motion.span>
            </span>
          </h1>

          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold">¡No encontrado!</h2>
            <p className="text-muted-foreground">
              Parece que lo que buscas se ha desvanecido en el universo digital.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            ¿Buscando fondos de pantalla increíbles? Explora nuestra colección
            de tendencias
          </p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/" className="gap-1 flex items-center">
              <Download className="h-3 w-3" />
              <span>Ver fondos populares</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
