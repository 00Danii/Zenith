"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Filter, Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Datos de ejemplo - en producción vendrían de la API
const colors = [
  { id: "1", name: "rojo" },
  { id: "2", name: "azul" },
  { id: "3", name: "verde" },
  { id: "4", name: "amarillo" },
  { id: "5", name: "negro" },
  { id: "6", name: "blanco" },
];

const tags = [
  { id: "1", name: "naturaleza" },
  { id: "2", name: "ciudad" },
  { id: "3", name: "abstracto" },
  { id: "4", name: "minimalista" },
  { id: "5", name: "espacio" },
  { id: "6", name: "tecnología" },
];

export function FilterBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");

  const handleColorToggle = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((id) => id !== colorId)
        : [...prev, colorId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedTags([]);
  };

  const getSelectedColorNames = () => {
    return colors
      .filter((color) => selectedColors.includes(color.id))
      .map((color) => color.name);
  };

  const getSelectedTagNames = () => {
    return tags
      .filter((tag) => selectedTags.includes(tag.id))
      .map((tag) => tag.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar fondos..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {(selectedColors.length > 0 || selectedTags.length > 0) && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedColors.length + selectedTags.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Filtra los fondos por colores y etiquetas
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Colores</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`color-${color.id}`}
                          checked={selectedColors.includes(color.id)}
                          onCheckedChange={() => handleColorToggle(color.id)}
                        />
                        <Label
                          htmlFor={`color-${color.id}`}
                          className="capitalize"
                        >
                          {color.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Etiquetas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label htmlFor={`tag-${tag.id}`} className="capitalize">
                          {tag.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button>Aplicar filtros</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
              <SelectItem value="downloads">Más descargas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mostrar filtros activos */}
      {(selectedColors.length > 0 || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {getSelectedColorNames().map((colorName) => (
            <Badge
              key={colorName}
              variant="outline"
              className="flex items-center gap-1 capitalize"
            >
              {colorName}
              <button
                onClick={() =>
                  handleColorToggle(
                    colors.find((c) => c.name === colorName)?.id || ""
                  )
                }
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {getSelectedTagNames().map((tagName) => (
            <Badge
              key={tagName}
              variant="secondary"
              className="flex items-center gap-1 capitalize"
            >
              {tagName}
              <button
                onClick={() =>
                  handleTagToggle(
                    tags.find((t) => t.name === tagName)?.id || ""
                  )
                }
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
