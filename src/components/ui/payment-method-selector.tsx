"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CreditCard, Smartphone, QrCode, Store } from "lucide-react";

export interface PaymentMethodDetails {
  bankCode?: string;
  type?: string;
  redirectUrl?: string;
}

export interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (
    method: string,
    details: PaymentMethodDetails,
  ) => void;
  isLoading?: boolean;
}

// Check if we're in test mode (Xendit not enabled)
const isTestMode = process.env.NEXT_PUBLIC_XENDIT_ENABLED !== "true";

const paymentMethods = isTestMode
  ? [
      {
        id: "TEST_BANK_TRANSFER",
        name: "Test Bank Transfer",
        description: "Simulasi transfer bank (tidak ada uang yang dipotong)",
        icon: CreditCard,
        banks: [
          { code: "TEST_BCA", name: "Test BCA" },
          { code: "TEST_BNI", name: "Test BNI" },
          { code: "TEST_BRI", name: "Test BRI" },
          { code: "TEST_MANDIRI", name: "Test Mandiri" },
        ],
      },
      {
        id: "TEST_EWALLET",
        name: "Test E-Wallet",
        description:
          "Simulasi pembayaran e-wallet (tidak ada uang yang dipotong)",
        icon: Smartphone,
        types: [
          { code: "TEST_OVO", name: "Test OVO" },
          { code: "TEST_DANA", name: "Test DANA" },
          { code: "TEST_GOPAY", name: "Test GoPay" },
        ],
      },
      {
        id: "TEST_CASH",
        name: "Test Cash Payment",
        description: "Simulasi pembayaran tunai (tidak ada uang yang dipotong)",
        icon: QrCode,
      },
    ]
  : [
      {
        id: "VIRTUAL_ACCOUNT",
        name: "Virtual Account",
        description: "Transfer bank melalui virtual account",
        icon: CreditCard,
        banks: [
          { code: "BCA", name: "BCA" },
          { code: "BNI", name: "BNI" },
          { code: "BRI", name: "BRI" },
          { code: "MANDIRI", name: "Mandiri" },
          { code: "PERMATA", name: "Permata" },
          { code: "BSI", name: "BSI" },
        ],
      },
      {
        id: "EWALLET",
        name: "E-Wallet",
        description: "Bayar dengan dompet digital",
        icon: Smartphone,
        types: [
          { code: "OVO", name: "OVO" },
          { code: "DANA", name: "DANA" },
          { code: "LINKAJA", name: "LinkAja" },
          { code: "SHOPEEPAY", name: "ShopeePay" },
          { code: "GOPAY", name: "GoPay" },
        ],
      },
      {
        id: "QR_CODE",
        name: "QR Code",
        description: "Scan QR code untuk pembayaran",
        icon: QrCode,
      },
      {
        id: "RETAIL_OUTLET",
        name: "Retail Outlet",
        description: "Bayar di Alfamart atau Indomaret",
        icon: Store,
        outlets: [
          { code: "ALFAMART", name: "Alfamart" },
          { code: "INDOMARET", name: "Indomaret" },
        ],
      },
    ];

export function PaymentMethodSelector({
  onPaymentMethodSelect,
  isLoading,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedOutlet, setSelectedOutlet] = useState<string>("");

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setSelectedBank("");
    setSelectedType("");
    setSelectedOutlet("");
  };

  const handleProceed = () => {
    if (!selectedMethod) return;

    let details: PaymentMethodDetails = {};

    // Handle both test and production payment methods
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
      // Test payment methods
      case "TEST_BANK_TRANSFER":
        if (!selectedBank) return;
        details.bankCode = selectedBank;
        break;
      case "TEST_EWALLET":
        if (!selectedType) return;
        details.type = selectedType;
        break;
      case "TEST_CASH":
        // No additional details needed for test cash
        break;
    }

    onPaymentMethodSelect(selectedMethod, details);
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
      // Test payment methods
      case "TEST_BANK_TRANSFER":
        return !!selectedBank;
      case "TEST_EWALLET":
        return !!selectedType;
      case "TEST_CASH":
        return true;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pilih Metode Pembayaran
          {isTestMode && (
            <span className="rounded-md bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
              MODE TEST
            </span>
          )}
        </CardTitle>
        {isTestMode && (
          <p className="text-muted-foreground text-sm">
            Ini adalah mode test. Tidak ada uang yang akan dipotong dari akun
            Anda.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.id} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label
                    htmlFor={method.id}
                    className="flex cursor-pointer items-center space-x-3"
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {method.description}
                      </div>
                    </div>
                  </Label>
                </div>

                {selectedMethod === method.id && (
                  <div className="ml-6 space-y-3">
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
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>

        <Button
          onClick={handleProceed}
          disabled={!isFormValid() || isLoading}
          className="w-full"
        >
          {isLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
        </Button>
      </CardContent>
    </Card>
  );
}
