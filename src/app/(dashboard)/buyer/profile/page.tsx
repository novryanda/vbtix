"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/hooks/use-auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "081234567890", // Dummy data
    address: "Jl. Contoh No. 123, Jakarta", // Dummy data
    birthDate: "1990-01-01", // Dummy data
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would update the user profile
    // through an API call
    console.log("Profile updated:", formData);
    setIsEditing(false);
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
                    src={user?.image || "/avatars/default.jpg"}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-blue-100 text-xl text-blue-600">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {user?.name || "User"}
                </h2>
                <p className="mt-1 text-gray-500">
                  {user?.email || "user@example.com"}
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
                          <div className="space-y-2">
                            <Label htmlFor="birthDate">Tanggal Lahir</Label>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                              <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Alamat</Label>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                            />
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
                          >
                            Batal
                          </Button>
                          <Button type="submit">Simpan Perubahan</Button>
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
