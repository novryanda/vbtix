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
    <div className="relative mb-10 overflow-hidden rounded-xl">
      <div className="relative h-[300px] w-full sm:h-[400px]">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
              <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
                {banner.title}
              </h2>
              <p className="mb-4 max-w-md text-sm sm:text-base">
                {banner.description}
              </p>
              <Button asChild variant="default">
                <Link href={banner.link}>Jelajahi Sekarang</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
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
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={event.posterUrl || placeholderImage}
          alt={event.title}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        {event.category && (
          <Badge className="absolute top-2 left-2 bg-blue-600">
            {event.category}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
          {event.title}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="text-muted-foreground flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="line-clamp-1">
              {event.venue}, {event.city}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="font-medium">
          {event.lowestPrice ? `${formatPrice(event.lowestPrice)}` : "Free"}
        </div>
        <Button size="sm" asChild>
          <Link href={`/buyer/events/${event.id}`}>Beli</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Loading skeleton
const EventCardSkeleton = () => (
  <Card className="h-full overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4">
      <Skeleton className="mb-2 h-6 w-3/4" />
      <div className="mb-3 space-y-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
    <CardFooter className="flex items-center justify-between border-t p-4">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-8 w-16" />
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
  <div className="mb-6 flex items-center justify-between">
    <h2 className="text-2xl font-bold">{title}</h2>
    <Button variant="ghost" size="sm" asChild>
      <Link href={viewAllLink} className="flex items-center">
        Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
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
          "/api/buyer/events?featured=true&limit=4",
        );
        const featuredData = await featuredResponse.json();
        console.log("Featured events response:", featuredData);

        console.log("Fetching upcoming events...");
        // Fetch upcoming events (sorted by date)
        const upcomingResponse = await fetch("/api/buyer/events?limit=4");
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
    <div className="space-y-12">
      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Recommended Events Section */}
      <section>
        <SectionTitle
          title="Rekomendasi Event"
          viewAllLink="/events?featured=true"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))
          ) : recommendedEvents.length > 0 ? (
            recommendedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">
              Tidak ada event yang direkomendasikan saat ini.
            </p>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section>
        <SectionTitle title="Event Terdekat" viewAllLink="/events" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">
              Tidak ada event terdekat saat ini.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
