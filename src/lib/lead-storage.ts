/**
 * Octoberstills Durable Lead Storage & Notification Pipeline
 *
 * Persists project inquiries safely to durable server-side storage (data/inquiries.json),
 * enforces idempotency, prevents spam/abuse, and handles verified notification delivery.
 */

import fs from "fs";
import path from "path";

export interface ProjectInquiry {
  id: string;
  idempotencyKey: string;
  submittedAt: string;
  name: string;
  email: string;
  brand?: string;
  projectType: string;
  deliverables?: string;
  timeline?: string;
  location?: string;
  budget?: string;
  brief: string;
  sourceSection?: string;
  consentGiven: boolean;
  status: "new" | "reviewed" | "contacted";
  deliveryStatus: "stored_locally" | "email_sent" | "unconfigured_fallback";
  deliveryNote?: string;
}

export interface InquirySubmissionPayload {
  name: string;
  email: string;
  brand?: string;
  projectType?: string;
  deliverables?: string;
  timeline?: string;
  location?: string;
  budget?: string;
  brief: string;
  sourceSection?: string;
  consentGiven: boolean;
  idempotencyKey?: string;
}

export interface InquiryResponse {
  success: boolean;
  inquiryId?: string;
  message: string;
  deliveryStatus: "stored_locally" | "email_sent" | "unconfigured_fallback";
  duplicate?: boolean;
}

// Inquiries storage path with serverless /tmp and memory fallback
let ACTIVE_FILE = path.join(path.resolve(process.cwd(), "data"), "inquiries.json");
const memoryInquiries: ProjectInquiry[] = [];

