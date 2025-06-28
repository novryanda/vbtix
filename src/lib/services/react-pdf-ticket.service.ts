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
 * Build header section with VBTicket logo and event title
 */
async function buildHeader(
  doc: jsPDF,
  ticketData: TicketPDFData,
  startY: number,
  addText: (text: string, x: number, y: number, size: number, color: string, align?: 'left' | 'center' | 'right') => void,
  fontSize: Required<PDFGenerationOptions>['fontSize'],
  colors: Required<PDFGenerationOptions>['colors']
): Promise<number> {
  let currentY = startY;

  // Create header background with light blue color
  doc.setFillColor(240, 248, 255); // Very light blue background
  doc.rect(15, currentY - 5, 180, 40, 'F');
  
  // Add border around header
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.rect(15, currentY - 5, 180, 40);

  try {
    // Add VBTicket logo (desain_logo.png) at top left
    const vbLogoPath = '/desain_logo.png';
    const logoSize = 20; // Smaller logo size for cleaner look
    doc.addImage(vbLogoPath, 'PNG', 20, currentY, logoSize, logoSize);
    
    // Add E-Ticket VBTicket title next to logo with better spacing
    addText('E-Ticket VBTicket', 45, currentY + 12, fontSize.subtitle || 16, colors.primary || '#3b82f6');
    
    // Add event title in header area (right side)
    const eventTitleWidth = doc.getTextWidth(ticketData.event.title);
    if (eventTitleWidth > 80) {
      // If title is too long, split it
      const words = ticketData.event.title.split(' ');
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
      const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
      addText(line1, 190, currentY + 8, fontSize.body || 12, colors.text || '#1f2937', 'right');
      addText(line2, 190, currentY + 18, fontSize.body || 12, colors.text || '#1f2937', 'right');
    } else {
      addText(ticketData.event.title, 190, currentY + 12, fontSize.body || 12, colors.text || '#1f2937', 'right');
    }
    
  } catch (error) {
    console.warn('Failed to add header logo:', error);
    // Fallback header without logo
    addText('E-Ticket VBTicket', 105, currentY + 12, fontSize.subtitle || 16, colors.primary || '#3b82f6', 'center');
    addText(ticketData.event.title, 105, currentY + 25, fontSize.body || 12, colors.text || '#1f2937', 'center');
  }
  
  currentY += 45; // Move down after header
  return currentY;
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

  // Header Section
  currentY = await buildHeader(doc, ticketData, currentY, addText, fontSize, colors);
  currentY += 10;

  // Main content area with proper sections
  
  // Section 1: Ticket Information (Left side)
  const leftColumn = 20;
  const rightColumn = 110;
  const sectionWidth = 85;
  
  // Prepare ticket details data
  const ticketDetails = [
    { label: 'Nomor Tiket', value: ticketData.ticketNumber },
    { label: 'Jenis Tiket', value: ticketData.ticketType },
    { label: 'Pemegang Tiket', value: ticketData.holderName },
    { label: 'Invoice', value: ticketData.order.invoiceNumber },
  ];

  // Calculate dynamic height for ticket info box
  const titleHeight = 20; // Space for title + margin
  const ticketContentHeight = ticketDetails.length * 15; // 15mm per item
  const ticketBoxPadding = 10; // Top and bottom padding
  const ticketBoxHeight = titleHeight + ticketContentHeight + ticketBoxPadding;

  // Ticket Info Section Background (Dynamic height)
  doc.setFillColor(252, 252, 252); // Very light gray
  doc.rect(leftColumn - 5, currentY - 5, sectionWidth, ticketBoxHeight, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(leftColumn - 5, currentY - 5, sectionWidth, ticketBoxHeight);

  addText('INFORMASI TIKET', leftColumn, currentY + 5, fontSize.subtitle || 16, colors.primary || '#3b82f6');
  let ticketY = currentY + 15;

  ticketDetails.forEach((detail, index) => {
    addText(`${detail.label}:`, leftColumn, ticketY, fontSize.small || 10, colors.text || '#666666');
    addText(detail.value, leftColumn, ticketY + 7, fontSize.body || 12, colors.text || '#1f2937');
    ticketY += 15;
  });

  // Section 2: Event Details (Right side)
  // Prepare event details data
  const eventDetails = [
    { label: 'Tanggal', value: ticketData.event.date },
    { label: 'Waktu', value: ticketData.event.time },
    { label: 'Lokasi', value: ticketData.event.location },
    { label: 'Alamat', value: ticketData.event.address }, // Full address without truncation
  ];

  // Calculate dynamic height for event details box
  const eventContentHeight = eventDetails.length * 15; // 15mm per item
  const eventBoxHeight = titleHeight + eventContentHeight + ticketBoxPadding;

  // Event Info Section Background (Dynamic height)
  doc.setFillColor(252, 252, 252);
  doc.rect(rightColumn - 5, currentY - 5, sectionWidth, eventBoxHeight, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(rightColumn - 5, currentY - 5, sectionWidth, eventBoxHeight);

  addText('DETAIL ACARA', rightColumn, currentY + 5, fontSize.subtitle || 16, colors.primary || '#3b82f6');
  let eventY = currentY + 15;

  eventDetails.forEach((detail, index) => {
    addText(`${detail.label}:`, rightColumn, eventY, fontSize.small || 10, colors.text || '#666666');
    
    // Handle long text for address
    if (detail.label === 'Alamat' && detail.value.length > 30) {
      // Split long address into multiple lines
      const words = detail.value.split(' ');
      const lines = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > (sectionWidth - 10) && currentLine) { // Leave margin for box
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        lines.push(currentLine);
      }

      // Add each line
      lines.forEach((line, lineIndex) => {
        addText(line, rightColumn, eventY + 7 + (lineIndex * 6), fontSize.body || 12, colors.text || '#1f2937');
      });
      
      eventY += 15 + ((lines.length - 1) * 6); // Adjust for multiple lines
    } else {
      addText(detail.value, rightColumn, eventY + 7, fontSize.body || 12, colors.text || '#1f2937');
      eventY += 15;
    }
  });

  // Move currentY past the tallest box
  const maxBoxHeight = Math.max(ticketBoxHeight, eventBoxHeight);
  currentY += maxBoxHeight + 15; // Add space after sections

  // Section 3: QR Code (Center, smaller like in reference)
  const qrSectionY = currentY;
  
  // QR Section Background
  doc.setFillColor(255, 255, 255); // White background
  doc.rect(15, qrSectionY - 5, 180, 70, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.rect(15, qrSectionY - 5, 180, 70);

  addText('KODE QR TIKET', 105, qrSectionY + 5, fontSize.subtitle || 16, colors.primary || '#3b82f6', 'center');
  currentY = qrSectionY + 15;

  // Add QR code with smaller size (like in reference PDF - about 30mm)
  const qrSize = 30; // Much smaller, professional size like reference
  const qrX = (210 - qrSize) / 2; // Center horizontally

  // Add the QR code image
  doc.addImage(qrCodeDataUrl, 'PNG', qrX, currentY, qrSize, qrSize);
  
  // QR instructions below the code
  addText('Tunjukkan QR code ini saat masuk venue', 105, currentY + qrSize + 10, fontSize.small || 10, colors.text || '#666666', 'center');
  
  currentY = qrSectionY + 70; // Move past QR section

  // Section 4: Important Instructions (Clean table-like format)
  currentY += 10;
  
  // Instructions Section Background
  doc.setFillColor(250, 250, 250);
  doc.rect(15, currentY - 5, 180, 40, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(15, currentY - 5, 180, 40);

  addText('PETUNJUK PENTING', 20, currentY + 5, fontSize.body || 12, colors.primary || '#3b82f6');
  currentY += 15;

  const instructions = [
    'Bawa identitas yang sesuai dengan nama pemegang tiket',
    'Datang 30 menit sebelum acara dimulai',
    'Simpan tiket ini dengan baik sampai acara selesai',
  ];

  instructions.forEach((instruction, index) => {
    addText(`${index + 1}.`, 25, currentY, fontSize.small || 10, colors.primary || '#3b82f6');
    addText(instruction, 35, currentY, fontSize.small || 10, colors.text || '#1f2937');
    currentY += 8;
  });

  // Footer removed as requested
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


