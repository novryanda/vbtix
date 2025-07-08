"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MagicCard } from "~/components/ui/magic-card";
import { toast } from "sonner";
import { updateWristbandSchema, type UpdateWristbandSchema } from "~/lib/validations/wristband.schema";
import { WristbandQRCodeStatus } from "@prisma/client";
import { Loader2, Save, X, Shield, ShieldCheck, ShieldX, Clock } from "lucide-react";

interface Wristband {
  id: string;
  name: string;
  description?: string;
  qrCode: string;
  status: "PENDING" | "GENERATED" | "ACTIVE" | "EXPIRED" | "REVOKED";
  isReusable: boolean;
  maxScans?: number;
  scanCount: number;
  validFrom?: string;
  validUntil?: string;
  codeType?: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  totalScans: number;
}

interface WristbandEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wristband: Wristband | null;
  organizerId: string;
  onSuccess?: (updatedWristband: Wristband) => void;
}

export function WristbandEditModal({
  open,
  onOpenChange,
  wristband,
  organizerId,
  onSuccess,
}: WristbandEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateWristbandSchema>({
    resolver: zodResolver(updateWristbandSchema),
    defaultValues: {
      name: "",
      description: "",
      validFrom: "",
      validUntil: "",
      maxScans: undefined,
      isReusable: true,
      status: "PENDING",
    },
  });

  // Reset form when wristband changes
  useEffect(() => {
    if (wristband) {
      form.reset({
        name: wristband.name,
        description: wristband.description || "",
        validFrom: wristband.validFrom || "",
        validUntil: wristband.validUntil || "",
        maxScans: wristband.maxScans || undefined,
        isReusable: wristband.isReusable,
        status: wristband.status as WristbandQRCodeStatus,
      });
    }
  }, [wristband, form]);

  const onSubmit = async (data: UpdateWristbandSchema) => {
    if (!wristband) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristband.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update wristband");
      }

      toast.success("Gelang berhasil diperbarui");

      onSuccess?.(result.data);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating wristband:", error);
      toast.error(error.message || "Gagal memperbarui gelang");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case "EXPIRED":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "REVOKED":
        return <ShieldX className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Gelang</DialogTitle>
          <DialogDescription>
            Perbarui informasi gelang. Perubahan akan berlaku segera.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Gelang *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama gelang" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deskripsi gelang (opsional)"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">
                            <div className="flex items-center gap-2">
                              {getStatusIcon("PENDING")}
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="ACTIVE">
                            <div className="flex items-center gap-2">
                              {getStatusIcon("ACTIVE")}
                              Aktif
                            </div>
                          </SelectItem>
                          <SelectItem value="EXPIRED">
                            <div className="flex items-center gap-2">
                              {getStatusIcon("EXPIRED")}
                              Kedaluwarsa
                            </div>
                          </SelectItem>
                          <SelectItem value="REVOKED">
                            <div className="flex items-center gap-2">
                              {getStatusIcon("REVOKED")}
                              Dicabut
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </MagicCard>

            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Pengaturan Scan</h3>

                {/* Max Scans */}
                <FormField
                  control={form.control}
                  name="maxScans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maksimal Scan</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          placeholder="Tidak terbatas"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Kosongkan untuk scan tidak terbatas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Reusable */}
                <FormField
                  control={form.control}
                  name="isReusable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Dapat Digunakan Berulang</FormLabel>
                        <FormDescription>
                          Gelang dapat di-scan berkali-kali
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </MagicCard>

            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Periode Berlaku</h3>

                {/* Valid From */}
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berlaku Dari</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Kapan gelang mulai dapat digunakan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valid Until */}
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berlaku Sampai</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Kapan gelang tidak dapat digunakan lagi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </MagicCard>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
