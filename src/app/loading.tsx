export default function Loading() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground text-lg">Memuat...</p>
    </div>
  );
}