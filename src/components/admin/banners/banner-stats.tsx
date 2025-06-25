"use client";

import { Image as ImageIcon, Eye, EyeOff, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MagicCard, Shimmer } from "~/components/ui/magic-card";
import { Skeleton } from "~/components/ui/skeleton";

interface BannerStatsData {
  total: number;
  active: number;
  inactive: number;
}

interface BannerStatsProps {
  stats: BannerStatsData;
  isLoading: boolean;
}

export function BannerStats({ stats, isLoading }: BannerStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Banner",
      value: stats.total,
      description: "Semua banner yang dibuat",
      icon: ImageIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Banner Aktif",
      value: stats.active,
      description: "Banner yang sedang ditampilkan",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Banner Nonaktif",
      value: stats.inactive,
      description: "Banner yang tidak ditampilkan",
      icon: EyeOff,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData.map((stat, index) => (
        <Shimmer key={stat.title} className="rounded-xl">
          <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </MagicCard>
        </Shimmer>
      ))}
    </div>
  );
}
