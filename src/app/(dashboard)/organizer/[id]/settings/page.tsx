"use client";

import { useState, useEffect } from "react";

export default function OrganizerSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [organizerId, setOrganizerId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setOrganizerId(resolvedParams.id);
    });
  }, [params]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Pengaturan Organizer</h1>
      <div className="bg-muted rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Halaman pengaturan organizer sedang dalam pengembangan.
        </p>
        {organizerId && (
          <p className="text-muted-foreground mt-2 text-sm">
            Organizer ID: {organizerId}
          </p>
        )}
      </div>
    </div>
  );
}
