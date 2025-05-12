"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

// Event Dummy Data
const dummyEvents = [
  {
    id: 1,
    type: "Konser Musik",
    title: "Festival Soundrenaline",
    date: "25 Mei 2025",
    location: "GBK, Jakarta",
    price: "Rp 350.000",
    image: "/api/placeholder/500/400",
  },
  {
    id: 2,
    type: "Seminar",
    title: "Tech Conference 2025",
    date: "5 Juni 2025",
    location: "JCC, Jakarta",
    price: "Rp 275.000",
    image: "/api/placeholder/500/400",
  },
  {
    id: 3,
    type: "Pameran",
    title: "Art Exhibition 2025",
    date: "15 Juni 2025",
    location: "Museum Nasional, Jakarta",
    price: "Rp 150.000",
    image: "/api/placeholder/500/400",
  },
  {
    id: 4,
    type: "Workshop",
    title: "Digital Marketing Masterclass",
    date: "20 Juni 2025",
    location: "Hotel Mulia, Jakarta",
    price: "Rp 500.000",
    image: "/api/placeholder/500/400",
  },
  {
    id: 5,
    type: "Festival",
    title: "Food Festival Jakarta",
    date: "10 Juli 2025",
    location: "Senayan City, Jakarta",
    price: "Rp 100.000",
    image: "/api/placeholder/500/400",
  },
];

// Laris Manis Event Dummy Data
const larisManisEvents = [
  {
    id: 1,
    title: "Story in Garut 2025",
    organizer: "One Night Project Garut",
    organizerLogo: "/api/placeholder/40/40",
    date: "17 May 2025",
    location: "Lapangan Korem 062 Tarumangara, Garut",
    image: "/api/placeholder/400/200",
  },
  {
    id: 2,
    title: "LAND OF KOPLO",
    organizer: "TWENTY THREE ENTERTAINMENT",
    organizerLogo: "/api/placeholder/40/40",
    date: "24 May 2025",
    location: "Stadion Kridosono, Yogyakarta",
    image: "/api/placeholder/400/200",
  },
  {
    id: 3,
    title: "Pesta Mangan",
    organizer: "Pesta Mangan",
    organizerLogo: "/api/placeholder/40/40",
    date: "30 - 01 Jun 2025",
    location: "Alun-alun Barat Kota Serang Banten",
    image: "/api/placeholder/400/200",
  },
  {
    id: 4,
    title: "Jakarta Music Festival",
    organizer: "Jakarta Event Productions",
    organizerLogo: "/api/placeholder/40/40",
    date: "15 Jun 2025",
    location: "Gelora Bung Karno, Jakarta",
    image: "/api/placeholder/400/200",
  },
  {
    id: 5,
    title: "Bali Arts Festival",
    organizer: "Bali Cultural Foundation",
    organizerLogo: "/api/placeholder/40/40",
    date: "22 Jun 2025",
    location: "Denpasar Art Center, Bali",
    image: "/api/placeholder/400/200",
  },
  {
    id: 6,
    title: "Surabaya Food Expo",
    organizer: "East Java Culinary Association",
    organizerLogo: "/api/placeholder/40/40",
    date: "05 Jul 2025",
    location: "Grand City Mall, Surabaya",
    image: "/api/placeholder/400/200",
  },
];

// Define Event type
interface Event {
  id: number;
  type: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
}

// Define Laris Manis Event type
interface LarisManisEvent {
  id: number;
  title: string;
  organizer: string;
  organizerLogo: string;
  date: string;
  location: string;
  image: string;
  type?: string; // Added type for consistency
}

// Event Card Component
const EventCard = ({ event }: { event: Event }) => {
  return (
    <div
      className="group h-full w-full cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md"
      onClick={() => (window.location.href = `/buyer/tickets/${event.id}`)}
    >
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
        <div className="absolute top-2 left-2 rounded-full bg-blue-600/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {event.type}
        </div>
      </div>
      <div className="p-3">
        <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
          {event.title}
        </h3>
        <div className="mb-2 flex flex-col gap-1">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1 text-blue-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin size={12} className="mr-1 text-blue-500" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-xs font-medium text-blue-600">
            {event.price}
          </span>
          <Button
            size="sm"
            className="h-7 rounded-full bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
          >
            Beli
          </Button>
        </div>
      </div>
    </div>
  );
};

