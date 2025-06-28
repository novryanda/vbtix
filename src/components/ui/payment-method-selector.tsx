"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { CreditCard, Smartphone, QrCode, Store, HandCoins, Check, Download, Upload, CheckCircle, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export interface PaymentMethodDetails {
  bankCode?: string;
  type?: string;
  redirectUrl?: string;
}

export interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (
    method: string,
    details: PaymentMethodDetails,
    paymentProofFile?: File | null,
  ) => void;
  isLoading?: boolean;
  orderId?: string; // Add orderId for payment proof upload
}

const paymentMethods = [
  {
    id: "MANUAL_PAYMENT",
    name: "Pembayaran Manual",
    description: "Pembayaran akan dikonfirmasi manual oleh admin",
    icon: HandCoins,
  },
  {
    id: "QRIS_BY_WONDERS",
    name: "QRIS By Wonders",
    description: "Scan QR code untuk pembayaran dengan QRIS",
    icon: QrCode,
    showQRCode: true,
  },
  // {
  //   id: "VIRTUAL_ACCOUNT",
  //   name: "Virtual Account",
  //   description: "Transfer bank melalui virtual account",
  //   icon: CreditCard,
  //   banks: [
  //     { code: "BCA", name: "BCA" },
  //     { code: "BNI", name: "BNI" },
  //     { code: "BRI", name: "BRI" },
  //     { code: "MANDIRI", name: "Mandiri" },
  //     { code: "PERMATA", name: "Permata" },
  //     { code: "BSI", name: "BSI" },
  //   ],
  // },
  // {
  //   id: "EWALLET",
  //   name: "E-Wallet",
  //   description: "Bayar dengan dompet digital",
  //   icon: Smartphone,
  //   types: [
  //     { code: "OVO", name: "OVO" },
  //     { code: "DANA", name: "DANA" },
  //     { code: "LINKAJA", name: "LinkAja" },
  //     { code: "SHOPEEPAY", name: "ShopeePay" },
  //     { code: "GOPAY", name: "GoPay" },
  //   ],
  // },
  // {
  //   id: "QR_CODE",
  //   name: "QR Code",
  //   description: "Scan QR code untuk pembayaran",
  //   icon: QrCode,
  // },
  // {
  //   id: "RETAIL_OUTLET",
  //   name: "Retail Outlet",
  //   description: "Bayar di Alfamart atau Indomaret",
  //   icon: Store,
  //   outlets: [
  //     { code: "ALFAMART", name: "Alfamart" },
  //     { code: "INDOMARET", name: "Indomaret" },
  //   ],
  // },
];

