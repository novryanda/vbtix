"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary, UploadEndpoint } from "~/lib/upload-helpers";
import { MagicCard } from "~/components/ui/magic-card";

interface TicketLogoUploadProps {
  onChange: (value: { url: string; publicId: string } | null) => void;
  value?: { url: string; publicId: string } | null;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function TicketLogoUpload({
  onChange,
  value,
  disabled = false,
  label = "Logo Tiket",
  className = "",
}: TicketLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar yang valid (JPEG, PNG, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    try {
      setIsUploading(true);

      // Use standardized upload helper with ticket endpoint
      const result = await uploadToCloudinary(file, { 
        endpoint: UploadEndpoint.TICKET,
        folder: "ticket-logos"
      });

      // Call the onChange callback with the uploaded image data
      onChange({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Gagal mengupload logo. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (disabled || isUploading) return;
    onChange(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      
      <MagicCard className="p-4 bg-background/50 backdrop-blur-sm">
        {value?.url ? (
          // Display uploaded logo
          <div className="space-y-3">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
              <Image
                src={value.url}
                alt="Logo tiket"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                disabled={disabled || isUploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Ganti Logo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // Upload area
          <div className="text-center space-y-3">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Mengupload logo...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Pilih logo untuk tiket ini
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Format: JPEG, PNG, WebP • Maksimal 5MB
                  </p>
                  <Button
                    type="button"
                    onClick={handleButtonClick}
                    variant="outline"
                    size="sm"
                    disabled={disabled || isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih File
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </MagicCard>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Logo akan ditampilkan di kartu tiket. Opsional - jika tidak diupload, 
        akan menggunakan gambar event sebagai fallback.
      </p>
    </div>
  );
}
