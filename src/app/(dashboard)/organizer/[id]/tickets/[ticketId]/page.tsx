"use client";

import { useState, useEffect } from "react";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string; ticketId: string }>;
}) {
  const [organizerId, setOrganizerId] = useState<string>("");
  const [ticketId, setTicketId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setOrganizerId(resolvedParams.id);
      setTicketId(resolvedParams.ticketId);
    });
  }, [params]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Detail Tiket</h1>
      <div className="bg-muted rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Halaman detail tiket sedang dalam pengembangan.
        </p>
        {organizerId && ticketId && (
          <div className="text-muted-foreground mt-2 space-y-1 text-sm">
            <p>Organizer ID: {organizerId}</p>
            <p>Ticket ID: {ticketId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
