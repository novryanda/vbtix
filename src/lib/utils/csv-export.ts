/**
 * CSV Export Utilities
 * Provides functions to export various data types to CSV format
 */

import { formatCurrency, formatDate } from "~/lib/utils";

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  if (!data.length) return "";

  // Create header row
  const headerRow = headers.join(",");
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas, quotes, or newlines
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export ticket types to CSV
 */
export function exportTicketTypesToCSV(ticketTypes: any[], filename?: string): void {
  const headers = [
    "id",
    "name", 
    "description",
    "price",
    "currency",
    "quantity",
    "sold",
    "maxPerPurchase",
    "isVisible",
    "allowTransfer",
    "ticketFeatures",
    "perks",
    "earlyBirdDeadline",
    "saleStartDate", 
    "saleEndDate",
    "eventTitle",
    "eventStartDate",
    "eventEndDate",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "deletionReason"
  ];

  const processedData = ticketTypes.map(ticketType => ({
    id: ticketType.id,
    name: ticketType.name,
    description: ticketType.description || "",
    price: formatCurrency(ticketType.price, ticketType.currency),
    currency: ticketType.currency,
    quantity: ticketType.quantity,
    sold: ticketType.sold,
    maxPerPurchase: ticketType.maxPerPurchase,
    isVisible: ticketType.isVisible ? "Yes" : "No",
    allowTransfer: ticketType.allowTransfer ? "Yes" : "No",
    ticketFeatures: ticketType.ticketFeatures || "",
    perks: ticketType.perks || "",
    earlyBirdDeadline: ticketType.earlyBirdDeadline ? formatDate(ticketType.earlyBirdDeadline) : "",
    saleStartDate: ticketType.saleStartDate ? formatDate(ticketType.saleStartDate) : "",
    saleEndDate: ticketType.saleEndDate ? formatDate(ticketType.saleEndDate) : "",
    eventTitle: ticketType.event?.title || "",
    eventStartDate: ticketType.event?.startDate ? formatDate(ticketType.event.startDate) : "",
    eventEndDate: ticketType.event?.endDate ? formatDate(ticketType.event.endDate) : "",
    createdAt: formatDate(ticketType.createdAt),
    updatedAt: formatDate(ticketType.updatedAt),
    deletedAt: ticketType.deletedAt ? formatDate(ticketType.deletedAt) : "",
    deletionReason: ticketType.deletionReason || ""
  }));

  const csvContent = arrayToCSV(processedData, headers);
  const defaultFilename = `ticket-types-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename || defaultFilename);
}

/**
 * Export individual tickets to CSV
 */
export function exportTicketsToCSV(tickets: any[], filename?: string): void {
  const headers = [
    "id",
    "qrCode",
    "status",
    "checkedIn",
    "checkInTime",
    "ticketTypeName",
    "ticketTypePrice",
    "eventTitle",
    "eventDate",
    "buyerName",
    "buyerEmail",
    "buyerPhone",
    "holderName",
    "holderEmail", 
    "holderPhone",
    "createdAt",
    "scannedAt"
  ];

  const processedData = tickets.map(ticket => ({
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn ? "Yes" : "No",
    checkInTime: ticket.checkInTime ? formatDate(ticket.checkInTime) : "",
    ticketTypeName: ticket.ticketType?.name || "",
    ticketTypePrice: ticket.ticketType ? formatCurrency(ticket.ticketType.price, ticket.ticketType.currency) : "",
    eventTitle: ticket.ticketType?.event?.title || "",
    eventDate: ticket.ticketType?.event?.startDate ? formatDate(ticket.ticketType.event.startDate) : "",
    buyerName: ticket.user?.name || "",
    buyerEmail: ticket.user?.email || "",
    buyerPhone: ticket.user?.phone || "",
    holderName: ticket.ticketHolder?.name || "",
    holderEmail: ticket.ticketHolder?.email || "",
    holderPhone: ticket.ticketHolder?.phone || "",
    createdAt: formatDate(ticket.createdAt),
    scannedAt: ticket.scannedAt ? formatDate(ticket.scannedAt) : ""
  }));

  const csvContent = arrayToCSV(processedData, headers);
  const defaultFilename = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename || defaultFilename);
}

/**
 * Export wristbands to CSV
 */
export function exportWristbandsToCSV(wristbands: any[], filename?: string): void {
  const headers = [
    "id",
    "name",
    "description", 
    "qrCode",
    "status",
    "isReusable",
    "maxScans",
    "scanCount",
    "validFrom",
    "validUntil",
    "eventTitle",
    "eventDate",
    "codeType",
    "createdAt",
    "totalScans"
  ];

  const processedData = wristbands.map(wristband => ({
    id: wristband.id,
    name: wristband.name,
    description: wristband.description || "",
    qrCode: wristband.qrCode,
    status: wristband.status,
    isReusable: wristband.isReusable ? "Yes" : "No",
    maxScans: wristband.maxScans || "Unlimited",
    scanCount: wristband.scanCount,
    validFrom: wristband.validFrom ? formatDate(wristband.validFrom) : "",
    validUntil: wristband.validUntil ? formatDate(wristband.validUntil) : "",
    eventTitle: wristband.event?.title || "",
    eventDate: wristband.event?.startDate ? formatDate(wristband.event.startDate) : "",
    codeType: wristband.codeType || "QR",
    createdAt: formatDate(wristband.createdAt),
    totalScans: wristband.totalScans || wristband._count?.scanLogs || 0
  }));

  const csvContent = arrayToCSV(processedData, headers);
  const defaultFilename = `wristbands-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename || defaultFilename);
}

/**
 * Generate filename with timestamp and event/organizer context
 */
export function generateExportFilename(
  type: "tickets" | "ticket-types" | "wristbands",
  context?: { eventName?: string; organizerName?: string }
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  let filename = type;
  
  if (context?.eventName) {
    const sanitizedEventName = context.eventName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    filename += `-${sanitizedEventName}`;
  }
  
  if (context?.organizerName) {
    const sanitizedOrganizerName = context.organizerName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    filename += `-${sanitizedOrganizerName}`;
  }
  
  filename += `-${timestamp}.csv`;
  
  return filename;
}

/**
 * Export wristband scan logs to CSV
 */
export function exportWristbandScanLogsToCSV(scanLogs: any[], filename?: string): void {
  const headers = [
    "id",
    "wristbandName",
    "wristbandCode",
    "scannedBy",
    "scannedAt",
    "scanResult",
    "scanLocation",
    "scanDevice",
    "notes",
    "eventTitle",
    "eventDate"
  ];

  const processedData = scanLogs.map(log => ({
    id: log.id,
    wristbandName: log.wristbandQR?.name || "",
    wristbandCode: log.wristbandQR?.qrCode || "",
    scannedBy: log.scannedBy,
    scannedAt: formatDate(log.scannedAt),
    scanResult: log.scanResult,
    scanLocation: log.scanLocation || "",
    scanDevice: log.scanDevice || "",
    notes: log.notes || "",
    eventTitle: log.wristbandQR?.event?.title || "",
    eventDate: log.wristbandQR?.event?.startDate ? formatDate(log.wristbandQR.event.startDate) : ""
  }));

  const csvContent = arrayToCSV(processedData, headers);
  const defaultFilename = `wristband-scan-logs-${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(csvContent, filename || defaultFilename);
}
