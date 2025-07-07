"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Download,
  QrCode,
  Calendar,
  Clock,
  Users,
  Copy,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "~/lib/utils";
import Image from "next/image";

interface WristbandQRModalProps {
  wristband: {
    id: string;
    name: string;
    description?: string;
    status: string;
    qrCodeImageUrl?: string;
    scanCount: number;
    maxScans?: number;
    isReusable: boolean;
    validFrom?: Date;
    validUntil?: Date;
    createdAt: Date;
    event: {
      id: string;
      title: string;
      startDate: Date;
      endDate: Date;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WristbandQRModal({ wristband, isOpen, onClose }: WristbandQRModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!wristband) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          label: "Active",
          color: "text-green-600",
        };
      case "PENDING":
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: "Pending",
          color: "text-yellow-600",
        };
      case "EXPIRED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Expired",
          color: "text-red-600",
        };
      case "REVOKED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Revoked",
          color: "text-red-600",
        };
      default:
        return {
          variant: "outline" as const,
          icon: AlertCircle,
          label: status,
          color: "text-gray-600",
        };
    }
  };

  const handleDownload = async () => {
    if (!wristband.qrCodeImageUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(wristband.qrCodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `wristband-${wristband.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast.success("QR code image has been downloaded successfully.");
    } catch (error) {
      toast.error("Failed to download QR code image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(wristband.id);
    toast.success("Wristband ID has been copied to clipboard.");
  };

  const statusConfig = getStatusConfig(wristband.status);
  const StatusIcon = statusConfig.icon;

  const isExpired = wristband.validUntil && new Date() > new Date(wristband.validUntil);
  const isNotYetValid = wristband.validFrom && new Date() < new Date(wristband.validFrom);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Wristband QR Code
          </DialogTitle>
          <DialogDescription>
            View and download the QR code for this wristband
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wristband Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{wristband.name}</h3>
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {wristband.description && (
              <p className="text-sm text-muted-foreground">
                {wristband.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{wristband.event.title}</span>
            </div>
          </div>

          <Separator />

          {/* QR Code Display */}
          {wristband.qrCodeImageUrl ? (
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                <Image
                  src={wristband.qrCodeImageUrl}
                  alt="Wristband QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>

              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download QR Code"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">QR code not generated yet</p>
            </div>
          )}

          <Separator />

          {/* Wristband Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Scan Count:</span>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {wristband.scanCount}
                  {wristband.maxScans && ` / ${wristband.maxScans}`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline" className="text-xs">
                {wristband.isReusable ? "Reusable" : "Single Use"}
              </Badge>
            </div>

            {wristband.validFrom && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid From:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(wristband.validFrom)}</span>
                  {isNotYetValid && (
                    <Badge variant="outline" className="text-xs">
                      Not yet valid
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {wristband.validUntil && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid Until:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(wristband.validUntil)}</span>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wristband ID:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-auto p-1 text-xs font-mono"
              >
                {wristband.id.substring(0, 8)}...
                <Copy className="ml-1 h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(wristband.createdAt)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
