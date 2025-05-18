"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface DeferredTicketImageUploadProps {
  onChange: (file: File | null) => void;
  value: File | null;
  previewUrl: string | null;
  disabled?: boolean;
}

export function DeferredTicketImageUpload({
  onChange,
  value,
  previewUrl,
  disabled = false,
}: DeferredTicketImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Call the onChange callback with the file
    onChange(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    // Call the onChange callback with null to remove the image
    onChange(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Label className="mb-2 block">Ticket Image</Label>
      <div className="mb-4">
        {previewUrl ? (
          <div className="relative h-[200px] w-full overflow-hidden rounded-md">
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                onClick={handleRemoveImage}
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
              className="object-contain"
              alt="Ticket Image Preview"
              src={previewUrl}
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
              className="hover:bg-muted/50 flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4"
            >
              <Upload className="h-6 w-6" />
              <span>Upload Ticket Image</span>
              <p className="text-muted-foreground text-xs">
                This image will be displayed on the ticket
              </p>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
