"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  QrCode,
  Store,
  AlertCircle,
} from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { Alert, AlertDescription } from "~/components/ui/alert";

// Type definitions for payment settings
interface PaymentSettings {
  xenditEnabled: boolean;
  xenditSecretKey: string;
  xenditWebhookToken: string;
  virtualAccountEnabled: boolean;
  ewalletEnabled: boolean;
  qrCodeEnabled: boolean;
  retailOutletEnabled: boolean;
  enabledBanks: {
    BCA: boolean;
    BNI: boolean;
    BRI: boolean;
    MANDIRI: boolean;
    PERMATA: boolean;
    BSI: boolean;
  };
  enabledEwallets: {
    OVO: boolean;
    DANA: boolean;
    LINKAJA: boolean;
    SHOPEEPAY: boolean;
    GOPAY: boolean;
  };
  enabledOutlets: {
    ALFAMART: boolean;
    INDOMARET: boolean;
  };
  serviceFeePercentage: number;
  serviceFeeFixed: number;
}

export default function PaymentSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Unwrap params with React.use()
  const { id: organizerId } = React.use(params);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    // Xendit settings
    xenditEnabled: true,
    xenditSecretKey: "",
    xenditWebhookToken: "",

    // Payment methods
    virtualAccountEnabled: true,
    ewalletEnabled: true,
    qrCodeEnabled: true,
    retailOutletEnabled: false,

    // Bank accounts for virtual account
    enabledBanks: {
      BCA: true,
      BNI: true,
      BRI: true,
      MANDIRI: true,
      PERMATA: false,
      BSI: false,
    },

    // E-wallet providers
    enabledEwallets: {
      OVO: true,
      DANA: true,
      LINKAJA: false,
      SHOPEEPAY: true,
      GOPAY: true,
    },

    // Retail outlets
    enabledOutlets: {
      ALFAMART: false,
      INDOMARET: false,
    },

    // Service fee settings
    serviceFeePercentage: 2.5,
    serviceFeeFixed: 0,
  });

  const handleInputChange = (field: string, value: any) => {
    setPaymentSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (
    parent: keyof Pick<
      PaymentSettings,
      "enabledBanks" | "enabledEwallets" | "enabledOutlets"
    >,
    field: string,
    value: boolean,
  ) => {
    setPaymentSettings((prev) => {
      const parentValue = prev[parent];

      // Ensure parentValue is an object before spreading
      if (typeof parentValue === "object" && parentValue !== null) {
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [field]: value,
          },
        };
      }

      // Fallback if parentValue is not an object
      return {
        ...prev,
        [parent]: {
          [field]: value,
        },
      } as PaymentSettings;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      // Here you would typically save the payment settings to your backend
      // For now, we'll simulate a successful save
      console.log(
        `Saving payment settings for organizer ${organizerId}:`,
        paymentSettings,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage("Payment settings saved successfully!");
    } catch (err: any) {
      console.error("Error saving payment settings:", err);
      setFormError(
        err.message || "Failed to save payment settings. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">
        <div className="container flex flex-1 flex-col gap-2 pt-4">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">Payment Settings</h1>
                  <p className="text-muted-foreground text-sm">
                    Configure payment methods and gateway settings
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 lg:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Xendit Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Xendit Configuration</CardTitle>
                    <CardDescription>
                      Configure your Xendit payment gateway settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="xenditEnabled"
                        checked={paymentSettings.xenditEnabled}
                        onCheckedChange={(checked) =>
                          handleInputChange("xenditEnabled", checked === true)
                        }
                      />
                      <Label htmlFor="xenditEnabled">
                        Enable Xendit Payment Gateway
                      </Label>
                    </div>

                    {paymentSettings.xenditEnabled && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="xenditSecretKey">
                            Xendit Secret Key
                          </Label>
                          <Input
                            id="xenditSecretKey"
                            type="password"
                            value={paymentSettings.xenditSecretKey}
                            onChange={(e) =>
                              handleInputChange(
                                "xenditSecretKey",
                                e.target.value,
                              )
                            }
                            placeholder="xnd_development_..."
                          />
                          <p className="text-muted-foreground text-xs">
                            Get your secret key from Xendit Dashboard
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="xenditWebhookToken">
                            Webhook Verification Token
                          </Label>
                          <Input
                            id="xenditWebhookToken"
                            type="password"
                            value={paymentSettings.xenditWebhookToken}
                            onChange={(e) =>
                              handleInputChange(
                                "xenditWebhookToken",
                                e.target.value,
                              )
                            }
                            placeholder="webhook_token_..."
                          />
                          <p className="text-muted-foreground text-xs">
                            Optional: Token for webhook verification
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Choose which payment methods to offer to your customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Virtual Account */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="virtualAccountEnabled"
                          checked={paymentSettings.virtualAccountEnabled}
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "virtualAccountEnabled",
                              checked === true,
                            )
                          }
                        />
                        <Label
                          htmlFor="virtualAccountEnabled"
                          className="flex items-center space-x-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Virtual Account</span>
                        </Label>
                      </div>

                      {paymentSettings.virtualAccountEnabled && (
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          {Object.entries(paymentSettings.enabledBanks).map(
                            ([bank, enabled]) => (
                              <div
                                key={bank}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`bank-${bank}`}
                                  checked={enabled}
                                  onCheckedChange={(checked) =>
                                    handleNestedChange(
                                      "enabledBanks",
                                      bank,
                                      checked === true,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`bank-${bank}`}
                                  className="text-sm"
                                >
                                  {bank}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* E-Wallet */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ewalletEnabled"
                          checked={paymentSettings.ewalletEnabled}
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "ewalletEnabled",
                              checked === true,
                            )
                          }
                        />
                        <Label
                          htmlFor="ewalletEnabled"
                          className="flex items-center space-x-2"
                        >
                          <Smartphone className="h-4 w-4" />
                          <span>E-Wallet</span>
                        </Label>
                      </div>

                      {paymentSettings.ewalletEnabled && (
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          {Object.entries(paymentSettings.enabledEwallets).map(
                            ([wallet, enabled]) => (
                              <div
                                key={wallet}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`wallet-${wallet}`}
                                  checked={enabled}
                                  onCheckedChange={(checked) =>
                                    handleNestedChange(
                                      "enabledEwallets",
                                      wallet,
                                      checked === true,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`wallet-${wallet}`}
                                  className="text-sm"
                                >
                                  {wallet}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* QR Code */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="qrCodeEnabled"
                        checked={paymentSettings.qrCodeEnabled}
                        onCheckedChange={(checked) =>
                          handleInputChange("qrCodeEnabled", checked === true)
                        }
                      />
                      <Label
                        htmlFor="qrCodeEnabled"
                        className="flex items-center space-x-2"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>QR Code (QRIS)</span>
                      </Label>
                    </div>

                    <Separator />

                    {/* Retail Outlet */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="retailOutletEnabled"
                          checked={paymentSettings.retailOutletEnabled}
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "retailOutletEnabled",
                              checked === true,
                            )
                          }
                        />
                        <Label
                          htmlFor="retailOutletEnabled"
                          className="flex items-center space-x-2"
                        >
                          <Store className="h-4 w-4" />
                          <span>Retail Outlet</span>
                        </Label>
                      </div>

                      {paymentSettings.retailOutletEnabled && (
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          {Object.entries(paymentSettings.enabledOutlets).map(
                            ([outlet, enabled]) => (
                              <div
                                key={outlet}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`outlet-${outlet}`}
                                  checked={enabled}
                                  onCheckedChange={(checked) =>
                                    handleNestedChange(
                                      "enabledOutlets",
                                      outlet,
                                      checked === true,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`outlet-${outlet}`}
                                  className="text-sm"
                                >
                                  {outlet}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Fee Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Fee</CardTitle>
                    <CardDescription>
                      Configure service fees for transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="serviceFeePercentage">
                          Percentage Fee (%)
                        </Label>
                        <Input
                          id="serviceFeePercentage"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={paymentSettings.serviceFeePercentage}
                          onChange={(e) =>
                            handleInputChange(
                              "serviceFeePercentage",
                              parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="serviceFeeFixed">Fixed Fee (IDR)</Label>
                        <Input
                          id="serviceFeeFixed"
                          type="number"
                          min="0"
                          value={paymentSettings.serviceFeeFixed}
                          onChange={(e) =>
                            handleInputChange(
                              "serviceFeeFixed",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
