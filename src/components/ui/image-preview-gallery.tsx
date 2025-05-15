"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ImagePreviewGalleryProps {
  poster?: { file: File; previewUrl: string } | null;
  banner?: { file: File; previewUrl: string } | null;
  additionalImages?: { file: File; previewUrl: string }[];
  className?: string;
}

export function ImagePreviewGallery({
  poster,
  banner,
  additionalImages = [],
  className,
}: ImagePreviewGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Combine all images into a single array
  const allImages = [
    ...(poster ? [{ url: poster.previewUrl, label: "Event Poster" }] : []),
    ...(banner ? [{ url: banner.previewUrl, label: "Event Banner" }] : []),
    ...(additionalImages.map((img, idx) => ({ 
      url: img.previewUrl, 
      label: `Additional Image ${idx + 1}` 
    }))),
  ];

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset active index when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [poster, banner, additionalImages.length]);

  if (!isMounted || allImages.length === 0) {
    return null;
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border", className)}>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {/* Main image */}
        <Image
          src={allImages[activeIndex].url}
          alt={allImages[activeIndex].label}
          fill
          className="object-contain"
          priority
        />
        
        {/* Image label */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-sm text-white">
          {allImages[activeIndex].label}
        </div>
        
        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex overflow-x-auto p-2 gap-2 bg-muted/20">
          {allImages.map((image, idx) => (
            <button
              key={idx}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2",
                activeIndex === idx ? "border-primary" : "border-transparent"
              )}
              onClick={() => setActiveIndex(idx)}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
