import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface BuyerTicket {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventAddress: string;
  ticketType: string;
  price: number;
  status: "ACTIVE" | "USED" | "EXPIRED" | "PENDING";
  qrCodeStatus: "PENDING" | "GENERATED" | "ACTIVE" | "USED" | "EXPIRED";
  qrCodeImageUrl?: string;
  purchaseDate: string;
  holderName: string;
  holderEmail: string;
  invoiceNumber: string;
  eventImage?: string;
}

export interface BuyerTicketsResponse {
  success: boolean;
  data: BuyerTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useBuyerTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<BuyerTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTickets = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);

      const response = await fetch(`/api/public/tickets?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }

      const result: BuyerTicketsResponse = await response.json();

      if (result.success) {
        setTickets(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error("Failed to fetch tickets");
      }
    } catch (err: any) {
      console.error("Error fetching buyer tickets:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [session, params?.page, params?.limit, params?.status]);

  const refresh = () => {
    fetchTickets();
  };

  return {
    tickets,
    isLoading,
    error,
    pagination,
    refresh,
  };
}

export function useBuyerTicketDetail(ticketId: string) {
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<BuyerTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    if (!session?.user || !ticketId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/public/tickets/${ticketId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ticket: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setTicket(result.data);
      } else {
        throw new Error("Failed to fetch ticket");
      }
    } catch (err: any) {
      console.error("Error fetching buyer ticket detail:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [session, ticketId]);

  const refresh = () => {
    fetchTicket();
  };

  return {
    ticket,
    isLoading,
    error,
    refresh,
  };
}

export function useBuyerOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);

      const response = await fetch(`/api/public/orders?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err: any) {
      console.error("Error fetching buyer orders:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session, params?.page, params?.limit, params?.status]);

  const refresh = () => {
    fetchOrders();
  };

  return {
    orders,
    isLoading,
    error,
    pagination,
    refresh,
  };
}
