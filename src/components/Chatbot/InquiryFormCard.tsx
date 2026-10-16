import React, { useState } from "react";
import { Check, Send, AlertCircle, Clock } from "lucide-react";
import type { InquirySubmissionPayload, InquiryResponse } from "../../lib/lead-storage";

interface InquiryFormCardProps {
  initialProjectType?: string;
  initialBrief?: string;
  sourceSection?: string;
  onSubmit: (payload: InquirySubmissionPayload) => Promise<InquiryResponse>;
  onClose?: () => void;
}

export function InquiryFormCard({
  initialProjectType = "Photography",
  initialBrief = "",
  sourceSection = "chatbot",
  onSubmit,
}: InquiryFormCardProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brand: "",
    projectType: initialProjectType,
    timeline: "",
    budget: "",
    brief: initialBrief,
    consent: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<InquiryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Please provide your name.");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!formData.brief.trim()) {
      setError("Please include a brief note about your project vision.");
      return;
    }

    if (!formData.consent) {
      setError("Consent is required to send your inquiry to Octoberstills.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `chat_${formData.email.trim().toLowerCase()}_${Date.now()}`;
      const res = await onSubmit({
        name: formData.name,
        email: formData.email,
        brand: formData.brand || undefined,
        projectType: formData.projectType,
        timeline: formData.timeline || undefined,
        budget: formData.budget || undefined,
        brief: formData.brief,
        sourceSection,
        consentGiven: true,
        idempotencyKey,
      });

      if (res.success) {
        setSubmittedResult(res);
      } else {
        setError(res.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error. Please reach Chaitya directly at octoberstills@gmail.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="p-4 rounded-lg bg-[#30231D] text-[#F3EADF] border border-[#B9784E]/40 space-y-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2.5 text-[#B9784E]">
          <span className="p-1.5 rounded-full bg-[#B9784E]/15">
            <Check className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase tracking-[0.2em] font-medium">Brief Received</span>
        </div>

        <p className="text-xs text-[#F3EADF]/85 leading-relaxed">
          {submittedResult.message}
        </p>

        <div className="pt-2 border-t border-[#F3EADF]/10 flex items-center justify-between text-[11px] text-[#F3EADF]/60">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#B9784E]" />
            Response within 24–48h
          </span>
          <span className="font-mono text-[10px] text-[#B9784E]/80">
            {submittedResult.inquiryId ? `#${submittedResult.inquiryId.slice(0, 12)}` : "Verified"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg bg-[#F3EADF] border border-[#30231D]/15 text-[#30231D] space-y-3.5 shadow-sm"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#30231D]/10">
        <div className="text-xs uppercase tracking-[0.18em] font-medium text-[#30231D]/80">
          Project Brief for Chaitya
        </div>
        <span className="text-[10px] text-[#B9784E] font-medium uppercase tracking-wider">
          Direct Studio Review
        </span>
      </div>

      {error && (
        <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Maya Chen"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D]"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="maya@brand.com"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
            Brand or Organization
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="Optional brand name"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D]"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
            Creative Discipline
          </label>
          <select
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D]"
          >
            <option value="Photography">01 · Photography</option>
            <option value="Films & Cinematography">02 · Films & Cinematography</option>
            <option value="UGC & Brand Content">03 · UGC & Brand Content</option>
            <option value="Multi-Discipline Creative">Multi-Discipline Creative</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
            Target Dates / Timeline
          </label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            placeholder="e.g. Next month, Q3, or flexible"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D]"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
            Approximate Budget (Optional)
          </label>
          <input
            type="text"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="Leave blank or specify range"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#30231D]/70 mb-1">
          Project Vision & Requirements <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={formData.brief}
          onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
          placeholder="Describe deliverables, aesthetic mood, shoot location, or key storytelling goals..."
          className="w-full px-2.5 py-1.5 text-xs rounded border border-[#30231D]/20 bg-white/80 focus:outline-none focus:border-[#30231D] resize-none"
        />
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input
          type="checkbox"
          id="chatbot-consent"
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="mt-0.5 accent-[#30231D]"
        />
        <label htmlFor="chatbot-consent" className="text-[11px] text-[#30231D]/75 leading-tight">
          I consent to sharing these project details with Chaitya Shah & Octoberstills for the
          purpose of reviewing my collaboration inquiry.
        </label>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.16em] bg-[#30231D] text-[#F3EADF] hover:bg-[#B9784E] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Sending to Studio...</span>
          ) : (
            <>
              <span>Submit Project Brief</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
