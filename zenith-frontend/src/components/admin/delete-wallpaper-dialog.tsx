"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DeleteWallpaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallpaper: {
    id: string;
    titulo?: string;
  } | null;
  onDeleted: () => void;
}

export function DeleteWallpaperDialog({
  open,
  onOpenChange,
  wallpaper,
  onDeleted,
}: DeleteWallpaperDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!wallpaper) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_URL}/api/fondos/${wallpaper.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el fondo");
      }

      toast.success("El fondo ha sido eliminado correctamente.");

      onDeleted();
      onOpenChange(false);
    } catch (error) {
      toast.error("No se pudo eliminar el fondo. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-center">
            Confirmar eliminación
          </DialogTitle>
          <DialogDescription className="pt-5">
            ¿Estás seguro de que deseas eliminar el fondo?
            <br />
            <span className="text-destructive">
              Esta acción no se puede deshacer.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
