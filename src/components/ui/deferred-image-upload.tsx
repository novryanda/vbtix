"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ImageIcon, X, Upload } from "lucide-react";
import Image from "next/image";
import { env } from "~/env";

interface ImageFile {
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  onChange: (value: ImageFile | null) => void;
  onRemove: () => void;
  value?: ImageFile | null;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function DeferredImageUpload({
  onChange,
  onRemove,
  value,
  disabled,
  label = "Image",
  className,
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (value?.previewUrl) {
        URL.revokeObjectURL(value.previewUrl);
      }
    };
  }, [value]);

  if (!isMounted) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Call the onChange callback with the file and preview URL
    onChange({ file, previewUrl });
    
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
      <div className="mb-4 flex items-center gap-4">
        {value?.previewUrl ? (
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-md">
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                onClick={onRemove}
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
              alt="Image"
              src={value.previewUrl}
            />
          </div>
        ) : (
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
              className="hover:bg-muted/50 flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4"
            >
              <Upload className="h-6 w-6" />
              <span>Upload {label}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MultiImageFile {
  files: File[];
  previewUrls: string[];
}

interface MultiImageUploadProps {
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
}: MultiImageUploadProps) {
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

  const handleRemove = (index: number) => {
    const newImages = [...values];
    
    // Revoke the object URL to prevent memory leaks
    if (newImages[index].previewUrl) {
      URL.revokeObjectURL(newImages[index].previewUrl);
    }
    
    newImages.splice(index, 1);
    onRemove(index);
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
                onClick={() => handleRemove(index)}
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
