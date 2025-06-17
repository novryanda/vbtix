import QRCode from "qrcode";
import { randomBytes, createHash, createCipheriv, createDecipheriv } from "crypto";
import { env } from "~/env";

/**
 * QR Code data structure for tickets
 */
export interface TicketQRData {
  ticketId: string;
  eventId: string;
  userId: string;
  transactionId: string;
  ticketTypeId: string;
  issuedAt: string;
  expiresAt?: string;
  checksum: string;
}

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Default QR code generation options optimized for scanning reliability
 */
const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  width: 512,  // Increased resolution for better scanning
  height: 512, // Increased resolution for better scanning
  margin: 4,   // Increased margin for better scanner detection
  color: {
    dark: "#000000",    // Pure black for maximum contrast
    light: "#FFFFFF",   // Pure white for maximum contrast
  },
  errorCorrectionLevel: "H", // Highest error correction level
};

/**
 * Optimized QR code options specifically for PDF tickets
 * Enhanced for maximum readability and scanning reliability
 */
export const PDF_QR_OPTIONS: QRCodeOptions = {
  width: 1000,  // Very high resolution for crisp PDF rendering and mobile scanning
  height: 1000, // Very high resolution for crisp PDF rendering and mobile scanning
  margin: 8,    // Generous margin for better scanner detection and edge clarity
  color: {
    dark: "#000000",    // Pure black for maximum contrast
    light: "#FFFFFF",   // Pure white background for optimal contrast
  },
  errorCorrectionLevel: "H", // Highest error correction level for maximum reliability
};

/**
 * Mobile-optimized QR code options for screen display
 */
export const MOBILE_QR_OPTIONS: QRCodeOptions = {
  width: 400,  // Optimized for mobile screens
  height: 400, // Optimized for mobile screens
  margin: 4,   // Standard margin
  color: {
    dark: "#000000",    // Pure black for maximum contrast
    light: "#FFFFFF",   // Pure white for maximum contrast
  },
  errorCorrectionLevel: "Q", // High error correction for mobile scanning
};

/**
 * Encryption key for QR code data (should be from environment)
 */
const ENCRYPTION_KEY = env.QR_CODE_ENCRYPTION_KEY || "default-key-change-in-production-32-chars";
const ALGORITHM = "aes-256-cbc";

/**
 * Generate secure QR code data for a ticket
 */
export function generateQRCodeData(params: {
  ticketId: string;
  eventId: string;
  userId: string;
  transactionId: string;
  ticketTypeId: string;
  eventDate?: Date;
}): TicketQRData {
  const { ticketId, eventId, userId, transactionId, ticketTypeId, eventDate } = params;
  
  const issuedAt = new Date().toISOString();

  // Set expiration to the later of: 24 hours after event OR 7 days from now
  // This ensures QR codes remain valid for a reasonable period
  let expiresAt: string | undefined;
  if (eventDate) {
    const eventExpiry = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after event
    const minimumExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    expiresAt = new Date(Math.max(eventExpiry.getTime(), minimumExpiry.getTime())).toISOString();
  }
  
  // Create checksum for data integrity
  const dataToHash = `${ticketId}:${eventId}:${userId}:${transactionId}:${ticketTypeId}:${issuedAt}`;
  const checksum = createHash("sha256").update(dataToHash).digest("hex").substring(0, 16);
  
  return {
    ticketId,
    eventId,
    userId,
    transactionId,
    ticketTypeId,
    issuedAt,
    expiresAt,
    checksum,
  };
}

/**
 * Encrypt QR code data for secure storage
 */
export function encryptQRCodeData(data: TicketQRData): string {
  try {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Combine IV and encrypted data
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Error encrypting QR code data:", error);
    throw new Error("Failed to encrypt QR code data");
  }
}

/**
 * Decrypt QR code data for validation
 */
export function decryptQRCodeData(encryptedData: string): TicketQRData {
  try {
    // Try current encryption format first
    const [ivHex, encrypted] = encryptedData.split(":");
    if (!ivHex || !encrypted) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as TicketQRData;
  } catch (error) {
    console.error("Error decrypting QR code data with current method:", error);

    // Try legacy decryption methods for backward compatibility
    try {
      return decryptLegacyQRCodeData(encryptedData);
    } catch (legacyError) {
      console.error("Error decrypting QR code data with legacy methods:", legacyError);
      throw new Error("Failed to decrypt QR code data");
    }
  }
}

/**
 * Attempt to decrypt QR codes using legacy encryption methods
 */
