"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, Camera, Edit, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative">
      {/* Banner de fondo */}
      <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden relative bg-gradient-to-r from-rose-100 to-teal-100 dark:from-rose-100/60 dark:to-teal-100/60">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Información del perfil */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 px-4 relative z-10">
        {/* Avatar */}
        <div className="relative group">
          {/* <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
            <Image
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              width={128}
              height={128}
              className="object-cover"
            />
          </div> */}
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Información del usuario */}
        <div className="flex-1 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
            {/* <Button
              variant="ghost"
              size="sm"
              className="w-auto h-8 gap-1 px-2 sm:self-start"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="text-xs">Editar perfil</span>
            </Button> */}
          </div>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
