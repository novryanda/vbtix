"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Sparkles, Star, TrendingUp, Search, Receipt } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatPrice, formatDate } from "~/lib/utils";
import { generateBannerUrl, defaultBanners } from "~/lib/banner-helpers";
import { MagicCard, GradientText, FloatingElement, Shimmer } from "~/components/ui/magic-card";
import { AnimatedBackground, Particles } from "~/components/ui/animated-background";
import { PUBLIC_ENDPOINTS } from "~/lib/api/endpoints";

// Banner carousel component
const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentPos, setCurrentPos] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const bannerUrl = `${PUBLIC_ENDPOINTS.BANNERS}?t=${Date.now()}`;
        console.log("Fetching banners from:", bannerUrl);
        const response = await fetch(bannerUrl, {
          cache: 'no-store', // Ensure we get fresh data
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await response.json();
        console.log("Banner API response:", data);
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          console.log("✅ Setting banners from API:", data.data);
          console.log("Number of banners:", data.data.length);
          setBanners(data.data);
        } else {
          console.log("❌ No banners from API, using fallback banners. API response:", data);
          console.log("Conditions check:", {
            success: data.success,
            hasData: !!data.data,
            isArray: Array.isArray(data.data),
            length: data.data?.length
          });
          // Fallback to default banners if no active banners
          const fallbackBanners = defaultBanners.map((banner) => ({
            ...banner,
            imageUrl: generateBannerUrl(`VBTicket ${banner.title}`, {
              backgroundColor: banner.backgroundColor,
              textColor: "white",
            }),
          }));
          console.log("Fallback banners:", fallbackBanners);
          setBanners(fallbackBanners);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Fallback to default banners on error
        const fallbackBanners = defaultBanners.map((banner) => ({
          ...banner,
          imageUrl: generateBannerUrl(`VBTicket ${banner.title}`, {
            backgroundColor: banner.backgroundColor,
            textColor: "white",
          }),
        }));
        console.log("Error fallback banners:", fallbackBanners);
        setBanners(fallbackBanners);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-change banner every 5 seconds
  useEffect(() => {
    if (banners.length > 0 && !isDragging) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length, isDragging]);

  // Handle drag/swipe functions
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartPos(clientX);
    setCurrentPos(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    
    const diff = clientX - startPos;
    setCurrentPos(clientX);
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const diff = currentPos - startPos;
    const threshold = 50; // Minimum drag distance to trigger slide change
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Dragged right - go to previous slide
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
      } else {
        // Dragged left - go to next slide
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }
    }
    
    setIsDragging(false);
    setStartPos(0);
    setCurrentPos(0);
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }
  };

  // Show loading state
  if (isLoading) {
    console.log("Banner carousel is loading...");
    return (
      <div className="relative mb-4 overflow-hidden rounded-lg sm:mb-6 sm:rounded-xl lg:mb-8 xl:mb-10 flex justify-center">
        {/* Mobile: 311x91, Desktop: Full width responsive */}
        <div className="relative w-full max-w-[311px] h-[91px] sm:max-w-none sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[350px] 2xl:h-[400px] bg-muted animate-pulse rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-2 sm:p-4 md:p-6 lg:p-8 text-white">
            <div className="sm:mx-auto sm:max-w-7xl">
              <div className="mb-1 h-3 w-32 bg-white/20 rounded sm:mb-2 sm:h-6 md:h-8 lg:h-10 xl:h-12"></div>
              <div className="mb-2 h-2 w-40 bg-white/20 rounded sm:mb-4 sm:h-4 md:h-5 lg:h-6"></div>
              <div className="h-4 w-16 bg-white/20 rounded sm:h-8 sm:w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback if no banners (this should rarely happen now)
  if (banners.length === 0) {
    console.log("No banners to display, showing fallback");
    // Generate fallback banners as last resort
    const emergencyFallback = defaultBanners.map((banner) => ({
      ...banner,
      imageUrl: generateBannerUrl(`VBTicket ${banner.title}`, {
        backgroundColor: banner.backgroundColor,
        textColor: "white",
      }),
    }));

    return (
      <div className="relative mb-4 overflow-hidden rounded-lg sm:mb-6 sm:rounded-xl lg:mb-8 xl:mb-10 flex justify-center">
        {/* Mobile: 311x91, Desktop: Full width responsive */}
        <div className="relative w-full max-w-[311px] h-[91px] sm:max-w-none sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[350px] 2xl:h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-2 sm:p-4 md:p-6 lg:p-8 text-white">
              <div className="sm:mx-auto sm:max-w-7xl">
                <h2 className="mb-1 text-xs font-bold leading-tight sm:mb-2 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
                  {emergencyFallback[0]?.title || "Selamat Datang di VBTicket"}
                </h2>
                <p className="mb-1 max-w-full text-xs opacity-90 line-clamp-1 sm:mb-4 sm:max-w-sm sm:text-sm md:max-w-md md:text-base lg:max-w-lg xl:max-w-xl sm:line-clamp-none">
                  {emergencyFallback[0]?.description || "Platform tiket event terpercaya"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering banner carousel with banners:", banners);

  return (
    <div className="relative mb-4 overflow-hidden rounded-lg sm:mb-6 sm:rounded-xl lg:mb-8 xl:mb-10 flex justify-center">
      {/* Mobile: 311x91, Desktop: Full width responsive */}
      <div 
        className="relative w-full max-w-[311px] h-[91px] sm:max-w-none sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[350px] 2xl:h-[400px] cursor-grab active:cursor-grabbing select-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Banner carousel - Gunakan panah kiri/kanan atau geser untuk navigasi"
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: isDragging && index === currentSlide ? `translateX(${dragOffset}px)` : 'translateX(0)',
              transition: isDragging ? 'none' : 'opacity 1000ms, transform 300ms ease-out'
            }}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-lg"
              onLoad={() => console.log("Banner image loaded:", banner.imageUrl)}
              onError={(e) => console.error("Banner image failed to load:", banner.imageUrl, e)}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none rounded-lg" />
            <div className="absolute right-0 bottom-0 left-0 p-2 sm:p-4 md:p-6 lg:p-8 text-white">
              <div className="sm:mx-auto sm:max-w-7xl">
                <h2 className="mb-1 text-xs font-bold leading-tight line-clamp-1 sm:mb-2 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl sm:line-clamp-none">
                  {banner.title}
                </h2>
                {banner.description && (
                  <p className="mb-1 max-w-full text-xs opacity-90 line-clamp-1 sm:mb-4 sm:max-w-sm sm:text-sm md:max-w-md md:text-base lg:max-w-lg xl:max-w-xl sm:line-clamp-none">
                    {banner.description}
                  </p>
                )}
                {banner.linkUrl && (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="text-xs font-semibold h-5 px-2 py-0 sm:h-auto sm:px-4 sm:py-2 sm:text-sm md:text-base"
                  >
                    <Link href={banner.linkUrl}>
                      <span className="sm:hidden">Lihat</span>
                      <span className="hidden sm:inline">Jelajahi Sekarang</span>
                    </Link>
                  </Button>
                )}
                {!banner.linkUrl && (banner.link || banner.linkUrl) && (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="text-xs font-semibold h-5 px-2 py-0 sm:h-auto sm:px-4 sm:py-2 sm:text-sm md:text-base"
                  >
                    <Link href={banner.link || banner.linkUrl}>
                      <span className="sm:hidden">Lihat</span>
                      <span className="hidden sm:inline">Jelajahi Sekarang</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
};

// Enhanced Event card component with Magic UI - Mobile optimized
const EventCard = ({ event, index }: { event: any; index: number }) => {
  // Generate a placeholder image URL using placeholder.co if no poster is available
  const placeholderImage = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(event.title || "No Image")}`;

  return (
    <FloatingElement delay={index * 0.1} duration={3 + index * 0.2}>
      <MagicCard className="group h-full overflow-hidden border-border/30 hover:border-primary/30 rounded-lg xs:rounded-xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={event.posterUrl || placeholderImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {event.category && (
            <Badge
              variant="magic"
              className="absolute top-1.5 left-1.5 xs:top-2 xs:left-2 shadow-lg text-xs xs:text-xs backdrop-blur-sm px-1.5 xs:px-2 py-0.5 xs:py-1"
            >
              <Sparkles className="mr-1 h-2 w-2 xs:h-2.5 xs:w-2.5" />
              <span className="truncate max-w-20 xs:max-w-24">{event.category}</span>
            </Badge>
          )}
          {event.featured && (
            <Badge
              variant="glow"
              className="absolute top-1.5 right-1.5 xs:top-2 xs:right-2 shadow-lg text-xs xs:text-xs backdrop-blur-sm px-1.5 xs:px-2 py-0.5 xs:py-1"
            >
              <Star className="mr-1 h-2 w-2 xs:h-2.5 xs:w-2.5" />
              <span className="hidden xs:inline">Featured</span>
              <span className="xs:hidden">★</span>
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Magic overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="relative p-3 xs:p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
          <div className="relative z-10">
            <h3 className="mb-2 xs:mb-3 line-clamp-2 text-sm xs:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              <GradientText className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 absolute inset-0">
                {event.title}
              </GradientText>
              <span className="group-hover:opacity-0 transition-opacity duration-300">
                {event.title}
              </span>
            </h3>
            <div className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm">
              <div className="text-muted-foreground flex items-center group-hover:text-foreground transition-colors duration-300">
                <div className="mr-1.5 xs:mr-2 rounded-full bg-primary/10 p-0.5 xs:p-1 group-hover:bg-primary/20 transition-colors duration-300">
                  <Calendar className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-primary" />
                </div>
                <span className="truncate font-medium text-xs xs:text-sm">{formatDate(event.startDate)}</span>
              </div>
              <div className="text-muted-foreground flex items-center group-hover:text-foreground transition-colors duration-300">
                <div className="mr-1.5 xs:mr-2 rounded-full bg-secondary/10 p-0.5 xs:p-1 group-hover:bg-secondary/20 transition-colors duration-300 flex-shrink-0">
                  <MapPin className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-secondary" />
                </div>
                <span className="line-clamp-1 min-w-0 font-medium text-xs xs:text-sm">
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative flex items-center justify-between border-t border-border/30 p-3 xs:p-4 bg-gradient-to-r from-muted/15 to-muted/5">
          <div className="flex items-center gap-1 xs:gap-1.5 min-w-0">
            <TrendingUp className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-green-500 flex-shrink-0" />
            <span className="text-xs xs:text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
              {event.lowestPrice ? `${formatPrice(event.lowestPrice)}` : "Gratis"}
            </span>
          </div>
          <Shimmer>
            <Button size="sm" variant="magic" asChild className="text-xs font-semibold shadow-md px-2 xs:px-3 py-1 xs:py-1.5 min-w-0">
              <Link href={`/events/${event.id}`} className="flex items-center gap-1 xs:gap-1.5">
                <Sparkles className="h-2.5 w-2.5 xs:h-3 xs:w-3 flex-shrink-0" />
                <span className="hidden xs:inline">Beli Tiket</span>
                <span className="xs:hidden">Beli</span>
              </Link>
            </Button>
          </Shimmer>
        </CardFooter>
      </MagicCard>
    </FloatingElement>
  );
};

// Loading skeleton - Mobile optimized
const EventCardSkeleton = () => (
  <Card className="h-full overflow-hidden rounded-lg xs:rounded-xl">
    <Skeleton className="aspect-[4/3] w-full" />
    <CardContent className="p-3 xs:p-4">
      <Skeleton className="mb-2 xs:mb-3 h-4 xs:h-5 w-3/4" />
      <div className="mb-2 xs:mb-3 space-y-1.5 xs:space-y-2">
        <Skeleton className="h-3 xs:h-3.5 w-1/2" />
        <Skeleton className="h-3 xs:h-3.5 w-2/3" />
      </div>
    </CardContent>
    <CardFooter className="flex items-center justify-between border-t p-3 xs:p-4">
      <Skeleton className="h-3.5 xs:h-4 w-12 xs:w-16" />
      <Skeleton className="h-6 xs:h-7 w-16 xs:w-20" />
    </CardFooter>
  </Card>
);

// Enhanced Section title component with Magic UI - Mobile optimized
const SectionTitle = ({
  title,
  viewAllLink,
  subtitle,
}: {
  title: string;
  viewAllLink: string;
  subtitle?: string;
}) => (
  <div className="mb-3 flex flex-col gap-2 xs:mb-4 xs:gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:mb-8">
    <div className="space-y-1 flex-1 min-w-0">
      <h2 className="text-base font-bold xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight">
        <GradientText className="leading-tight">
          {title}
        </GradientText>
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-sm md:text-base font-medium max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
    <div className="flex-shrink-0">
      <Shimmer>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs xs:text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-lg w-full xs:w-auto sm:w-auto min-w-0"
        >
          <Link href={viewAllLink} className="flex items-center justify-center gap-1.5 xs:gap-2 px-3 xs:px-4">
            <span className="truncate">
              <span className="xs:hidden">Semua</span>
              <span className="hidden xs:inline sm:hidden lg:inline">Lihat Semua</span>
              <span className="hidden sm:inline lg:hidden">Semua</span>
            </span>
            <ArrowRight className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
          </Link>
        </Button>
      </Shimmer>
    </div>
  </div>
);

export default function BuyerHomePage() {
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching featured events...");
        // Fetch featured events (recommended)
        const featuredResponse = await fetch(
          "/api/public/events?featured=true&limit=4",
        );
        const featuredData = await featuredResponse.json();
        console.log("Featured events response:", featuredData);

        console.log("Fetching upcoming events...");
        // Fetch upcoming events (sorted by date)
        const upcomingResponse = await fetch("/api/public/events?limit=4");
        const upcomingData = await upcomingResponse.json();
        console.log("Upcoming events response:", upcomingData);

        if (featuredData.success && upcomingData.success) {
          console.log("Setting events data...");
          setRecommendedEvents(featuredData.data);
          setUpcomingEvents(upcomingData.data);
        } else {
          console.error("API returned unsuccessful response:", {
            featuredSuccess: featuredData.success,
            upcomingSuccess: upcomingData.success,
            featuredError: featuredData.error,
            upcomingError: upcomingData.error,
          });
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <AnimatedBackground variant="gradient" className="min-h-screen">
      <Particles className="absolute inset-0" quantity={50} />

      <div className="relative z-10">
        {/* Mobile-optimized container with proper padding */}
        <div className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="space-y-4 py-3 xs:space-y-5 xs:py-4 sm:space-y-6 sm:py-6 md:space-y-8 md:py-8 lg:space-y-10 lg:py-10 xl:space-y-12 xl:py-12">
            {/* Enhanced Banner Carousel - Mobile optimized with fixed size */}
            <div className="relative">
              <BannerCarousel />
              <div className="absolute inset-0 bg-gradient-to-t from-background/15 via-transparent to-transparent pointer-events-none" />
            </div>


            {/* Recommended Events Section - Mobile optimized */}
            <section className="space-y-3 xs:space-y-4 sm:space-y-6">
              <SectionTitle
                title="✨ Event Rekomendasi"
                subtitle="Event pilihan terbaik yang tidak boleh Anda lewatkan"
                viewAllLink="/events?featured=true"
              />
              {/* Mobile-first responsive grid */}
              <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-6 2xl:gap-8">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <FloatingElement key={index} delay={index * 0.1}>
                      <EventCardSkeleton />
                    </FloatingElement>
                  ))
                ) : recommendedEvents.length > 0 ? (
                  recommendedEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 xs:py-10 sm:py-12 text-center">
                    <FloatingElement>
                      <MagicCard className="max-w-xs xs:max-w-sm p-4 xs:p-5 sm:p-6">
                        <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-3 xs:p-4 mb-3 xs:mb-4 mx-auto w-fit">
                          <Sparkles className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 text-primary" />
                        </div>
                        <h3 className="text-sm xs:text-base font-bold mb-2">
                          <GradientText>Belum Ada Event Rekomendasi</GradientText>
                        </h3>
                        <p className="text-muted-foreground text-xs xs:text-sm mb-3 xs:mb-4 leading-relaxed">
                          Event menarik akan segera hadir. Pantau terus untuk mendapatkan event terbaik!
                        </p>
                        <Button variant="magic" size="sm" asChild className="w-full xs:w-auto">
                          <Link href="/events">
                            <Star className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Jelajahi Semua Event
                          </Link>
                        </Button>
                      </MagicCard>
                    </FloatingElement>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Order Lookup Section */}
            <section className="space-y-3 xs:space-y-4 sm:space-y-6">
              <FloatingElement delay={0.3}>
                <MagicCard className="bg-gradient-to-br from-blue-50/80 to-green-50/80 border-blue-200/50">
                  <div className="p-4 xs:p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3 xs:mb-4">
                      <div className="rounded-full bg-blue-100 p-2 xs:p-2.5">
                        <Search className="h-4 w-4 xs:h-5 xs:w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm xs:text-base font-bold text-blue-900">
                          Cari Pesanan Anda
                        </h3>
                        <p className="text-xs xs:text-sm text-blue-700">
                          Lacak status tiket dan unduh e-ticket Anda
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 xs:gap-3">
                      <Button variant="outline" size="sm" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                        <Link href="/my-orders">
                          <Search className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                          <span className="text-xs xs:text-sm">Cari Pesanan</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                        <Link href="/orders/lookup">
                          <Receipt className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                          <span className="text-xs xs:text-sm">Lookup Detail</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </MagicCard>
              </FloatingElement>
            </section>

            {/* Upcoming Events Section - Mobile optimized */}
            <section className="space-y-3 xs:space-y-4 sm:space-y-6">
              <SectionTitle
                title="🕒 Event Terdekat"
                subtitle="Jangan sampai terlewat! Event seru yang akan segera dimulai"
                viewAllLink="/events"
              />
              {/* Mobile-first responsive grid */}
              <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-6 2xl:gap-8">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <FloatingElement key={index} delay={index * 0.1}>
                      <EventCardSkeleton />
                    </FloatingElement>
                  ))
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 xs:py-10 sm:py-12 text-center">
                    <FloatingElement>
                      <MagicCard className="max-w-xs xs:max-w-sm p-4 xs:p-5 sm:p-6">
                        <div className="rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 p-3 xs:p-4 mb-3 xs:mb-4 mx-auto w-fit">
                          <Calendar className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 text-secondary" />
                        </div>
                        <h3 className="text-sm xs:text-base font-bold mb-2">
                          <GradientText>Belum Ada Event Terdekat</GradientText>
                        </h3>
                        <p className="text-muted-foreground text-xs xs:text-sm mb-3 xs:mb-4 leading-relaxed">
                          Event baru akan segera ditambahkan. Kembali lagi nanti untuk melihat event terbaru!
                        </p>
                        <Button variant="magic" size="sm" asChild className="w-full xs:w-auto">
                          <Link href="/events">
                            <TrendingUp className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Lihat Semua Event
                          </Link>
                        </Button>
                      </MagicCard>
                    </FloatingElement>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
