"use client";

import { useState } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useWristbandQRGeneration } from "~/lib/api/hooks/qr-code";
import { useToast } from "~/hooks/use-toast";
import {
  QrCode,
  MoreHorizontal,
  Eye,
  Download,
  Scan,
  Calendar,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { formatDate } from "~/lib/utils";
import Image from "next/image";

interface WristbandCardProps {
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
    totalScans?: number;
  };
  organizerId: string;
  onQRGenerated?: () => void;
  onViewScans?: (wristbandId: string) => void;
  onViewQR?: (wristband: any) => void;
}

export function WristbandCard({
  wristband,
  organizerId,
  onQRGenerated,
  onViewScans,
  onViewQR,
}: WristbandCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateWristbandQR } = useWristbandQRGeneration();
  const { toast } = useToast();

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

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      await generateWristbandQR(organizerId, wristband.id);
      toast({
        title: "QR Code Generated",
        description: "Wristband QR code has been generated successfully.",
      });
      onQRGenerated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (wristband.qrCodeImageUrl) {
      const link = document.createElement("a");
      link.href = wristband.qrCodeImageUrl;
      link.download = `wristband-${wristband.name}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const statusConfig = getStatusConfig(wristband.status);
  const StatusIcon = statusConfig.icon;

  const isExpired = wristband.validUntil && new Date() > new Date(wristband.validUntil);
  const isNotYetValid = wristband.validFrom && new Date() < new Date(wristband.validFrom);

  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{wristband.name}</h3>
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            
            {wristband.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {wristband.description}
              </p>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{wristband.event.title}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {wristband.qrCodeImageUrl && (
                <>
                  <DropdownMenuItem onClick={() => onViewQR?.(wristband)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadQR}>
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => onViewScans?.(wristband.id)}>
                <Scan className="mr-2 h-4 w-4" />
                View Scan Logs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* QR Code Display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {wristband.qrCodeImageUrl ? (
              <Image
                src={wristband.qrCodeImageUrl}
                alt="Wristband QR Code"
                width={80}
                height={80}
                className="rounded-lg"
              />
            ) : (
              <QrCode className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            {!wristband.qrCodeImageUrl ? (
              <Button
                onClick={handleGenerateQR}
                disabled={isGenerating}
                size="sm"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {wristband.scanCount} scan{wristband.scanCount !== 1 ? "s" : ""}
                    {wristband.maxScans && ` / ${wristband.maxScans}`}
                  </span>
                </div>
                
                {wristband.isReusable && (
                  <Badge variant="outline" className="text-xs">
                    Reusable
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validity Period */}
        {(wristband.validFrom || wristband.validUntil) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {wristband.validFrom && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Valid from: {formatDate(wristband.validFrom)}</span>
                {isNotYetValid && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Not yet valid
                  </Badge>
                )}
              </div>
            )}
            {wristband.validUntil && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Valid until: {formatDate(wristband.validUntil)}</span>
                {isExpired && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Expired
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-muted-foreground">
          Created {formatDate(wristband.createdAt)}
        </div>
      </div>
    </MagicCard>
  );
}