function decryptLegacyQRCodeData(encryptedData: string): TicketQRData {
  const legacyMethods = [
    // Method 1: Try with full encryption key (64 chars)
    () => {
      const [ivHex, encrypted] = encryptedData.split(":");
      if (!ivHex || !encrypted) {
        throw new Error("Invalid format");
      }
      const iv = Buffer.from(ivHex, "hex");
      const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return JSON.parse(decrypted);
    },

    // Method 2: Try with different key derivation
    () => {
      const [ivHex, encrypted] = encryptedData.split(":");
      if (!ivHex || !encrypted) {
        throw new Error("Invalid format");
      }
      const iv = Buffer.from(ivHex, "hex");
      const key = createHash("sha256").update(ENCRYPTION_KEY).digest();
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return JSON.parse(decrypted);
    },

    // Method 3: Try base64 decoding first
    () => {
      const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
      const [ivHex, encrypted] = decoded.split(":");
      if (!ivHex || !encrypted) {
        throw new Error("Invalid format");
      }
      const iv = Buffer.from(ivHex, "hex");
      const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return JSON.parse(decrypted);
    }
  ];

  for (let i = 0; i < legacyMethods.length; i++) {
    try {
      console.log(`🔄 Trying legacy decryption method ${i + 1}...`);
      const result = legacyMethods[i]();
      console.log(`✅ Legacy decryption method ${i + 1} succeeded`);
      return result;
    } catch (error) {
      console.log(`❌ Legacy decryption method ${i + 1} failed:`, error instanceof Error ? error.message : error);
    }
  }

  throw new Error("All decryption methods failed");
}

/**
 * Validate QR code data integrity
 */
export function validateQRCodeData(data: TicketQRData): boolean {
  try {
    // Check if expired (with some tolerance for clock differences)
    if (data.expiresAt) {
      const expirationDate = new Date(data.expiresAt);
      const now = new Date();
      const timeDifference = now.getTime() - expirationDate.getTime();

      // Allow 1 hour grace period for clock differences
      if (timeDifference > 60 * 60 * 1000) {
        console.warn(`QR code expired: ${data.expiresAt} (${Math.round(timeDifference / (60 * 60 * 1000))} hours ago)`);
        return false;
      }
    }

    // Verify checksum
    const dataToHash = `${data.ticketId}:${data.eventId}:${data.userId}:${data.transactionId}:${data.ticketTypeId}:${data.issuedAt}`;
    const expectedChecksum = createHash("sha256").update(dataToHash).digest("hex").substring(0, 16);

    const checksumValid = data.checksum === expectedChecksum;
    if (!checksumValid) {
      console.warn(`QR code checksum mismatch: expected ${expectedChecksum}, got ${data.checksum}`);
    }

    return checksumValid;
  } catch (error) {
    console.error("Error validating QR code data:", error);
    return false;
  }
}

/**
 * Generate QR code image as base64 data URL
 */
export async function generateQRCodeImage(
  data: TicketQRData,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    // Encrypt the data before encoding in QR code
    const encryptedData = encryptQRCodeData(data);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(encryptedData, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code image:", error);
    throw new Error("Failed to generate QR code image");
  }
}

/**
 * Generate QR code image as buffer (for file storage)
 */
export async function generateQRCodeBuffer(
  data: TicketQRData,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };

    // Encrypt the data before encoding in QR code
    const encryptedData = encryptQRCodeData(data);

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });

    return qrCodeBuffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw new Error("Failed to generate QR code buffer");
  }
}

// Email QR code functions removed - PDF-only delivery system

/**
 * Generate high-quality QR code specifically optimized for PDF tickets
 */
export async function generatePDFQRCodeImage(
  data: TicketQRData,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // Use PDF-optimized settings by default
    const qrOptions = { ...PDF_QR_OPTIONS, ...options };

    console.log(`🔄 Generating PDF QR code with settings:`, {
      width: qrOptions.width,
      height: qrOptions.height,
      margin: qrOptions.margin,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });

    // Encrypt the data before encoding in QR code
    const encryptedData = encryptQRCodeData(data);

    console.log(`📊 QR code data length: ${encryptedData.length} characters`);

    // Generate QR code as high-quality data URL
    const qrCodeDataUrl = await QRCode.toDataURL(encryptedData, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      type: 'image/png',
      quality: 1.0, // Maximum quality
      rendererOpts: {
        quality: 1.0, // Maximum quality for PNG
      },
    });

    console.log(`✅ PDF QR code generated successfully - Data URL length: ${qrCodeDataUrl.length}`);

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating PDF QR code image:", error);
    throw new Error("Failed to generate PDF QR code image");
  }
}

/**
 * Generate high-quality QR code buffer specifically optimized for PDF tickets
 */
export async function generatePDFQRCodeBuffer(
  data: TicketQRData,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    // Use PDF-optimized settings by default
    const qrOptions = { ...PDF_QR_OPTIONS, ...options };

    console.log(`🔄 Generating PDF QR code buffer with settings:`, {
      width: qrOptions.width,
      height: qrOptions.height,
      margin: qrOptions.margin,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });

    // Encrypt the data before encoding in QR code
    const encryptedData = encryptQRCodeData(data);

    // Generate QR code as high-quality buffer
    const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      type: 'png',
      rendererOpts: {
        quality: 1.0, // Maximum quality
      },
    });

    console.log(`✅ PDF QR code buffer generated successfully - Size: ${qrCodeBuffer.length} bytes`);

    return qrCodeBuffer;
  } catch (error) {
    console.error("Error generating PDF QR code buffer:", error);
    throw new Error("Failed to generate PDF QR code buffer");
  }
}