// Laris Manis Event Card Component
const LarisManisCard = ({ event }: { event: LarisManisEvent }) => {
  return (
    <div
      className="group h-full w-full cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      onClick={() => (window.location.href = `/buyer/tickets/${event.id}`)}
    >
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
      </div>
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-6 w-6 overflow-hidden rounded-full border border-blue-100">
            <img
              src={event.organizerLogo}
              alt={event.organizer}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-medium text-blue-600">
            {event.organizer}
          </span>
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
          {event.title}
        </h3>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center text-gray-500">
            <Calendar size={12} className="mr-1 text-blue-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <MapPin size={12} className="mr-1 text-blue-500" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            className="h-7 rounded-full bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
          >
            Beli
          </Button>
        </div>
      </div>
    </div>
  );
};

// Laris Manis Carousel Component
const LarisManisCarousel = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // We don't need to calculate card width explicitly anymore
  // as we're using CSS animations for the marquee effect

  // Calculate animation duration based on content width - much faster now
  const getAnimationDuration = () => {
    if (!contentRef.current) return 8; // Default very fast duration

    // Longer content = longer duration for consistent speed
    const contentWidth = contentRef.current.scrollWidth;
    // Base duration of 8s for 1500px of content (very fast animation)
    const baseDuration = 8; // Significantly reduced for much faster animation
    const baseWidth = 1500;

    return (contentWidth / baseWidth) * baseDuration;
  };

  // Setup continuous marquee animation
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    // Clone the content to create a seamless loop
    const setupMarquee = () => {
      if (!contentRef.current) return;

      // Reset any existing animation
      contentRef.current.style.animation = "none";
      contentRef.current.offsetHeight; // Trigger reflow

      // Set up the animation with faster speed
      const duration = getAnimationDuration();

      // Apply animation with optimized properties for speed
      if (isAnimating) {
        contentRef.current.style.animation = `marquee ${duration}s linear infinite`;
        // Force hardware acceleration for smoother animation
        contentRef.current.style.transform = "translateZ(0)";
      } else {
        contentRef.current.style.animation = "none";
      }
    };

    // Create the CSS keyframes animation
    const createKeyframes = () => {
      // Remove any existing keyframes
      const existingStyle = document.getElementById("marquee-keyframes");
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new keyframes with optimized animation
      const style = document.createElement("style");
      style.id = "marquee-keyframes";
      style.innerHTML = `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Add a class for the animated element to ensure smooth animation */
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

    // Initialize
    createKeyframes();
    setupMarquee();

    // Handle window resize
    const handleResize = () => {
      setupMarquee();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isAnimating]);

  // Pause animation on hover
  const handleMouseEnter = () => setIsAnimating(false);
  const handleMouseLeave = () => setIsAnimating(true);

  // Create a doubled set of cards for seamless looping
  const allCards = [...larisManisEvents, ...larisManisEvents];

  return (
    <div
      className="relative mx-auto max-w-6xl overflow-hidden"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative mx-auto overflow-hidden px-2">
        <div
          ref={contentRef}
          className="marquee-animation flex gap-3"
          style={{
            width: "fit-content", // Allow content to determine width
          }}
        >
          {/* First set of cards */}
          {allCards.map((event, index) => (
            <div
              key={`event-${event.id}-${index}`}
              className="w-[220px] flex-shrink-0 sm:w-[240px] md:w-[260px]"
            >
              <LarisManisCard event={event} />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays to indicate continuous scrolling */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-blue-600 to-transparent"></div>
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-blue-600 to-transparent"></div>
    </div>
  );
};

// Carousel Component
const EventCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const maxIndex = dummyEvents.length - 1;
  const [cardWidth, setCardWidth] = useState(306);

  // Calculate card width based on screen size
  useEffect(() => {
    const updateCardWidth = () => {
      if (window.innerWidth < 640) {
        setCardWidth(260); // smaller cards for mobile
      } else {
        setCardWidth(306); // original size for larger screens
      }
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  // Scroll to a specific card by index
  const scrollToIndex = (index: number) => {
    // Just update the index - the transform style will handle the actual scrolling
    setCurrentIndex(index);
  };

  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    // Calculate visible cards based on screen size
    const visibleCards =
      window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    const newIndex = Math.min(maxIndex - (visibleCards - 1), currentIndex + 1);
    scrollToIndex(newIndex);
  };

  // Auto-scroll functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoScrolling) {
      interval = setInterval(() => {
        // Calculate visible cards based on screen size
        const visibleCards =
          window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        const maxScrollIndex = Math.max(0, maxIndex - (visibleCards - 1));
        const newIndex = currentIndex < maxScrollIndex ? currentIndex + 1 : 0;
        scrollToIndex(newIndex);
      }, 5000); // Auto-scroll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentIndex, isAutoScrolling, maxIndex]);

  // Pause auto-scrolling when hovering over carousel
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-6">
      {/* Carousel Navigation Buttons */}
      <div className="absolute top-1/2 left-0 z-10 -translate-y-1/2 sm:left-1">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
          onClick={scrollLeft}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} className="text-blue-600" />
        </Button>
      </div>

      <div className="absolute top-1/2 right-0 z-10 -translate-y-1/2 sm:right-1">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
          onClick={scrollRight}
          disabled={currentIndex >= maxIndex - 2}
        >
          <ChevronRight size={20} className="text-blue-600" />
        </Button>
      </div>

      {/* Scrollable Carousel - Responsive to different screen sizes */}
      <div
        id="tickets-carousel"
        className="relative mx-auto overflow-hidden px-4 pt-2 pb-8"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex gap-6 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * cardWidth}px)` }}
        >
          {dummyEvents.map((event) => (
            <div
              key={event.id}
              className="w-full flex-shrink-0 px-1 sm:w-[280px] md:w-[300px]"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {/* Gradient overlay to indicate more content */}
        {currentIndex < maxIndex - 2 && (
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent"></div>
        )}
      </div>

      {/* Pagination Dots - Only show dots for valid scroll positions */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({
          length: Math.min(dummyEvents.length - 2, dummyEvents.length),
        }).map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
            }`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Blue Header */}
      <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden items-center justify-between md:flex">
            {/* Logo and Name */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-xl font-bold text-blue-600">VB</span>
              </div>
              <span className="text-xl font-bold">VBTix</span>
            </div>

            {/* Navigation */}
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList className="flex space-x-8">
                <NavigationMenuItem>
                  <NavigationMenuLink className="text-sm font-medium text-white hover:text-blue-100">
                    Jelajah
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-white hover:bg-blue-700/50 hover:text-blue-100 focus:bg-blue-700/50">
                    Event Creator
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-[220px] rounded-xl bg-white p-4 text-black shadow-lg">
                    <ul className="grid gap-2">
                      <li>
                        <NavigationMenuLink className="block rounded-lg p-2 hover:bg-blue-50">
                          Create New Event
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink className="block rounded-lg p-2 hover:bg-blue-50">
                          My Events
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink className="block rounded-lg p-2 hover:bg-blue-50">
                          Event Templates
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink className="text-sm font-medium text-white hover:text-blue-100">
                    About Us
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Search Icon and Profile */}
            <div className="flex items-center space-x-4">
              {isSearchOpen ? (
                <div className="flex items-center overflow-hidden rounded-full bg-blue-700/80 backdrop-blur-sm">
                  <Input
                    className="border-0 bg-transparent text-white placeholder-blue-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Search..."
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-800"
                    onClick={toggleSearch}
                  >
                    <Search size={20} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="rounded-full text-white hover:bg-blue-700/50"
                  onClick={toggleSearch}
                >
                  <Search size={20} />
                </Button>
              )}

              {/* Profile Logo */}
              <Link href="/buyer/profile" className="flex items-center">
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-white transition-all hover:border-blue-200">
                  <AvatarImage src="/avatars/default.jpg" alt="Profile" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User size={18} />
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden">
            {/* Logo and Name */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-lg font-bold text-blue-600">J</span>
              </div>
              <span className="text-lg font-bold">VBTix</span>
            </div>

            {/* Mobile Menu, Search and Profile */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                className="rounded-full text-white hover:bg-blue-700/50"
                onClick={toggleSearch}
              >
                <Search size={18} />
              </Button>

              {/* Profile Logo */}
              <Link href="/buyer/profile" className="flex items-center">
                <Avatar className="h-8 w-8 cursor-pointer border-2 border-white transition-all hover:border-blue-200">
                  <AvatarImage src="/avatars/default.jpg" alt="Profile" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              </Link>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full text-white hover:bg-blue-700/50"
                  >
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-blue-600 text-white">
                  <nav className="mt-8 flex flex-col gap-4">
                    <Link
                      href="/buyer/profile"
                      className="flex items-center gap-2 py-2 text-lg font-medium text-white hover:text-blue-100"
                    >
                      <User size={20} />
                      Profil Saya
                    </Link>
                    <a
                      href="#"
                      className="py-2 text-lg font-medium text-white hover:text-blue-100"
                    >
                      Jelajah
                    </a>
                    <div className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                          Event Creator
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col gap-2 pl-4">
                        <a
                          href="#"
                          className="py-1 text-white hover:text-blue-100"
                        >
                          Create New Event
                        </a>
                        <a
                          href="#"
                          className="py-1 text-white hover:text-blue-100"
                        >
                          My Events
                        </a>
                        <a
                          href="#"
                          className="py-1 text-white hover:text-blue-100"
                        >
                          Event Templates
                        </a>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="py-2 text-lg font-medium text-white hover:text-blue-100"
                    >
                      About Us
                    </a>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-16">
        <div className="container mx-auto px-6 text-center text-white">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Events Events Terbaik Ada Disini
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-blue-100">
            Temukan dan pesan tiket untuk events terbaik yang terjadi di kota
            Anda
          </p>
        </div>
      </div>

      {/* Event Tickets Carousel Section */}
      <div className="container mx-auto mt-8 max-w-6xl px-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Rekomendasi Event
            </h2>
            <div className="mt-2 h-1 w-20 rounded bg-blue-600"></div>
          </div>
        </div>
      </div>
      <EventCarousel />

      {/* Laris Manis Section */}
      <section className="mt-8 w-full bg-gradient-to-b from-blue-600 to-blue-700 py-12 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-1 inline-block rounded-full bg-blue-400/30 px-3 py-1 text-xs font-medium text-white">
              Trending Now
            </div>
            <h2 className="text-2xl font-bold">Laris Manis</h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-white/60"></div>
            <p className="mt-3 max-w-md text-sm text-blue-100">
              Event-event yang sedang populer dan banyak diminati saat ini
            </p>
          </div>

          <LarisManisCarousel />
        </div>
      </section>

      {/* Event Terdekat Section */}
      <section className="bg-blue-50/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
              Upcoming
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Event Terdekat</h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-blue-600/60"></div>
            <p className="mt-3 max-w-md text-sm text-gray-600">
              Jangan lewatkan event-event menarik yang akan datang
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Show all events */}
              {dummyEvents.map((event) => (
                <div key={event.id} className="w-full px-1">
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {/* "View All" button - only show if we have more than 8 events in a real scenario */}
            {dummyEvents.length > 8 && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  className="group rounded-full border border-blue-200 px-5 py-1.5 text-xs font-medium text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                  onClick={() => {
                    // In a real implementation, this would navigate to a page with all events
                    alert(
                      "This would show all events in a real implementation",
                    );
                  }}
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
