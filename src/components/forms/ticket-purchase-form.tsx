"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, User, Users } from "lucide-react";
import {
  ticketPurchaseSchema,
  type TicketPurchaseSchema,
  type TicketPurchaseItemSchema,
  formatWhatsAppNumber,
} from "~/lib/validations/ticket-purchase.schema";

interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  maxPerPurchase: number;
}

interface TicketPurchaseFormProps {
  ticketTypes: TicketType[];
  onSubmit: (data: TicketPurchaseSchema) => Promise<void>;
  isLoading?: boolean;
}

export function TicketPurchaseForm({
  ticketTypes,
  onSubmit,
  isLoading = false,
}: TicketPurchaseFormProps) {
  const [totalTickets, setTotalTickets] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TicketPurchaseSchema>({
    resolver: zodResolver(ticketPurchaseSchema),
    defaultValues: {
      buyerInfo: {
        fullName: "",
        identityType: "KTP",
        identityNumber: "",
        email: "",
        whatsapp: "",
      },
      items: [],
      ticketHolders: [],
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: "items",
  });

  const { fields: holderFields, append: appendHolder, remove: removeHolder, replace: replaceHolders } = useFieldArray({
    control,
    name: "ticketHolders",
  });

  const watchedItems = watch("items");

  // Calculate total tickets and update ticket holders
  useEffect(() => {
    const total = watchedItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    setTotalTickets(total);

    // Update ticket holders array to match total tickets
    const currentHolders = holderFields.length;
    if (total !== currentHolders) {
      const newHolders = Array.from({ length: total }, (_, index) => ({
        fullName: "",
        identityType: "KTP" as const,
        identityNumber: "",
        email: "",
        whatsapp: "",
      }));
      replaceHolders(newHolders);
    }
  }, [watchedItems, holderFields.length, replaceHolders]);

  const addTicketType = () => {
    appendItem({
      ticketTypeId: "",
      quantity: 1,
    });
  };

  const handleFormSubmit = async (data: TicketPurchaseSchema) => {
    // Format WhatsApp numbers
    const formattedData = {
      ...data,
      buyerInfo: {
        ...data.buyerInfo,
        whatsapp: formatWhatsAppNumber(data.buyerInfo.whatsapp),
      },
      ticketHolders: data.ticketHolders.map(holder => ({
        ...holder,
        whatsapp: formatWhatsAppNumber(holder.whatsapp),
      })),
    };

    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Buyer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Data Pemesan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyerInfo.fullName">Nama Lengkap *</Label>
              <Input
                id="buyerInfo.fullName"
                {...register("buyerInfo.fullName")}
                placeholder="Masukkan nama lengkap"
              />
              {errors.buyerInfo?.fullName && (
                <p className="text-sm text-red-500 mt-1">{errors.buyerInfo.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="buyerInfo.identityType">Jenis Identitas *</Label>
              <Select
                value={watch("buyerInfo.identityType")}
                onValueChange={(value) => setValue("buyerInfo.identityType", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis identitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KTP">KTP</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="SIM">SIM</SelectItem>
                  <SelectItem value="KITAS">KITAS</SelectItem>
                  <SelectItem value="KITAP">KITAP</SelectItem>
                </SelectContent>
              </Select>
              {errors.buyerInfo?.identityType && (
                <p className="text-sm text-red-500 mt-1">{errors.buyerInfo.identityType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="buyerInfo.identityNumber">Nomor Identitas *</Label>
              <Input
                id="buyerInfo.identityNumber"
                {...register("buyerInfo.identityNumber")}
                placeholder="Masukkan nomor identitas"
              />
              {errors.buyerInfo?.identityNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.buyerInfo.identityNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="buyerInfo.email">Email *</Label>
              <Input
                id="buyerInfo.email"
                type="email"
                {...register("buyerInfo.email")}
                placeholder="Masukkan email"
              />
              <p className="text-sm text-gray-500 mt-1">e-Tiket akan dikirimkan ke email ini</p>
              {errors.buyerInfo?.email && (
                <p className="text-sm text-red-500 mt-1">{errors.buyerInfo.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="buyerInfo.whatsapp">No. WhatsApp *</Label>
              <Input
                id="buyerInfo.whatsapp"
                {...register("buyerInfo.whatsapp")}
                placeholder="Contoh: 08123456789 atau +6281234567890"
              />
              {errors.buyerInfo?.whatsapp && (
                <p className="text-sm text-red-500 mt-1">{errors.buyerInfo.whatsapp.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Tiket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itemFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Jenis Tiket</Label>
                <Select
                  value={watch(`items.${index}.ticketTypeId`)}
                  onValueChange={(value) => setValue(`items.${index}.ticketTypeId`, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis tiket" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypes.map((ticketType) => (
                      <SelectItem key={ticketType.id} value={ticketType.id}>
                        {ticketType.name} - Rp {ticketType.price.toLocaleString("id-ID")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={itemFields.length === 1}
              >
                Hapus
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addTicketType}>
            Tambah Jenis Tiket
          </Button>

          {errors.items && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.items.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Ticket Holders */}
      {totalTickets > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Data Pemilik Tiket ({totalTickets} tiket)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {holderFields.map((field, index) => (
              <div key={field.id}>
                <h4 className="font-medium mb-4">Pemilik Tiket {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Lengkap *</Label>
                    <Input
                      {...register(`ticketHolders.${index}.fullName`)}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.ticketHolders?.[index]?.fullName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.ticketHolders[index]?.fullName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Jenis Identitas *</Label>
                    <Select
                      value={watch(`ticketHolders.${index}.identityType`)}
                      onValueChange={(value) => setValue(`ticketHolders.${index}.identityType`, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis identitas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KTP">KTP</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="KITAS">KITAS</SelectItem>
                        <SelectItem value="KITAP">KITAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nomor Identitas *</Label>
                    <Input
                      {...register(`ticketHolders.${index}.identityNumber`)}
                      placeholder="Masukkan nomor identitas"
                    />
                    {errors.ticketHolders?.[index]?.identityNumber && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.ticketHolders[index]?.identityNumber?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      {...register(`ticketHolders.${index}.email`)}
                      placeholder="Masukkan email"
                    />
                    {errors.ticketHolders?.[index]?.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.ticketHolders[index]?.email?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label>No. WhatsApp *</Label>
                    <Input
                      {...register(`ticketHolders.${index}.whatsapp`)}
                      placeholder="Contoh: 08123456789 atau +6281234567890"
                    />
                    {errors.ticketHolders?.[index]?.whatsapp && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.ticketHolders[index]?.whatsapp?.message}
                      </p>
                    )}
                  </div>
                </div>
                {index < holderFields.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}

            {errors.ticketHolders && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.ticketHolders.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || totalTickets === 0} size="lg">
          {isLoading ? "Memproses..." : "Lanjut ke Pembayaran"}
        </Button>
      </div>
    </form>
  );
}
