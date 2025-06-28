"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary, UploadEndpoint } from "~/lib/upload-helpers";
import { MagicCard } from "~/components/ui/magic-card";

interface IndividualTicketLogoUploadProps {
  organizerId: string;
  ticketId: string;
  currentLogoUrl?: string | null;
  onSuccess?: (logoData: { url: string; publicId: string }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function IndividualTicketLogoUpload({
  organizerId,
  ticketId,
  currentLogoUrl,
  onSuccess,
  onError,
  disabled = false,
  label = "Logo Tiket Individual",
  className = "",
}: IndividualTicketLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Silakan pilih file gambar yang valid (JPEG, PNG, WebP)";
      onError?.(errorMsg);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "Ukuran file terlalu besar. Maksimal 5MB.";
      onError?.(errorMsg);
      return;
    }

    try {
      setIsUploading(true);

      // Use standardized upload helper with ticket endpoint
      const result = await uploadToCloudinary(file, { 
        endpoint: UploadEndpoint.TICKET,
        folder: "individual-ticket-logos"
      });

      // Update the ticket with the logo URL via API
      const response = await fetch(
        `/api/organizer/${organizerId}/sold-tickets/${ticketId}/logo`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            logoUrl: result.url,
            logoPublicId: result.publicId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update ticket with logo",
        );
      }

      // Update local state
      setLogoUrl(result.url);
      
      // Call success callback
      onSuccess?.({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      const errorMsg = error instanceof Error ? error.message : "Gagal mengupload logo. Silakan coba lagi.";
      onError?.(errorMsg);
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

  const handleRemove = async () => {
    if (disabled || isUploading) return;
    
    try {
      setIsUploading(true);

      // Remove logo via API
      const response = await fetch(
        `/api/organizer/${organizerId}/sold-tickets/${ticketId}/logo`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to remove ticket logo",
        );
      }

      // Update local state
      setLogoUrl(null);
      
      // Call success callback with null
      onSuccess?.(null as any);
    } catch (error) {
      console.error("Error removing logo:", error);
      const errorMsg = error instanceof Error ? error.message : "Gagal menghapus logo. Silakan coba lagi.";
      onError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      
      <MagicCard className="p-4 bg-background/50 backdrop-blur-sm">
        {logoUrl ? (
          // Display uploaded logo
          <div className="space-y-3">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
              <Image
                src={logoUrl}
                alt="Logo tiket individual"
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
                    Upload logo khusus untuk tiket ini
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
        Logo individual akan ditampilkan di tiket ini. Jika tidak diupload, 
        akan menggunakan logo tipe tiket atau gambar event sebagai fallback.
      </p>
    </div>
  );
}
