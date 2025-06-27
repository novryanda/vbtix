import { jsPDF } from 'jspdf';
import { generatePDFQRCodeImage, testQRCodeQuality, PDF_QR_OPTIONS } from './qr-code.service';
import type { TicketQRData } from './qr-code.service';

export interface TicketPDFData {
  ticketId: string;
  ticketNumber: string;
  ticketType: string;
  holderName: string;
  qrData: TicketQRData;
  logoUrl?: string; // Individual ticket logo
  ticketTypeLogoUrl?: string; // Ticket type logo
  eventImageUrl?: string; // Event image as fallback
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    address: string;
  };
  order: {
    invoiceNumber: string;
    totalAmount: number;
    paymentDate: string;
  };
}

export interface PDFGenerationOptions {
  pageWidth?: number;
  pageHeight?: number;
  margin?: number;
  fontSize?: {
    title?: number;
    subtitle?: number;
    body?: number;
    small?: number;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
  };
}

const DEFAULT_PDF_OPTIONS: Required<PDFGenerationOptions> = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 20,
  fontSize: {
    title: 20,
    subtitle: 16,
    body: 12,
    small: 10,
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    text: '#1f2937',
  },
};

/**
 * Generate a professional PDF ticket with QR code using jsPDF
 */
export async function generateTicketPDF(
  ticketData: TicketPDFData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  try {
    const opts = { ...DEFAULT_PDF_OPTIONS, ...options };

    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Test QR code quality before generation
    console.log(`🧪 Testing QR code quality for ticket: ${ticketData.ticketNumber}`);
    const qualityTest = await testQRCodeQuality(ticketData.qrData);
    console.log(`📊 QR code quality: ${qualityTest.quality.toUpperCase()} (${qualityTest.success ? 'PASS' : 'FAIL'})`);

    if (qualityTest.details.recommendations.length > 0) {
      console.log(`💡 QR code recommendations:`, qualityTest.details.recommendations);
    }

    // Generate high-quality QR code optimized for PDF scanning
    console.log(`🔄 Generating optimized QR code for PDF ticket: ${ticketData.ticketNumber}`);
    const qrCodeDataUrl = await generatePDFQRCodeImage(ticketData.qrData, {
      // Use enhanced PDF-optimized settings for maximum scanning reliability
      width: 1200,   // Ultra-high resolution for crisp PDF rendering and mobile scanning
      height: 1200,  // Ultra-high resolution for crisp PDF rendering and mobile scanning
      margin: 10,    // Generous margin for better scanner detection and edge clarity
      errorCorrectionLevel: 'H', // Highest error correction level for maximum reliability
    });
    console.log(`✅ QR code generated for PDF ticket: ${ticketData.ticketNumber} (Quality: ${qualityTest.quality})`);

    // Build the PDF content
    await buildPDFContent(doc, ticketData, qrCodeDataUrl, opts);

    // Convert to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('Error generating PDF ticket:', error);
    throw new Error('Failed to generate PDF ticket');
  }
}

/**
 * Build the PDF content with professional layout
 */
