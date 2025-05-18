"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  CreditCard,
  Globe,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  useAdminOrganizerDetail,
  useVerifyOrganizer,
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

  // Verify organizer hook
  const { verifyOrganizer } = useVerifyOrganizer();

  // Handle verification
  const handleVerify = async () => {
    try {
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Revoke Verification</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to revoke verification for this
                      organizer? This will prevent them from creating new events
                      until re-verified.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Add notes about why verification is being revoked (optional)"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsVerifyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleVerify}>
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
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500"
                    onClick={() => setVerificationAction(true)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Verify Organizer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verify Organizer</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to verify this organizer? This will
                      allow them to create and publish events.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Add notes about verification (optional)"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsVerifyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="default" onClick={handleVerify}>
                      Verify Organizer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
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

          {/* Verification Documents */}
          {organizer.verificationDocs && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>
                  Documents provided for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={organizer.verificationDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-muted flex items-center space-x-2 rounded-md border p-3"
                >
                  <Calendar className="h-5 w-5" />
                  <span>View Verification Documents</span>
                </a>
              </CardContent>
            </Card>
          )}
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
