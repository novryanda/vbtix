"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatPrice, formatDate } from "~/lib/utils";
import { generateBannerUrl, defaultBanners } from "~/lib/banner-helpers";

// Banner carousel component
const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Generate banner URLs using Cloudinary
  const banners = defaultBanners.map((banner) => ({
    ...banner,
    imageUrl: generateBannerUrl(`VBTix ${banner.title}`, {
      backgroundColor: banner.backgroundColor,
      textColor: "white",
    }),
  }));

  // Auto-change banner every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg sm:mb-10 sm:rounded-xl lg:mb-12">
      <div className="relative h-[250px] w-full sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-4 text-white sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">
                <h2 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl md:text-3xl lg:text-4xl">
                  {banner.title}
                </h2>
                <p className="mb-4 max-w-sm text-xs sm:mb-6 sm:max-w-md sm:text-sm md:max-w-lg md:text-base lg:max-w-xl">
                  {banner.description}
                </p>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="sm:size-default"
                >
                  <Link href={banner.link}>Jelajahi Sekarang</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 space-x-1.5 sm:bottom-4 sm:space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-200 sm:h-2 sm:w-2 ${
              index === currentSlide
                ? "scale-125 bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Event card component
const EventCard = ({ event }: { event: any }) => {
  // Generate a placeholder image URL using placeholder.co if no poster is available
  const placeholderImage = `https://placehold.co/400x300/gray/white?text=${encodeURIComponent(event.title || "No Image")}`;

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-40 w-full overflow-hidden sm:h-44 md:h-48 lg:h-52">
        <Image
          src={event.posterUrl || placeholderImage}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {event.category && (
          <Badge className="absolute top-2 left-2 bg-blue-600 text-xs sm:text-sm">
            {event.category}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold sm:text-base lg:text-lg">
          {event.title}
        </h3>
        <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
          <div className="text-muted-foreground flex items-center">
            <Calendar className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="truncate">{formatDate(event.startDate)}</span>
          </div>
          <div className="text-muted-foreground flex items-center">
            <MapPin className="mr-1.5 h-3 w-3 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="line-clamp-1 min-w-0">
              {event.venue}, {event.city}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-3 sm:p-4">
        <div className="text-sm font-medium sm:text-base">
          {event.lowestPrice ? `${formatPrice(event.lowestPrice)}` : "Free"}
        </div>
        <Button size="sm" asChild className="text-xs sm:text-sm">
          <Link href={`/events/${event.id}`}>Beli</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Loading skeleton
const EventCardSkeleton = () => (
  <Card className="h-full overflow-hidden">
    <Skeleton className="h-40 w-full sm:h-44 md:h-48 lg:h-52" />
    <CardContent className="p-3 sm:p-4">
      <Skeleton className="mb-2 h-4 w-3/4 sm:h-5 lg:h-6" />
      <div className="mb-3 space-y-1 sm:space-y-1.5">
        <Skeleton className="h-3 w-1/2 sm:h-4" />
        <Skeleton className="h-3 w-2/3 sm:h-4" />
      </div>
    </CardContent>
    <CardFooter className="flex items-center justify-between border-t p-3 sm:p-4">
      <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
      <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
    </CardFooter>
  </Card>
);

// Section title component
const SectionTitle = ({
  title,
  viewAllLink,
}: {
  title: string;
  viewAllLink: string;
}) => (
  <div className="mb-4 flex items-center justify-between sm:mb-6">
    <h2 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
      {title}
    </h2>
    <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
      <Link href={viewAllLink} className="flex items-center">
        <span className="hidden sm:inline">Lihat Semua</span>
        <span className="sm:hidden">Semua</span>
        <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
      </Link>
    </Button>
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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 px-3 py-4 sm:space-y-10 sm:px-4 sm:py-6 lg:space-y-12 lg:px-6 lg:py-8">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Recommended Events Section */}
        <section className="space-y-4 sm:space-y-6">
          <SectionTitle
            title="Rekomendasi Event"
            viewAllLink="/events?featured=true"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))
            ) : recommendedEvents.length > 0 ? (
              recommendedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center sm:py-12">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Tidak ada event yang direkomendasikan saat ini.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="space-y-4 sm:space-y-6">
          <SectionTitle title="Event Terdekat" viewAllLink="/events" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center sm:py-12">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Tidak ada event terdekat saat ini.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
