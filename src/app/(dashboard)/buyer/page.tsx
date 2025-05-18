"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BuyerTopNavbar } from "~/components/navigation/buyer-top-navbar";

// Event type definitions
interface Event {
  id: string;
  type: string;
  title: string;
  date: string;
  location: string;
  price: number;
  image: string;
  description?: string;
}

interface LarisManisEvent {
  id: string;
  title: string;
  organizer: {
    id: string;
    name: string;
    logo?: string;
  };
  date: string;
  location: string;
  image: string;
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Event Card Component
const EventCard = ({ event }: { event: Event }) => {
  // Extract CSS classes for better readability
  const cardClasses =
    "group h-full w-full cursor-pointer overflow-hidden rounded-lg bg-white " +
    "shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md";
  const imgClasses =
    "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";
  const overlayClasses =
    "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent " +
    "opacity-0 transition-opacity group-hover:opacity-100";
  const typeClasses =
    "absolute top-2 left-2 rounded-full bg-blue-600/80 px-2 py-0.5 text-[10px] " +
    "font-medium text-white backdrop-blur-sm";
  const titleClasses =
    "mb-2 line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-600";
  const infoClasses = "flex items-center text-xs text-gray-500";
  const btnClasses =
    "h-7 rounded-full bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700";

  // Extract navigation to a function
  const navigateToEvent = () =>
    (window.location.href = `/buyer/tickets/${event.id}`);

  // Helper component for event info items
  const InfoItem = ({
    icon,
    text,
  }: {
    icon: React.ReactNode;
    text: string;
  }) => (
    <div className={infoClasses}>
      {icon}
      <span className="line-clamp-1">{text}</span>
    </div>
  );

  return (
    <div className={cardClasses} onClick={navigateToEvent}>
      <div className="relative h-32 w-full overflow-hidden">
        <img src={event.image} alt={event.title} className={imgClasses} />
        <div className={overlayClasses}></div>
        <div className={typeClasses}>{event.type}</div>
      </div>
      <div className="p-3">
        <h3 className={titleClasses}>{event.title}</h3>
        <div className="mb-2 flex flex-col gap-1">
          <InfoItem
            icon={<Calendar size={12} className="mr-1 text-blue-500" />}
            text={event.date}
          />
          <InfoItem
            icon={<MapPin size={12} className="mr-1 text-blue-500" />}
            text={event.location}
          />
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-xs font-medium text-blue-600">
            {event.price}
          </span>
          <Button size="sm" className={btnClasses}>
            Beli
          </Button>
        </div>
      </div>
    </div>
  );
};

// Laris Manis Event Card Component
const LarisManisCard = ({ event }: { event: LarisManisEvent }) => {
  // Extract CSS classes for better readability
  const cardClasses =
    "group h-full w-full cursor-pointer overflow-hidden rounded-lg bg-white " +
    "shadow-sm transition-all duration-300 hover:shadow-md";
  const imgClasses =
    "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";
  const overlayClasses =
    "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent " +
    "opacity-0 transition-opacity group-hover:opacity-100";
  const titleClasses =
    "mb-2 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-700";
  const infoClasses = "flex items-center text-gray-500";
  const btnClasses =
    "h-7 rounded-full bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700";

  // Extract navigation to a function
  const navigateToEvent = () =>
    (window.location.href = `/buyer/events/${event.id}`);

  // Helper component for event info items
  const InfoItem = ({
    icon,
    text,
  }: {
    icon: React.ReactNode;
    text: string;
  }) => (
    <div className={infoClasses}>
      {icon}
      <span className="line-clamp-1">{text}</span>
    </div>
  );

  return (
    <div className={cardClasses} onClick={navigateToEvent}>
      <div className="relative h-36 w-full overflow-hidden">
        <img src={event.image} alt={event.title} className={imgClasses} />
        <div className={overlayClasses}></div>
      </div>
      <div className="p-3">
        {/* Organizer info */}
        <div className="mb-2 flex items-center gap-2">
          <div className="h-6 w-6 overflow-hidden rounded-full border border-blue-100">
            <img
              src={event.organizer.logo || "/avatars/default.jpg"}
              alt={event.organizer.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-medium text-blue-600">
            {event.organizer.name}
          </span>
        </div>

        <h3 className={titleClasses}>{event.title}</h3>

        <div className="flex flex-col gap-1 text-xs">
          <InfoItem
            icon={<Calendar size={12} className="mr-1 text-blue-500" />}
            text={event.date}
          />
          <InfoItem
            icon={<MapPin size={12} className="mr-1 text-blue-500" />}
            text={event.location}
          />
        </div>

        <div className="mt-2 flex justify-end">
          <Button size="sm" className={btnClasses}>
            Beli
          </Button>
        </div>
      </div>
    </div>
  );
};

// Laris Manis Carousel Component
const LarisManisCarousel = ({ events }: { events: LarisManisEvent[] }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate animation duration based on content width
  const getAnimationDuration = () => {
    if (!contentRef.current) return 8;
    const contentWidth = contentRef.current.scrollWidth;
    return (contentWidth / 1500) * 8; // Base duration: 8s for 1500px width
  };

  // Create the CSS keyframes animation
  const createKeyframes = () => {
    const existingStyle = document.getElementById("marquee-keyframes");
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.id = "marquee-keyframes";
    style.innerHTML = `
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-animation {
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        will-change: transform;
        backface-visibility: hidden;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(style);
  };

  // Setup or update the marquee animation
  const setupMarquee = () => {
    if (!contentRef.current) return;

    // Reset animation
    contentRef.current.style.animation = "none";
    contentRef.current.offsetHeight; // Force reflow

    // Apply animation if needed
    if (isAnimating) {
      const duration = getAnimationDuration();
      contentRef.current.style.animation = `marquee ${duration}s linear infinite`;
      contentRef.current.style.transform = "translateZ(0)";
    }
  };

  // Initialize and handle animation updates
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    createKeyframes();
    setupMarquee();

    // Handle window resize
    window.addEventListener("resize", setupMarquee);
    return () => window.removeEventListener("resize", setupMarquee);
  }, [isAnimating]);

  // Animation control handlers
  const handleMouseEnter = () => setIsAnimating(false);
  const handleMouseLeave = () => setIsAnimating(true);

  // Double the cards for continuous scrolling effect (only if we have events)
  const allCards = events.length > 0 ? [...events, ...events] : [];

  // CSS classes
  const containerClasses = "relative mx-auto max-w-6xl overflow-hidden";
  const contentClasses = "marquee-animation flex gap-3";
  const cardWrapperClasses =
    "w-[220px] flex-shrink-0 sm:w-[240px] md:w-[260px]";
  const gradientLeftClasses =
    "pointer-events-none absolute top-0 bottom-0 left-0 w-12 " +
    "bg-gradient-to-r from-blue-600 to-transparent";
  const gradientRightClasses =
    "pointer-events-none absolute top-0 right-0 bottom-0 w-12 " +
    "bg-gradient-to-l from-blue-600 to-transparent";

  return (
    <div
      className={containerClasses}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative mx-auto overflow-hidden px-2">
        <div
          ref={contentRef}
          className={contentClasses}
          style={{ width: "fit-content" }}
        >
          {allCards.map((event, index) => (
            <div
              key={`event-${event.id}-${index}`}
              className={cardWrapperClasses}
            >
              <LarisManisCard event={event} />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for visual effect */}
      <div className={gradientLeftClasses}></div>
      <div className={gradientRightClasses}></div>
    </div>
  );
};

// Carousel Component
const EventCarousel = ({ events }: { events: Event[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const maxIndex = events.length > 0 ? events.length - 1 : 0;
  const [cardWidth, setCardWidth] = useState(306);

  // Helper function to get visible cards based on screen size
  const getVisibleCards = () =>
    window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  // Calculate card width based on screen size
  useEffect(() => {
    const updateCardWidth = () => {
      setCardWidth(window.innerWidth < 640 ? 260 : 306);
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  // Navigation functions
  const scrollToIndex = (index: number) => setCurrentIndex(index);

  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const visibleCards = getVisibleCards();
    const newIndex = Math.min(maxIndex - (visibleCards - 1), currentIndex + 1);
    scrollToIndex(newIndex);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      const visibleCards = getVisibleCards();
      const maxScrollIndex = Math.max(0, maxIndex - (visibleCards - 1));
      const newIndex = currentIndex < maxScrollIndex ? currentIndex + 1 : 0;
      scrollToIndex(newIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoScrolling, maxIndex]);

  // Mouse event handlers
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  // CSS classes
  const navButtonClasses =
    "h-10 w-10 rounded-full bg-white/90 shadow-md backdrop-blur-sm " +
    "transition-all hover:bg-white hover:shadow-lg";
  const carouselClasses = "relative mx-auto overflow-hidden px-4 pt-2 pb-8";
  const cardContainerClasses =
    "flex gap-6 transition-transform duration-500 ease-in-out";
  const cardWrapperClasses =
    "w-full flex-shrink-0 px-1 sm:w-[280px] md:w-[300px]";

  // Pagination dot rendering
  const renderPaginationDots = () => {
    const dotsCount = Math.min(events.length - 2, events.length);
    return Array.from({ length: dotsCount }).map((_, index) => (
      <button
        key={index}
        className={`h-2 rounded-full transition-all ${
          index === currentIndex ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
        }`}
        onClick={() => scrollToIndex(index)}
        aria-label={`Go to slide ${index + 1}`}
      />
    ));
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-6">
      {/* Left navigation button */}
      <div className="absolute top-1/2 left-0 z-10 -translate-y-1/2 sm:left-1">
        <Button
          variant="outline"
          size="icon"
          className={navButtonClasses}
          onClick={scrollLeft}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} className="text-blue-600" />
        </Button>
      </div>

      {/* Right navigation button */}
      <div className="absolute top-1/2 right-0 z-10 -translate-y-1/2 sm:right-1">
        <Button
          variant="outline"
          size="icon"
          className={navButtonClasses}
          onClick={scrollRight}
          disabled={currentIndex >= maxIndex - 2}
        >
          <ChevronRight size={20} className="text-blue-600" />
        </Button>
      </div>

      {/* Carousel content */}
      <div
        id="tickets-carousel"
        className={carouselClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={cardContainerClasses}
          style={{ transform: `translateX(-${currentIndex * cardWidth}px)` }}
        >
          {events.map((event) => (
            <div key={event.id} className={cardWrapperClasses}>
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        {currentIndex < maxIndex - 2 && (
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent"></div>
        )}
      </div>

      {/* Pagination dots */}
      <div className="mt-4 flex justify-center gap-2">
        {renderPaginationDots()}
      </div>
    </div>
  );
};

export default function Home() {
  // State for events and loading
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<LarisManisEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        // Fetch featured events
        const featuredResponse = await fetch(
          "/api/buyer/events?featured=true&limit=8",
        );
        const featuredData = await featuredResponse.json();

        // Fetch trending events
        const trendingResponse = await fetch(
          "/api/buyer/events?trending=true&limit=10",
        );
        const trendingData = await trendingResponse.json();

        if (featuredData.success) {
          setFeaturedEvents(featuredData.data);
        }

        if (trendingData.success) {
          setTrendingEvents(trendingData.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // CSS classes
  const sectionTitleClasses = "text-2xl font-bold";

  // Section components
  const SectionTitle = ({
    title,
    subtitle,
    badge,
    badgeColor = "blue",
    underlineColor = "blue-600",
  }: {
    title: string;
    subtitle?: string;
    badge?: string;
    badgeColor?: string;
    underlineColor?: string;
  }) => {
    const badgeClasses = {
      blue: "bg-blue-400/30 text-white",
      light: "bg-blue-100 text-blue-600",
    };

    const underlineClasses = {
      "blue-600": "bg-blue-600",
      "blue-600/60": "bg-blue-600/60",
      "white/60": "bg-white/60",
    };

    return (
      <div className="flex flex-col items-center text-center">
        {badge && (
          <div
            className={`mb-1 inline-block rounded-full ${badgeClasses[badgeColor as keyof typeof badgeClasses]} px-3 py-1 text-xs font-medium`}
          >
            {badge}
          </div>
        )}
        <h2 className={sectionTitleClasses}>{title}</h2>
        <div
          className={`mt-2 h-1 w-16 rounded-full ${underlineClasses[underlineColor as keyof typeof underlineClasses]}`}
        ></div>
        {subtitle && (
          <p className="mt-3 max-w-md text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <BuyerTopNavbar />

      {/* Hero Section */}
      <div className="relative">
        <div className="mx-auto h-[520px] max-w-6xl overflow-hidden rounded-3xl border-20 border-white bg-black/10">
          <img
            src="https://images.pexels.com/photos/196652/pexels-photo-196652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Hero Image"
            className="h-full w-full object-cover"
            width={2727}
            height={1520}
          />
        </div>
      </div>

      {/* Event Tickets Carousel Section */}
      <div className="container mx-auto mt-8 max-w-6xl px-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={sectionTitleClasses + " text-gray-800"}>
              Rekomendasi Event
            </h2>
            <div className="mt-2 h-1 w-20 rounded bg-blue-600"></div>
          </div>
        </div>
      </div>
      {featuredEvents.length > 0 && <EventCarousel events={featuredEvents} />}

      {/* Laris Manis Section */}
      {trendingEvents.length > 0 && (
        <section className="mt-8 w-full bg-gradient-to-b from-blue-600 to-blue-700 py-12 text-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-6">
              <SectionTitle
                title="Laris Manis"
                badge="Trending Now"
                badgeColor="blue"
                underlineColor="white/60"
                subtitle="Event-event yang sedang populer dan banyak diminati saat ini"
              />
            </div>
            <LarisManisCarousel events={trendingEvents} />
          </div>
        </section>
      )}

      {/* Event Terdekat Section */}
      <section className="bg-blue-50/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <SectionTitle
              title="Event Terdekat"
              badge="Upcoming"
              badgeColor="light"
              underlineColor="blue-600/60"
              subtitle="Jangan lewatkan event-event menarik yang akan datang"
            />
          </div>

          <div className="mx-auto max-w-6xl">
            {isLoading ? (
              // Loading state
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 w-full animate-pulse rounded-lg bg-gray-200"
                  ></div>
                ))}
              </div>
            ) : featuredEvents.length > 0 ? (
              // Events grid
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {featuredEvents.map((event) => (
                  <div key={event.id} className="w-full px-1">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 h-16 w-16 rounded-full bg-blue-100 p-4">
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Tidak ada event</h3>
                <p className="text-gray-500">
                  Belum ada event yang tersedia saat ini
                </p>
              </div>
            )}

            {/* "View All" button - only show if we have more than 8 events */}
            {featuredEvents.length > 8 && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  className="group rounded-full border border-blue-200 px-5 py-1.5 text-xs font-medium text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                  onClick={() => (window.location.href = "/buyer/events")}
                >
                  <span>Lihat Semua Event</span>
                  <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
