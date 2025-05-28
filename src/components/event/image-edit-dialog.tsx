"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ImageUpload } from "~/components/ui/image-upload";
import { MultiImageUpload } from "~/components/ui/multi-image-upload";
import { UploadEndpoint } from "~/lib/upload-helpers";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import Image from "next/image";
import { ImageIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export type ImageType = "poster" | "banner" | "additional";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageType: ImageType;
  currentImage?: string;
  currentImages?: string[];
  currentImagePublicIds?: string[];
  posterImage?: string;
  bannerImage?: string;
  additionalImages?: string[];
  imagePublicIds?: {
    poster?: string;
    banner?: string;
    additional?: string[];
  };
  eventId: string;
  organizerId: string;
  onSuccess: () => void;
  eventTitle: string;
}

interface ApiResponse {
  error?: string;
  message?: string;
}

interface ApiError {
  message?: string;
}

export function ImageEditDialog({
  open,
  onOpenChange,
  imageType,
  currentImage,
  currentImages = [],
  currentImagePublicIds = [],
  eventId,
  organizerId,
  onSuccess,
  eventTitle,
}: ImageEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newImage, setNewImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);
  const [newImages, setNewImages] = useState<
    { url: string; publicId: string }[]
  >([]);

  // Get title and description based on image type
  const getDialogTitle = () => {
    switch (imageType) {
      case "poster":
        return "Update Event Poster";
      case "banner":
        return "Update Event Banner";
      case "additional":
        return "Manage Additional Images";
    }
  };

  const getDialogDescription = () => {
    switch (imageType) {
      case "poster":
        return "Upload a new poster image for your event";
      case "banner":
        return "Upload a new banner image for your event";
      case "additional":
        return "Add or remove additional images for your event";
    }
  };

  // Handle image change for single image (poster or banner)
  const handleSingleImageChange = (imageData: {
    url: string;
    publicId: string;
  }) => {
    setNewImage(imageData);
  };

  // Handle image removal for single image
  const handleSingleImageRemove = () => {
    setNewImage(null);
  };

  // Handle image change for multiple images
  const handleMultiImageChange = (
    imagesData: { url: string; publicId: string }[],
  ) => {
    setNewImages(imagesData);
  };

  // Handle image removal for multiple images
  const handleMultiImageRemove = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      let data = {};

      // Prepare data based on image type
      if (imageType === "poster" && newImage) {
        data = {
          posterUrl: newImage.url,
          posterPublicId: newImage.publicId,
        };
      } else if (imageType === "banner" && newImage) {
        data = {
          bannerUrl: newImage.url,
          bannerPublicId: newImage.publicId,
        };
      } else if (imageType === "additional") {
        data = {
          images: newImages.map((img) => img.url),
          imagePublicIds: newImages.map((img) => img.publicId),
        };
      } else {
        throw new Error("Please select an image to upload");
      }

      // Send request to update event
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_DETAIL(organizerId, eventId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update image");
      }

      // Call success callback
      onSuccess();

      // Close dialog
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating image:", err);
      const apiError = err as ApiError;
      setError(apiError.message ?? "Failed to update image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize additional images from current images if available
  useState(() => {
    if (
      imageType === "additional" &&
      currentImages.length > 0 &&
      currentImagePublicIds.length > 0
    ) {
      const initialImages = currentImages.map((url, index) => ({
        url,
        publicId: currentImagePublicIds[index] ?? "",
      }));
      setNewImages(initialImages);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {/* Current Image (for poster and banner) */}
          {(imageType === "poster" || imageType === "banner") &&
            currentImage &&
            !newImage && (
              <div className="mb-4">
                <h3 className="mb-2 flex items-center font-medium">
                  <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                  Current Image
                </h3>
                <div className="overflow-hidden rounded-md">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={currentImage}
                      alt={eventTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Image Upload Component (for poster and banner) */}
          {(imageType === "poster" || imageType === "banner") && (
            <ImageUpload
              onChange={handleSingleImageChange}
              onRemove={handleSingleImageRemove}
              value={newImage?.url}
              label="Upload New Image"
              endpoint={UploadEndpoint.EVENT}
            />
          )}

          {/* Multi Image Upload Component (for additional images) */}
          {imageType === "additional" && (
            <MultiImageUpload
              onChange={handleMultiImageChange}
              onRemove={handleMultiImageRemove}
              values={newImages}
              label="Additional Images"
              endpoint={UploadEndpoint.EVENT}
              maxImages={10}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              ((imageType === "poster" || imageType === "banner") && !newImage)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
