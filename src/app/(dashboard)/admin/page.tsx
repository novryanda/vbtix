"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SectionCards } from "~/components/dashboard/admin/section-card";

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>

        {/* Statistik utama */}
        <SectionCards />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Aktivitas terbaru */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Aktivitas terbaru di platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Belum ada aktivitas terbaru</p>
            </CardContent>
          </Card>

          {/* Event yang perlu disetujui */}
          <Card>
            <CardHeader>
              <CardTitle>Event Menunggu Persetujuan</CardTitle>
              <CardDescription>Event yang memerlukan persetujuan admin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tidak ada event yang menunggu persetujuan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
