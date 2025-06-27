import { Resend } from "resend";
import { env } from "~/env";
import { generateTicketPDF, type TicketPDFData } from "./services/react-pdf-ticket.service";
import {
  generateQRCodeData,
  type TicketQRData
} from "./services/qr-code.service";

// Initialize Resend with proper error handling
const resend = new Resend(env.RESEND_API_KEY);

// Check if email service is properly configured
const isEmailConfigured = () => {
  return !!(env.RESEND_API_KEY && env.EMAIL_FROM);
};

interface EmailConfig {
  from: string;
  replyTo?: string;
  companyName: string;
}

const defaultConfig: EmailConfig = {
  from: env.EMAIL_FROM || "noreply@vbticket.com",
  replyTo: "support@vbticket.com",
  companyName: "VBTicket",
};

export class EmailService {
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Create HTML template for account verification
   */
  private createAccountVerificationHTML(
    userName: string,
    verificationUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Akun - ${this.config.companyName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
      <h1 style="color: #3b82f6; font-size: 28px; margin: 0; font-weight: bold;">${this.config.companyName}</h1>
      <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0;">Platform Tiket Event Terpercaya</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 30px 0;">
      <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; text-align: center;">🎉 Selamat Datang di ${this.config.companyName}!</h2>

      <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${userName}</strong>,</p>

      <p style="font-size: 16px; margin-bottom: 20px;">
        Terima kasih telah mendaftar di ${this.config.companyName}! Untuk melengkapi proses pendaftaran dan mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini.
      </p>

      <!-- Verification Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
          ✅ Verifikasi Email Saya
        </a>
      </div>

      <p style="font-size: 14px; color: #666666; text-align: center; margin-bottom: 20px;">
        Atau salin dan tempel link berikut di browser Anda:
      </p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; word-break: break-all; font-size: 14px; color: #495057;">
        ${verificationUrl}
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>⚠️ Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.
        </p>
      </div>

      <h3 style="color: #1f2937; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Setelah verifikasi, Anda dapat:</h3>

      <ul style="font-size: 14px; color: #4b5563; padding-left: 20px;">
        <li style="margin-bottom: 8px;">🎫 Membeli tiket event favorit Anda</li>
        <li style="margin-bottom: 8px;">📱 Mengelola tiket digital dengan mudah</li>
        <li style="margin-bottom: 8px;">🔔 Mendapatkan notifikasi event terbaru</li>
        <li style="margin-bottom: 8px;">💰 Menikmati promo dan diskon eksklusif</li>
        <li style="margin-bottom: 8px;">📊 Melihat riwayat pembelian tiket</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 10px 0;">Email ini dikirim oleh ${this.config.companyName}</p>
      <p style="margin: 0 0 10px 0;">
        Jika Anda memiliki pertanyaan, hubungi kami di
        <a href="mailto:${this.config.replyTo}" style="color: #3b82f6;">${this.config.replyTo}</a>
      </p>
      <p style="margin: 0;">© 2025 ${this.config.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Create text template for account verification
   */
  private createAccountVerificationText(
    userName: string,
    verificationUrl: string,
  ): string {
    return `
Selamat Datang di ${this.config.companyName}!

Halo ${userName},

Terima kasih telah mendaftar di ${this.config.companyName}! Untuk melengkapi proses pendaftaran dan mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik link berikut:

${verificationUrl}

Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.

Setelah verifikasi, Anda dapat:
- Membeli tiket event favorit Anda
- Mengelola tiket digital dengan mudah
- Mendapatkan notifikasi event terbaru
- Menikmati promo dan diskon eksklusif
- Melihat riwayat pembelian tiket

Jika Anda memiliki pertanyaan, hubungi kami di ${this.config.replyTo}

© 2025 ${this.config.companyName}. All rights reserved.
    `.trim();
  }

  /**
   * Send account verification email
   */
  async sendAccountVerification({
    to,
    userName,
    verificationUrl,
  }: {
    to: string;
    userName: string;
    verificationUrl: string;
  }) {
    try {
      const htmlContent = this.createAccountVerificationHTML(
        userName,
        verificationUrl,
      );
      const textContent = this.createAccountVerificationText(
        userName,
        verificationUrl,
      );

      const result = await resend.emails.send({
        from: this.config.from,
        to: [to],
        replyTo: this.config.replyTo,
        subject: `Verifikasi Akun ${this.config.companyName} - ${userName}`,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: "category", value: "account-verification" },
          { name: "user", value: this.sanitizeTagValue(userName) },
        ],
      });

      console.log("✅ Account verification email sent:", result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error("❌ Failed to send account verification email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create HTML template for ticket delivery
   */
  private createTicketDeliveryHTML(
    customerName: string,
    event: any,
    order: any,
    tickets: any[],
  ): string {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const ticketsHTML = tickets
      .map(
        (ticket, index) => `
      <div style="border: 2px solid #3b82f6; border-radius: 12px; margin-bottom: 20px; overflow: hidden; background-color: #ffffff;">
        <!-- Ticket Header -->
        <div style="background-color: #3b82f6; color: #ffffff; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; font-size: 16px;">Tiket #${index + 1}</h4>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${ticket.ticketType}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">Nomor Tiket</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold;">${ticket.ticketNumber}</p>
          </div>
        </div>

        <!-- Ticket Body -->
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;">Nama Pemegang Tiket:</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold;">${ticket.holderName}</p>
            </div>
            ${
              ticket.qrCode
                ? `
            <div style="text-align: center;">
              <img src="${ticket.qrCode}" alt="QR Code" style="width: 80px; height: 80px; border: 1px solid #e5e7eb; border-radius: 4px;" />
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">QR Code</p>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiket Anda - ${event.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 30px 20px; text-align: center;">
      <h1 style="font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">🎉 Tiket Anda Sudah Siap!</h1>
      <p style="font-size: 16px; margin: 0; opacity: 0.9;">Terima kasih telah mempercayai ${this.config.companyName}</p>
    </div>

    ${
      event.image
        ? `
    <!-- Event Banner -->
    <div style="height: 200px; background-image: url(${event.image}); background-size: cover; background-position: center; position: relative;">
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: #ffffff; padding: 20px;">
        <h2 style="font-size: 24px; margin: 0; font-weight: bold;">${event.title}</h2>
      </div>
    </div>
    `
        : ""
    }

    <!-- Main Content -->
    <div style="padding: 30px 20px;">
      <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${customerName}</strong>,</p>

      <p style="font-size: 16px; margin-bottom: 30px;">
        Pembayaran Anda telah berhasil dikonfirmasi! Berikut adalah tiket digital Anda untuk event <strong>${event.title}</strong>.
      </p>

      <!-- Event Details -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">📅 Detail Event</h3>

        <div style="display: grid; gap: 10px;">
          <div><span style="font-weight: bold; color: #4b5563;">Event:</span> ${event.title}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Tanggal:</span> ${event.date}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Waktu:</span> ${event.time}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Lokasi:</span> ${event.location}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Alamat:</span> ${event.address}</div>
        </div>
      </div>

      <!-- Order Summary -->
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #92400e; font-size: 18px; margin: 0 0 15px 0;">🧾 Ringkasan Pesanan</h3>

        <div style="display: grid; gap: 8px;">
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Invoice:</span> <span>${order.invoiceNumber}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Total Bayar:</span> <span style="font-weight: bold; color: #059669;">${formatPrice(order.totalAmount)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Tanggal Bayar:</span> <span>${order.paymentDate}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Jumlah Tiket:</span> <span>${tickets.length} tiket</span></div>
        </div>
      </div>

      <!-- Tickets -->
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">🎫 Tiket Digital Anda</h3>

      ${ticketsHTML}

      <!-- Important Notes -->
      <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin-top: 30px;">
        <h3 style="color: #dc2626; font-size: 16px; margin: 0 0 15px 0;">⚠️ Penting - Harap Dibaca!</h3>

        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #7f1d1d;">
          <li style="margin-bottom: 8px;">Simpan email ini sebagai bukti pembelian tiket Anda</li>
          <li style="margin-bottom: 8px;">Tunjukkan QR Code atau nomor tiket saat masuk ke venue</li>
          <li style="margin-bottom: 8px;">Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara</li>
          <li style="margin-bottom: 8px;">Datang 30 menit sebelum acara dimulai untuk proses check-in</li>
          <li style="margin-bottom: 0;">Hubungi customer service jika ada pertanyaan</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 10px 0;">Terima kasih telah menggunakan ${this.config.companyName}</p>
      <p style="margin: 0 0 10px 0;">
        Butuh bantuan? Hubungi kami di
        <a href="mailto:${this.config.replyTo}" style="color: #3b82f6;">${this.config.replyTo}</a>
      </p>
      <p style="margin: 0;">© 2025 ${this.config.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send ticket delivery email
   */
  async sendTicketDelivery({
    to,
    customerName,
    event,
    order,
    tickets,
  }: {
    to: string;
    customerName: string;
    event: {
      title: string;
      date: string;
      time: string;
      location: string;
      address: string;
      image?: string;
    };
    order: {
      invoiceNumber: string;
      totalAmount: number;
      paymentDate: string;
    };
    tickets: Array<{
      id: string;
      ticketNumber: string;
      ticketType: string;
      holderName: string;
      qrCode?: string;
    }>;
  }) {
    try {
      // Check if email service is configured
      if (!isEmailConfigured()) {
        console.log("📧 Email service not configured. Ticket email would be sent to:", to);
        return {
          success: false,
          error: "Email service not configured. Please set RESEND_API_KEY and EMAIL_FROM environment variables."
        };
      }
      const htmlContent = this.createTicketDeliveryHTML(
        customerName,
        event,
        order,
        tickets,
      );

      // Create text version
      const textContent = this.createTicketDeliveryTextEmail({
        customerName,
        event,
        order,
        tickets,
      });

      const result = await resend.emails.send({
        from: this.config.from,
        to: [to],
        replyTo: this.config.replyTo,
        subject: `🎫 Tiket Anda - ${event.title} | ${order.invoiceNumber}`,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: "category", value: "ticket-delivery" },
          { name: "event", value: this.sanitizeTagValue(event.title) },
          { name: "invoice", value: this.sanitizeTagValue(order.invoiceNumber) },
        ],
      });

      console.log("✅ Ticket delivery email sent - Full result:", JSON.stringify(result, null, 2));

      // Check if there's an error in the result
      if (result.error) {
        console.error("❌ Resend API error:", result.error);
        return {
          success: false,
          error: result.error.message || "Email sending failed",
          resendError: result.error
        };
      }

      console.log("✅ Ticket delivery email sent - Message ID:", result.data?.id);
      return { success: true, messageId: result.data?.id, fullResult: result };
    } catch (error: any) {
      console.error("❌ Failed to send ticket delivery email:", error);
      return { success: false, error: error.message };
    }
  }

  // sendTicketDeliveryWithQRImages method removed - PDF-only delivery system

  /**
   * Send ticket delivery email with PDF attachments
   */
  async sendTicketDeliveryWithPDF({
    to,
    customerName,
    event,
    order,
    tickets,
  }: {
    to: string;
    customerName: string;
    event: {
      title: string;
      date: string;
      time: string;
      location: string;
      address: string;
      image?: string;
    };
    order: {
      invoiceNumber: string;
      totalAmount: number;
      paymentDate: string;
    };
    tickets: Array<{
      id: string;
      ticketNumber: string;
      ticketType: string;
      holderName: string;
      qrCode?: string;
      // Additional fields needed for PDF generation
      eventId?: string;
      userId?: string;
      transactionId?: string;
      ticketTypeId?: string;
      eventDate?: Date;
    }>;
  }) {
    try {
      // Check if email service is configured
      if (!isEmailConfigured()) {
        console.log("📧 Email service not configured. Ticket email would be sent to:", to);
        return {
          success: false,
          error: "Email service not configured. Please set RESEND_API_KEY and EMAIL_FROM environment variables."
        };
      }

      console.log(`📄 Starting PDF generation for ${tickets.length} tickets...`);

      // Generate PDF attachments for each ticket
      const pdfAttachments = await Promise.all(
        tickets.map(async (ticket, index) => {
          try {
            console.log(`📄 Generating PDF for ticket ${index + 1}/${tickets.length}: ${ticket.ticketNumber}`);

            // Generate QR data for PDF
            const qrData = generateQRCodeData({
              ticketId: ticket.id,
              eventId: ticket.eventId || '',
              userId: ticket.userId || '',
              transactionId: ticket.transactionId || '',
              ticketTypeId: ticket.ticketTypeId || '',
              eventDate: ticket.eventDate || new Date(),
            });

            console.log(`✅ QR data generated for ticket ${ticket.ticketNumber}`);

            // Prepare ticket data for PDF
            const ticketPDFData: TicketPDFData = {
              ticketId: ticket.id,
              ticketNumber: ticket.ticketNumber,
              ticketType: ticket.ticketType,
              holderName: ticket.holderName,
              qrData,
              logoUrl: (ticket as any).logoUrl, // Individual ticket logo
              ticketTypeLogoUrl: (ticket as any).ticketTypeLogoUrl, // Ticket type logo
              eventImageUrl: (event as any).imageUrl, // Event image as fallback
              event: {
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location,
                address: event.address,
              },
              order: {
                invoiceNumber: order.invoiceNumber,
                totalAmount: order.totalAmount,
                paymentDate: order.paymentDate,
              },
            };

            // Generate PDF
            console.log(`🔄 Generating PDF buffer for ticket ${ticket.ticketNumber}...`);
            const pdfBuffer = await generateTicketPDF(ticketPDFData);

            console.log(`✅ PDF generated for ticket ${ticket.ticketNumber} - Size: ${pdfBuffer.length} bytes (${Math.round(pdfBuffer.length / 1024)} KB)`);

            // Validate PDF buffer
            if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
              throw new Error(`Invalid PDF buffer generated for ticket ${ticket.ticketNumber}`);
            }

            const attachment = {
              filename: `tiket-${ticket.ticketNumber}-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
              content: pdfBuffer,
              content_type: 'application/pdf',
            };

            console.log(`📎 Attachment prepared: ${attachment.filename} (${pdfBuffer.length} bytes)`);

            return attachment;
          } catch (error) {
            console.error(`❌ Error generating PDF for ticket ${ticket.id}:`, error);
            throw error;
          }
        })
      );

      console.log(`✅ All ${pdfAttachments.length} PDF attachments generated successfully`);

      // Create HTML content (modified to mention PDF attachments)
      const htmlContent = this.createTicketDeliveryWithPDFHTML(
        customerName,
        event,
        order,
        tickets,
      );

      // Create text version (modified to mention PDF attachments)
      const textContent = this.createTicketDeliveryWithPDFTextEmail({
        customerName,
        event,
        order,
        tickets,
      });

      console.log(`📧 Sending email with ${pdfAttachments.length} PDF attachments to: ${to}`);
      console.log(`📎 Attachment details:`, pdfAttachments.map(att => ({
        filename: att.filename,
        size: att.content.length,
        isBuffer: Buffer.isBuffer(att.content)
      })));

      const result = await resend.emails.send({
        from: this.config.from,
        to: [to],
        replyTo: this.config.replyTo,
        subject: `🎫 Tiket PDF Anda - ${event.title} | ${order.invoiceNumber}`,
        html: htmlContent,
        text: textContent,
        attachments: pdfAttachments,
        tags: [
          { name: "category", value: "ticket-delivery-pdf" },
          { name: "event", value: this.sanitizeTagValue(event.title) },
          { name: "invoice", value: this.sanitizeTagValue(order.invoiceNumber) },
        ],
      });

      console.log(`📧 Email send attempt completed. Checking result...`);

      console.log("✅ Ticket delivery email with PDF sent - Full result:", JSON.stringify(result, null, 2));

      // Log attachment details for debugging
      if (result.data?.id) {
        console.log(`📧 Email sent successfully with ID: ${result.data.id}`);
        console.log(`📎 Attachments included: ${pdfAttachments.length}`);
        pdfAttachments.forEach((att, index) => {
          console.log(`   ${index + 1}. ${att.filename} (${att.content.length} bytes, ${att.content_type})`);
        });
      }

      // Check if there's an error in the result
      if (result.error) {
        console.error("❌ Resend API error:", result.error);
        return {
          success: false,
          error: result.error.message || "Email sending failed",
          resendError: result.error
        };
      }

      console.log("✅ Ticket delivery email with PDF sent - Message ID:", result.data?.id);
      return { success: true, messageId: result.data?.id, fullResult: result };
    } catch (error: any) {
      console.error("❌ Failed to send ticket delivery email with PDF:", error);
      return { success: false, error: error.message };
    }
  }

  // createTicketDeliveryWithQRImagesHTML method removed - PDF-only delivery system

  /**
   * Create plain text version of ticket delivery email
   */
  private createTicketDeliveryTextEmail({
    customerName,
    event,
    order,
    tickets,
  }: {
    customerName: string;
    event: any;
    order: any;
    tickets: any[];
  }): string {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return `
🎉 TIKET ANDA SUDAH SIAP!

Halo ${customerName},

Pembayaran Anda telah berhasil dikonfirmasi! Berikut adalah tiket digital Anda untuk event ${event.title}.

📅 DETAIL EVENT
Event: ${event.title}
Tanggal: ${event.date}
Waktu: ${event.time}
Lokasi: ${event.location}
Alamat: ${event.address}

🧾 RINGKASAN PESANAN
Invoice: ${order.invoiceNumber}
Total Bayar: ${formatPrice(order.totalAmount)}
Tanggal Bayar: ${order.paymentDate}
Jumlah Tiket: ${tickets.length} tiket

🎫 TIKET DIGITAL ANDA
${tickets
  .map(
    (ticket, index) => `
Tiket #${index + 1}
- Jenis: ${ticket.ticketType}
- Nomor: ${ticket.ticketNumber}
- Pemegang: ${ticket.holderName}
`,
  )
  .join("")}

⚠️ PENTING - HARAP DIBACA!
- Simpan email ini sebagai bukti pembelian tiket Anda
- Tunjukkan QR Code atau nomor tiket saat masuk ke venue
- Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara
- Datang 30 menit sebelum acara dimulai untuk proses check-in
- Hubungi customer service jika ada pertanyaan

Terima kasih telah menggunakan ${this.config.companyName}

Butuh bantuan? Hubungi kami di support@vbticket.com

© 2025 ${this.config.companyName}. All rights reserved.
    `.trim();
  }

  /**
   * Create HTML template for ticket delivery with PDF attachments
   */
  private createTicketDeliveryWithPDFHTML(
    customerName: string,
    event: any,
    order: any,
    tickets: any[],
  ): string {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tiket PDF Anda - ${event.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">🎉 Tiket PDF Anda Sudah Siap!</h1>
            <p style="font-size: 16px; margin: 0; opacity: 0.9;">Tiket digital dalam format PDF telah dilampirkan</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin: 0 0 20px 0;">Halo <strong>${customerName}</strong>,</p>

            <p style="font-size: 14px; margin: 0 0 25px 0; line-height: 1.6;">
                Pembayaran Anda telah berhasil dikonfirmasi! Tiket digital Anda untuk event <strong>${event.title}</strong>
                telah dilampirkan dalam format PDF pada email ini.
            </p>

            <!-- PDF Attachment Notice -->
            <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1d4ed8; margin: 0 0 10px 0; font-size: 16px;">📎 Tiket PDF Terlampir</h3>
                <p style="margin: 0; font-size: 14px; color: #1f2937;">
                    Tiket Anda telah dilampirkan sebagai file PDF. Silakan unduh dan simpan file PDF tersebut.
                    Tunjukkan kode QR pada tiket PDF saat masuk ke venue.
                </p>
            </div>

            <!-- Event Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📅 Detail Event</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 30%;">Event:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${event.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tanggal:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${event.date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Waktu:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${event.time}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Lokasi:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${event.location}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Alamat:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${event.address}</td>
                    </tr>
                </table>
            </div>

            <!-- Order Summary -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">🧾 Ringkasan Pesanan</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 30%;">Invoice:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${order.invoiceNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Bayar:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${formatPrice(order.totalAmount)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tanggal Bayar:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${order.paymentDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Jumlah Tiket:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${tickets.length} tiket</td>
                    </tr>
                </table>
            </div>

            <!-- Tickets List -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">🎫 Tiket Digital Anda</h3>
                ${tickets
                  .map(
                    (ticket, index) => `
                    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 10px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Tiket #${index + 1}</h4>
                        <p style="margin: 5px 0; font-size: 14px;"><strong>Jenis:</strong> ${ticket.ticketType}</p>
                        <p style="margin: 5px 0; font-size: 14px;"><strong>Nomor:</strong> ${ticket.ticketNumber}</p>
                        <p style="margin: 5px 0; font-size: 14px;"><strong>Pemegang:</strong> ${ticket.holderName}</p>
                    </div>
                `,
                  )
                  .join("")}
            </div>

            <!-- Important Instructions -->
            <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">⚠️ PENTING - HARAP DIBACA!</h3>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                    <li style="margin: 8px 0;">Unduh dan simpan file PDF tiket yang dilampirkan</li>
                    <li style="margin: 8px 0;">Tunjukkan kode QR pada tiket PDF saat masuk ke venue</li>
                    <li style="margin: 8px 0;">Bawa identitas yang sesuai dengan nama pemegang tiket</li>
                    <li style="margin: 8px 0;">Datang 30 menit sebelum acara dimulai untuk proses check-in</li>
                    <li style="margin: 8px 0;">Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara</li>
                </ul>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin: 25px 0 0 0; text-align: center;">
                Terima kasih telah menggunakan ${this.config.companyName}<br>
                Butuh bantuan? Hubungi kami di support@vbticket.com
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © 2025 ${this.config.companyName}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Create plain text version of ticket delivery email with PDF attachments
   */
  private createTicketDeliveryWithPDFTextEmail({
    customerName,
    event,
    order,
    tickets,
  }: {
    customerName: string;
    event: any;
    order: any;
    tickets: any[];
  }): string {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return `
🎉 TIKET PDF ANDA SUDAH SIAP!

Halo ${customerName},

Pembayaran Anda telah berhasil dikonfirmasi! Tiket digital Anda untuk event ${event.title} telah dilampirkan dalam format PDF pada email ini.

📎 TIKET PDF TERLAMPIR
Tiket Anda telah dilampirkan sebagai file PDF. Silakan unduh dan simpan file PDF tersebut. Tunjukkan kode QR pada tiket PDF saat masuk ke venue.

📅 DETAIL EVENT
Event: ${event.title}
Tanggal: ${event.date}
Waktu: ${event.time}
Lokasi: ${event.location}
Alamat: ${event.address}

🧾 RINGKASAN PESANAN
Invoice: ${order.invoiceNumber}
Total Bayar: ${formatPrice(order.totalAmount)}
Tanggal Bayar: ${order.paymentDate}
Jumlah Tiket: ${tickets.length} tiket

🎫 TIKET DIGITAL ANDA
${tickets
  .map(
    (ticket, index) => `
Tiket #${index + 1}
- Jenis: ${ticket.ticketType}
- Nomor: ${ticket.ticketNumber}
- Pemegang: ${ticket.holderName}
`,
  )
  .join("")}

⚠️ PENTING - HARAP DIBACA!
- Unduh dan simpan file PDF tiket yang dilampirkan
- Tunjukkan kode QR pada tiket PDF saat masuk ke venue
- Bawa identitas yang sesuai dengan nama pemegang tiket
- Datang 30 menit sebelum acara dimulai untuk proses check-in
- Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara
- Hubungi customer service jika ada pertanyaan

Terima kasih telah menggunakan ${this.config.companyName}

Butuh bantuan? Hubungi kami di support@vbticket.com

© 2025 ${this.config.companyName}. All rights reserved.
    `.trim();
  }

  /**
   * Send a generic email (for custom use cases)
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
    tags = [],
  }: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    tags?: Array<{ name: string; value: string }>;
  }) {
    try {
      const result = await resend.emails.send({
        from: this.config.from,
        to: Array.isArray(to) ? to : [to],
        replyTo: this.config.replyTo,
        subject,
        html,
        text,
        tags,
      });

      console.log("✅ Email sent - Full result:", JSON.stringify(result, null, 2));

      // Check if there's an error in the result
      if (result.error) {
        console.error("❌ Resend API error:", result.error);
        return {
          success: false,
          error: result.error.message || "Email sending failed",
          resendError: result.error
        };
      }

      console.log("✅ Email sent - Message ID:", result.data?.id);
      return { success: true, messageId: result.data?.id, fullResult: result };
    } catch (error: any) {
      console.error("❌ Failed to send email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sanitize tag values to only contain ASCII letters, numbers, underscores, or dashes
   */
  sanitizeTagValue(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace invalid characters with underscore
      .substring(0, 50); // Limit length to 50 characters
  }

  /**
   * Test email configuration
   */
  async testConfiguration() {
    try {
      // Send a simple test email
      const result = await this.sendEmail({
        to: "test@example.com",
        subject: "Test Email Configuration",
        html: "<p>This is a test email to verify configuration.</p>",
        text: "This is a test email to verify configuration.",
        tags: [{ name: "category", value: "test" }],
      });

      return result;
    } catch (error: any) {
      console.error("❌ Email configuration test failed:", error);
      return { success: false, error: error.message };
    }
  }
}

// Export default instance
export const emailService = new EmailService();

// Export types for use in other files
export type { EmailConfig };