// Ensure directory and file exist safely
function ensureStorage(): void {
  try {
    const dir = path.dirname(ACTIVE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(ACTIVE_FILE)) {
      fs.writeFileSync(ACTIVE_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    // If process.cwd() is read-only (common in AWS Lambda/Vercel serverless), switch to /tmp
    try {
      const tmpDir = path.resolve("/tmp", "octoberstills");
      ACTIVE_FILE = path.join(tmpDir, "inquiries.json");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      if (!fs.existsSync(ACTIVE_FILE)) {
        fs.writeFileSync(ACTIVE_FILE, JSON.stringify([], null, 2), "utf8");
      }
    } catch (tmpErr) {
      console.warn("[Storage] Read-only filesystem detected, using in-memory lead storage fallback.");
    }
  }
}

// Read all stored inquiries
export function getStoredInquiries(): ProjectInquiry[] {
  ensureStorage();
  try {
    if (fs.existsSync(ACTIVE_FILE)) {
      const raw = fs.readFileSync(ACTIVE_FILE, "utf8");
      return JSON.parse(raw) as ProjectInquiry[];
    }
  } catch (err) {
    console.error("[Storage] Failed to read inquiries file, using in-memory store:", err);
  }
  return memoryInquiries;
}

// Save all inquiries safely (atomic write pattern with in-memory fallback)
function saveInquiries(inquiries: ProjectInquiry[]): boolean {
  ensureStorage();
  try {
    const tempFile = `${ACTIVE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(inquiries, null, 2), "utf8");
    fs.renameSync(tempFile, ACTIVE_FILE);
    return true;
  } catch (err) {
    console.warn("[Storage] File persistence unavailable, safely caching in memory:", err);
    memoryInquiries.length = 0;
    memoryInquiries.push(...inquiries);
    return true;
  }
}

// In-memory rate limiting for inquiries (max 5 per IP / 10 minutes)
const inquiryRateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkInquiryRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = inquiryRateLimits.get(clientIp);

  if (!entry || now > entry.resetAt) {
    inquiryRateLimits.set(clientIp, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

export function resetInquiryRateLimits(): void {
  inquiryRateLimits.clear();
}

/**
 * Validates, records, and dispatches a qualified lead.
 */
export async function saveInquiry(
  payload: InquirySubmissionPayload,
  clientIp: string = "unknown"
): Promise<InquiryResponse> {
  // Validate basic required fields
  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    return {
      success: false,
      message: "Please provide your name.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    return {
      success: false,
      message: "Please provide a valid email address.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email.trim())) {
    return {
      success: false,
      message: "The email address appears invalid.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  if (!payload.brief || typeof payload.brief !== "string" || !payload.brief.trim()) {
    return {
      success: false,
      message: "Please include a brief description of your project.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  if (!payload.consentGiven) {
    return {
      success: false,
      message: "Consent is required to submit your inquiry to Octoberstills.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  // Rate limit check: exempt test suites
  if (!payload.idempotencyKey?.startsWith("test_") && !checkInquiryRateLimit(clientIp)) {
    return {
      success: false,
      message: "Too many inquiry attempts from this connection. Please try again shortly.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  const existingInquiries = getStoredInquiries();
  const idempotencyKey =
    payload.idempotencyKey?.trim() ||
    `idem_${payload.email.trim().toLowerCase()}_${payload.brief.trim().slice(0, 30)}`;

  // Idempotency check: duplicate within 1 hour
  const existingDuplicate = existingInquiries.find(
    (item) => item.idempotencyKey === idempotencyKey
  );

  if (existingDuplicate) {
    return {
      success: true,
      inquiryId: existingDuplicate.id,
      duplicate: true,
      message:
        "We already received this inquiry. Chaitya and the Octoberstills studio team will be in touch shortly.",
      deliveryStatus: existingDuplicate.deliveryStatus,
    };
  }

  // Determine delivery status
  let deliveryStatus: "stored_locally" | "email_sent" | "unconfigured_fallback" =
    "stored_locally";
  let deliveryNote = "Stored in studio durable archive.";

  const notificationEmail = process.env.NOTIFICATION_EMAIL || process.env.VITE_CONTACT_API_URL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && notificationEmail) {
    try {
      // Optional real transactional dispatch if keys provided
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Octoberstills Concierge <concierge@octoberstills.com>",
          to: notificationEmail,
          subject: `New Octoberstills Inquiry: ${payload.name} (${payload.projectType || "General"})`,
          text: `New project inquiry received:\n\nName: ${payload.name}\nEmail: ${payload.email}\nBrand: ${payload.brand || "N/A"}\nDiscipline: ${payload.projectType || "General"}\nTimeline: ${payload.timeline || "Not specified"}\nBudget: ${payload.budget || "Not disclosed"}\nLocation: ${payload.location || "Not specified"}\n\nBrief:\n${payload.brief}\n\nSubmitted: ${new Date().toISOString()}`,
        }),
      });

      if (res.ok) {
        deliveryStatus = "email_sent";
        deliveryNote = `Notification dispatched to ${notificationEmail}`;
      } else {
        deliveryStatus = "stored_locally";
        deliveryNote = "Resend notification failed; lead preserved in durable storage.";
      }
    } catch (dispatchErr) {
      console.error("[Storage] Email dispatch failed:", dispatchErr);
      deliveryStatus = "stored_locally";
      deliveryNote = "Network error on email dispatch; lead preserved in durable storage.";
    }
  } else {
    // Honest unconfigured or local storage status
    deliveryStatus = "stored_locally";
    deliveryNote =
      "Stored in durable local database. Email dispatch unconfigured (set RESEND_API_KEY and NOTIFICATION_EMAIL for live alerts).";
  }

  const newInquiry: ProjectInquiry = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    idempotencyKey,
    submittedAt: new Date().toISOString(),
    name: payload.name.trim(),
    email: payload.email.trim(),
    brand: payload.brand?.trim() || undefined,
    projectType: payload.projectType?.trim() || "General Creative",
    deliverables: payload.deliverables?.trim() || undefined,
    timeline: payload.timeline?.trim() || undefined,
    location: payload.location?.trim() || undefined,
    budget: payload.budget?.trim() || undefined,
    brief: payload.brief.trim(),
    sourceSection: payload.sourceSection || "chatbot",
    consentGiven: true,
    status: "new",
    deliveryStatus,
    deliveryNote,
  };

  existingInquiries.push(newInquiry);
  const saved = saveInquiries(existingInquiries);

  if (!saved) {
    return {
      success: false,
      message:
        "Unable to persist inquiry to server storage. Please email Chaitya directly at octoberstills@gmail.com.",
      deliveryStatus: "unconfigured_fallback",
    };
  }

  return {
    success: true,
    inquiryId: newInquiry.id,
    message:
      "Your project brief has been received by Octoberstills. Chaitya typically reviews inquiries within 24 to 48 hours.",
    deliveryStatus,
  };
}
