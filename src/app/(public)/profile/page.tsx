"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Edit,
  Save,
  Lock,
  Loader2,
} from "lucide-react";

// User profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
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
        const response = await fetch("/api/buyer/profile");
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
          setFormData({
            name: data.data.name || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update profile through API
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

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would update the user's password
    console.log("Password change requested");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50 pb-16">
      {/* Back button */}
      <div className="bg-blue-600 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/buyer"
            className="inline-flex items-center text-white hover:text-blue-100"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Profil Saya</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
            <Card className="border-blue-200 bg-white shadow-md">
              <CardHeader className="border-b border-blue-200 bg-blue-600 text-white">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profil
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
                  <AvatarFallback className="bg-blue-100 text-xl text-blue-600">
                    {(profile?.name || session?.user?.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {profile?.name || session?.user?.name || "User"}
                </h2>
                <p className="mt-1 text-gray-500">
                  {profile?.email || session?.user?.email || "user@example.com"}
                </p>
                <div className="mt-4 w-full">
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-center text-sm text-blue-800">
                    Buyer
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="personal">Informasi Pribadi</TabsTrigger>
                <TabsTrigger value="security">Keamanan</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card className="border-blue-200 bg-white shadow-md">
                  <CardHeader className="border-b border-blue-200 bg-blue-600 text-white">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Informasi Pribadi
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-blue-700"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          <Save className="mr-1 h-4 w-4" />
                        ) : (
                          <Edit className="mr-1 h-4 w-4" />
                        )}
                        {isEditing ? "Simpan" : "Edit"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4 text-blue-500" />
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-blue-500" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-blue-500" />
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </div>
                          </div>
                          {/* Additional fields can be added here when the API supports them */}
                        </div>
                        {/* Address field can be added here when the API supports it */}
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
                            Batal
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              "Simpan Perubahan"
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="border-blue-200 bg-white shadow-md">
                  <CardHeader className="border-b border-blue-200 bg-blue-600 text-white">
                    <CardTitle className="flex items-center">
                      <Lock className="mr-2 h-5 w-5" />
                      Keamanan Akun
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Password Saat Ini
                          </Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            placeholder="Masukkan password saat ini"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Password Baru</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="Masukkan password baru"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Konfirmasi Password Baru
                          </Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Konfirmasi password baru"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button type="submit">Ubah Password</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
