"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ImageUpload } from "~/components/ui/image-upload";
import { MultiImageUpload } from "~/components/ui/multi-image-upload";
import { UploadEndpoint } from "~/lib/upload-helpers";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import Image from "next/image";
import { ImageIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface ImageManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  posterImage?: string;
  posterPublicId?: string;
  bannerImage?: string;
  bannerPublicId?: string;
  additionalImages?: string[];
  additionalImagePublicIds?: string[];
  eventId: string;
  organizerId: string;
  onSuccess: () => void;
  eventTitle: string;
}

export function ImageManagerDialog({
  open,
  onOpenChange,
  posterImage,
  posterPublicId,
  bannerImage,
  bannerPublicId,
  additionalImages = [],
  additionalImagePublicIds = [],
  eventId,
  organizerId,
  onSuccess,
  eventTitle,
}: ImageManagerDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("poster");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // State for new images
  const [newPosterImage, setNewPosterImage] = useState<{ url: string; publicId: string } | null>(null);
  const [newBannerImage, setNewBannerImage] = useState<{ url: string; publicId: string } | null>(null);
  const [additionalImagesData, setAdditionalImagesData] = useState<{ url: string; publicId: string }[]>([]);

  // Initialize additional images from props
  useEffect(() => {
    if (additionalImages.length > 0 && additionalImagePublicIds.length > 0) {
      const initialImages = additionalImages.map((url, index) => ({
        url,
        publicId: additionalImagePublicIds[index] || "",
      }));
      setAdditionalImagesData(initialImages);
    }
  }, [additionalImages, additionalImagePublicIds]);

  // Handle image change for poster
  const handlePosterImageChange = (imageData: { url: string; publicId: string }) => {
    setNewPosterImage(imageData);
  };

  // Handle image removal for poster
  const handlePosterImageRemove = () => {
    setNewPosterImage(null);
  };

  // Handle image change for banner
  const handleBannerImageChange = (imageData: { url: string; publicId: string }) => {
    setNewBannerImage(imageData);
  };

  // Handle image removal for banner
  const handleBannerImageRemove = () => {
    setNewBannerImage(null);
  };

  // Handle image change for additional images
  const handleAdditionalImagesChange = (imagesData: { url: string; publicId: string }[]) => {
    setAdditionalImagesData(imagesData);
  };

  // Handle image removal for additional images
  const handleAdditionalImageRemove = (index: number) => {
    setAdditionalImagesData((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      let data: Record<string, any> = {};

      // Add poster image data if changed
      if (newPosterImage) {
        data.posterUrl = newPosterImage.url;
        data.posterPublicId = newPosterImage.publicId;
      }

      // Add banner image data if changed
      if (newBannerImage) {
        data.bannerUrl = newBannerImage.url;
        data.bannerPublicId = newBannerImage.publicId;
      }

      // Add additional images data if changed
      if (additionalImagesData.length > 0) {
        data.images = additionalImagesData.map((img) => img.url);
        data.imagePublicIds = additionalImagesData.map((img) => img.publicId);
      }

      // If no changes, show error
      if (Object.keys(data).length === 0) {
        throw new Error("No changes to save");
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update images");
      }

      // Call success callback
      onSuccess();
      
      // Close dialog
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error updating images:", err);
      setError(err.message || "Failed to update images. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Event Images</DialogTitle>
          <DialogDescription>
            Update or add images for your event
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="poster" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="poster">Poster</TabsTrigger>
            <TabsTrigger value="banner">Banner</TabsTrigger>
            <TabsTrigger value="additional">Additional Images</TabsTrigger>
          </TabsList>
          
          {/* Poster Tab */}
          <TabsContent value="poster" className="space-y-4 py-4">
            {/* Current Poster Image */}
            {posterImage && !newPosterImage && (
              <div className="mb-4">
                <h3 className="mb-2 flex items-center font-medium">
                  <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                  Current Poster
                </h3>
                <div className="overflow-hidden rounded-md">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={posterImage}
                      alt={`${eventTitle} Poster`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Poster Upload Component */}
            <ImageUpload
              onChange={handlePosterImageChange}
              onRemove={handlePosterImageRemove}
              value={newPosterImage?.url}
              label="Upload New Poster"
              endpoint={UploadEndpoint.EVENT}
            />
          </TabsContent>
          
          {/* Banner Tab */}
          <TabsContent value="banner" className="space-y-4 py-4">
            {/* Current Banner Image */}
            {bannerImage && !newBannerImage && (
              <div className="mb-4">
                <h3 className="mb-2 flex items-center font-medium">
                  <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                  Current Banner
                </h3>
                <div className="overflow-hidden rounded-md">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={bannerImage}
                      alt={`${eventTitle} Banner`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Banner Upload Component */}
            <ImageUpload
              onChange={handleBannerImageChange}
              onRemove={handleBannerImageRemove}
              value={newBannerImage?.url}
              label="Upload New Banner"
              endpoint={UploadEndpoint.EVENT}
            />
          </TabsContent>
          
          {/* Additional Images Tab */}
          <TabsContent value="additional" className="space-y-4 py-4">
            {/* Additional Images Upload Component */}
            <MultiImageUpload
              onChange={handleAdditionalImagesChange}
              onRemove={handleAdditionalImageRemove}
              values={additionalImagesData}
              label="Additional Images"
              endpoint={UploadEndpoint.EVENT}
              maxImages={10}
            />
          </TabsContent>
        </Tabs>

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
            disabled={isSubmitting}
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
