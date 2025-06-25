"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2, GripVertical, ExternalLink, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { MagicCard, Shimmer } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDate } from "~/lib/utils";

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imagePublicId: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

interface BannerListProps {
  banners: Banner[];
  isLoading: boolean;
  onStatusToggle: (bannerId: string, isActive: boolean) => void;
  onDelete: (bannerId: string) => void;
  onReorder: (bannerIds: string[]) => void;
}

export function BannerList({ banners, isLoading, onStatusToggle, onDelete, onReorder }: BannerListProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, bannerId: string) => {
    setDraggedItem(bannerId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, bannerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(bannerId);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetBannerId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetBannerId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Reorder banners
    const reorderedBanners = [...banners];
    const draggedIndex = reorderedBanners.findIndex(b => b.id === draggedItem);
    const targetIndex = reorderedBanners.findIndex(b => b.id === targetBannerId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedBanner] = reorderedBanners.splice(draggedIndex, 1);
      reorderedBanners.splice(targetIndex, 0, draggedBanner);

      // Call reorder function with new order
      const newOrder = reorderedBanners.map(b => b.id);
      onReorder(newOrder);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Daftar Banner</h2>
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-32 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <MagicCard className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Belum Ada Banner</h3>
              <p className="text-muted-foreground">
                Mulai dengan menambahkan banner pertama untuk halaman utama
              </p>
            </div>
          </div>
        </CardContent>
      </MagicCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Daftar Banner</h2>
        <p className="text-sm text-muted-foreground">
          Seret untuk mengubah urutan tampilan
        </p>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <MagicCard
            key={banner.id}
            className={`transition-all duration-200 ${
              draggedItem === banner.id ? "opacity-50 scale-95" : ""
            } ${
              dragOverItem === banner.id ? "border-blue-500 shadow-lg" : ""
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, banner.id)}
            onDragOver={(e) => handleDragOver(e, banner.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, banner.id)}
            onDragEnd={handleDragEnd}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Drag Handle */}
                <div className="flex items-center">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                </div>

                {/* Banner Image */}
                <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Banner Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{banner.title}</h3>
                      {banner.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {banner.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={banner.isActive ? "default" : "secondary"}>
                      {banner.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Urutan: {banner.displayOrder}</span>
                    {banner.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Mulai: {formatDate(banner.startDate)}
                      </span>
                    )}
                    {banner.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Berakhir: {formatDate(banner.endDate)}
                      </span>
                    )}
                    {banner.linkUrl && (
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.isActive}
                      onCheckedChange={(checked) => onStatusToggle(banner.id, checked)}
                    />
                    {banner.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(banner.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </MagicCard>
        ))}
      </div>
    </div>
  );
}
