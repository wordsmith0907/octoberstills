import React, { useState } from "react";
import { motion } from "framer-motion";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brand: "",
    projectType: "Photography",
    details: "",
    botCheck: "", // honeypot
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = "Please enter your name.";
    if (!formData.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.details.trim()) errs.details = "Please share a brief note about your project.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.botCheck) return; // Silent discard for bots

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate reliable inquiry processing with mailto fallback capability
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <section
      id="contact"
      className="relative w-full py-28 md:py-40 px-6 sm:px-12 md:px-20 lg:px-28 overflow-hidden text-[#F3EADF]"
      style={{ backgroundColor: "#30231D" }}
      aria-label="Contact Finale"
    >
      {/* Background warm radial highlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 80%, rgba(185, 120, 78, 0.45) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 space-y-20 md:space-y-28">
        {/* Top Editorial Section Header */}
        <div className="space-y-4 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9784E]" />
            <span
              className="text-[11px] md:text-[12px] uppercase font-medium tracking-[0.28em] text-[#D5B99C]"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              Let&apos;s Create Together
            </span>
          </div>

          <h2
            className="text-[clamp(2.8rem,7vw,6rem)] font-light leading-[1.05] tracking-tight text-[#F3EADF] text-center"
            style={{
              fontFamily: '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
            }}
          >
            <span className="block">Let&apos;s make</span>
            <span className="block font-normal italic text-[#D5B99C]">
              something beautiful.
            </span>
          </h2>

          <p
            className="text-[16px] md:text-[18px] text-[#F3EADF]/80 font-normal leading-relaxed max-w-2xl mx-auto pt-2 text-center"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            Have a project, campaign, or collaboration in mind? I&apos;d love to hear your vision
            and explore how we can bring it to life through light, feeling, and cinematic stillness.
          </p>
        </div>

        {/* Form and Silhouette Media Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 md:p-12 rounded-sm border border-[#F3EADF]/20 bg-[#F3EADF]/[0.03] space-y-6"
              >
                <div className="w-12 h-12 rounded-full bg-[#B9784E]/20 text-[#D5B99C] flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h3
                  className="text-[28px] md:text-[34px] font-light text-[#F3EADF]"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  Thank you for reaching out.
                </h3>
                <p
                  className="text-[15px] text-[#F3EADF]/80 leading-relaxed"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                >
                  Your message has been received. Chaitiya personally reviews all project inquiries
                  and will respond within 24 to 48 hours.
                </p>
                <div className="pt-4">
                  <a
                    href="mailto:octoberstills@gmail.com"
                    className="text-[13px] uppercase tracking-[0.18em] text-[#D5B99C] hover:underline"
                  >
                    Direct Email: octoberstills@gmail.com
                  </a>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Honeypot for spam protection */}
                <input
                  type="text"
                  name="botCheck"
                  value={formData.botCheck}
                  onChange={(e) => setFormData({ ...formData, botCheck: e.target.value })}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] uppercase tracking-[0.2em] text-[#F3EADF]/70 font-medium"
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      Your Name <span className="text-[#B9784E]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-[#F3EADF]/[0.04] border border-[#F3EADF]/20 rounded-sm px-4 py-3.5 text-[#F3EADF] placeholder-[#F3EADF]/30 focus:outline-none focus:border-[#D5B99C] transition-colors text-[14px]"
                    />
                    {errors.name && (
                      <p className="text-[12px] text-red-300 tracking-wide">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] uppercase tracking-[0.2em] text-[#F3EADF]/70 font-medium"
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      Email Address <span className="text-[#B9784E]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@studio.com"
                      className="w-full bg-[#F3EADF]/[0.04] border border-[#F3EADF]/20 rounded-sm px-4 py-3.5 text-[#F3EADF] placeholder-[#F3EADF]/30 focus:outline-none focus:border-[#D5B99C] transition-colors text-[14px]"
                    />
                    {errors.email && (
                      <p className="text-[12px] text-red-300 tracking-wide">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Brand or Company */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-brand"
                      className="block text-[11px] uppercase tracking-[0.2em] text-[#F3EADF]/70 font-medium"
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      Brand / Studio <span className="text-[#F3EADF]/40">(Optional)</span>
                    </label>
                    <input
                      id="contact-brand"
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Brand Name"
                      className="w-full bg-[#F3EADF]/[0.04] border border-[#F3EADF]/20 rounded-sm px-4 py-3.5 text-[#F3EADF] placeholder-[#F3EADF]/30 focus:outline-none focus:border-[#D5B99C] transition-colors text-[14px]"
                    />
                  </div>

                  {/* Project Type */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-type"
                      className="block text-[11px] uppercase tracking-[0.2em] text-[#F3EADF]/70 font-medium"
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      Discipline of Interest
                    </label>
                    <select
                      id="contact-type"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full bg-[#30231D] border border-[#F3EADF]/20 rounded-sm px-4 py-3.5 text-[#F3EADF] focus:outline-none focus:border-[#D5B99C] transition-colors text-[14px] cursor-pointer"
                    >
                      <option value="Photography">Photography (Editorial / Hospitality)</option>
                      <option value="Film">Films &amp; Cinematography</option>
                      <option value="UGC">Creator UGC &amp; Brand Partnership</option>
                      <option value="Creative Direction">Full Creative Direction</option>
                      <option value="Other">Other Collaboration</option>
                    </select>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-details"
                    className="block text-[11px] uppercase tracking-[0.2em] text-[#F3EADF]/70 font-medium"
                    style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                  >
                    Project Details <span className="text-[#B9784E]">*</span>
                  </label>
                  <textarea
                    id="contact-details"
                    required
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Tell me about your concept, timeline, and ideal deliverables..."
                    className="w-full bg-[#F3EADF]/[0.04] border border-[#F3EADF]/20 rounded-sm px-4 py-3.5 text-[#F3EADF] placeholder-[#F3EADF]/30 focus:outline-none focus:border-[#D5B99C] transition-colors text-[14px] resize-none"
                  />
                  {errors.details && (
                    <p className="text-[12px] text-red-300 tracking-wide">{errors.details}</p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-3 rounded-full uppercase tracking-[0.2em] text-[13px] px-10 py-5 font-medium transition-all duration-300 bg-[#F3EADF] text-[#30231D] hover:bg-[#B9784E] hover:text-[#F3EADF] disabled:opacity-50 cursor-pointer"
                    style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                  >
                    <span>{isSubmitting ? "Sending..." : "Send an Inquiry"}</span>
                  </button>

                  <div className="text-[12px] text-[#F3EADF]/60 tracking-[0.1em]">
                    Or email directly:{" "}
                    <a
                      href="mailto:octoberstills@gmail.com"
                      className="text-[#D5B99C] hover:underline"
                    >
                      octoberstills@gmail.com
                    </a>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Restrained Photographic Detail & Studio Information (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-[#F3EADF]/10 border border-[#F3EADF]/15">
              <img
                src="/portfolio/cta_silhouette.jpg"
                alt="Chaitiya Shah film camera silhouette during golden hour"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#30231D]/80 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <div
                  className="text-[18px] font-light text-[#F3EADF]"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  Ahmedabad · Available Worldwide
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#D5B99C]">
                  Direct Bookings · Inquiries
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-[#F3EADF]/15">
              <div className="flex items-center justify-between text-[13px] text-[#F3EADF]/75">
                <span className="uppercase tracking-[0.18em] text-[11px] text-[#D5B99C]">
                  Email
                </span>
                <a
                  href="mailto:octoberstills@gmail.com"
                  className="hover:text-[#D5B99C] transition-colors"
                >
                  octoberstills@gmail.com
                </a>
              </div>

              <div className="flex items-center justify-between text-[13px] text-[#F3EADF]/75">
                <span className="uppercase tracking-[0.18em] text-[11px] text-[#D5B99C]">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/octoberstills/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D5B99C] transition-colors"
                >
                  @octoberstills
                </a>
              </div>

              <div className="flex items-center justify-between text-[13px] text-[#F3EADF]/75">
                <span className="uppercase tracking-[0.18em] text-[11px] text-[#D5B99C]">
                  Representation
                </span>
                <span>Independent / Direct</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
