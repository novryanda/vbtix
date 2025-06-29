"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Calendar, MapPin, Trash2, CreditCard } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "~/components/ui/sheet";
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
      "Festival musik terbesar di Indonesia dengan menampilkan berbagai musisi papan atas tanah air dan internasional.",
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
      "Konferensi teknologi terbesar di Indonesia yang menghadirkan pembicara dari perusahaan teknologi terkemuka.",
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
      "Pameran seni yang menampilkan karya-karya terbaik dari seniman lokal dan internasional.",
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
      "Workshop intensif tentang digital marketing yang dipandu oleh pakar industri.",
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
      "Festival kuliner terbesar di Jakarta yang menampilkan berbagai hidangan dari seluruh Indonesia dan mancanegara.",
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

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<
    { id: number; count: number }[]
  >([]);

  // Form state
  const [fullName, setFullName] = useState("");
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [ticketOwners, setTicketOwners] = useState<
    {
      name: string;
      identityType: string;
      identityNumber: string;
      email: string;
      whatsappNumber: string;
    }[]
  >([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [useBuyerDataForTicketOwner, setUseBuyerDataForTicketOwner] =
    useState(false);

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        if (params.id) {
          const eventData = await fetchEventDetails(params.id as string);
          setEvent(eventData);

          // Parse query params untuk mendapatkan jumlah tiket yang dipilih
          if (typeof window !== "undefined") {
            const queryParams = new URLSearchParams(window.location.search);
            const selectedTicketsData: { id: number; count: number }[] = [];

            // Cari semua parameter yang dimulai dengan "ticket_"
            queryParams.forEach((value, key) => {
              if (key.startsWith("ticket_")) {
                const ticketId = parseInt(key.replace("ticket_", ""));
                const count = parseInt(value);

                if (!isNaN(ticketId) && !isNaN(count) && count > 0) {
                  selectedTicketsData.push({ id: ticketId, count });
                }
              }
            });

            setSelectedTickets(selectedTicketsData);
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    getEventDetails();
  }, [params.id]);

  // Initialize ticket owners array based on total tickets selected
  useEffect(() => {
    if (selectedTickets.length > 0) {
      // Calculate total number of tickets
      const totalTickets = selectedTickets.reduce(
        (sum, ticket) => sum + ticket.count,
        0,
      );

      // Initialize ticket owners array with empty fields
      setTicketOwners(
        Array(totalTickets).fill({
          name: "",
          identityType: "",
          identityNumber: "",
          email: "",
          whatsappNumber: "",
        }),
      );
    }
  }, [selectedTickets]);

  // Effect untuk menyalin data pemesan ke data pemilik tiket pertama
  useEffect(() => {
    if (useBuyerDataForTicketOwner && ticketOwners.length > 0) {
      // Salin data pemesan ke semua pemilik tiket
      const updatedTicketOwners = ticketOwners.map(() => ({
        name: fullName,
        identityType: identityType,
        identityNumber: identityNumber,
        email: email,
        whatsappNumber: whatsappNumber,
      }));

      setTicketOwners(updatedTicketOwners);
    }
  }, [
    useBuyerDataForTicketOwner,
    fullName,
    identityType,
    identityNumber,
    email,
    whatsappNumber,
    ticketOwners.length,
  ]);

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

  // Hitung subtotal berdasarkan tiket yang dipilih
  const subtotal = selectedTickets.reduce((total, selectedTicket) => {
    const ticket = event.ticketTypes?.find(
      (t: any) => t.id === selectedTicket.id,
    );
    if (ticket) {
      return total + ticket.price * selectedTicket.count;
    }
    return total;
  }, 0);

  const serviceFee = 0; // Removed service fee
  const total = subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !fullName ||
      !identityType ||
      !identityNumber ||
      !email ||
      !whatsappNumber
    ) {
      alert("Mohon lengkapi semua data pemesan");
      return;
    }

    // Validate all ticket owner fields
    const hasEmptyTicketOwnerField = ticketOwners.some(
      (owner) =>
        !owner.name ||
        !owner.identityType ||
        !owner.identityNumber ||
        !owner.email ||
        !owner.whatsappNumber,
    );

    if (hasEmptyTicketOwnerField) {
      alert("Mohon lengkapi semua data pemilik tiket");
      return;
    }

    // Tampilkan pop-up konfirmasi pembayaran
    setIsPaymentSheetOpen(true);
  };

  const handleProceedToPayment = () => {
    // In a real implementation, this would submit the order to the backend
    // and get the orderId from the response

    // Simulasi orderId untuk demo
    const orderId = "ORDER-" + Date.now();

    // Tutup pop-up
    setIsPaymentSheetOpen(false);

    // Redirect to checkout page
    router.push(`/buyer/checkout/${orderId}`);
  };

  return (
    <main className="min-h-screen bg-blue-50 pb-16">
      {/* Back button */}
      <div className="bg-blue-600 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/buyer/tickets/${event.id}`}
            className="inline-flex items-center text-white hover:text-blue-100"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Kembali ke Detail Event</span>
          </Link>
        </div>
      </div>

      {/* Order Form */}
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 text-center md:text-left">
          <h1 className="mb-3 text-2xl font-bold text-blue-600 md:text-3xl">
            Form Pemesanan Tiket
          </h1>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-blue-600/30 md:mx-0"></div>
          <p className="text-sm text-gray-600 md:text-base">
            Silakan lengkapi data di bawah ini untuk melanjutkan pemesanan tiket
            Anda
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Order Form */}
          <div className="space-y-6 lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="overflow-hidden rounded-lg border-0 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-white px-6 py-4">
                  <CardTitle className="flex items-center text-lg font-medium text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Data Pemesan
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5">
                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Nama Lengkap
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Masukkan nama lengkap Anda"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>

                    {/* Identity Type and Number */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="identityType"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Jenis Identitas
                        </Label>
                        <Select
                          value={identityType}
                          onValueChange={setIdentityType}
                        >
                          <SelectTrigger
                            id="identityType"
                            className="h-10 border-gray-200 focus:ring-blue-200"
                          >
                            <SelectValue placeholder="Pilih jenis identitas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ktp">KTP</SelectItem>
                            <SelectItem value="sim">SIM</SelectItem>
                            <SelectItem value="student">
                              Kartu Pelajar
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="identityNumber"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          {identityType === "ktp"
                            ? "Nomor KTP"
                            : identityType === "sim"
                              ? "Nomor SIM"
                              : identityType === "student"
                                ? "Nomor Kartu Pelajar"
                                : "Nomor Identitas"}
                        </Label>
                        <Input
                          id="identityNumber"
                          placeholder={`Masukkan nomor ${
                            identityType === "ktp"
                              ? "KTP"
                              : identityType === "sim"
                                ? "SIM"
                                : identityType === "student"
                                  ? "kartu pelajar"
                                  : "identitas"
                          } Anda`}
                          value={identityNumber}
                          onChange={(e) => setIdentityNumber(e.target.value)}
                          required
                          disabled={!identityType}
                          className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                    </div>

                    {/* Email and WhatsApp */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="email"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Masukkan email Anda"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="whatsapp"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Nomor WhatsApp
                        </Label>
                        <Input
                          id="whatsapp"
                          placeholder="Masukkan nomor WhatsApp Anda"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          required
                          className="h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 flex items-center rounded-lg border border-blue-100 bg-blue-50/80 p-4">
                <Checkbox
                  id="use-buyer-data"
                  checked={useBuyerDataForTicketOwner}
                  onCheckedChange={(checked) => {
                    setUseBuyerDataForTicketOwner(checked === true);
                  }}
                  className="h-4 w-4 border-blue-300 text-blue-600"
                />
                <div className="ml-3">
                  <label
                    htmlFor="use-buyer-data"
                    className="cursor-pointer text-sm font-medium text-blue-700"
                  >
                    Gunakan data pemesan untuk semua pemilik tiket
                  </label>
                  <p className="mt-0.5 text-xs text-blue-600/70">
                    Centang opsi ini untuk mengisi otomatis data pemilik tiket
                    dengan data pemesan
                  </p>
                </div>
              </div>

              <Card className="mt-6 overflow-hidden rounded-lg border-0 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-white px-6 py-4">
                  <CardTitle className="flex items-center text-lg font-medium text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Data Pemilik Tiket
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5">
                  <div className="space-y-5">
                    {ticketOwners.length > 0 ? (
                      ticketOwners.map((owner, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-100 bg-gray-50/50 p-5"
                        >
                          <h3 className="mb-4 flex items-center text-base font-medium text-gray-800">
                            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                              {index + 1}
                            </span>
                            Pemilik Tiket #{index + 1}
                          </h3>
                          <div className="space-y-5">
                            {/* Full Name */}
                            <div>
                              <Label
                                htmlFor={`ticketOwnerName-${index}`}
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                              >
                                Nama Lengkap
                              </Label>
                              <Input
                                id={`ticketOwnerName-${index}`}
                                placeholder="Masukkan nama lengkap pemilik tiket"
                                value={owner.name}
                                onChange={(e) => {
                                  const newTicketOwners = [...ticketOwners];
                                  newTicketOwners[index] = {
                                    ...owner,
                                    name: e.target.value,
                                  };
                                  setTicketOwners(newTicketOwners);
                                }}
                                required
                                className="h-10 border-gray-200 bg-white focus:border-blue-300 focus:ring-blue-200"
                              />
                              {index === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  *Nama ini akan tercetak pada e-ticket dan akan
                                  diverifikasi saat check-in
                                </p>
                              )}
                            </div>

                            {/* Identity Type and Number */}
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <Label
                                  htmlFor={`identityType-${index}`}
                                  className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                  Jenis Identitas
                                </Label>
                                <Select
                                  value={owner.identityType}
                                  onValueChange={(value) => {
                                    const newTicketOwners = [...ticketOwners];
                                    newTicketOwners[index] = {
                                      ...owner,
                                      identityType: value,
                                    };
                                    setTicketOwners(newTicketOwners);
                                  }}
                                >
                                  <SelectTrigger
                                    id={`identityType-${index}`}
                                    className="h-10 border-gray-200 bg-white focus:ring-blue-200"
                                  >
                                    <SelectValue placeholder="Pilih jenis identitas" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ktp">KTP</SelectItem>
                                    <SelectItem value="sim">SIM</SelectItem>
                                    <SelectItem value="student">
                                      Kartu Pelajar
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label
                                  htmlFor={`identityNumber-${index}`}
                                  className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                  {owner.identityType === "ktp"
                                    ? "Nomor KTP"
                                    : owner.identityType === "sim"
                                      ? "Nomor SIM"
                                      : owner.identityType === "student"
                                        ? "Nomor Kartu Pelajar"
                                        : "Nomor Identitas"}
                                </Label>
                                <Input
                                  id={`identityNumber-${index}`}
                                  placeholder={`Masukkan nomor ${
                                    owner.identityType === "ktp"
                                      ? "KTP"
                                      : owner.identityType === "sim"
                                        ? "SIM"
                                        : owner.identityType === "student"
                                          ? "kartu pelajar"
                                          : "identitas"
                                  }`}
                                  value={owner.identityNumber}
                                  onChange={(e) => {
                                    const newTicketOwners = [...ticketOwners];
                                    newTicketOwners[index] = {
                                      ...owner,
                                      identityNumber: e.target.value,
                                    };
                                    setTicketOwners(newTicketOwners);
                                  }}
                                  required
                                  disabled={!owner.identityType}
                                  className="h-10 border-gray-200 bg-white focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                            </div>

                            {/* Email and WhatsApp */}
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <Label
                                  htmlFor={`email-${index}`}
                                  className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                  Email
                                </Label>
                                <Input
                                  id={`email-${index}`}
                                  type="email"
                                  placeholder="Masukkan email pemilik tiket"
                                  value={owner.email}
                                  onChange={(e) => {
                                    const newTicketOwners = [...ticketOwners];
                                    newTicketOwners[index] = {
                                      ...owner,
                                      email: e.target.value,
                                    };
                                    setTicketOwners(newTicketOwners);
                                  }}
                                  required
                                  className="h-10 border-gray-200 bg-white focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`whatsapp-${index}`}
                                  className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                  Nomor WhatsApp
                                </Label>
                                <Input
                                  id={`whatsapp-${index}`}
                                  placeholder="Masukkan nomor WhatsApp pemilik tiket"
                                  value={owner.whatsappNumber}
                                  onChange={(e) => {
                                    const newTicketOwners = [...ticketOwners];
                                    newTicketOwners[index] = {
                                      ...owner,
                                      whatsappNumber: e.target.value,
                                    };
                                    setTicketOwners(newTicketOwners);
                                  }}
                                  required
                                  className="h-10 border-gray-200 bg-white focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800">
                        <p className="text-sm font-medium">
                          Tidak ada tiket yang dipilih
                        </p>
                        <p className="mt-1 text-xs">
                          Silakan kembali ke halaman detail event untuk memilih
                          tiket
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 overflow-hidden rounded-lg border-0 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-white px-6 py-4">
                  <CardTitle className="flex items-center text-lg font-medium text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Kode Voucher
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5">
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Masukkan kode voucher (opsional)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="h-10 flex-1 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 border-blue-200 px-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => alert("Voucher berhasil diterapkan!")}
                      disabled={!voucherCode}
                    >
                      Terapkan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 hidden lg:block">
                <Button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-lg bg-blue-600 py-4 text-base font-medium text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                >
                  <span className="relative flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                    Lanjutkan Pembayaran
                  </span>
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-4 overflow-hidden rounded-lg border-0 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-white px-6 py-4">
                <CardTitle className="flex items-center text-lg font-medium text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <div className="space-y-6">
                  {/* Event Info */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md shadow-sm">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {event.title}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-2 text-blue-500" />
                          <span>{event.date}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <MapPin size={14} className="mr-2 text-blue-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Selection */}
                  <div className="space-y-3">
                    <h3 className="flex items-center text-sm font-medium text-blue-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tiket yang Dipilih
                    </h3>
                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                      {selectedTickets.length > 0 ? (
                        <div className="space-y-3">
                          {selectedTickets.map((selectedTicket) => {
                            const ticket = event.ticketTypes?.find(
                              (t: any) => t.id === selectedTicket.id,
                            );
                            if (!ticket) return null;

                            return (
                              <div
                                key={ticket.id}
                                className="flex justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                              >
                                <div>
                                  <div className="font-medium text-gray-700">
                                    {ticket.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {selectedTicket.count} tiket ×{" "}
                                    {formatPrice(ticket.price)}
                                  </div>
                                </div>
                                <div className="text-right font-semibold text-blue-600">
                                  {formatPrice(
                                    ticket.price * selectedTicket.count,
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-center text-yellow-800">
                          <p className="text-sm">
                            Tidak ada tiket yang dipilih
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-gray-100" />

                  {/* Price Summary */}
                  <div className="space-y-3">
                    <h3 className="flex items-center text-sm font-medium text-blue-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Ringkasan Pembayaran
                    </h3>
                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Subtotal
                          </span>
                          <span className="font-medium text-gray-700">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Biaya Layanan
                          </span>
                          <span className="font-medium text-gray-700">
                            {formatPrice(serviceFee)}
                          </span>
                        </div>
                        <Separator className="my-2 bg-gray-100" />
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">
                            Total
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:hidden">
                    <Button
                      type="button"
                      className="group relative w-full overflow-hidden rounded-lg bg-blue-600 py-3 text-base font-medium text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                      onClick={handleSubmit}
                    >
                      <span className="relative flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                        Lanjutkan Pembayaran
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pop-up Konfirmasi Pembayaran */}
      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent className="overflow-y-auto bg-blue-50 sm:max-w-md">
          <SheetHeader className="border-b border-blue-200 pb-4">
            <SheetTitle className="text-xl text-blue-700">
              Konfirmasi Pembayaran
            </SheetTitle>
            <SheetDescription className="text-blue-600">
              Ringkasan pembelian tiket untuk event {event.title}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Detail Event */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium tracking-wider text-blue-600 uppercase">
                Detail Event
              </h3>
              <div className="flex items-start gap-4 rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md shadow-md">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {event.title}
                  </h4>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2 text-blue-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Tiket */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium tracking-wider text-blue-600 uppercase">
                Tiket yang Dibeli
              </h3>
              <div className="space-y-3">
                {selectedTickets.map((selectedTicket) => {
                  const ticket = event.ticketTypes?.find(
                    (t: any) => t.id === selectedTicket.id,
                  );
                  if (!ticket) return null;

                  return (
                    <div
                      key={ticket.id}
                      className="flex justify-between rounded-lg border border-blue-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {ticket.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {selectedTicket.count} tiket ×{" "}
                          {formatPrice(ticket.price)}
                        </div>
                      </div>
                      <div className="text-right font-semibold text-blue-600">
                        {formatPrice(ticket.price * selectedTicket.count)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ringkasan Pembayaran */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium tracking-wider text-blue-600 uppercase">
                Ringkasan Pembayaran
              </h3>
              <div className="space-y-3 rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 flex-row justify-between gap-3 border-t border-blue-200 pt-6">
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setIsPaymentSheetOpen(false)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Batalkan
            </Button>
            <Button
              className="flex-1 border border-blue-800 bg-blue-700 text-white shadow-md hover:bg-blue-800"
              onClick={handleProceedToPayment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Lanjutkan ke Pembayaran
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