/**
 * Validate scanned QR code data
 */
export function validateScannedQRCode(encryptedData: string): {
  isValid: boolean;
  data?: TicketQRData;
  error?: string;
} {
  try {
    // Decrypt the data
    const data = decryptQRCodeData(encryptedData);
    
    // Validate the data
    const isValid = validateQRCodeData(data);
    
    if (!isValid) {
      return {
        isValid: false,
        error: "QR code data is invalid or expired",
      };
    }
    
    return {
      isValid: true,
      data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid QR code format",
    };
  }
}

/**
 * Generate a simple QR code for public display (non-encrypted)
 */
export async function generateSimpleQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };

    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating simple QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Test QR code quality and scanning reliability
 */
export async function testQRCodeQuality(data: TicketQRData): Promise<{
  success: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  details: {
    dataLength: number;
    encryptedLength: number;
    errorCorrectionLevel: string;
    estimatedModules: number;
    recommendations: string[];
  };
  testResults: {
    encryption: boolean;
    decryption: boolean;
    validation: boolean;
    dataIntegrity: boolean;
  };
}> {
  try {
    console.log('🧪 Testing QR code quality and reliability...');

    const testResults = {
      encryption: false,
      decryption: false,
      validation: false,
      dataIntegrity: false,
    };

    // Test 1: Encryption
    let encryptedData: string;
    try {
      encryptedData = encryptQRCodeData(data);
      testResults.encryption = true;
      console.log('✅ QR code encryption test passed');
    } catch (error) {
      console.error('❌ QR code encryption test failed:', error);
      throw error;
    }

    // Test 2: Decryption
    let decryptedData: TicketQRData;
    try {
      decryptedData = decryptQRCodeData(encryptedData);
      testResults.decryption = true;
      console.log('✅ QR code decryption test passed');
    } catch (error) {
      console.error('❌ QR code decryption test failed:', error);
      throw error;
    }

    // Test 3: Validation
    try {
      const isValid = validateQRCodeData(decryptedData);
      testResults.validation = isValid;
      if (isValid) {
        console.log('✅ QR code validation test passed');
      } else {
        console.warn('⚠️ QR code validation test failed');
      }
    } catch (error) {
      console.error('❌ QR code validation test failed:', error);
    }

    // Test 4: Data Integrity
    try {
      const dataMatches = JSON.stringify(data) === JSON.stringify(decryptedData);
      testResults.dataIntegrity = dataMatches;
      if (dataMatches) {
        console.log('✅ QR code data integrity test passed');
      } else {
        console.warn('⚠️ QR code data integrity test failed');
      }
    } catch (error) {
      console.error('❌ QR code data integrity test failed:', error);
    }

    // Analyze quality metrics
    const dataLength = JSON.stringify(data).length;
    const encryptedLength = encryptedData.length;

    // Estimate QR code complexity (rough calculation)
    const estimatedModules = Math.ceil(Math.sqrt(encryptedLength * 8));

    // Quality assessment
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    const recommendations: string[] = [];

    if (encryptedLength <= 200) {
      quality = 'excellent';
    } else if (encryptedLength <= 400) {
      quality = 'good';
    } else if (encryptedLength <= 600) {
      quality = 'fair';
      recommendations.push('Consider reducing data payload for better scanning');
    } else {
      quality = 'poor';
      recommendations.push('Data payload too large - may cause scanning issues');
      recommendations.push('Consider using shorter identifiers or reducing data');
    }

    // Additional recommendations based on test results
    if (!testResults.validation) {
      recommendations.push('QR code validation failed - check data integrity');
    }

    if (!testResults.dataIntegrity) {
      recommendations.push('Data integrity compromised - encryption/decryption issue');
    }

    if (estimatedModules > 50) {
      recommendations.push('QR code may be complex - ensure adequate size in PDF');
    }

    const allTestsPassed = Object.values(testResults).every(result => result === true);

    console.log(`📊 QR code quality assessment: ${quality.toUpperCase()}`);
    console.log(`📏 Data length: ${dataLength} chars, Encrypted: ${encryptedLength} chars`);
    console.log(`🔍 Estimated modules: ${estimatedModules}x${estimatedModules}`);

    return {
      success: allTestsPassed,
      quality,
      details: {
        dataLength,
        encryptedLength,
        errorCorrectionLevel: 'H',
        estimatedModules,
        recommendations,
      },
      testResults,
    };

  } catch (error) {
    console.error('❌ QR code quality test failed:', error);
    return {
      success: false,
      quality: 'poor',
      details: {
        dataLength: 0,
        encryptedLength: 0,
        errorCorrectionLevel: 'H',
        estimatedModules: 0,
        recommendations: ['QR code generation failed - check data and encryption'],
      },
      testResults: {
        encryption: false,
        decryption: false,
        validation: false,
        dataIntegrity: false,
      },
    };
  }
}
