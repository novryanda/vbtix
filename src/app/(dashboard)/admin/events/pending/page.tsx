"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  organizer: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function PendingEventsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const response = await fetch("/api/admin/events/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending events");
      }
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError("Gagal memuat event yang menunggu persetujuan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to approve event");
      }

      // Remove the approved event from the list
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setError("Gagal menyetujui event");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reject event");
      }

      // Remove the rejected event from the list
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setError("Gagal menolak event");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Menunggu Persetujuan</h1>
        <Badge variant="secondary">{events.length} event menunggu</Badge>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive mb-6 rounded-md p-4">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold">
                Tidak ada event menunggu
              </h3>
              <p className="text-muted-foreground">
                Semua event telah diproses atau belum ada pengajuan baru.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Diajukan oleh: {event.organizer.name} (
                      {event.organizer.email})
                    </p>
                  </div>
                  <Badge variant="outline">Menunggu</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">{event.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="font-medium">Tanggal:</span>
                      <p>{new Date(event.date).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div>
                      <span className="font-medium">Lokasi:</span>
                      <p>{event.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Harga:</span>
                      <p>Rp {event.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <span className="font-medium">Diajukan:</span>
                      <p>
                        {new Date(event.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleApprove(event.id)}
                      disabled={processingId === event.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === event.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Setujui
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(event.id)}
                      disabled={processingId === event.id}
                    >
                      {processingId === event.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Tolak
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
