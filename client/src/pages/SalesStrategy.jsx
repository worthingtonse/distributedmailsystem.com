import React, { memo, useState } from "react";
import { useLocation } from "react-router-dom";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  MessageSquare,
  Contact,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Code,
  Palette,
  Type,
  Mail,
  Link,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { track } from "../utils/analytics";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

// Reusable component for each strategic phase
const StrategyCard = memo(({ title, children, step }) => {
  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative p-8 rounded-xl border border-gray-700 bg-gray-950 mb-12"
    >
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-xl font-bold text-white shadow-lg">
        {step}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      {children}
    </m.div>
  );
});

StrategyCard.displayName = "StrategyCard";

function SalesStrategy() {
  useDocumentMeta({ title: 'Influencer Dashboard', description: 'Generate your QMail link, customize your landing page, and start earning from your audience.' });

  const location = useLocation();
  const verifiedData = location.state || {};
  const isVerified = !!verifiedData.verifiedName;

  // Link generator state
  const [name, setName] = useState(verifiedData.verifiedName || "");
  const [qmail, setQmail] = useState(verifiedData.qmail || "");
  const [token, setToken] = useState(verifiedData.token || "");
  const [cost, setCost] = useState("10");
  const [buttonText, setButtonText] = useState("Send Me a Private Message");

  // Theme customization state (embed tab only)
  const [bgColor, setBgColor] = useState("#0a0a1a");
  const [btnColor, setBtnColor] = useState("#3b82f6");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textFont, setTextFont] = useState("Inter");

  // UI state
  const [activeTab, setActiveTab] = useState("link"); // "link" | "embed"
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Payment form — pre-filled from verified PayPal flow, no duplicate entry
  const [paypalEmail, setPaypalEmail] = useState(verifiedData.paypalEmail || "");
  const isPaypalVerified = !!verifiedData.paypalEmail;
  const [alternativePayment, setAlternativePayment] = useState("");
  const [paymentFormSubmitting, setPaymentFormSubmitting] = useState(false);
  const [paymentFormSuccess, setPaymentFormSuccess] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState("");

  const handlePaymentFormSubmit = async (e) => {
    e.preventDefault();
    setPaymentFormSubmitting(true);
    setPaymentFormError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/register-influencer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: verifiedData.verifiedName || name,
            qmailAddress: qmail,
            paypalEmail: paypalEmail,
            paypalVerified: isPaypalVerified,
            alternativePayment: alternativePayment || "",
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setPaymentFormSuccess(true);
        // Save token returned by backend — used in shareable link
        if (result.token) setToken(result.token);
        setPaypalEmail("");
        setAlternativePayment("");
      } else {
        setPaymentFormError(result.error || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setPaymentFormError("Network error. Please try again.");
    } finally {
      setPaymentFormSubmitting(false);
    }
  };

  const baseUrl = (import.meta.env.VITE_BASE_URL || window.location.origin) + "/access";
  const tokenParam = token ? `&token=${token}` : "";
  const easyLink = `${baseUrl}?recipient=${encodeURIComponent(name)}&addr=${encodeURIComponent(qmail)}&cost=${cost}${tokenParam}`;
  const themedUrl = `${baseUrl}?recipient=${encodeURIComponent(name)}&addr=${encodeURIComponent(qmail)}&cost=${cost}&bg=${bgColor.replace("#", "")}&btn=${btnColor.replace("#", "")}&font=${encodeURIComponent(textFont)}${tokenParam}`;

  const logoCircle = `<div style="width:40px;height:40px;background:rgba(37,99,235,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>`;

  const embedCode = `<div style="display:inline-flex;align-items:center;gap:12px;font-family:${textFont},sans-serif;">
  ${logoCircle}
  <a href="${themedUrl}" target="_blank" style="font-weight:700;font-size:18px;color:${textColor};text-decoration:underline;text-decoration-color:${btnColor};text-decoration-thickness:2px;text-underline-offset:8px;cursor:pointer;transition:color 0.2s ease;">${buttonText}</a>
</div>`;

  const handleCopyLink = () => {
    if (!name || !qmail) return;
    navigator.clipboard.writeText(easyLink);
    setCopiedLink(true);
    track('influencer_link_copy', { influencer: name });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    if (!name || !qmail) return;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    track('influencer_embed_copy', { influencer: name });
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const canGenerate = !!(name && qmail);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20 bg-black">

        {/* ── Compact Header ── */}
        <section className="py-10 md:py-14 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
                Your Influencer Dashboard
              </h1>

              {/* Identity Status Badge */}
              <div className="flex justify-center mb-6">
                {isVerified ? (
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-900/30 border border-green-500/50">
                    <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-green-300 font-semibold text-sm md:text-base">
                      Identity Verified — {verifiedData.verifiedName}
                    </span>
                  </div>
                ) : (
                  <a
                    href="/register"
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-900/30 border border-blue-500/40 hover:bg-blue-900/50 transition-colors cursor-pointer"
                  >
                    <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-blue-300 font-semibold text-sm md:text-base">
                      Don't have a QMail yet? Verify your identity for $0 to get started.
                    </span>
                  </a>
                )}
              </div>

              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base px-4">
                Generate your link, share it with your audience, and earn 50% of every sale.
              </p>
            </m.div>
          </div>
        </section>

        {/* ── Stages ── */}
        <section className="py-12 md:py-16 lg:py-20 pb-20 md:pb-32">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">

            {/* ─── Step 1: Generate Your Link ─── */}
            <div id="stage-1" className="scroll-mt-24" />
            <StrategyCard step="1" title="Step 1: Generate Your Link">
              <div className="space-y-6">
                <p className="text-gray-400 text-sm">
                  Fill in your details to generate a shareable link. Your followers will use this to message you.
                </p>

                {/* Identity / Settings panel */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                        Your Name *
                        {isVerified && (
                          <span className="ml-2 text-green-400 normal-case font-normal tracking-normal text-xs">
                            ✓ Verified
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => !isVerified && setName(e.target.value)}
                        readOnly={isVerified}
                        className={`w-full border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all ${
                          isVerified
                            ? "bg-gray-900 border-green-700/50 text-green-300 cursor-not-allowed"
                            : "bg-black border-gray-700 focus:border-blue-500"
                        }`}
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                        Your QMail Address *
                        {isVerified && (
                          <span className="ml-2 text-green-400 normal-case font-normal tracking-normal text-xs">
                            ✓ Auto-filled
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={qmail}
                        onChange={(e) => !isVerified && setQmail(e.target.value)}
                        readOnly={isVerified}
                        className={`w-full border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all font-mono text-sm ${
                          isVerified
                            ? "bg-gray-900 border-green-700/50 text-green-300 cursor-not-allowed"
                            : "bg-black border-gray-700 focus:border-blue-500"
                        }`}
                        placeholder="Joe.Doe@WhatEver#8FD.Giga"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                        Your Inbox Fee (USD)
                      </label>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        min="1"
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">How much senders pay to reach you. You keep 50%.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Button Preview */}
                <div>
                  <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-3 text-center">
                    Your Button Preview:
                  </label>
                  <div className="bg-black/30 border border-gray-800 rounded-xl p-6 flex items-center justify-center gap-3">
                    <div className="w-11 h-11 bg-blue-600/20 border-2 border-blue-500/40 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <a
                      href={canGenerate ? easyLink : "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-base md:text-lg text-white underline decoration-blue-500 decoration-2 underline-offset-8 hover:text-blue-300 transition-colors"
                    >
                      {buttonText}
                    </a>
                  </div>
                </div>

                {/* URL display */}
                <div className="flex items-center gap-3 bg-black rounded-xl border border-gray-700 px-4 py-3">
                  <span className="text-gray-400 text-xs font-mono flex-1 truncate">
                    {canGenerate ? easyLink : "Fill in your name and QMail above to generate your link"}
                  </span>
                </div>

                {/* Share Buttons */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Share Your Link</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      disabled={!canGenerate}
                      onClick={handleCopyLink}
                      className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                        canGenerate
                          ? "bg-blue-600/20 border-2 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 active:scale-95"
                          : "bg-gray-800/50 border-2 border-gray-700 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {copiedLink ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                    </button>

                    <a
                      href={canGenerate ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Send me a private, priority message via QMail!\n${easyLink}`)}` : "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                        canGenerate
                          ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                          : "border-gray-800 text-gray-700 pointer-events-none"
                      }`}
                    >
                      Share on X
                    </a>

                    <button
                      disabled={!canGenerate}
                      onClick={() => {
                        if (!canGenerate) return;
                        navigator.clipboard.writeText(easyLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                        canGenerate
                          ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                          : "border-gray-800 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      Instagram Bio
                    </button>

                    <a
                      href={canGenerate ? easyLink : "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                        canGenerate
                          ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                          : "border-gray-800 text-gray-700 pointer-events-none"
                      }`}
                    >
                      <ExternalLink size={14} /> Preview
                    </a>
                  </div>
                </div>
              </div>
            </StrategyCard>

            {/* ─── Step 2: Setup Direct Deposit ─── */}
            <div id="stage-2" className="scroll-mt-24" />
            <StrategyCard step="2" title="Step 2: Setup Direct Deposit">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We need to link our payment system to yours. Just tell us where to send your 50%
                  share — we already have your name and QMail from your verification, no need to
                  enter them again.
                </p>

                {/* Notes */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">Important Notes:</h4>
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                      <span>This is a beta project launched on January 9th 2026 so please give us your patience as we bring ourselves up to the high standards we know you expect and deserve.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                      <span>We are using PayPal because they have a high degree of security. But the price of this is that sometimes they freeze funds. If our funds are frozen for any reason, your payment may be delayed for as much as six months.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Because we are just starting and have huge development costs, we are splitting the revenues with you 50/50. So if you charge $10 for an email, you will get $5.</span>
                    </li>
                  </ul>
                </div>

                {/* Payment Form */}
                {paymentFormSuccess ? (
                  <div className="bg-gray-800 border border-green-500 p-8 rounded-xl text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Registration Submitted!</h4>
                    <p className="text-gray-400">
                      Thank you for registering. We will review your information and set up your
                      payment link shortly.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handlePaymentFormSubmit}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                  >
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-green-400" />
                      From our PayPal account to yours
                    </h4>

                    {/* Pre-fill banner when fully verified */}
                    {isVerified && isPaypalVerified && (
                      <div className="flex items-center gap-3 mb-5 p-3 bg-green-900/20 border border-green-600/30 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <p className="text-green-300 text-xs">
                          All your details have been pre-filled from PayPal. Just click <strong>Next Step</strong> to confirm.
                        </p>
                      </div>
                    )}

                    {/* Who we're registering — no re-entry */}
                    {(isVerified || qmail) && (
                      <div className="flex items-start gap-3 mb-6 p-4 bg-gray-900 rounded-xl border border-green-800/40">
                        <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm space-y-1">
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Identity verified via PayPal</p>
                          <p className="text-gray-300">
                            Name: <strong className="text-white">{verifiedData.verifiedName || name}</strong>
                          </p>
                          {qmail && (
                            <p className="text-gray-400 font-mono text-xs">QMail: {qmail}</p>
                          )}
                          {isPaypalVerified && (
                            <p className="text-gray-400 text-xs">PayPal: {verifiedData.paypalEmail}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Full Name field (editable when not verified) */}
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                        Your Full Name *
                        {isVerified && (
                          <span className="ml-2 text-green-400 normal-case font-normal tracking-normal text-xs">
                            ✓ Verified from PayPal
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => !isVerified && setName(e.target.value)}
                        readOnly={isVerified}
                        className={`w-full border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all ${
                          isVerified
                            ? "bg-gray-900 border-green-700/50 text-green-300 cursor-not-allowed"
                            : "bg-black border-gray-700 focus:border-green-500"
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                          Your PayPal Email *
                          {isPaypalVerified && (
                            <span className="ml-2 text-green-400 normal-case font-normal tracking-normal text-xs">
                              ✓ From your PayPal account
                            </span>
                          )}
                        </label>
                        <input
                          type="email"
                          required
                          value={paypalEmail}
                          onChange={(e) => !isPaypalVerified && setPaypalEmail(e.target.value)}
                          readOnly={isPaypalVerified}
                          className={`w-full border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all ${
                            isPaypalVerified
                              ? "bg-gray-900 border-green-700/50 text-green-300 cursor-not-allowed"
                              : "bg-black border-gray-700 focus:border-green-500"
                          }`}
                          placeholder="your-paypal@email.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          We'll send your 50% share here after each payment collected.
                        </p>
                      </div>

                      {/* QMail display (read-only confirmation) */}
                      <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                          QMail Address *
                        </label>
                        <input
                          type="text"
                          value={qmail}
                          onChange={(e) => !isVerified && setQmail(e.target.value)}
                          readOnly={isVerified}
                          className={`w-full border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all font-mono text-sm ${
                            isVerified
                              ? "bg-gray-900 border-green-700/50 text-green-300 cursor-not-allowed"
                              : "bg-black border-gray-700 focus:border-green-500"
                          }`}
                          placeholder="Joe.Doe@WhatEver#8FD.Giga"
                        />
                        {isVerified && (
                          <p className="text-xs text-green-500/70 mt-1">✓ Auto-filled from your registration</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                        Alternative Payment Options
                      </label>
                      <textarea
                        value={alternativePayment}
                        onChange={(e) => setAlternativePayment(e.target.value)}
                        rows={3}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all resize-none"
                        placeholder="If you prefer a different payment method (crypto, bank transfer, etc.), please describe it here..."
                      />
                    </div>

                    {paymentFormError && (
                      <div className="mb-4 p-3 bg-gray-900 border border-red-500 rounded-lg text-red-400 text-sm">
                        {paymentFormError}
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={paymentFormSubmitting}
                        className={`px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                          paymentFormSubmitting
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {paymentFormSubmitting ? (
                          <>Processing...</>
                        ) : (
                          <><DollarSign size={20} /> Next Step</>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </StrategyCard>

            {/* ─── Step 3: Design Your Landing Page ─── */}
            <div id="stage-3" className="scroll-mt-24" />
            <StrategyCard step="3" title="Step 3: Customize Your Landing Page">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We need to give you a button embed code for your website. Customize the colors and font — these control how your landing page looks when fans click your link.
                </p>

                {/* Theme controls */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Text Font
                      </label>
                      <select
                        value={textFont}
                        onChange={(e) => setTextFont(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                      >
                        {["Inter", "Arial", "Helvetica", "Georgia", "Times New Roman", "Verdana", "Roboto"].map(
                          (f) => <option key={f} value={f}>{f}</option>
                        )}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Background", value: bgColor,   setter: setBgColor,   icon: <Palette size={12} /> },
                        { label: "Button",     value: btnColor,  setter: setBtnColor,  icon: <Palette size={12} /> },
                        { label: "Text",       value: textColor, setter: setTextColor, icon: <Type size={12} /> },
                      ].map(({ label, value, setter, icon }) => (
                        <div key={label}>
                          <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            {icon} {label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => setter(e.target.value)}
                              className="w-10 h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-400 font-mono bg-black px-1.5 py-1 rounded">
                              {value}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live preview */}
                  <div>
                    <label className="block text-xs font-black text-purple-400 uppercase tracking-widest mb-3">
                      Live Preview:
                    </label>
                    <div
                      className="rounded-xl p-6 flex items-center justify-center gap-3 border border-gray-700"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div
                        className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-full"
                        style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(59,130,246,0.4)" }}
                      >
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <span
                        className="font-bold text-base md:text-lg underline decoration-2 underline-offset-8"
                        style={{ color: textColor, textDecorationColor: btnColor, fontFamily: `${textFont}, sans-serif` }}
                      >
                        {buttonText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Embed code */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-purple-400 font-bold uppercase tracking-widest text-xs">
                      Button Embed Code
                    </h5>
                    <button
                      disabled={!canGenerate}
                      onClick={handleCopyEmbed}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        canGenerate
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-gray-700 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {copiedEmbed ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap bg-black p-4 rounded-lg border border-gray-800 leading-relaxed overflow-x-auto">
                    {canGenerate
                      ? embedCode
                      : "Fill in your name and QMail in Stage 2 to generate the embed code."}
                  </pre>
                </div>
              </div>
            </StrategyCard>

            {/* ─── Stage 4: Deploy ─── */}
            <StrategyCard step="4" title="Step 4: Deploy Your Links">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  Now that you've generated your personalized link and button, it's time to share
                  them with your audience. The more places you deploy, the more opportunities for
                  engagement and revenue!
                </p>

                {/* Quick Deploy Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { icon: "📸", label: "Instagram",  tip: "Add to bio link" },
                    { icon: "▶️",  label: "YouTube",    tip: "Pin in descriptions" },
                    { icon: "✉️",  label: "Email",      tip: "Add to signature" },
                    { icon: "🌐",  label: "Website",    tip: "Contact & About pages" },
                    { icon: "🎙️", label: "Podcast",    tip: "Drop in show notes" },
                  ].map(({ icon, label, tip }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-800 border border-gray-700 rounded-xl text-center hover:border-purple-500/50 transition-colors"
                    >
                      <span className="text-3xl">{icon}</span>
                      <span className="text-white font-bold text-sm">{label}</span>
                      <span className="text-gray-400 text-xs leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>

                {/* Pro Tips */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-3 text-gray-300 text-sm">
                    {[
                      { strong: "Announce it:", rest: " Let your followers know you've upgraded to a spam-free, secure messaging system and explain why." },
                      { strong: "Create urgency:", rest: " Mention that messages through this system get priority attention from you." },
                      { strong: "Be consistent:", rest: " Use the same button/link across all platforms for brand recognition." },
                      { strong: "Update regularly:", rest: " Remind your audience periodically that this is the best way to reach you directly." },
                    ].map(({ strong, rest }) => (
                      <li key={strong} className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold flex-shrink-0">•</span>
                        <span><strong>{strong}</strong>{rest}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StrategyCard>

            {/* ─── Stage 5: Support ─── */}
            <StrategyCard step="5" title="Getting Support">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We are here to serve you. If you need help, have any suggestions, want more
                  features or anything, let us know!
                </p>

                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Join our Discussion Group on Telegram
                  </h4>
                  <a
                    href="https://t.me/+9YVOgaobizw5NjEx"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
                  >
                    https://t.me/+9YVOgaobizw5NjEx
                  </a>
                </div>

                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">Note:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    {[
                      "If calling, leave a message and your call will be returned.",
                      "You can send text messages to the same phone number.",
                      "The support website is in the process of being implemented.",
                    ].map((note) => (
                      <li key={note} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Contact className="w-6 h-6 text-yellow-400" />
                    Contact Information
                  </h4>
                  <svg
                    viewBox="0 0 400 160"
                    className="w-full max-w-md"
                    role="img"
                    aria-label="Contact information: Phone (530) 591-7028, QMail Sean.Worthington@CEO#C23.Giga, Email CloudCoin@Protonmail.com, Web Support.CloudCoin.com"
                  >
                    <rect width="400" height="160" fill="#111827" rx="8" />
                    {[
                      { label: "Phone:", value: "(530) 591-7028",                y: 35,  fill: "#d1d5db" },
                      { label: "QMail:", value: "Sean.Worthington@CEO#C23.Giga",  y: 65,  fill: "#d1d5db" },
                      { label: "Email:", value: "CloudCoin@Protonmail.com",        y: 95,  fill: "#d1d5db" },
                      { label: "Web:",   value: "https://Support.CloudCoin.com",  y: 125, fill: "#60a5fa" },
                    ].map(({ label, value, y, fill }) => (
                      <React.Fragment key={label}>
                        <text x="20" y={y} fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">{label}</text>
                        <text x="80" y={y} fill={fill} fontSize="12" fontFamily="monospace">{value}</text>
                      </React.Fragment>
                    ))}
                  </svg>
                </div>
              </div>
            </StrategyCard>

          </div>
        </section>
      </div>
    </LazyMotion>
  );
}

export default SalesStrategy;