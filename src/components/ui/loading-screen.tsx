"use client"

import { LoadingSpinner } from "~/components/ui/loading-spinner"

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