async function buildPDFContent(
  doc: jsPDF,
  ticketData: TicketPDFData,
  qrCodeDataUrl: string,
  options: Required<PDFGenerationOptions>
): Promise<void> {
  const { margin, fontSize, colors } = options;
  let currentY = margin;

  // Helper function to add text with color
  const addText = (text: string, x: number, y: number, size: number, color: string, align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    if (align === 'center') {
      doc.text(text, x, y, { align: 'center' });
    } else if (align === 'right') {
      doc.text(text, x, y, { align: 'right' });
    } else {
      doc.text(text, x, y);
    }
  };

  // Header with VBTicket branding and logo
  addText('VBTicket', 105, currentY, fontSize.title, colors.primary, 'center');
  currentY += 15;

  addText('E-TICKET', 105, currentY, fontSize.subtitle, colors.text, 'center');
  currentY += 20;

  // Add ticket logo with fallback hierarchy
  try {
    let logoUrl = ticketData.logoUrl || ticketData.ticketTypeLogoUrl || ticketData.eventImageUrl;
    if (logoUrl) {
      // Add logo to PDF (centered, above event title)
      const logoSize = 30; // 30mm width/height
      const logoX = (210 - logoSize) / 2; // Center horizontally

      // Create a white background for the logo
      doc.setFillColor(255, 255, 255);
      doc.rect(logoX - 2, currentY - 2, logoSize + 4, logoSize + 4, 'F');

      // Add the logo image
      doc.addImage(logoUrl, 'JPEG', logoX, currentY, logoSize, logoSize);
      currentY += logoSize + 10;
    }
  } catch (error) {
    console.warn('Failed to add logo to PDF:', error);
    // Continue without logo if there's an error
  }

  // Event title
  addText(ticketData.event.title, 105, currentY, fontSize.title, colors.text, 'center');
  currentY += 25;

  // Ticket information section
  doc.setDrawColor(59, 130, 246); // Primary color
  doc.setLineWidth(1);
  doc.rect(margin, currentY, 170, 40);

  currentY += 10;
  addText('INFORMASI TIKET', margin + 5, currentY, fontSize.subtitle, colors.primary);
  currentY += 10;

  const ticketDetails = [
    { label: 'Nomor Tiket:', value: ticketData.ticketNumber },
    { label: 'Jenis Tiket:', value: ticketData.ticketType },
    { label: 'Pemegang Tiket:', value: ticketData.holderName },
    { label: 'Invoice:', value: ticketData.order.invoiceNumber },
  ];

  ticketDetails.forEach((detail) => {
    addText(detail.label, margin + 5, currentY, fontSize.body, colors.text);
    addText(detail.value, margin + 50, currentY, fontSize.body, colors.text);
    currentY += 6;
  });

  currentY += 15;

  // Event details section
  addText('DETAIL ACARA', margin, currentY, fontSize.subtitle, colors.primary);
  currentY += 10;

  const eventDetails = [
    { label: 'Tanggal & Waktu:', value: `${ticketData.event.date}, ${ticketData.event.time}` },
    { label: 'Lokasi:', value: ticketData.event.location },
    { label: 'Alamat:', value: ticketData.event.address },
  ];

  eventDetails.forEach((detail) => {
    addText(detail.label, margin, currentY, fontSize.body, colors.text);
    addText(detail.value, margin + 40, currentY, fontSize.body, colors.text);
    currentY += 8;
  });

  currentY += 15;

  // QR Code section with enhanced visibility
  addText('KODE QR TIKET', 105, currentY, fontSize.subtitle, colors.primary, 'center');
  currentY += 20;

  // Add QR code with optimal size and positioning for maximum scanning reliability
  const qrSize = 80; // Increased to 80mm for much better scanning reliability on mobile devices
  const qrX = (210 - qrSize) / 2; // Center horizontally

  // Add a clean white background with subtle border for better contrast
  doc.setFillColor(255, 255, 255); // Pure white background
  doc.setDrawColor(220, 220, 220); // Light gray border
  doc.setLineWidth(0.5);
  doc.rect(qrX - 3, currentY - 3, qrSize + 6, qrSize + 6, 'FD'); // Fill and draw border

  // Add the QR code image with high quality and optimal positioning
  doc.addImage(qrCodeDataUrl, 'PNG', qrX, currentY, qrSize, qrSize);
  currentY += qrSize + 15;

  // Add QR code instructions for better user guidance
  addText('Scan kode QR di atas untuk validasi tiket', 105, currentY, fontSize.small, colors.text, 'center');
  currentY += 10;

  // Important message
  addText('Ini tiket Anda, silahkan ditukarkan saat penukaran', 105, currentY, fontSize.body, colors.secondary, 'center');
  currentY += 15;

  // Instructions
  addText('PETUNJUK PENTING:', margin, currentY, fontSize.body, colors.text);
  currentY += 8;

  const instructions = [
    '• Tunjukkan kode QR ini saat masuk ke venue',
    '• Bawa identitas yang sesuai dengan nama pemegang tiket',
    '• Datang 30 menit sebelum acara dimulai',
    '• Simpan tiket ini dengan baik',
  ];

  instructions.forEach((instruction) => {
    addText(instruction, margin, currentY, fontSize.small, colors.text);
    currentY += 5;
  });

  // Footer
  const footerY = 280; // Near bottom of page
  addText('Terima kasih telah menggunakan VBTicket', 105, footerY, fontSize.small, colors.primary, 'center');
}

/**
 * Generate multiple ticket PDFs for a transaction
 */
export async function generateTransactionTicketPDFs(
  tickets: TicketPDFData[],
  options: PDFGenerationOptions = {}
): Promise<Buffer[]> {
  try {
    const pdfPromises = tickets.map(ticket => generateTicketPDF(ticket, options));
    return await Promise.all(pdfPromises);
  } catch (error) {
    console.error('Error generating transaction ticket PDFs:', error);
    throw new Error('Failed to generate transaction ticket PDFs');
  }
}

/**
 * Format currency for Indonesian Rupiah
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for Indonesian locale
 */
export function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format time for Indonesian locale
 */
export function formatIndonesianTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}


