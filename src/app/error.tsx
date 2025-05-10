"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter">Oops, terjadi kesalahan!</h1>
        <p className="text-muted-foreground text-lg">
          Maaf, terjadi kesalahan saat memuat halaman ini.
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="mt-4"
      >
        Coba Lagi
      </Button>
    </div>
  );
}