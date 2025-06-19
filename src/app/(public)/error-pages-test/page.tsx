"use client";

import React from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  ShieldX, 
  Server, 
  WifiOff, 
  Wrench,
  FileX,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { TEXT_SIZES, SPACING } from "~/lib/responsive-utils";

export default function ErrorPagesTestPage() {
  const errorPages = [
    {
      title: "404 Not Found",
      description: "Halaman tidak ditemukan dengan navigasi yang user-friendly",
      icon: FileX,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      path: "/non-existent-page",
      status: "implemented",
      features: [
        "Pesan error dalam bahasa Indonesia",
        "Navigasi kembali dan ke beranda",
        "Link ke halaman populer",
        "Bantuan dan dukungan",
        "Responsive design"
      ]
    },
    {
      title: "403 Unauthorized",
      description: "Akses tidak diizinkan dengan role-specific messaging",
      icon: ShieldX,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      path: "/unauthorized?required=admin&current=guest&returnUrl=/admin/dashboard",
      status: "implemented",
      features: [
        "Role-specific error messages",
        "Login/register options untuk guest",
        "Informasi role yang diperlukan",
        "Bantuan untuk upgrade role",
        "URL parameter support"
      ]
    },
    {
      title: "500 Server Error",
      description: "Error server internal dengan error reporting",
      icon: Server,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      path: "/test-500-error",
      status: "implemented",
      features: [
        "Error details untuk development",
        "Error reporting via email",
        "Troubleshooting steps",
        "Retry functionality",
        "Status information"
      ]
    },
    {
      title: "Maintenance Mode",
      description: "Halaman pemeliharaan dengan progress tracking",
      icon: Wrench,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      path: "/maintenance",
      status: "implemented",
      features: [
        "Real-time progress tracking",
        "Estimasi waktu selesai",
        "Maintenance task list",
        "Social media links",
        "Auto-refresh status"
      ]
    },
    {
      title: "Network Error",
      description: "Masalah koneksi dengan troubleshooting guide",
      icon: WifiOff,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      path: "/network-error",
      status: "implemented",
      features: [
        "Connection status detection",
        "Troubleshooting steps",
        "Retry mechanism",
        "Network speed detection",
        "Offline/online status"
      ]
    }
  ];

  const testScenarios = [
    {
      title: "Responsive Design Test",
      description: "Test semua error pages di berbagai ukuran layar",
      icon: Eye,
      tests: [
        "Mobile (320px - 768px)",
        "Tablet (768px - 1024px)", 
        "Desktop (1024px+)",
        "Touch targets minimum 44px",
        "Text readability"
      ]
    },
    {
      title: "Navigation Test",
      description: "Test semua link dan tombol navigasi",
      icon: ExternalLink,
      tests: [
        "Back button functionality",
        "Home page navigation",
        "External links",
        "Retry mechanisms",
        "URL parameter handling"
      ]
    },
    {
      title: "Accessibility Test",
      description: "Test aksesibilitas dan usability",
      icon: CheckCircle,
      tests: [
        "Screen reader compatibility",
        "Keyboard navigation",
        "Color contrast ratios",
        "Focus indicators",
        "ARIA labels"
      ]
    }
  ];

  const handleTestError = () => {
    // Simulate an error for testing
    throw new Error("Test error for 500 page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container-responsive py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`${TEXT_SIZES['heading-xl']} font-bold mb-4`}>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Error Pages Test Suite
              </span>
            </h1>
            <p className={`${TEXT_SIZES.body} text-muted-foreground max-w-3xl mx-auto leading-relaxed`}>
              Comprehensive testing interface untuk semua error pages dan loading states 
              yang telah diimplementasi dalam aplikasi VBTicket.
            </p>
          </div>

          {/* Error Pages Grid */}
          <div className="mb-12">
            <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-6 text-center`}>
              Error Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {errorPages.map((page, index) => {
                const Icon = page.icon;
                return (
                  <MagicCard key={index} className={`group cursor-pointer border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 ${page.bgColor}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${page.bgColor}`}>
                          <Icon className={`h-6 w-6 ${page.color}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold">{page.title}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 text-xs ${page.status === 'implemented' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                          >
                            {page.status === 'implemented' ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Implemented
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1 h-3 w-3" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Features:</h4>
                          <ul className="space-y-1">
                            {page.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" asChild>
                            <Link href={page.path}>
                              <Eye className="mr-2 h-4 w-4" />
                              Test Page
                            </Link>
                          </Button>
                          {page.title === "500 Server Error" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleTestError}
                              className="flex-1"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Trigger Error
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </MagicCard>
                );
              })}
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="mb-12">
            <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-6 text-center`}>
              Test Scenarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testScenarios.map((scenario, index) => {
                const Icon = scenario.icon;
                return (
                  <MagicCard key={index} className="border-0 bg-gradient-to-br from-muted/20 to-background/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-bold">{scenario.title}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {scenario.tests.map((test, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span>{test}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </MagicCard>
                );
              })}
            </div>
          </div>

          {/* Loading Components Test */}
          <div className="mb-12">
            <h2 className={`${TEXT_SIZES['heading-md']} font-bold mb-6 text-center`}>
              Loading Components
            </h2>
            <MagicCard className="border-0 bg-gradient-to-br from-background/90 to-muted/20">
              <CardHeader>
                <CardTitle className="text-center">Loading States Test</CardTitle>
                <p className="text-center text-muted-foreground">
                  Test berbagai komponen loading yang telah diimplementasi
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/responsive-test">
                      <Eye className="mr-2 h-4 w-4" />
                      Responsive Test
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/loading">
                      <Eye className="mr-2 h-4 w-4" />
                      Global Loading
                    </Link>
                  </Button>
                  <Button variant="outline" disabled>
                    <Eye className="mr-2 h-4 w-4" />
                    Component Loading
                  </Button>
                  <Button variant="outline" disabled>
                    <Eye className="mr-2 h-4 w-4" />
                    Skeleton States
                  </Button>
                </div>
              </CardContent>
            </MagicCard>
          </div>

          {/* Testing Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Testing Instructions</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>Manual Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Test setiap error page di berbagai ukuran layar (mobile, tablet, desktop)</li>
                  <li>Verifikasi semua tombol dan link berfungsi dengan benar</li>
                  <li>Periksa aksesibilitas dengan screen reader dan keyboard navigation</li>
                  <li>Test responsive design dengan browser developer tools</li>
                  <li>Validasi bahwa semua teks dalam bahasa Indonesia dan mudah dipahami</li>
                </ul>
                <p className="mt-3"><strong>Automated Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Gunakan tools seperti Lighthouse untuk accessibility audit</li>
                  <li>Test dengan berbagai browser (Chrome, Firefox, Safari, Edge)</li>
                  <li>Validasi dengan tools seperti axe-core untuk accessibility</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

        </div>
      </div>
    </div>
  );
}
