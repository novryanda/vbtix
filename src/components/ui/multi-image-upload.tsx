"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary, UploadEndpoint } from "~/lib/upload-helpers";

// ===== MULTI-IMAGE UPLOAD COMPONENTS =====

interface MultiImageUploadProps {
  onChange: (value: { url: string; publicId: string }[]) => void;
  onRemove: (index: number) => void;
  values: { url: string; publicId: string }[];
  disabled?: boolean;
  label?: string;
  className?: string;
  maxImages?: number;
  endpoint?: UploadEndpoint;
}

export function MultiImageUpload({
  onChange,
  onRemove,
  values = [],
  disabled,
  label = "Images",
  className,
  maxImages = 5,
  endpoint = UploadEndpoint.GENERAL,
}: MultiImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Use standardized upload helper
      const result = await uploadToCloudinary(file, { endpoint });

      // Add the new image to the current images
      const newImage = {
        url: result.url,
        publicId: result.publicId,
      };

      const updatedImages = [...values, newImage];

      // Call the onChange callback with the updated images
      onChange(updatedImages);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {values.map((image, index) => (
          <div
            key={index}
            className="relative h-[150px] w-full overflow-hidden rounded-md"
          >
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(index)}
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt={`Image ${index + 1}`}
              src={image.url}
            />
          </div>
        ))}
        {values.length < maxImages && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={disabled || isUploading}
            />
            <Button
              type="button"
              disabled={disabled || isUploading}
              variant="outline"
              onClick={handleButtonClick}
              className="hover:bg-muted/50 flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4"
            >
              {isUploading ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span>Add Image</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DeferredMultiImageProps {
  onChange: (value: { file: File; previewUrl: string }[]) => void;
  onRemove: (index: number) => void;
  values: { file: File; previewUrl: string }[];
  disabled?: boolean;
  label?: string;
  className?: string;
  maxImages?: number;
}

export function DeferredMultiImageUpload({
  onChange,
  onRemove,
  values = [],
  disabled,
  label = "Images",
  className,
  maxImages = 5,
}: DeferredMultiImageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      values.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [values]);

  if (!isMounted) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Add the new image to the current images
    const newImage = { file, previewUrl };
    const updatedImages = [...values, newImage];
    
    // Call the onChange callback with the updated images
    onChange(updatedImages);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {values.map((image, index) => (
          <div
            key={index}
            className="relative h-[150px] w-full overflow-hidden rounded-md"
          >
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(index)}
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt={`Image ${index + 1}`}
              src={image.previewUrl}
            />
          </div>
        ))}
        {values.length < maxImages && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={disabled}
            />
            <Button
              type="button"
              disabled={disabled}
              variant="outline"
              onClick={handleButtonClick}
              className="hover:bg-muted/50 flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4"
            >
              <Upload className="h-6 w-6" />
              <span>Add Image</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
