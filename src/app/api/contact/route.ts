import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { emailService } from "~/lib/email-service";

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phone: z.string().optional(),
  eventId: z.string().optional(), // For event-specific inquiries
});

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📧 Contact form submission received");

    // Parse request body
    const body = await request.json();
    console.log("📋 Contact form data:", { ...body, message: body.message?.substring(0, 50) + "..." });

    // Validate input
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      console.log("❌ Contact form validation failed:", result.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
          details: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, phone, eventId } = result.data;

    // Send email to support team
    try {
      const supportEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${eventId ? `<p><strong>Event ID:</strong> ${eventId}</p>` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Subject</h3>
            <p>${subject}</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0369a1;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Submitted at: ${new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      `;

      const supportEmailText = `
New Contact Form Submission

Contact Information:
- Name: ${name}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}
${eventId ? `- Event ID: ${eventId}` : ''}

Subject: ${subject}

Message:
${message}

Submitted at: ${new Date().toLocaleString('id-ID')}
      `;

      const supportEmailResult = await emailService.sendEmail({
        to: "support@vbticket.com",
        subject: `[Contact Form] ${subject}`,
        html: supportEmailHtml,
        text: supportEmailText,
        tags: [
          { name: "category", value: "contact-form" },
          { name: "sender", value: emailService.sanitizeTagValue(name) },
        ],
      });

      console.log("✅ Support email sent:", supportEmailResult.success);
    } catch (supportEmailError) {
      console.error("❌ Failed to send support email:", supportEmailError);
    }

    // Send confirmation email to user
    try {
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
          </div>

          <div style="padding: 30px 20px; background-color: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Thank you for reaching out to VBTicket! We have received your message and will get back to you as soon as possible.</p>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Message Summary</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString('id-ID')}</p>
            </div>

            <p>Our support team typically responds within 24 hours during business days. If your inquiry is urgent, please don't hesitate to contact us directly.</p>

            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
                <strong>Need immediate assistance?</strong><br>
                Email: support@vbticket.com<br>
                WhatsApp: +62 812-3456-7890
              </p>
            </div>

            <p>Best regards,<br>The VBTicket Team</p>
          </div>
        </div>
      `;

      const confirmationEmailText = `
Hi ${name},

Thank you for reaching out to VBTicket! We have received your message and will get back to you as soon as possible.

Your Message Summary:
- Subject: ${subject}
- Submitted: ${new Date().toLocaleString('id-ID')}

Our support team typically responds within 24 hours during business days. If your inquiry is urgent, please don't hesitate to contact us directly.

Need immediate assistance?
Email: support@vbticket.com
WhatsApp: +62 812-3456-7890

Best regards,
The VBTicket Team
      `;

      const confirmationResult = await emailService.sendEmail({
        to: email,
        subject: "Thank you for contacting VBTicket - We've received your message",
        html: confirmationEmailHtml,
        text: confirmationEmailText,
        tags: [
          { name: "category", value: "contact-confirmation" },
          { name: "recipient", value: emailService.sanitizeTagValue(name) },
        ],
      });

      console.log("✅ Confirmation email sent:", confirmationResult.success);
    } catch (confirmationEmailError) {
      console.error("❌ Failed to send confirmation email:", confirmationEmailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing contact form:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your message. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Health check for contact form endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Contact form endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
