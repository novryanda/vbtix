"use client";

import { useState, useEffect } from "react";
import { Plus, Upload, Image as ImageIcon, Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, Shimmer } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { BannerUploadForm } from "~/components/admin/banners/banner-upload-form";
import { BannerList } from "~/components/admin/banners/banner-list";
import { BannerStats } from "~/components/admin/banners/banner-stats";
import { ADMIN_ENDPOINTS } from "~/lib/api/endpoints";

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imagePublicId: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

interface BannerStats {
  total: number;
  active: number;
  inactive: number;
}

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [stats, setStats] = useState<BannerStats>({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(ADMIN_ENDPOINTS.BANNERS);
      const data = await response.json();

      if (data.success) {
        setBanners(data.data);
        // Calculate stats
        const total = data.data.length;
        const active = data.data.filter((banner: Banner) => banner.isActive).length;
        const inactive = total - active;
        setStats({ total, active, inactive });
      } else {
        console.error("Failed to fetch banners:", data.error);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle banner upload
  const handleBannerUpload = async (bannerData: any) => {
    try {
      setIsUploading(true);
      const response = await fetch(ADMIN_ENDPOINTS.BANNERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bannerData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBanners(); // Refresh the list
        setShowUploadForm(false);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      return { success: false, error: "Failed to upload banner" };
    } finally {
      setIsUploading(false);
    }
  };

  // Handle banner status toggle
  const handleStatusToggle = async (bannerId: string, isActive: boolean) => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.BANNER_STATUS(bannerId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBanners(); // Refresh the list
      } else {
        console.error("Failed to update banner status:", data.error);
      }
    } catch (error) {
      console.error("Error updating banner status:", error);
    }
  };

  // Handle banner deletion
  const handleDelete = async (bannerId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      return;
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.BANNER_DETAIL(bannerId), {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchBanners(); // Refresh the list
      } else {
        console.error("Failed to delete banner:", data.error);
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  // Handle banner reordering
  const handleReorder = async (bannerIds: string[]) => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.BANNER_REORDER, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bannerIds }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBanners(); // Refresh the list
      } else {
        console.error("Failed to reorder banners:", data.error);
      }
    } catch (error) {
      console.error("Error reordering banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Manajemen Banner
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola banner yang ditampilkan di halaman utama website
          </p>
        </div>
        <Shimmer className="rounded-xl">
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Banner
          </Button>
        </Shimmer>
      </div>

      <Separator />

      {/* Stats Cards */}
      <BannerStats stats={stats} isLoading={isLoading} />

      {/* Upload Form Modal */}
      {showUploadForm && (
        <BannerUploadForm
          onSubmit={handleBannerUpload}
          onCancel={() => setShowUploadForm(false)}
          isUploading={isUploading}
        />
      )}

      {/* Banner List */}
      <BannerList
        banners={banners}
        isLoading={isLoading}
        onStatusToggle={handleStatusToggle}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}
