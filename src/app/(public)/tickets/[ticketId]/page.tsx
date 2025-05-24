"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  User,
  Tag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "~/lib/utils";

// This would be replaced with actual API call in a real implementation
const fetchEventDetails = async (id: string) => {
  // Simulate API call
  const event = dummyEvents.find((event) => event.id.toString() === id);
  return event;
};

// Dummy data - would be fetched from API in real implementation
const dummyEvents = [
  {
    id: 1,
    type: "Konser Musik",
    title: "Festival Soundrenaline",
    date: "25 Mei 2025",
    time: "19:00 - 23:00",
    location: "GBK, Jakarta",
    address: "Jl. Pintu Satu Senayan, Jakarta Pusat",
    price: "Rp 350.000",
    priceNumber: 350000,
    image: "/api/placeholder/800/400",
    description:
      "Festival musik terbesar di Indonesia dengan menampilkan berbagai musisi papan atas tanah air dan internasional. Nikmati pengalaman konser yang tak terlupakan dengan sound system dan lighting kelas dunia.",
    organizer: "Soundrenaline Productions",
    organizerLogo: "/api/placeholder/100/100",
    ticketTypes: [
      {
        id: 1,
        name: "Regular",
        price: 350000,
        remaining: 500,
        quota: 1000,
        sold: 500,
      },
      {
        id: 2,
        name: "VIP",
        price: 750000,
        remaining: 200,
        quota: 300,
        sold: 100,
      },
      {
        id: 3,
        name: "VVIP",
        price: 1500000,
        remaining: 50,
        quota: 100,
        sold: 50,
      },
    ],
  },
  {
    id: 2,
    type: "Seminar",
    title: "Tech Conference 2025",
    date: "5 Juni 2025",
    time: "09:00 - 17:00",
    location: "JCC, Jakarta",
    address: "Jl. Jendral Gatot Subroto, Jakarta Selatan",
    price: "Rp 275.000",
    priceNumber: 275000,
    image: "/api/placeholder/800/400",
    description:
      "Konferensi teknologi terbesar di Indonesia yang menghadirkan pembicara dari perusahaan teknologi terkemuka. Pelajari tren terbaru dalam dunia teknologi dan jalin networking dengan para profesional.",
    organizer: "TechTalks Indonesia",
    organizerLogo: "/api/placeholder/100/100",
    ticketTypes: [
      {
        id: 1,
        name: "Standard",
        price: 275000,
        remaining: 300,
        quota: 500,
        sold: 200,
      },
      {
        id: 2,
        name: "Premium",
        price: 500000,
        remaining: 100,
        quota: 200,
        sold: 100,
      },
    ],
  },
  {
    id: 3,
    type: "Pameran",
    title: "Art Exhibition 2025",
    date: "15 Juni 2025",
    time: "10:00 - 20:00",
    location: "Museum Nasional, Jakarta",
    address: "Jl. Merdeka Barat No.12, Jakarta Pusat",
    price: "Rp 150.000",
    priceNumber: 150000,
    image: "/api/placeholder/800/400",
    description:
      "Pameran seni yang menampilkan karya-karya terbaik dari seniman lokal dan internasional. Nikmati keindahan seni lukis, patung, dan instalasi dari berbagai aliran dan era.",
    organizer: "Jakarta Art Foundation",
    organizerLogo: "/api/placeholder/100/100",
    ticketTypes: [
      {
        id: 1,
        name: "Regular",
        price: 150000,
        remaining: 800,
        quota: 1000,
        sold: 200,
      },
      {
        id: 2,
        name: "Student",
        price: 100000,
        remaining: 400,
        quota: 500,
        sold: 100,
      },
    ],
  },
  {
    id: 4,
    type: "Workshop",
    title: "Digital Marketing Masterclass",
    date: "20 Juni 2025",
    time: "09:00 - 16:00",
    location: "Hotel Mulia, Jakarta",
    address: "Jl. Asia Afrika No.8, Senayan, Jakarta",
    price: "Rp 500.000",
    priceNumber: 500000,
    image: "/api/placeholder/800/400",
    description:
      "Workshop intensif tentang digital marketing yang dipandu oleh pakar industri. Pelajari strategi pemasaran digital terbaru dan praktik terbaik untuk mengembangkan bisnis Anda.",
    organizer: "Digital Marketing Indonesia",
    organizerLogo: "/api/placeholder/100/100",
    ticketTypes: [
      {
        id: 1,
        name: "Professional",
        price: 500000,
        remaining: 150,
        quota: 200,
        sold: 50,
      },
      {
        id: 2,
        name: "Corporate",
        price: 450000,
        remaining: 80,
        quota: 100,
        sold: 20,
      },
    ],
  },
  {
    id: 5,
    type: "Festival",
    title: "Food Festival Jakarta",
    date: "10 Juli 2025",
    time: "11:00 - 22:00",
    location: "Senayan City, Jakarta",
    address: "Jl. Asia Afrika Lot 19, Jakarta Selatan",
    price: "Rp 100.000",
    priceNumber: 100000,
    image: "/api/placeholder/800/400",
    description:
      "Festival kuliner terbesar di Jakarta yang menampilkan berbagai hidangan dari seluruh Indonesia dan mancanegara. Nikmati pengalaman kuliner yang tak terlupakan dengan live cooking show dan workshop memasak.",
    organizer: "Jakarta Culinary Association",
    organizerLogo: "/api/placeholder/100/100",
    ticketTypes: [
      {
        id: 1,
        name: "Entry Pass",
        price: 100000,
        remaining: 1500,
        quota: 2000,
        sold: 500,
      },
      {
        id: 2,
        name: "Entry + Food Voucher",
        price: 250000,
        remaining: 700,
        quota: 1000,
        sold: 300,
      },
    ],
  },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Menghapus selectedTicketType karena kita akan menggunakan counter untuk setiap jenis tiket
  const [ticketCounts, setTicketCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        if (params.id) {
          const eventData = await fetchEventDetails(params.id as string);
          setEvent(eventData);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    getEventDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex animate-pulse flex-col space-y-4">
          <div className="h-8 w-2/3 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 rounded bg-gray-200"></div>
            <div className="h-4 rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Event Not Found
          </h2>
          <p className="text-red-500">
            The event you are looking for does not exist or has been removed.
          </p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/buyer")}
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  // Fungsi untuk menambah jumlah tiket (single ticket type only)
  const increaseTicketCount = (ticketTypeId: number, maxCount: number) => {
    setTicketCounts((prev) => {
      const currentCount = prev[ticketTypeId] || 0;

      // Check if any other ticket type is already selected
      const hasOtherSelection = Object.entries(prev).some(
        ([id, count]) => Number(id) !== ticketTypeId && count > 0,
      );

      if (hasOtherSelection) {
        alert("Anda hanya dapat memilih satu jenis tiket per transaksi");
        return prev;
      }

      if (currentCount < maxCount) {
        return { ...prev, [ticketTypeId]: currentCount + 1 };
      }
      return prev;
    });
  };

  // Fungsi untuk mengurangi jumlah tiket
  const decreaseTicketCount = (ticketTypeId: number) => {
    setTicketCounts((prev) => {
      const currentCount = prev[ticketTypeId] || 0;
      if (currentCount > 0) {
        return { ...prev, [ticketTypeId]: currentCount - 1 };
      }
      return prev;
    });
  };

  // Fungsi untuk menangani pembelian tiket (single ticket type only)
  const handleBuyTicket = () => {
    // Find the selected ticket type (only one should have count > 0)
    const selectedEntries = Object.entries(ticketCounts).filter(
      ([_, count]) => count > 0,
    );

    if (selectedEntries.length === 0) {
      alert("Silakan pilih minimal satu tiket terlebih dahulu");
      return;
    }

    if (selectedEntries.length > 1) {
      alert("Anda hanya dapat memilih satu jenis tiket per transaksi");
      return;
    }

    const [ticketTypeId, quantity] = selectedEntries[0]!;

    // Navigate to the order form page with single ticket type
    const queryParams = new URLSearchParams();
    queryParams.append("ticketTypeId", ticketTypeId);
    queryParams.append("quantity", quantity.toString());

    router.push(`/buyer/orders/${event.id}?${queryParams.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Back button */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/buyer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Kembali ke Daftar Event</span>
          </Link>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
            <div>
              <div className="mb-2 inline-block rounded-md bg-blue-600/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                {event.type}
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">{event.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-blue-200" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="mr-2 text-blue-200" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={18} className="mr-2 text-blue-200" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-blue-100">
                <img
                  src={event.organizerLogo}
                  alt={event.organizer}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm text-blue-100">
                  Diselenggarakan oleh
                </div>
                <div className="font-medium">{event.organizer}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative h-[300px] w-full overflow-hidden sm:h-[400px]">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Deskripsi Event</h2>
                <p className="text-gray-700">{event.description}</p>

                <Separator className="my-6" />

                <h2 className="mb-4 text-xl font-bold">Informasi Lokasi</h2>
                <div className="flex items-start">
                  <MapPin size={20} className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                    <div className="text-gray-600">{event.address}</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <h2 className="mb-4 text-xl font-bold">Informasi Event</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start">
                    <Calendar size={20} className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Tanggal</div>
                      <div>{event.date}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock size={20} className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Waktu</div>
                      <div>{event.time}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User size={20} className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Penyelenggara</div>
                      <div>{event.organizer}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Tag size={20} className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Kategori</div>
                      <div>{event.type}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ticket Selection */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Pilih Tiket</h2>
                <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Informasi Pembelian</span>
                  </div>
                  <p className="mt-1">
                    Anda hanya dapat memilih satu jenis tiket per transaksi.
                    Untuk membeli jenis tiket lain, silakan lakukan transaksi
                    terpisah.
                  </p>
                </div>
                <div className="space-y-4">
                  {event.ticketTypes.map((ticket: any) => {
                    const ticketCount = ticketCounts[ticket.id] || 0;
                    return (
                      <div
                        key={ticket.id}
                        className={`rounded-lg border p-4 transition-all ${
                          ticketCount > 0
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{ticket.name}</div>
                            <div className="text-sm text-gray-500">
                              {ticket.remaining} dari {ticket.quota} tersedia
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-blue-600">
                              {formatPrice(ticket.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              <Ticket className="mr-1 inline h-3 w-3" />
                              {ticket.sold} terjual
                            </div>
                          </div>
                        </div>

                        {/* Counter Tiket */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {ticketCount > 0
                              ? `${ticketCount} tiket dipilih`
                              : "Pilih jumlah tiket"}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => decreaseTicketCount(ticket.id)}
                              disabled={ticketCount === 0}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {ticketCount}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                increaseTicketCount(ticket.id, ticket.remaining)
                              }
                              disabled={ticketCount >= ticket.remaining}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
                  disabled={Object.values(ticketCounts).every(
                    (count) => count === 0,
                  )}
                  onClick={handleBuyTicket}
                >
                  Beli Tiket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
