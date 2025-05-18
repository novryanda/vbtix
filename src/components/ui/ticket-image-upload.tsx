"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";

interface TicketImageUploadProps {
  organizerId: string;
  ticketId: string;
  currentImageUrl?: string | null;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export function TicketImageUpload({
  organizerId,
  ticketId,
  currentImageUrl,
  onSuccess,
  onError,
}: TicketImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server
      const response = await fetch(
        ORGANIZER_ENDPOINTS.TICKET_IMAGE(organizerId, ticketId),
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      
      // Update local state
      setImageUrl(data.data.imageUrl);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data.data.imageUrl);
      }
    } catch (error: any) {
      console.error("Error uploading ticket image:", error);
      if (onError) {
        onError(error.message || "Failed to upload image");
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUploading(true);

      // Send request to remove image
      const response = await fetch(
        ORGANIZER_ENDPOINTS.TICKET_IMAGE(organizerId, ticketId),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove image");
      }

      // Update local state
      setImageUrl(null);
      
      // Call success callback
      if (onSuccess) {
        onSuccess("");
      }
    } catch (error: any) {
      console.error("Error removing ticket image:", error);
      if (onError) {
        onError(error.message || "Failed to remove image");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Label className="mb-2 block">Ticket Image</Label>
      <div className="mb-4">
        {imageUrl ? (
          <div className="relative h-[200px] w-full overflow-hidden rounded-md">
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                onClick={handleRemoveImage}
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Image
              fill
              className="object-contain"
              alt="Ticket Image"
              src={imageUrl}
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
              disabled={isUploading}
            />
            <Button
              type="button"
              disabled={isUploading}
              variant="outline"
              onClick={handleButtonClick}
              className="hover:bg-muted/50 flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span>Upload Ticket Image</span>
                  <p className="text-muted-foreground text-xs">
                    This image will be displayed on the ticket
                  </p>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