export function PaymentMethodSelector({
  onPaymentMethodSelect,
  isLoading,
  orderId,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedOutlet, setSelectedOutlet] = useState<string>("");

  // Payment proof file selection state
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setSelectedBank("");
    setSelectedType("");
    setSelectedOutlet("");
    // Reset payment proof when changing methods
    setPaymentProofFile(null);
  };

  // Handle QR code download
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = '/qrcode.jpg';
    link.download = 'qris-payment-code.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code berhasil diunduh");
  };

  // Handle payment proof file selection
  const handlePaymentProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak valid. Hanya JPEG, PNG, dan WebP yang diperbolehkan.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setPaymentProofFile(file);
    toast.success("File bukti pembayaran berhasil dipilih");
  };

  // Remove payment proof
  const removePaymentProof = () => {
    setPaymentProofFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProceed = () => {
    if (!selectedMethod) return;

    let details: PaymentMethodDetails = {};

    // Handle both mock and production payment methods
    switch (selectedMethod) {
      case "VIRTUAL_ACCOUNT":
        if (!selectedBank) return;
        details.bankCode = selectedBank;
        break;
      case "EWALLET":
        if (!selectedType) return;
        details.type = selectedType;
        details.redirectUrl = window.location.origin + "/orders";
        break;
      case "RETAIL_OUTLET":
        if (!selectedOutlet) return;
        details.type = selectedOutlet;
        break;
      case "QR_CODE":
        details.type = "QRIS";
        break;
      case "QRIS_BY_WONDERS":
        // No additional details needed for QRIS By Wonders
        break;
      case "MANUAL_PAYMENT":
        // No additional details needed for manual payment
        break;
    }

    // For QRIS_BY_WONDERS, pass the payment proof file
    const paymentProofFileToPass = selectedMethod === "QRIS_BY_WONDERS" ? paymentProofFile : null;
    onPaymentMethodSelect(selectedMethod, details, paymentProofFileToPass);
  };

  const isFormValid = () => {
    if (!selectedMethod) return false;

    switch (selectedMethod) {
      case "VIRTUAL_ACCOUNT":
        return !!selectedBank;
      case "EWALLET":
        return !!selectedType;
      case "RETAIL_OUTLET":
        return !!selectedOutlet;
      case "QR_CODE":
        return true;
      case "QRIS_BY_WONDERS":
        // For QRIS By Wonders, require payment proof file to be selected (upload happens after order creation)
        return !!paymentProofFile;
      case "MANUAL_PAYMENT":
        return true;
      default:
        return false;
    }
  };

  return (
    <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pilih Metode Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <div key={method.id} className="space-y-3">
                <MagicCard
                  className={`cursor-pointer transition-all duration-300 p-4 border-2 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                  onClick={() => handleMethodChange(method.id)}
                  gradientColor={isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.1)"}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {method.description}
                      </div>
                    </div>
                  </div>
                </MagicCard>

                {selectedMethod === method.id && (
                  <div className="mt-4 space-y-3 pl-8">
                    {method.banks && (
                      <div>
                        <Label htmlFor="bank-select">Pilih Bank</Label>
                        <Select
                          value={selectedBank}
                          onValueChange={setSelectedBank}
                        >
                          <SelectTrigger id="bank-select">
                            <SelectValue placeholder="Pilih bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {method.banks.map((bank) => (
                              <SelectItem key={bank.code} value={bank.code}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {method.types && (
                      <div>
                        <Label htmlFor="type-select">Pilih E-Wallet</Label>
                        <Select
                          value={selectedType}
                          onValueChange={setSelectedType}
                        >
                          <SelectTrigger id="type-select">
                            <SelectValue placeholder="Pilih e-wallet" />
                          </SelectTrigger>
                          <SelectContent>
                            {method.types.map((type) => (
                              <SelectItem key={type.code} value={type.code}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {method.outlets && (
                      <div>
                        <Label htmlFor="outlet-select">Pilih Outlet</Label>
                        <Select
                          value={selectedOutlet}
                          onValueChange={setSelectedOutlet}
                        >
                          <SelectTrigger id="outlet-select">
                            <SelectValue placeholder="Pilih outlet" />
                          </SelectTrigger>
                          <SelectContent>
                            {method.outlets.map((outlet) => (
                              <SelectItem key={outlet.code} value={outlet.code}>
                                {outlet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {method.showQRCode && (
                      <div className="space-y-4">
                        <Label>QR Code Pembayaran</Label>
                        <MagicCard className="p-6 text-center bg-white">
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Scan QR code di bawah ini untuk melakukan pembayaran
                            </p>
                            <div className="flex justify-center">
                              <Image
                                src="/qrcode.jpg"
                                alt="QRIS Payment QR Code"
                                width={200}
                                height={200}
                                className="border rounded-lg shadow-sm"
                                priority
                              />
                            </div>
                            <Button
                              onClick={handleDownloadQR}
                              variant="outline"
                              size="sm"
                              className="mx-auto flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Unduh QR Code
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Setelah pembayaran berhasil, unggah bukti pembayaran di bawah ini
                            </p>
                          </div>
                        </MagicCard>

                        {/* Payment Proof File Selection */}
                        <div className="space-y-3">
                          <Label>Bukti Pembayaran *</Label>
                          <MagicCard className="p-4 bg-white">
                            {!paymentProofFile ? (
                              <div className="text-center space-y-3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Pilih bukti pembayaran (JPEG, PNG, WebP)
                                  </p>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Maksimal 5MB - File akan diunggah setelah konfirmasi pembayaran
                                  </p>
                                  <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Pilih File
                                  </Button>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handlePaymentProofSelect}
                                    className="hidden"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium text-green-700">
                                      {paymentProofFile.name}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={removePaymentProof}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                  File siap untuk diunggah setelah konfirmasi pembayaran
                                </p>
                              </div>
                            )}
                          </MagicCard>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <MagicButton
          onClick={handleProceed}
          disabled={!isFormValid() || isLoading}
          className="w-full"
          variant="magic"
          size="lg"
        >
          {isLoading ? "Memproses..." :
           selectedMethod === "QRIS_BY_WONDERS" && !paymentProofFile ?
           "Pilih Bukti Pembayaran Dulu" :
           "Lanjutkan Pembayaran"}
        </MagicButton>
      </CardContent>
    </MagicCard>
  );
}
