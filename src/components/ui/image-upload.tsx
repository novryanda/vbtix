"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary, UploadEndpoint } from "~/lib/upload-helpers";

// ===== IMMEDIATE UPLOAD COMPONENTS =====

interface ImageUploadProps {
  onChange: (value: { url: string; publicId: string }) => void;
  onRemove: () => void;
  value?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  endpoint?: UploadEndpoint;
}

export function ImageUpload({
  onChange,
  onRemove,
  value,
  disabled,
  label = "Image",
  className,
  endpoint = UploadEndpoint.GENERAL,
}: ImageUploadProps) {
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

      // Call the onChange callback with the uploaded image data
      onChange({
        url: result.url,
        publicId: result.publicId,
      });
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
      <div className="mb-4 flex items-center gap-4">
        {value ? (
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-md">
            <div className="absolute top-2 right-2 z-10">
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
            <Image fill className="object-cover" alt="Image" src={value} />
          </div>
        ) : (
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
              className="hover:bg-muted/50 flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4"
            >
              {isUploading ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span>Upload {label}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== DEFERRED UPLOAD COMPONENTS =====

interface ImageFile {
  file: File;
  previewUrl: string;
}

interface DeferredImageUploadProps {
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
}: DeferredImageUploadProps) {
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
