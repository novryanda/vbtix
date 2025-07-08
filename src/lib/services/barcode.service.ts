import JsBarcode from "jsbarcode";
import { createHash } from "crypto";

/**
 * Barcode generation options
 */
export interface BarcodeOptions {
  width?: number;
  height?: number;
  format?: "CODE128" | "CODE39" | "CODE93" | "EAN13" | "EAN8" | "UPC";
  displayValue?: boolean;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  textPosition?: "bottom" | "top";
  textMargin?: number;
  fontOptions?: string;
  font?: string;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

/**
 * Wristband barcode data structure
 */
export interface WristbandBarcodeData {
  wristbandId: string;
  eventId: string;
  organizerId: string;
  name: string;
  issuedAt: string;
  validFrom?: string;
  validUntil?: string;
  isReusable: boolean;
  maxScans?: number;
  checksum: string;
}

/**
 * Default barcode options optimized for wristband scanning
 */
export const DEFAULT_BARCODE_OPTIONS: BarcodeOptions = {
  format: "CODE128",
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 14,
  textAlign: "center",
  textPosition: "bottom",
  textMargin: 2,
  fontOptions: "",
  font: "monospace",
  background: "#ffffff",
  lineColor: "#000000",
  margin: 10,
};

/**
 * High-quality barcode options for printing
 */
export const PRINT_BARCODE_OPTIONS: BarcodeOptions = {
  format: "CODE128",
  width: 3,
  height: 120,
  displayValue: true,
  fontSize: 16,
  textAlign: "center",
  textPosition: "bottom",
  textMargin: 4,
  fontOptions: "bold",
  font: "monospace",
  background: "#ffffff",
  lineColor: "#000000",
  margin: 15,
};

/**
 * Generate secure barcode data for a wristband
 */
export function generateWristbandBarcodeData(params: {
  wristbandId: string;
  eventId: string;
  organizerId: string;
  name: string;
  validFrom?: Date;
  validUntil?: Date;
  isReusable?: boolean;
  maxScans?: number;
}): WristbandBarcodeData {
  const { wristbandId, eventId, organizerId, name, validFrom, validUntil, isReusable = true, maxScans } = params;

  const issuedAt = new Date().toISOString();
  const validFromStr = validFrom?.toISOString();
  const validUntilStr = validUntil?.toISOString();

  // Create checksum for data integrity
  const dataToHash = `${wristbandId}:${eventId}:${organizerId}:${name}:${issuedAt}:${isReusable}`;
  const checksum = createHash("sha256").update(dataToHash).digest("hex").substring(0, 16);

  return {
    wristbandId,
    eventId,
    organizerId,
    name,
    issuedAt,
    validFrom: validFromStr,
    validUntil: validUntilStr,
    isReusable,
    maxScans,
    checksum,
  };
}

/**
 * Generate barcode value from wristband data
 */
export function generateBarcodeValue(data: WristbandBarcodeData): string {
  // Create a compact barcode value that includes essential data
  // Format: WB-{wristbandId}-{checksum}
  const shortId = data.wristbandId.substring(0, 8);
  const shortChecksum = data.checksum.substring(0, 8);
  return `WB-${shortId}-${shortChecksum}`;
}

/**
 * Generate barcode image as base64 data URL
 */
export async function generateBarcodeImage(
  value: string,
  options: BarcodeOptions = DEFAULT_BARCODE_OPTIONS
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      
      // Generate barcode on canvas
      JsBarcode(canvas, value, {
        format: options.format || "CODE128",
        width: options.width || 2,
        height: options.height || 100,
        displayValue: options.displayValue !== false,
        fontSize: options.fontSize || 14,
        textAlign: options.textAlign || "center",
        textPosition: options.textPosition || "bottom",
        textMargin: options.textMargin || 2,
        fontOptions: options.fontOptions || "",
        font: options.font || "monospace",
        background: options.background || "#ffffff",
        lineColor: options.lineColor || "#000000",
        margin: options.margin || 10,
        marginTop: options.marginTop,
        marginBottom: options.marginBottom,
        marginLeft: options.marginLeft,
        marginRight: options.marginRight,
      });

      // Convert canvas to base64 data URL
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate barcode image for server-side use (Node.js)
 */
export async function generateBarcodeImageServer(
  value: string,
  options: BarcodeOptions = DEFAULT_BARCODE_OPTIONS
): Promise<Buffer> {
  // For server-side, we'll use canvas package
  const { createCanvas } = await import("canvas");
  
  const canvas = createCanvas(400, 200);
  
  JsBarcode(canvas, value, {
    format: options.format || "CODE128",
    width: options.width || 2,
    height: options.height || 100,
    displayValue: options.displayValue !== false,
    fontSize: options.fontSize || 14,
    textAlign: options.textAlign || "center",
    textPosition: options.textPosition || "bottom",
    textMargin: options.textMargin || 2,
    fontOptions: options.fontOptions || "",
    font: options.font || "monospace",
    background: options.background || "#ffffff",
    lineColor: options.lineColor || "#000000",
    margin: options.margin || 10,
    marginTop: options.marginTop,
    marginBottom: options.marginBottom,
    marginLeft: options.marginLeft,
    marginRight: options.marginRight,
  });

  return canvas.toBuffer("image/png");
}

/**
 * Encrypt barcode data for secure storage
 */
export function encryptWristbandBarcodeData(data: WristbandBarcodeData): string {
  // Simple base64 encoding for now - in production, use proper encryption
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString("base64");
}

/**
 * Decrypt barcode data
 */
export function decryptWristbandBarcodeData(encryptedData: string): WristbandBarcodeData {
  try {
    const jsonString = Buffer.from(encryptedData, "base64").toString("utf-8");
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Invalid or corrupted barcode data");
  }
}

/**
 * Validate barcode data integrity
 */
export function validateWristbandBarcodeData(data: WristbandBarcodeData): boolean {
  try {
    // Verify checksum
    const dataToHash = `${data.wristbandId}:${data.eventId}:${data.organizerId}:${data.name}:${data.issuedAt}:${data.isReusable}`;
    const expectedChecksum = createHash("sha256").update(dataToHash).digest("hex").substring(0, 16);
    
    return data.checksum === expectedChecksum;
  } catch (error) {
    return false;
  }
}

/**
 * Parse barcode value to extract wristband ID
 */
export function parseBarcodeValue(barcodeValue: string): { wristbandId: string; checksum: string } | null {
  try {
    // Expected format: WB-{shortId}-{shortChecksum}
    const match = barcodeValue.match(/^WB-([a-zA-Z0-9]{8})-([a-zA-Z0-9]{8})$/);
    if (!match) {
      return null;
    }
    
    return {
      wristbandId: match[1],
      checksum: match[2],
    };
  } catch (error) {
    return null;
  }
}
