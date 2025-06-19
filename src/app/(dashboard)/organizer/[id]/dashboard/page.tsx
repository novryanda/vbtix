"use client";

import { ChartAreaInteractive } from "~/components/dashboard/organizer/chart-area-interactive";
import { DataTable } from "~/components/dashboard/organizer/data-table";
import { SectionCards } from "~/components/dashboard/organizer/section-card";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { useOrganizerEvents, useOrganizerVerification } from "~/lib/api/hooks/organizer";
import { MagicCard, GradientText } from "~/components/ui/magic-card";
import { 
  SparklesIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  BarChart3Icon,
  UsersIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from "lucide-react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  const params = useParams();
  const organizerId = params.id as string;
  const { data: session } = useSession();

  // Fetch events data
  const { data, isLoading } = useOrganizerEvents(organizerId);
  const events = data?.data || [];
  
  // Fetch organizer verification status using user ID from session
  const userId = session?.user?.id;
  const { verification, isLoading: isVerificationLoading, error: verificationError } = useOrganizerVerification(userId || "");
  
  // Get verification status with fallback
  // If there's an error or no verification data, default to unverified
  const isVerified = verificationError ? false : (verification?.verified ?? false);
  const verificationStatus = isVerified ? "Terverifikasi" : "Belum Verifikasi";
  const StatusIcon = isVerified ? CheckCircleIcon : ClockIcon;
  const statusColor = isVerified ? "blue" : "orange";
  return (
    <OrganizerRoute>
      <div className="space-y-8 p-4 lg:p-6">
        {/* Welcome Header Section */}
        <MagicCard 
          className="border-0 bg-gradient-to-br from-gradient-primary/10 via-gradient-secondary/10 to-gradient-accent/10 backdrop-blur-sm"
          gradientColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 shadow-2xl">
                    <CalendarIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-3 h-3 text-yellow-800" />
                  </div>
                </div>                <div className="flex-1">
                  <GradientText 
                    className="text-4xl md:text-5xl font-bold mb-4 -mt-6 relative z-50"
                    colors={["#10b981", "#14b8a6", "#059669"]}
                  >
                    Dashboard Organizer
                    <br />
                    <span className="text-2xl md:text-3xl font-medium text-muted-foreground">
                      Kelola Event Anda
                    </span>
                  </GradientText>
                  <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl">
                    Selamat datang di pusat kontrol event Anda. Kelola, monitor, dan optimalkan 
                    performa semua event dengan interface yang intuitif dan data real-time.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-border/50 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/15 group-hover:bg-green-500/25 transition-colors">
                      <TicketIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Event</p>
                      <p className="text-2xl font-bold text-green-600">{events.length}</p>
                      <p className="text-xs text-green-600/70">Event aktif</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className={`absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 ${
                  isVerified 
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20" 
                    : "bg-gradient-to-r from-orange-500/20 to-yellow-500/20"
                }`}></div>
                <div className="relative p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-border/50 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${
                      isVerified 
                        ? "bg-blue-500/15 group-hover:bg-blue-500/25" 
                        : "bg-orange-500/15 group-hover:bg-orange-500/25"
                    }`}>
                      <StatusIcon className={`w-6 h-6 ${
                        isVerified ? "text-blue-600" : "text-orange-600"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Status Akun</p>
                      <p className={`text-2xl font-bold ${
                        isVerified ? "text-blue-600" : "text-orange-600"
                      }`}>
                        {isVerified ? "Aktif" : "Pending"}
                      </p>
                      <p className={`text-xs ${
                        isVerified ? "text-blue-600/70" : "text-orange-600/70"
                      }`}>{verificationStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-border/50 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/15 group-hover:bg-purple-500/25 transition-colors">
                      <TrendingUpIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Performa</p>
                      <p className="text-2xl font-bold text-purple-600">Baik</p>
                      <p className="text-xs text-purple-600/70">Trending up</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MagicCard>
        
        {/* Analytics Section */}
        <SectionCards />
        
        {/* Chart Analytics */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <BarChart3Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Analitik & Performa</h2>
              <p className="text-muted-foreground">Insight mendalam tentang performa event Anda</p>
            </div>
          </div>
          <ChartAreaInteractive />
        </div>
        
        {/* Events Data Table */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Daftar Event</h2>
              <p className="text-muted-foreground">Kelola dan monitor semua event Anda dalam satu tempat</p>
            </div>
          </div>
            {isLoading ? (
            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center p-16">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="border-primary h-16 w-16 animate-spin rounded-full border-b-4 mx-auto"></div>
                    <div className="absolute inset-0 border-primary/20 h-16 w-16 rounded-full border-2 mx-auto"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">Memuat Data Event</p>
                    <p className="text-muted-foreground">Sedang mengambil informasi terbaru...</p>
                  </div>
                </div>
              </div>
            </MagicCard>
          ) : (
            <DataTable data={events} />
          )}
        </div>
      </div>
    </OrganizerRoute>
  );
}
