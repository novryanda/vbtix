"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Edit,
  Save,
  Lock,
  Loader2,
  Building,
  CreditCard,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { OrganizerRoute } from "~/components/auth/organizer-route";

// User profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  organizer?: {
    id: string;
    orgName: string;
    legalName: string | null;
    npwp: string | null;
    verified: boolean;
    socialMedia: any | null;
  };
}

export default function OrganizerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  const { data: session, status } = useSession();
  // Using sonner toast directly
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orgName: "",
    legalName: "",
    npwp: "",
  });

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "loading") return;

      if (!session) {
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        // Using the buyer profile API for now, will be replaced with organizer-specific API
        const response = await fetch("/api/buyer/profile");
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
          setFormData({
            name: data.data.name || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
            orgName: data.data.organizer?.orgName || "",
            legalName: data.data.organizer?.legalName || "",
            npwp: data.data.organizer?.npwp || "",
          });
        } else {
          console.error("Failed to fetch profile:", data.error);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      setIsSaving(true);
      // Using the buyer profile API for now, will be replaced with organizer-specific API
      const response = await fetch("/api/buyer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update profile state
        setProfile(data.data);
        setIsEditing(false);
        toast.success("Your profile has been updated successfully.");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <OrganizerRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Verification Warning */}
        {profile?.organizer && !profile.organizer.verified && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Account Not Verified
            </AlertTitle>
            <AlertDescription className="flex flex-col space-y-2 text-red-700">
              <p>
                Your organizer account is not verified. You cannot create or
                publish events until your account is verified. Please complete
                the verification process to unlock all features.
              </p>
              <div>
                <Button
                  variant="outline"
                  className="mt-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() =>
                    router.push(`/organizer/${organizerId}/verification`)
                  }
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Your Account
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-6 pb-6">
                <Avatar className="mb-4 h-24 w-24">
                  <AvatarImage
                    src={
                      profile?.image ||
                      session?.user?.image ||
                      "/avatars/default.jpg"
                    }
                    alt={profile?.name || session?.user?.name || "User"}
                  />
                  <AvatarFallback>
                    {(profile?.name || session?.user?.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {profile?.name || session?.user?.name || "User"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {profile?.email || session?.user?.email || "user@example.com"}
                </p>
                <div className="mt-4 w-full">
                  <div className="bg-primary/10 text-primary flex items-center justify-center gap-2 rounded-full px-3 py-1 text-center text-sm">
                    <Building className="h-4 w-4" />
                    Organizer
                  </div>
                </div>
                <div className="mt-2 w-full">
                  {profile?.organizer?.verified ? (
                    <div className="flex items-center justify-center gap-2 rounded-full bg-green-100 px-3 py-1 text-center text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-full bg-red-100 px-3 py-1 text-center text-sm text-red-700">
                      <XCircle className="h-4 w-4" />
                      Not Verified
                    </div>
                  )}
                </div>

                {!profile?.organizer?.verified && (
                  <div className="mt-3 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() =>
                        router.push(`/organizer/${organizerId}/verification`)
                      }
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Verify Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Personal Information
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isSaving}
                      >
                        {isEditing ? (
                          <Save className="mr-1 h-4 w-4" />
                        ) : (
                          <Edit className="mr-1 h-4 w-4" />
                        )}
                        {isEditing ? "Save" : "Edit"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="flex items-center">
                              <User className="text-muted-foreground mr-2 h-4 w-4" />
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing || isSaving}
                                className={!isEditing ? "bg-muted/50" : ""}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center">
                              <Mail className="text-muted-foreground mr-2 h-4 w-4" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={true}
                                className="bg-muted/50"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex items-center">
                              <Phone className="text-muted-foreground mr-2 h-4 w-4" />
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing || isSaving}
                                className={!isEditing ? "bg-muted/50" : ""}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="mt-6 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            className="mr-2"
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organization">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Organization Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input
                              id="orgName"
                              name="orgName"
                              value={formData.orgName}
                              disabled={true}
                              className="bg-muted/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="legalName">Legal Name</Label>
                            <Input
                              id="legalName"
                              name="legalName"
                              value={formData.legalName}
                              disabled={true}
                              className="bg-muted/50"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="npwp">NPWP</Label>
                            <Input
                              id="npwp"
                              name="npwp"
                              value={formData.npwp}
                              disabled={true}
                              className="bg-muted/50"
                            />
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          To update organization details, please contact
                          support.
                        </p>
                      </div>

                      {/* Verification Status */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Verification Status
                        </h3>
                        <div className="rounded-md border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {profile?.organizer?.verified ? (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-red-500 text-red-500"
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Not Verified
                                </Badge>
                              )}
                              <span className="text-sm">
                                {profile?.organizer?.verified
                                  ? "Your organizer account is verified. You can create and publish events."
                                  : "Your organizer account is not verified. You cannot create or publish events."}
                              </span>
                            </div>
                          </div>

                          {!profile?.organizer?.verified && (
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
                                onClick={() =>
                                  router.push(
                                    `/organizer/${organizerId}/verification`,
                                  )
                                }
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Go to Verification Page
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="mr-2 h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Password management and security settings will be
                        implemented in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </OrganizerRoute>
  );
}
