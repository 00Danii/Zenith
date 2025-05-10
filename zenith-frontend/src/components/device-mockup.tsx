"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DeviceMockupProps {
  type: "mobile" | "desktop";
  imageUrl: string;
  title: string;
}

export function DeviceMockup({ type, imageUrl, title }: DeviceMockupProps) {
  // const [rotate, setRotate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovering, setIsHovering] = useState(false);

  // Update time every minute
  useEffect(() => {
    const update = () => setCurrentTime(new Date());

    // Alinear con el siguiente segundo exacto
    const now = new Date();
    const delay = 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      update();
      const interval = setInterval(update, 1000);
      // Limpieza del intervalo
      const cleanup = () => clearInterval(interval);
      // Guardar para limpiar en return
      (cleanup as any).__interval = interval;
      return cleanup;
    }, delay);

    return () => {
      clearTimeout(timeout);
      if ((timeout as any).__interval)
        clearInterval((timeout as any).__interval);
    };
  }, []);

  // Format time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
    hour12: false,
  });

  // Format date as Day, Month DD
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* <div className="flex justify-between w-full mb-4">
        <Badge
          variant="secondary"
          className="bg-black/50 text-white border-none"
        >
          {type === "mobile" ? (
            <>
              <Smartphone className="h-3 w-3 mr-1" /> Móvil
            </>
          ) : (
            <>
              <Monitor className="h-3 w-3 mr-1" /> Escritorio
            </>
          )}
        </Badge>
      </div> */}

      {type === "mobile" ? (
        <div
          className={cn(
            "relative transition-all duration-500 ease-in-out",
            "w-[100%] max-w-[500px]",
            isLoading && "min-h-[500px]"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Smartphone mockup */}
          <div
            className={cn(
              "relative mx-auto border-[14px] border-black rounded-[2.5rem]  shadow-xl transition-all duration-500",
              " aspect-[3/0] h-[600px] lg:h-[800px]"
            )}
          >
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-[28px] bg-black rounded-b-[1rem] flex justify-center overflow-hidden">
              <div className="w-40 h-8 bg-black rounded-b-3xl"></div>
            </div>

            {/* Screen content */}
            <div className="w-full h-full overflow-hidden relative rounded-3xl">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={title}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300 ",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                sizes="(max-width: 768px) 60vw, 30vw"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  {/* <div className="w-8 h-8 border-4  rounded-full animate-spin"></div> */}
                </div>
              )}

              {/* Clock and Date overlay */}
              <div
                className={cn(
                  "absolute top-0 inset-x-0 p-6 pt-30 text-center transition-opacity duration-300 bg-gradient-to-b from-black/50 to-transparent h-full",
                  isHovering ? "opacity-0" : "opacity-100"
                )}
              >
                <div
                  className="text-white text-7xl font-semibold tracking-tight"
                  suppressHydrationWarning
                >
                  {formattedTime}
                </div>
                <div className="text-white/80 text-xl mt-2 capitalize">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1 inset-x-0 h-[4px] w-1/3 mx-auto bg-black rounded-full"></div>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full max-w-[800px] mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Laptop mockup */}
          <div className="relative mx-auto border-black bg-black border-[8px] rounded-t-xl h-[300px] max-w-[650px] md:h-[400px] md:max-w-[900px]">
            <div className="rounded-lg overflow-hidden h-full w-full bg-black">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={title}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300 rounded-xl",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  {/* <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div> */}
                </div>
              )}

              {/* Clock and Date overlay for desktop */}
              <div
                className={cn(
                  "absolute flex p-6 pb-8 transition-opacity duration-300 bg-gradient-to-t h-full from-black/70 to-transparent",
                  isHovering ? "opacity-0" : "opacity-100",
                  "w-full text-left"
                )}
              >
                <div className="flex flex-col justify-end ">
                  <div
                    className="text-white text-6xl font-semibold tracking-tight"
                    suppressHydrationWarning
                  >
                    {formattedTime}
                  </div>
                  <div className="text-white/80 text-2xl mt-1 capitalize">
                    {formattedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mx-auto bg-black rounded-b-xl rounded-t-sm h-[17px] max-w-[550px] md:h-[21px] md:max-w-[800px]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-neutral-800"></div>
          </div>
          <div className="relative mx-auto bg-neutral-800 rounded-t-sm h-[5px] max-w-[450px] md:h-[8px] md:max-w-[700px]"></div>
        </div>
      )}
    </div>
  );
}
