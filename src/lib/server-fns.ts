/**
 * TanStack Start Server Functions for Octoberstills Studio Assistant
 *
 * Provides isomorphic client-to-server RPC with full server-side execution:
 * - chatWithStudioAssistant
 * - submitStudioInquiry
 */

import { createServerFn } from "@tanstack/react-start";
import { executeChat, type ChatRequestPayload, type ChatResponsePayload } from "./gemini-service";
import { saveInquiry, type InquirySubmissionPayload, type InquiryResponse } from "./lead-storage";

export const chatWithStudioAssistant = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as ChatRequestPayload)
  .handler(async ({ data }): Promise<ChatResponsePayload> => {
    return await executeChat(data, "client-rpc");
  });

export const submitStudioInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as InquirySubmissionPayload)
  .handler(async ({ data }): Promise<InquiryResponse> => {
    return await saveInquiry(data, "client-rpc");
  });
