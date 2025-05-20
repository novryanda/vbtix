"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  UserX,
  Calendar,
  Mail,
  CreditCard,
  Globe,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  Shield,
} from "lucide-react";
import {
  useAdminOrganizerDetail,
  useVerifyOrganizer,
  useOrganizerVerificationHistory,
} from "~/lib/api/hooks/admin";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { formatDate } from "~/lib/utils";

export default function OrganizerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;

  // State for verification dialog
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationAction, setVerificationAction] = useState<boolean>(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  // Fetch organizer details
  const { organizer, error, isLoading, mutate } =
    useAdminOrganizerDetail(organizerId);

  // Fetch verification history
  const { verificationHistory, isLoading: isLoadingHistory } =
    useOrganizerVerificationHistory(organizerId);

  // Verify organizer hook
  const { verifyOrganizer } = useVerifyOrganizer();

  // Check for URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const tab = searchParams.get("tab");
  const action = searchParams.get("action");

  // Handle URL parameters for verification actions
  useEffect(() => {
    if (tab === "verification" && action && organizer) {
      if (action === "approve") {
        setVerificationAction(true);
        setIsVerifyDialogOpen(true);
      } else if (action === "reject") {
        setVerificationAction(false);
        setIsVerifyDialogOpen(true);
      }

      // Clear the action parameter from URL to prevent dialog from reopening on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("action");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [tab, action, organizer]);

  // Handle verification
  const handleVerify = async () => {
    try {
      // Check if verification documents exist when trying to verify
      if (verificationAction && !organizer.verification) {
        console.error("Cannot verify organizer without verification documents");
        return;
      }

      await verifyOrganizer(organizerId, verificationAction, verificationNotes);
      setIsVerifyDialogOpen(false);
      setVerificationNotes("");
      mutate(); // Refresh data after verification
    } catch (error) {
      console.error("Error verifying organizer:", error);
    }
  };

  // Handle back button
  const handleBack = () => {
    router.push("/admin/organizers");
  };

  // Format social media links
  const formatSocialMediaLinks = (
    socialMedia: Record<string, any> | null | undefined,
  ) => {
    if (!socialMedia) return [];

    const links = [];
    if (socialMedia.website)
      links.push({ name: "Website", url: socialMedia.website, icon: Globe });
    if (socialMedia.facebook)
      links.push({
        name: "Facebook",
        url: socialMedia.facebook,
        icon: Globe,
      });
    if (socialMedia.twitter)
      links.push({ name: "Twitter", url: socialMedia.twitter, icon: Globe });
    if (socialMedia.instagram)
      links.push({
        name: "Instagram",
        url: socialMedia.instagram,
        icon: Globe,
      });
    if (socialMedia.linkedin)
      links.push({
        name: "LinkedIn",
        url: socialMedia.linkedin,
        icon: Globe,
      });
    if (socialMedia.youtube)
      links.push({ name: "YouTube", url: socialMedia.youtube, icon: Globe });

    return links;
  };

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the organizer details. Please try
              refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading || !organizer) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizers
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  // Format dates
  const createdAt = formatDate(new Date(organizer.createdAt));
  const updatedAt = formatDate(new Date(organizer.updatedAt));

  // Social media links
  const socialMediaLinks = formatSocialMediaLinks(organizer.socialMedia);

  return (
    <div className="px-4 lg:px-6">
      {/* Back button */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Organizers
        </Button>
      </div>

      {/* Header */}
      <div className="mt-6 flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">{organizer.orgName}</h1>
          <p className="text-muted-foreground">
            {organizer.legalName || "No legal name provided"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {organizer.verified ? (
            <>
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
              <Dialog
                open={isVerifyDialogOpen}
                onOpenChange={setIsVerifyDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-500"
                    onClick={() => setVerificationAction(false)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Revoke Verification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Revoke Verification</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to revoke verification for this
                      organizer? This will prevent them from creating new events
                      until re-verified.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <Label htmlFor="revocation-notes" className="mb-2 block">
                      Revocation Reason
                    </Label>
                    <Textarea
                      id="revocation-notes"
                      placeholder="Add notes about why verification is being revoked (required)"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                    <p className="text-muted-foreground mt-2 text-xs">
                      Please provide a reason for revoking verification. This
                      will be recorded in the verification history and may be
                      visible to the organizer.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsVerifyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleVerify}
                      disabled={!verificationNotes.trim()}
                    >
                      Revoke Verification
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="border-amber-500 text-amber-500"
              >
                <XCircle className="mr-1 h-3 w-3" />
                Unverified
              </Badge>
              <Dialog
                open={isVerifyDialogOpen}
                onOpenChange={setIsVerifyDialogOpen}
              >
                <DialogContent className="max-w-2xl overflow-y-auto sm:max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>
                      {verificationAction ? "Approve" : "Reject"} Verification
                      Request
                    </DialogTitle>
                    <DialogDescription>
                      {verificationAction
                        ? "Are you sure you want to approve this verification request? This will allow the organizer to create and publish events."
                        : "Are you sure you want to reject this verification request? The organizer will need to submit a new request with updated information."}
                    </DialogDescription>
                  </DialogHeader>

                  {organizer.verification && (
                    <div className="my-4 rounded-md border p-3 sm:p-4">
                      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-medium">Verification Documents</h4>
                        {organizer.verification.status === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="w-fit border-amber-500 text-amber-500"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Pending Review
                          </Badge>
                        )}
                      </div>

                      {organizer.verification.submittedAt && (
                        <div className="mb-3 text-sm sm:mb-4">
                          <span className="font-medium">Submitted:</span>{" "}
                          <span className="text-muted-foreground">
                            {formatDate(
                              new Date(organizer.verification.submittedAt),
                            )}
                          </span>
                        </div>
                      )}

                      <div className="space-y-5 sm:space-y-6">
                        {/* KTP Information */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium">
                            KTP Information
                          </h5>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium">KTP Number</p>
                              <p className="text-muted-foreground text-sm break-words">
                                {organizer.verification.ktpNumber ||
                                  "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">
                                Name as per KTP
                              </p>
                              <p className="text-muted-foreground text-sm break-words">
                                {organizer.verification.ktpName ||
                                  "Not provided"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium">
                              Address as per KTP
                            </p>
                            <p className="text-muted-foreground text-sm break-words">
                              {organizer.verification.ktpAddress ||
                                "Not provided"}
                            </p>
                          </div>

                          {organizer.verification.ktpImageUrl && (
                            <div>
                              <p className="mb-1 text-xs font-medium">
                                KTP Image
                              </p>
                              <div className="overflow-hidden rounded-md border">
                                <a
                                  href={organizer.verification.ktpImageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={organizer.verification.ktpImageUrl}
                                    alt="KTP Document"
                                    className="h-auto max-h-[150px] w-full object-contain sm:max-h-[200px]"
                                  />
                                  <div className="bg-muted/10 hover:bg-muted/20 text-muted-foreground p-1 text-center text-xs">
                                    <span>Click to view full image</span>
                                  </div>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* NPWP Information (if provided) */}
                        {(organizer.verification.npwpNumber ||
                          organizer.verification.npwpImageUrl) && (
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium">
                              NPWP Information
                            </h5>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs font-medium">
                                  NPWP Number
                                </p>
                                <p className="text-muted-foreground text-sm break-words">
                                  {organizer.verification.npwpNumber ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium">
                                  Name as per NPWP
                                </p>
                                <p className="text-muted-foreground text-sm break-words">
                                  {organizer.verification.npwpName ||
                                    "Not provided"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium">
                                Address as per NPWP
                              </p>
                              <p className="text-muted-foreground text-sm break-words">
                                {organizer.verification.npwpAddress ||
                                  "Not provided"}
                              </p>
                            </div>

                            {organizer.verification.npwpImageUrl && (
                              <div>
                                <p className="mb-1 text-xs font-medium">
                                  NPWP Image
                                </p>
                                <div className="overflow-hidden rounded-md border">
                                  <a
                                    href={organizer.verification.npwpImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={organizer.verification.npwpImageUrl}
                                      alt="NPWP Document"
                                      className="h-auto max-h-[150px] w-full object-contain sm:max-h-[200px]"
                                    />
                                    <div className="bg-muted/10 hover:bg-muted/20 text-muted-foreground p-1 text-center text-xs">
                                      <span>Click to view full image</span>
                                    </div>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm">
                          Please review the documents carefully before making a
                          decision.
                          {organizer.verification.status === "PENDING" &&
                            " The organizer is waiting for your response and cannot submit another verification request until this one is reviewed."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="py-3 sm:py-4">
                    <Label htmlFor="verification-notes" className="mb-2 block">
                      {verificationAction
                        ? "Approval Notes"
                        : "Rejection Reason"}
                    </Label>
                    <Textarea
                      id="verification-notes"
                      placeholder={
                        verificationAction
                          ? "Add notes about approval (optional)"
                          : "Add reason for rejection (required)"
                      }
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="min-h-[80px] sm:min-h-[100px]"
                      required={!verificationAction}
                    />
                    <p className="text-muted-foreground mt-2 text-xs">
                      {verificationAction
                        ? "These notes will be recorded in the verification history and may be visible to the organizer."
                        : "Please provide a clear reason for rejection. This will be shown to the organizer so they can address the issues before submitting again."}
                    </p>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setIsVerifyDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant={verificationAction ? "default" : "destructive"}
                      onClick={handleVerify}
                      disabled={
                        !verificationAction && !verificationNotes.trim()
                      }
                      className="w-full sm:w-auto"
                    >
                      {verificationAction
                        ? "Approve Verification"
                        : "Reject Verification"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={tab === "verification" ? "verification" : "profile"}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="verification" className="relative">
            Verification
            {organizer.verification &&
              organizer.verification.status === "PENDING" && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                </span>
              )}
          </TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Details about the organizer and their account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Organization Name</p>
                  <p className="text-muted-foreground">{organizer.orgName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Legal Name</p>
                  <p className="text-muted-foreground">
                    {organizer.legalName || "Not provided"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">NPWP</p>
                  <p className="text-muted-foreground">
                    {organizer.npwp || "Not provided"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Verification Status</p>
                  <div>
                    {organizer.verified ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-500"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">User Information</p>
                <div className="flex items-center space-x-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    {organizer.user.image ? (
                      <Image
                        src={organizer.user.image}
                        alt={organizer.user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center">
                        {organizer.user.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {organizer.user.name || "No name"}
                    </p>
                    <div className="text-muted-foreground flex items-center">
                      <Mail className="mr-1 h-3 w-3" />
                      {organizer.user.email}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Dates</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      Created: {createdAt}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      Last Updated: {updatedAt}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Social media profiles and online presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialMediaLinks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {socialMediaLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-muted flex items-center space-x-2 rounded-md border p-3"
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No social media links provided
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Current verification status and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {organizer.verified ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-500"
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                  <span className="text-sm">
                    {organizer.verified
                      ? "This organizer is verified and can create events"
                      : "This organizer is not verified and cannot create events"}
                  </span>
                </div>
                <div>
                  {organizer.verified ? (
                    <Button
                      variant="outline"
                      className="border-amber-500 text-amber-500"
                      onClick={() => {
                        setVerificationAction(false);
                        setIsVerifyDialogOpen(true);
                      }}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Revoke Verification
                    </Button>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {!organizer.verification
                        ? "Verification documents required"
                        : "Check verification documents tab for approval options"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>
                Documents provided for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizer.verification ? (
                <div className="space-y-6">
                  {/* KTP Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">KTP Information</h3>
                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">KTP Number</p>
                        <p className="text-muted-foreground">
                          {organizer.verification.ktpNumber || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Name as per KTP</p>
                        <p className="text-muted-foreground">
                          {organizer.verification.ktpName || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Address as per KTP</p>
                      <p className="text-muted-foreground">
                        {organizer.verification.ktpAddress || "Not provided"}
                      </p>
                    </div>

                    {organizer.verification.ktpImageUrl && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">KTP Image</p>
                        <div className="overflow-hidden rounded-md border">
                          <a
                            href={organizer.verification.ktpImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block"
                          >
                            <img
                              src={organizer.verification.ktpImageUrl}
                              alt="KTP Document"
                              className="h-auto max-h-[200px] w-full object-contain sm:max-h-[300px]"
                            />
                            <div className="bg-muted/10 hover:bg-muted/20 text-muted-foreground p-1 text-center text-xs">
                              <span>Click to view full image</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* NPWP Information (if provided) */}
                  {(organizer.verification.npwpNumber ||
                    organizer.verification.npwpImageUrl) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">NPWP Information</h3>
                      <Separator />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">NPWP Number</p>
                          <p className="text-muted-foreground">
                            {organizer.verification.npwpNumber ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Name as per NPWP
                          </p>
                          <p className="text-muted-foreground">
                            {organizer.verification.npwpName || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Address as per NPWP
                        </p>
                        <p className="text-muted-foreground">
                          {organizer.verification.npwpAddress || "Not provided"}
                        </p>
                      </div>

                      {organizer.verification.npwpImageUrl && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">NPWP Image</p>
                          <div className="overflow-hidden rounded-md border">
                            <a
                              href={organizer.verification.npwpImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative block"
                            >
                              <img
                                src={organizer.verification.npwpImageUrl}
                                alt="NPWP Document"
                                className="h-auto max-h-[200px] w-full object-contain sm:max-h-[300px]"
                              />
                              <div className="bg-muted/10 hover:bg-muted/20 text-muted-foreground p-1 text-center text-xs">
                                <span>Click to view full image</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">
                        Verification Status:
                      </p>
                      <Badge
                        variant={
                          organizer.verification.status === "APPROVED"
                            ? "default"
                            : organizer.verification.status === "REJECTED"
                              ? "destructive"
                              : "outline"
                        }
                        className={
                          organizer.verification.status === "PENDING"
                            ? "border-amber-500 text-amber-500"
                            : ""
                        }
                      >
                        {organizer.verification.status === "APPROVED" && (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        )}
                        {organizer.verification.status === "REJECTED" && (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {organizer.verification.status === "PENDING" && (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {organizer.verification.status}
                      </Badge>
                    </div>

                    {organizer.verification.submittedAt && (
                      <p className="text-muted-foreground text-sm">
                        Submitted:{" "}
                        {formatDate(
                          new Date(organizer.verification.submittedAt),
                        )}
                      </p>
                    )}

                    {organizer.verification.reviewedAt && (
                      <p className="text-muted-foreground text-sm">
                        Reviewed:{" "}
                        {formatDate(
                          new Date(organizer.verification.reviewedAt),
                        )}
                      </p>
                    )}

                    {organizer.verification.rejectionReason && (
                      <div className="mt-2 rounded-md bg-red-50 p-3 text-sm">
                        <p className="font-medium text-red-800">
                          Rejection Reason:
                        </p>
                        <p className="text-red-700">
                          {organizer.verification.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Pending Verification Actions */}
                    {organizer.verification.status === "PENDING" && (
                      <div className="mt-4 flex flex-col space-y-4 rounded-md bg-amber-50 p-3 sm:p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-amber-500" />
                          <h4 className="text-base font-medium text-amber-800">
                            Pending Verification Request
                          </h4>
                        </div>
                        <p className="text-sm text-amber-700">
                          This organizer has submitted verification documents
                          and is waiting for your review. Please review the
                          documents carefully before approving or rejecting the
                          request.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                          <Button
                            variant="outline"
                            className="w-full border-green-500 text-green-500 hover:bg-green-50 sm:w-auto"
                            onClick={() => {
                              setVerificationAction(true);
                              setIsVerifyDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Verification
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-red-500 text-red-500 hover:bg-red-50 sm:w-auto"
                            onClick={() => {
                              setVerificationAction(false);
                              setIsVerifyDialogOpen(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Verification
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="text-muted-foreground mb-2 h-8 w-8" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No verification documents
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    This organizer hasn't submitted any verification documents
                    yet.
                  </p>
                  <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                    <p className="font-medium">
                      Verification documents required
                    </p>
                    <p className="mt-1 text-amber-700">
                      The organizer cannot be verified until they submit the
                      required verification documents.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification History */}
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>
                History of verification requests and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : verificationHistory && verificationHistory.length > 0 ? (
                <div className="space-y-4">
                  {verificationHistory.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {item.status === "APPROVED" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approved
                            </Badge>
                          ) : item.status === "REJECTED" ? (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Rejected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-500"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                          <span className="text-sm font-medium">
                            {item.formattedCreatedAt}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="bg-muted mb-2 rounded-md p-3 text-sm">
                          {item.notes}
                        </div>
                      )}

                      <div className="text-muted-foreground grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                        {item.submitter && (
                          <div className="flex items-center space-x-1">
                            <span>Submitted by:</span>
                            <span className="font-medium">
                              {item.submitter.name || item.submitter.email}
                            </span>
                          </div>
                        )}
                        {item.reviewer && (
                          <div className="flex items-center space-x-1">
                            <span>Reviewed by:</span>
                            <span className="font-medium">
                              {item.reviewer.name || item.reviewer.email}
                            </span>
                          </div>
                        )}
                        {item.formattedSubmittedAt && (
                          <div className="flex items-center space-x-1">
                            <span>Submitted at:</span>
                            <span className="font-medium">
                              {item.formattedSubmittedAt}
                            </span>
                          </div>
                        )}
                        {item.formattedReviewedAt && (
                          <div className="flex items-center space-x-1">
                            <span>Reviewed at:</span>
                            <span className="font-medium">
                              {item.formattedReviewedAt}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Shield className="text-muted-foreground mb-2 h-8 w-8" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No verification history
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    There is no verification history for this organizer yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Events created by this organizer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizer.events && organizer.events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Tickets Sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizer.events &&
                      organizer.events.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {event.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                event.status === "PUBLISHED"
                                  ? "default"
                                  : event.status === "DRAFT"
                                    ? "outline"
                                    : event.status === "CANCELLED"
                                      ? "destructive"
                                      : "secondary"
                              }
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(event.startDate))}
                          </TableCell>
                          <TableCell>{event.venue}</TableCell>
                          <TableCell>{event.ticketsSold || 0}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Calendar className="text-muted-foreground mb-2 h-8 w-8" />
                  <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
                  <p className="text-muted-foreground text-sm">
                    This organizer hasn't created any events yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          {/* Bank Account */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Account</CardTitle>
              <CardDescription>
                Bank account information for payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizer.bankAccount ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Bank Name</p>
                      <p className="text-muted-foreground">
                        {organizer.bankAccount.bankName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Account Name</p>
                      <p className="text-muted-foreground">
                        {organizer.bankAccount.accountName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Account Number</p>
                      <p className="text-muted-foreground">
                        {organizer.bankAccount.accountNumber}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Branch</p>
                      <p className="text-muted-foreground">
                        {organizer.bankAccount.branch || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <CreditCard className="text-muted-foreground mb-2 h-8 w-8" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No bank account
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    This organizer hasn't added bank account information yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Overview of sales and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <TrendingUp className="text-muted-foreground mb-2 h-8 w-8" />
                <h3 className="mb-2 text-lg font-semibold">
                  Sales data not available
                </h3>
                <p className="text-muted-foreground text-sm">
                  Detailed sales information will be implemented in a future
                  update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
