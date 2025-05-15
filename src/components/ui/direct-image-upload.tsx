"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ImageIcon, X, Upload } from "lucide-react";
import Image from "next/image";
import { env } from "~/env";

interface ImageUploadProps {
  onChange: (value: { url: string; publicId: string }) => void;
  onRemove: () => void;
  value?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function DirectImageUpload({
  onChange,
  onRemove,
  value,
  disabled,
  label = "Image",
  className,
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

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Use unsigned upload with upload preset
      const uploadPreset =
        env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
      const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

      console.log("Uploading with preset:", uploadPreset);
      console.log("Cloud name:", cloudName);

      formData.append("upload_preset", uploadPreset);

      // Upload to Cloudinary directly
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Cloudinary error response:", errorData);
        throw new Error(`Failed to upload image: ${errorData}`);
      }

      const data = await response.json();

      // Call the onChange callback with the uploaded image data
      onChange({
        url: data.secure_url,
        publicId: data.public_id,
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

interface MultiImageUploadProps {
  onChange: (value: { url: string; publicId: string }[]) => void;
  onRemove: (index: number) => void;
  values?: string[];
  disabled?: boolean;
  label?: string;
  className?: string;
  maxImages?: number;
}

export function DirectMultiImageUpload({
  onChange,
  onRemove,
  values = [],
  disabled,
  label = "Images",
  className,
  maxImages = 5,
}: MultiImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImages, setCurrentImages] = useState<
    { url: string; publicId: string }[]
  >(values.map((url) => ({ url, publicId: "" })));

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Update currentImages when values change
    setCurrentImages(values.map((url) => ({ url, publicId: "" })));
  }, [values]);

  if (!isMounted) {
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Use unsigned upload with upload preset
      const uploadPreset =
        env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
      const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

      console.log("Uploading with preset:", uploadPreset);
      console.log("Cloud name:", cloudName);

      formData.append("upload_preset", uploadPreset);

      // Upload to Cloudinary directly
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Cloudinary error response:", errorData);
        throw new Error(`Failed to upload image: ${errorData}`);
      }

      const data = await response.json();

      // Add the new image to the current images
      const newImage = {
        url: data.secure_url,
        publicId: data.public_id,
      };

      const updatedImages = [...currentImages, newImage];
      setCurrentImages(updatedImages);

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

  const handleRemove = (index: number) => {
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    setCurrentImages(newImages);
    onRemove(index);
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {currentImages.map((image, index) => (
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
              src={image.url}
            />
          </div>
        ))}
        {currentImages.length < maxImages && (
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
