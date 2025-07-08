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
import { MagicCard } from "~/components/ui/magic-card";
import { toast } from "sonner";
import { updateTicketTypeSchema, type UpdateTicketTypeSchema } from "~/lib/validations/ticket.schema";
import { Loader2, Save, X } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  maxPerPurchase: number;
  isVisible: boolean;
  allowTransfer: boolean;
  ticketFeatures?: string;
  perks?: string;
  logoUrl?: string;
  earlyBirdDeadline?: string;
  saleStartDate?: string;
  saleEndDate?: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface TicketTypeEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketType: TicketType | null;
  organizerId: string;
  onSuccess?: (updatedTicketType: TicketType) => void;
}

export function TicketTypeEditModal({
  open,
  onOpenChange,
  ticketType,
  organizerId,
  onSuccess,
}: TicketTypeEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateTicketTypeSchema>({
    resolver: zodResolver(updateTicketTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 1,
      maxPerPurchase: 10,
      isVisible: true,
      allowTransfer: false,
      ticketFeatures: "",
      perks: "",
      earlyBirdDeadline: "",
      saleStartDate: "",
      saleEndDate: "",
    },
  });

  // Reset form when ticket type changes
  useEffect(() => {
    if (ticketType) {
      form.reset({
        name: ticketType.name,
        description: ticketType.description || "",
        price: ticketType.price,
        quantity: ticketType.quantity,
        maxPerPurchase: ticketType.maxPerPurchase,
        isVisible: ticketType.isVisible,
        allowTransfer: ticketType.allowTransfer,
        ticketFeatures: ticketType.ticketFeatures || "",
        perks: ticketType.perks || "",
        earlyBirdDeadline: ticketType.earlyBirdDeadline || "",
        saleStartDate: ticketType.saleStartDate || "",
        saleEndDate: ticketType.saleEndDate || "",
      });
    }
  }, [ticketType, form]);

  const onSubmit = async (data: UpdateTicketTypeSchema) => {
    if (!ticketType) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/organizer/${organizerId}/tickets/${ticketType.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update ticket type");
      }

      toast.success("Jenis tiket berhasil diperbarui");

      onSuccess?.(result.data);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating ticket type:", error);
      toast.error(error.message || "Gagal memperbarui jenis tiket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Jenis Tiket</DialogTitle>
          <DialogDescription>
            Perbarui informasi jenis tiket. Perubahan akan berlaku segera.
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
                      <FormLabel>Nama Tiket *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama tiket" {...field} />
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
                          placeholder="Deskripsi tiket (opsional)"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price and Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga (IDR) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kuota *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Max Per Purchase */}
                <FormField
                  control={form.control}
                  name="maxPerPurchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maksimal per Pembelian</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                        />
                      </FormControl>
                      <FormDescription>
                        Jumlah maksimal tiket yang dapat dibeli dalam satu transaksi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </MagicCard>

            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Fitur & Pengaturan</h3>

                {/* Features */}
                <FormField
                  control={form.control}
                  name="ticketFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitur Tiket</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Daftar fitur yang didapat dengan tiket ini"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Perks */}
                <FormField
                  control={form.control}
                  name="perks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keuntungan Tambahan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Keuntungan atau bonus yang didapat"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Checkboxes */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Tampilkan di Publik</FormLabel>
                          <FormDescription>
                            Tiket akan terlihat oleh pembeli di halaman event
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowTransfer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Izinkan Transfer</FormLabel>
                          <FormDescription>
                            Pembeli dapat mentransfer tiket ke orang lain
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
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
