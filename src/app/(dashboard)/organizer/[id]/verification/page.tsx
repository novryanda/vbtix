"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { OrganizerPageWrapper } from "~/components/dashboard/organizer/organizer-page-wrapper";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Checkbox } from "~/components/ui/checkbox";
import { uploadToCloudinary } from "~/lib/upload-helpers";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { VerificationStatus } from "@prisma/client";

// Define the interface for the verification data
interface OrganizerVerification {
  id: string;
  organizerId: string;
  ktpNumber?: string;
  ktpName?: string;
  ktpAddress?: string;
  ktpImageUrl?: string;
  ktpImagePublicId?: string;
  npwpNumber?: string;
  npwpName?: string;
  npwpAddress?: string;
  npwpImageUrl?: string;
  npwpImagePublicId?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function OrganizerVerificationPage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  const { data: session, status } = useSession();

  // Debug logging
  console.log("Verification page params:", params);
  console.log("Organizer ID:", organizerId);

  // State for organizer data
  const [organizer, setOrganizer] = useState<any>(null);
  const [verification, setVerification] =
    useState<OrganizerVerification | null>(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for KTP information
  const [ktpNumber, setKtpNumber] = useState("");
  const [ktpName, setKtpName] = useState("");
  const [ktpAddress, setKtpAddress] = useState("");
  const [ktpImageFile, setKtpImageFile] = useState<File | null>(null);
  const [ktpImagePreview, setKtpImagePreview] = useState<string | null>(null);

  // State for NPWP information
  const [npwpNumber, setNpwpNumber] = useState("");
  const [npwpName, setNpwpName] = useState("");
  const [npwpAddress, setNpwpAddress] = useState("");
  const [npwpImageFile, setNpwpImageFile] = useState<File | null>(null);
  const [npwpImagePreview, setNpwpImagePreview] = useState<string | null>(null);

  // State for terms and conditions
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  // Fetch organizer data and verification status
  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (status === "loading") return;

      if (!session) {
        router.push("/login");
        return;
      }

      // Validate organizerId
      if (
        !organizerId ||
        organizerId === "events" ||
        organizerId === "undefined"
      ) {
        console.error("Invalid organizer ID:", organizerId);
        toast.error("Invalid organizer ID. Redirecting to dashboard...");
        router.push("/organizer");
        return;
      }

      try {
        setIsLoading(true);

        // Try to fetch organizer settings (may not exist for new organizers)
        try {
          const settingsResponse = await fetch(
            `/api/organizer/${organizerId}/settings`,
          );
          const settingsData = await settingsResponse.json();

          if (settingsData.success) {
            setOrganizer(settingsData.data);
          }
        } catch (error) {
          // Organizer settings may not exist yet, this is okay for new organizers
          console.log(
            "Organizer settings not found, user may not have organizer record yet",
          );
        }

        // Fetch verification status
        const verificationResponse = await fetch(
          `/api/organizer/${organizerId}/verification`,
        );
        const verificationData = await verificationResponse.json();

        // Log verification data for debugging
        console.log("Verification data from API:", verificationData);

        if (verificationData.success && verificationData.data) {
          // Handle both organizer verification and user verification requests
          if (verificationData.data.verification) {
            // Existing organizer with verification record
            setVerification(verificationData.data.verification);

            // Pre-fill form with existing data if available
            const verificationRecord = verificationData.data.verification;

            // Only load text fields from previous verification
            if (verificationRecord.ktpNumber)
              setKtpNumber(verificationRecord.ktpNumber);
            if (verificationRecord.ktpName)
              setKtpName(verificationRecord.ktpName);
            if (verificationRecord.ktpAddress)
              setKtpAddress(verificationRecord.ktpAddress);

            // Only set image previews if verification is not rejected
            if (
              verificationRecord.ktpImageUrl &&
              verificationRecord.status !== "REJECTED"
            )
              setKtpImagePreview(verificationRecord.ktpImageUrl);

            if (verificationRecord.npwpNumber)
              setNpwpNumber(verificationRecord.npwpNumber);
            if (verificationRecord.npwpName)
              setNpwpName(verificationRecord.npwpName);
            if (verificationRecord.npwpAddress)
              setNpwpAddress(verificationRecord.npwpAddress);
            if (
              verificationRecord.npwpImageUrl &&
              verificationRecord.status !== "REJECTED"
            )
              setNpwpImagePreview(verificationRecord.npwpImageUrl);

            if (verificationRecord.termsAccepted)
              setTermsAccepted(verificationRecord.termsAccepted);
          } else if (verificationData.data.approval) {
            // User without organizer record but with verification request
            const approval = verificationData.data.approval;

            // Try to parse verification data from approval notes
            try {
              const parsedNotes = JSON.parse(approval.notes);
              if (parsedNotes.verificationData) {
                const verificationData = parsedNotes.verificationData;

                if (verificationData.ktpNumber)
                  setKtpNumber(verificationData.ktpNumber);
                if (verificationData.ktpName)
                  setKtpName(verificationData.ktpName);
                if (verificationData.ktpAddress)
                  setKtpAddress(verificationData.ktpAddress);
                if (verificationData.npwpNumber)
                  setNpwpNumber(verificationData.npwpNumber);
                if (verificationData.npwpName)
                  setNpwpName(verificationData.npwpName);
                if (verificationData.npwpAddress)
                  setNpwpAddress(verificationData.npwpAddress);
                if (verificationData.termsAccepted)
                  setTermsAccepted(verificationData.termsAccepted);
              }
            } catch (error) {
              console.log(
                "Could not parse verification data from approval notes",
              );
            }
          }

          // Check if there's a pending request flag
          console.log("Pending request check:", {
            hasPendingRequest: verificationData.data.hasPendingRequest,
            verificationStatus: verificationData.data.verification?.status,
          });

          if (verificationData.data.hasPendingRequest) {
            // Only set hasPendingRequest to true if the verification is not rejected
            // This allows resubmission after rejection
            if (
              !verificationData.data.verification ||
              verificationData.data.verification.status !== "REJECTED"
            ) {
              console.log("Setting hasPendingRequest to true");
              setHasPendingRequest(true);
            } else {
              console.log(
                "Not setting hasPendingRequest because verification is REJECTED",
              );
            }

            // If there's a pending request but no verification with PENDING status,
            // and the verification is not REJECTED, update the verification status to PENDING
            if (
              (!verificationData.data.verification ||
                verificationData.data.verification.status !== "PENDING") &&
              (!verificationData.data.verification ||
                verificationData.data.verification.status !== "REJECTED")
            ) {
              if (verificationData.data.verification) {
                // If we have a verification record, update its status
                setVerification({
                  ...verificationData.data.verification,
                  status: "PENDING",
                  submittedAt:
                    verificationData.data.approval?.submittedAt ||
                    new Date().toISOString(),
                });
              } else {
                // If no verification record exists yet but there's a pending approval,
                // create a minimal verification object with PENDING status
                setVerification({
                  id: "pending-verification",
                  organizerId: verificationData.data.id,
                  status: "PENDING",
                  termsAccepted: true,
                  submittedAt:
                    verificationData.data.approval?.submittedAt ||
                    new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching organizer data:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizerData();
  }, [organizerId, router, session, status]);

  // Handle KTP image file selection
  const handleKtpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type (image files only)
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG or PNG image");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setKtpImageFile(file);

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setKtpImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle NPWP image file selection
  const handleNpwpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type (image files only)
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG or PNG image");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setNpwpImageFile(file);

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setNpwpImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!ktpNumber) {
      toast.error("KTP Number is required");
      return;
    }
    if (!ktpName) {
      toast.error("Name as per KTP is required");
      return;
    }
    if (!ktpAddress) {
      toast.error("Address as per KTP is required");
      return;
    }

    // If verification was rejected, require new KTP image or existing preview
    if (
      verification?.status === "REJECTED" &&
      !ktpImageFile &&
      !ktpImagePreview
    ) {
      toast.error("Please upload a new KTP Image");
      return;
    } else if (!ktpImageFile && !ktpImagePreview) {
      toast.error("KTP Image is required");
      return;
    }

    if (!termsAccepted) {
      toast.error("You must accept the terms and conditions");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);

      let ktpImageResult = null;
      let npwpImageResult = null;

      // Upload KTP image to Cloudinary if a new file is selected
      if (ktpImageFile) {
        ktpImageResult = await uploadToCloudinary(ktpImageFile);
        setUploadProgress(40);
      }

      // Upload NPWP image to Cloudinary if a new file is selected
      if (npwpImageFile) {
        npwpImageResult = await uploadToCloudinary(npwpImageFile);
        setUploadProgress(70);
      }

      // Prepare verification data
      const verificationData = {
        ktpNumber,
        ktpName,
        ktpAddress,
        // For rejected verifications, only use the newly uploaded image
        ktpImageUrl:
          verification?.status === "REJECTED"
            ? ktpImageResult
              ? ktpImageResult.url
              : ktpImagePreview && ktpImagePreview.trim() !== ""
                ? ktpImagePreview
                : ""
            : ktpImageResult
              ? ktpImageResult.url
              : ktpImagePreview && ktpImagePreview.trim() !== ""
                ? ktpImagePreview
                : "",
        ktpImagePublicId: ktpImageResult ? ktpImageResult.publicId : undefined,
        npwpNumber: npwpNumber || undefined,
        npwpName: npwpName || undefined,
        npwpAddress: npwpAddress || undefined,
        // For rejected verifications, only use the newly uploaded NPWP image if provided
        npwpImageUrl:
          verification?.status === "REJECTED"
            ? npwpImageResult
              ? npwpImageResult.url
              : npwpImagePreview && npwpImagePreview.trim() !== ""
                ? npwpImagePreview
                : undefined
            : npwpImageResult
              ? npwpImageResult.url
              : npwpImagePreview && npwpImagePreview.trim() !== ""
                ? npwpImagePreview
                : undefined,
        npwpImagePublicId: npwpImageResult
          ? npwpImageResult.publicId
          : undefined,
        termsAccepted,
        notes,
      };

      // Log verification data for debugging
      console.log("Submitting verification data:", verificationData);
      console.log("Current verification status:", verification?.status);
      console.log("Has pending request:", hasPendingRequest);
      console.log("Organizer ID for API call:", organizerId);

      // Validate organizerId before making API call
      if (
        !organizerId ||
        organizerId === "events" ||
        organizerId === "undefined"
      ) {
        toast.error(
          "Invalid organizer ID. Please refresh the page and try again.",
        );
        return;
      }

      // Submit verification data
      const response = await fetch(
        `/api/organizer/${organizerId}/verification`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verificationData),
        },
      );

      setUploadProgress(100);
      const data = await response.json();

      // Log response for debugging
      console.log("Verification submission response:", data);

      if (data.success) {
        toast.success("Verification information submitted successfully");

        // Update local state with the verification data
        if (data.data.verification) {
          setVerification(data.data.verification);
        } else if (data.data) {
          // Create a verification object with PENDING status if not returned directly
          setVerification({
            id: data.data.id || "pending-verification",
            organizerId: data.data.id,
            status: "PENDING",
            termsAccepted: true,
            submittedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Clear file selection but keep form data
        setKtpImageFile(null);
        setNpwpImageFile(null);

        // Refresh the page to show the updated status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Check if there are validation errors
        if (data.details && typeof data.details === "object") {
          // Display specific validation errors
          if (Array.isArray(data.details.errors)) {
            data.details.errors.forEach((err: any) => {
              if (err.message) {
                toast.error(`Validation error: ${err.message}`);
              }
            });
          } else {
            // Display general error message
            toast.error(
              data.error || "Failed to submit verification information",
            );
          }
        } else {
          toast.error(
            data.error || "Failed to submit verification information",
          );
        }

        // If there's a pending verification, update the UI to reflect that
        if (data.error?.includes("pending verification request")) {
          // Only set hasPendingRequest to true if the verification is not rejected
          // This allows resubmission after rejection
          if (!verification || verification.status !== "REJECTED") {
            setHasPendingRequest(true);
          }

          // Set verification status to PENDING only if not rejected
          if (!verification || verification.status !== "REJECTED") {
            setVerification((prev) => {
              if (!prev) {
                return {
                  id: "pending-verification",
                  organizerId: organizerId,
                  status: "PENDING",
                  termsAccepted: true,
                  submittedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
              }
              return {
                ...prev,
                status: "PENDING",
                submittedAt: prev.submittedAt || new Date().toISOString(),
              };
            });

            // Refresh the page to get the latest verification status
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            // If verification was rejected, show a more specific error message
            toast.error(
              "Please fix the issues mentioned in the rejection reason and try again.",
            );
          }
        }
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    router.push(`/organizer/${organizerId}/dashboard`);
  };

  // Helper function to determine if form fields should be disabled
  const isFormDisabled = () => {
    // Allow editing if verification was rejected
    if (verification?.status === "REJECTED") {
      return isSubmitting;
    }

    // Otherwise, disable if submitting, pending, or has pending request
    // Allow form editing if:
    // 1. Not submitting AND
    // 2. Not in PENDING status AND
    // 3. Either no pending request OR verification is REJECTED
    return (
      isSubmitting ||
      verification?.status === "PENDING" ||
      (hasPendingRequest &&
        (verification?.status === undefined ||
          verification.status === "APPROVED"))
    );
  };

  // Render verification status badge
  const renderVerificationStatus = () => {
    if (!organizer) return null;

    if (organizer.verified) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      );
    } else if (verification?.status === "PENDING") {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          <Clock className="mr-1 h-3 w-3" />
          Pending Review
        </Badge>
      );
    } else if (verification?.status === "REJECTED") {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          <XCircle className="mr-1 h-3 w-3" />
          Not Verified
        </Badge>
      );
    }
  };

  return (
    <OrganizerRoute>
      <OrganizerPageWrapper>
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Organizer Verification</h1>
          <div className="ml-4">{renderVerificationStatus()}</div>
        </div>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Submit your business documents to verify your organizer
                  account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {organizer?.verified ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Verified Account</AlertTitle>
                    <AlertDescription>
                      Your organizer account has been verified. You can now
                      create and publish events.
                    </AlertDescription>
                  </Alert>
                ) : verification?.status === "PENDING" ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <AlertTitle>Verification Pending</AlertTitle>
                    <AlertDescription>
                      Your verification information has been submitted and is
                      pending review by our team. This process typically takes
                      1-3 business days. You cannot submit another verification
                      request until this one is reviewed by an admin.
                    </AlertDescription>
                  </Alert>
                ) : verification?.status === "REJECTED" ? (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle>Verification Rejected</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                        Your verification request has been rejected. Reason:{" "}
                        <span className="font-medium">
                          {verification.rejectionReason || "No reason provided"}
                        </span>
                        .
                      </p>
                      <p>
                        You can now edit your information below and resubmit
                        your verification request. Please make sure to address
                        the issues mentioned in the rejection reason.
                      </p>
                      <div className="mt-2 rounded-md bg-red-100 p-3">
                        <p className="font-medium text-red-800">Important:</p>
                        <p className="text-red-700">
                          You must upload a new KTP image to resubmit your
                          verification request. Previous images have been
                          cleared for security reasons.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Verification Required</AlertTitle>
                    <AlertDescription>
                      To create and publish events, you need to verify your
                      organizer account. Please submit your KTP and NPWP
                      information below. Once submitted, you will need to wait
                      for admin review before you can make changes or submit
                      another request.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {!organizer?.verified && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Verification Information</CardTitle>
                  <CardDescription>
                    {verification?.status === "PENDING" ||
                    (hasPendingRequest && verification?.status !== "REJECTED")
                      ? "Your verification is pending review. You cannot make changes until it is reviewed."
                      : verification?.status === "REJECTED"
                        ? "Your verification was rejected. Please update your information, upload new images, and resubmit your request."
                        : "Please provide your KTP and NPWP information to verify your identity and business."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* KTP Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">KTP Information</h3>
                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="ktpNumber">
                              KTP Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="ktpNumber"
                              placeholder="Enter your KTP number"
                              value={ktpNumber}
                              onChange={(e) => setKtpNumber(e.target.value)}
                              disabled={isFormDisabled()}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ktpName">
                              Name as per KTP{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="ktpName"
                              placeholder="Enter your name as shown on KTP"
                              value={ktpName}
                              onChange={(e) => setKtpName(e.target.value)}
                              disabled={isFormDisabled()}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ktpAddress">
                            Address as per KTP{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="ktpAddress"
                            placeholder="Enter your address as shown on KTP"
                            value={ktpAddress}
                            onChange={(e) => setKtpAddress(e.target.value)}
                            disabled={isFormDisabled()}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ktpImage">
                            KTP Image <span className="text-red-500">*</span>
                          </Label>
                          <div className="mt-2">
                            <div className="flex w-full items-center justify-center">
                              <label
                                htmlFor="ktp-image-upload"
                                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {ktpImagePreview ? (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src={ktpImagePreview}
                                        alt="KTP Preview"
                                        className="mb-3 h-32 object-contain"
                                      />
                                      <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">
                                          {ktpImageFile?.name || "KTP Image"}
                                        </span>
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {ktpImageFile?.size
                                          ? (
                                              ktpImageFile.size /
                                              (1024 * 1024)
                                            ).toFixed(2)
                                          : ""}{" "}
                                        {ktpImageFile?.size ? "MB" : ""}
                                      </p>
                                    </div>
                                  ) : (
                                    <>
                                      <Upload className="mb-3 h-10 w-10 text-gray-400" />
                                      <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">
                                          Click to upload
                                        </span>{" "}
                                        or drag and drop
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        JPG or PNG image (MAX. 5MB)
                                      </p>
                                    </>
                                  )}
                                </div>
                                <input
                                  id="ktp-image-upload"
                                  type="file"
                                  className="hidden"
                                  onChange={handleKtpImageChange}
                                  accept="image/jpeg,image/png,image/jpg"
                                  disabled={isFormDisabled()}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* NPWP Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          NPWP Information (Optional)
                        </h3>
                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="npwpNumber">NPWP Number</Label>
                            <Input
                              id="npwpNumber"
                              placeholder="Enter your NPWP number"
                              value={npwpNumber}
                              onChange={(e) => setNpwpNumber(e.target.value)}
                              disabled={
                                isSubmitting ||
                                verification?.status === "PENDING" ||
                                hasPendingRequest
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="npwpName">Name as per NPWP</Label>
                            <Input
                              id="npwpName"
                              placeholder="Enter your name as shown on NPWP"
                              value={npwpName}
                              onChange={(e) => setNpwpName(e.target.value)}
                              disabled={
                                isSubmitting ||
                                verification?.status === "PENDING" ||
                                (hasPendingRequest &&
                                  (verification?.status === undefined ||
                                    verification.status === "APPROVED"))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="npwpAddress">
                            Address as per NPWP
                          </Label>
                          <Textarea
                            id="npwpAddress"
                            placeholder="Enter your address as shown on NPWP"
                            value={npwpAddress}
                            onChange={(e) => setNpwpAddress(e.target.value)}
                            disabled={
                              isSubmitting ||
                              verification?.status === "PENDING" ||
                              (hasPendingRequest &&
                                (verification?.status === undefined ||
                                  verification.status === "APPROVED"))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="npwpImage">NPWP Image</Label>
                          <div className="mt-2">
                            <div className="flex w-full items-center justify-center">
                              <label
                                htmlFor="npwp-image-upload"
                                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {npwpImagePreview ? (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src={npwpImagePreview}
                                        alt="NPWP Preview"
                                        className="mb-3 h-32 object-contain"
                                      />
                                      <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">
                                          {npwpImageFile?.name || "NPWP Image"}
                                        </span>
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {npwpImageFile?.size
                                          ? (
                                              npwpImageFile.size /
                                              (1024 * 1024)
                                            ).toFixed(2)
                                          : ""}{" "}
                                        {npwpImageFile?.size ? "MB" : ""}
                                      </p>
                                    </div>
                                  ) : (
                                    <>
                                      <Upload className="mb-3 h-10 w-10 text-gray-400" />
                                      <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">
                                          Click to upload
                                        </span>{" "}
                                        or drag and drop
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        JPG or PNG image (MAX. 5MB)
                                      </p>
                                    </>
                                  )}
                                </div>
                                <input
                                  id="npwp-image-upload"
                                  type="file"
                                  className="hidden"
                                  onChange={handleNpwpImageChange}
                                  accept="image/jpeg,image/png,image/jpg"
                                  disabled={
                                    isSubmitting ||
                                    verification?.status === "PENDING" ||
                                    (hasPendingRequest &&
                                      (verification?.status === undefined ||
                                        verification.status === "APPROVED"))
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Additional Information
                        </h3>
                        <Separator />

                        <div className="space-y-2">
                          <Label htmlFor="notes">
                            Additional Notes (Optional)
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any additional information that might help with the verification process"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isFormDisabled()}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) =>
                              setTermsAccepted(checked === true)
                            }
                            disabled={isFormDisabled()}
                          />
                          <Label htmlFor="terms" className="text-sm">
                            I confirm that all information provided is true and
                            accurate. I understand that providing false
                            information may result in rejection of my
                            verification request.
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {verification?.status === "REJECTED" && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Reset form fields
                              setKtpNumber("");
                              setKtpName("");
                              setKtpAddress("");
                              setKtpImageFile(null);
                              setKtpImagePreview(null);
                              setNpwpNumber("");
                              setNpwpName("");
                              setNpwpAddress("");
                              setNpwpImageFile(null);
                              setNpwpImagePreview(null);
                              setNotes("");
                              setTermsAccepted(false);

                              toast.success("Form has been reset");
                            }}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            Reset Form
                          </Button>
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={
                          // Disable if submitting
                          isSubmitting ||
                          // Disable if pending and not rejected
                          verification?.status === "PENDING" ||
                          // Disable if has pending request and not rejected
                          (hasPendingRequest &&
                            verification?.status !== "REJECTED") ||
                          // Disable if required fields are missing
                          !ktpNumber ||
                          !ktpName ||
                          !ktpAddress ||
                          (!ktpImageFile && !ktpImagePreview) ||
                          !termsAccepted
                        }
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting... {uploadProgress}%
                          </>
                        ) : verification?.status === "PENDING" ||
                          (hasPendingRequest &&
                            verification?.status !== "REJECTED") ? (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Verification Pending
                          </>
                        ) : verification?.status === "REJECTED" ? (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Resubmit for Verification
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit for Verification
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </OrganizerPageWrapper>
    </OrganizerRoute>
  );
}
