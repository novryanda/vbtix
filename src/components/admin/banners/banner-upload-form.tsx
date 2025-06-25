"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Image as ImageIcon, Calendar, Link as LinkIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, Shimmer } from "~/components/ui/magic-card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { uploadToCloudinary, UploadEndpoint } from "~/lib/upload-helpers";

const bannerFormSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255, "Judul terlalu panjang"),
  description: z.string().optional(),
  linkUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
  isActive: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "Tanggal berakhir harus setelah tanggal mulai",
  path: ["endDate"],
});

type BannerFormData = z.infer<typeof bannerFormSchema>;

interface BannerUploadFormProps {
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isUploading: boolean;
}

export function BannerUploadForm({ onSubmit, onCancel, isUploading }: BannerUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      title: "",
      description: "",
      linkUrl: "",
      isActive: false,
      startDate: "",
      endDate: "",
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploadingImage(true);
      const result = await uploadToCloudinary(selectedFile, {
        endpoint: UploadEndpoint.BANNER,
      });
      setUploadedImage(result);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal mengupload gambar. Silakan coba lagi.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (data: BannerFormData) => {
    if (!uploadedImage) {
      alert("Silakan upload gambar terlebih dahulu");
      return;
    }

    const bannerData = {
      ...data,
      imageUrl: uploadedImage.url,
      imagePublicId: uploadedImage.publicId,
      linkUrl: data.linkUrl || undefined,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    };

    const result = await onSubmit(bannerData);
    if (!result.success) {
      alert(result.error || "Gagal menyimpan banner");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <MagicCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Tambah Banner Baru</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Gambar Banner</Label>
            
            {!previewUrl ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pilih gambar banner (JPG, PNG, WebP)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ukuran maksimal: 5MB | Resolusi optimal: 1200x400px
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="banner-upload"
                />
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Pilih Gambar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={isUploadingImage || !!uploadedImage}
                    className="flex-1"
                  >
                    {isUploadingImage ? "Mengupload..." : uploadedImage ? "Berhasil Diupload" : "Upload Gambar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                      setUploadedImage(null);
                    }}
                  >
                    Ganti
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Banner</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul banner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan deskripsi banner"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Link (Opsional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="https://example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai (Opsional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Berakhir (Opsional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktifkan Banner</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Banner akan ditampilkan di halaman utama
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Batal
                </Button>
                <Shimmer className="flex-1 rounded-lg">
                  <Button 
                    type="submit" 
                    disabled={isUploading || !uploadedImage}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isUploading ? "Menyimpan..." : "Simpan Banner"}
                  </Button>
                </Shimmer>
              </div>
            </form>
          </Form>
        </CardContent>
      </MagicCard>
    </div>
  );
}
