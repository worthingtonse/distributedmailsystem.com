import React, { memo, useState } from "react";
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
  Target
} from "lucide-react";

// Reusable component for each strategic phase
const StrategyCard = memo(({ title, children, step, color = "blue" }) => {
  const colors = {
    blue: "border-blue-500/30 bg-blue-900/10 text-blue-400",
    green: "border-green-500/30 bg-green-900/10 text-green-400",
    purple: "border-purple-500/30 bg-purple-900/10 text-purple-400",
    gold: "border-yellow-500/30 bg-yellow-900/10 text-yellow-400",
  };

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
  // Form state
  const [name, setName] = useState("");
  const [qmail, setQmail] = useState("");
  const [cost, setCost] = useState("10");
  const [bgColor, setBgColor] = useState("#0a0a1a");
  const [btnColor, setBtnColor] = useState("#3b82f6");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textFont, setTextFont] = useState("Inter");
  const [buttonText, setButtonText] = useState("Send Me a Private Message");
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Influencer payment form state
  const [influencerFullName, setInfluencerFullName] = useState("");
  const [influencerEmail, setInfluencerEmail] = useState("");
  const [influencerPhone, setInfluencerPhone] = useState("");
  const [influencerQMail, setInfluencerQMail] = useState("");
  const [influencerPayPal, setInfluencerPayPal] = useState("");
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
            fullName: influencerFullName,
            email: influencerEmail,
            phone: influencerPhone,
            qmailAddress: influencerQMail,
            paypalEmail: influencerPayPal,
            alternativePayment: alternativePayment,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setPaymentFormSuccess(true);
        // Clear form
        setInfluencerFullName("");
        setInfluencerEmail("");
        setInfluencerPhone("");
        setInfluencerQMail("");
        setInfluencerPayPal("");
        setAlternativePayment("");
      } else {
        setPaymentFormError(
          result.error || "Failed to submit. Please try again.",
        );
      }
    } catch (err) {
      setPaymentFormError("Network error. Please try again.");
    } finally {
      setPaymentFormSubmitting(false);
    }
  };

  const baseUrl =
    (import.meta.env.VITE_BASE_URL || window.location.origin) + "/access";

  const generatedUrl = `${baseUrl}?recipient=${encodeURIComponent(name)}&addr=${encodeURIComponent(qmail)}&cost=${cost}&bg=${bgColor.replace("#", "")}&btn=${btnColor.replace("#", "")}`;

  // Logo circle with envelope icon (fixed branding - not customizable)
  const logoCircle = `<div style="width:40px; height:40px; background:rgba(37,99,235,0.2); border:1px solid rgba(59,130,246,0.4); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  </div>`;

  const embedCode = `<div style="display:inline-flex; align-items:center; gap:12px;">
  ${logoCircle}
  <a href="${generatedUrl}" target="_blank" style="font-weight:700; font-size:18px; color:#ffffff; text-decoration:underline; text-decoration-color:#3b82f6; text-decoration-thickness:2px; text-underline-offset:8px; cursor:pointer; transition:color 0.2s ease;" onmouseover="this.style.color='#93c5fd';" onmouseout="this.style.color='#ffffff';">${buttonText}</a>
</div>`;

  const handleCopy = () => {
    if (!name) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20 bg-black">
        {/* Header: Core Campaign Concept */}
        <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Influencers: Get Paid For Your Attention!
              </h1>
              <ul className="text-gray-300 max-w-2xl mx-auto mb-10 text-left inline-block space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-green-600 border border-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2
                      className="w-4 h-4 text-white"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-sm md:text-base">
                    Doesn't cost you anything
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-green-600 border border-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2
                      className="w-4 h-4 text-white"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-sm md:text-base">
                    A Constant Revenue Stream
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-green-600 border border-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2
                      className="w-4 h-4 text-white"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-sm md:text-base">
                    Keeps Your Inbox Free of Clutter
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-green-600 border border-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2
                      className="w-4 h-4 text-white"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-sm md:text-base">
                    Stop Emails from Antagonists and Time Wasters
                  </span>
                </li>
              </ul>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-tight">
                Sales Funnel <span className="text-blue-500">Strategy</span>
              </h2>

              {/* Stepper */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <span className="text-sm md:text-base text-gray-300 font-medium">
                      Create a link
                    </span>
                  </div>

                  <div className="w-8 md:w-12 h-0.5 bg-gray-700"></div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <span className="text-sm md:text-base text-gray-300 font-medium">
                      Post the Link
                    </span>
                  </div>

                  <div className="w-8 md:w-12 h-0.5 bg-gray-700"></div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600 border-2 border-green-400 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <span className="text-sm md:text-base text-gray-300 font-medium">
                      Receive $$$!
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base px-4">
                Requires that you have a QMail address. For instant payments,
                you will need a PayPal account. You can get paid in other ways
                but it will take more time.
              </p>
            </m.div>
          </div>
        </section>

        {/* Funnel Flow Architecture */}
        <section className="py-12 md:py-16 lg:py-20 pb-20 md:pb-32">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
            {/* Stage 1: Call Your Followers to Action */}
            <StrategyCard
              step="1"
              title="Stage 1: Call Your Followers to Action"
              color="blue"
            >
              <div className="space-y-6">
                <ul className="text-gray-300 space-y-4 text-sm md:text-base">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">•</span>
                    <span>
                      Put an affiliate link or button on your webpage, social
                      media or other communication.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">•</span>
                    <span>
                      Tell your followers that if they want to send you an
                      email, the link is on your webpage. (takes less than five
                      seconds)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">•</span>
                    <span>
                      To generate more interest, tell them that you have become
                      an early adopter of a new email system called the
                      Distributed Mail System and that they will need to use
                      your link to join. (Less than 5 seconds)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 font-bold">•</span>
                    <span>
                      You can also tell them that this system allows you to
                      receive emails without having to deal with thousands of
                      junk mails, spams, phishing attempts and so you are much
                      more likely to read and respond.
                    </span>
                  </li>
                </ul>

                {/* Generate Your Link and Buttons Form */}
                <div className="mt-10 pt-10 border-t border-gray-700/50">
                  <div className="text-center mb-8">
                    <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                      Generate Your Link and Buttons
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Customize your messaging button to match your brand
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Settings Section */}
                    <div className="lg:col-span-2 space-y-5 bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                            Influencer's Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                            Influencer's QMail
                          </label>
                          <input
                            type="text"
                            value={qmail}
                            onChange={(e) => setQmail(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                            placeholder="Joe.Doe@WhatEver#8FD.Giga"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                            Influencer's InBox Fee (USD)
                          </label>
                          <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                            Text Font
                          </label>
                          <select
                            value={textFont}
                            onChange={(e) => setTextFont(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">
                              Times New Roman
                            </option>
                            <option value="Verdana">Verdana</option>
                            <option value="Roboto">Roboto</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-5 border-t border-gray-800 pt-5 mt-2">
                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <Palette size={14} /> Background
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="w-10 h-10 bg-transparent  cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-400 font-mono bg-black px-2 py-1 rounded">
                              {bgColor}
                            </code>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <Palette size={14} /> Button Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={btnColor}
                              onChange={(e) => setBtnColor(e.target.value)}
                              className="w-10 h-10 bg-transparent  cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-400 font-mono bg-black px-2 py-1 rounded">
                              {btnColor}
                            </code>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <Type size={14} /> Text Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-10 h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-400 font-mono bg-black px-2 py-1 rounded">
                              {textColor}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-3">
                      <button
                        disabled={!name || !qmail}
                        onClick={handleCopy}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm ${
                          name && qmail
                            ? "bg-blue-600/20 border-2 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/60 active:scale-95"
                            : "bg-gray-800/50 border-2 border-gray-700 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check size={18} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={18} /> Copy Direct Link
                          </>
                        )}
                      </button>

                      <button
                        disabled={!name || !qmail}
                        onClick={() => setShowEmbed(!showEmbed)}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm ${
                          name && qmail
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:from-blue-500 hover:to-purple-500 active:scale-95"
                            : "bg-gray-800/50 border-2 border-gray-700 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        <Code size={18} />{" "}
                        {showEmbed ? "Hide Embed Code" : "Embed Button"}
                      </button>

                      <a
                        href={name && qmail ? generatedUrl : "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                          name && qmail
                            ? "border-gray-700 text-gray-400 hover:bg-gray-800"
                            : "border-gray-800 text-gray-700 pointer-events-none"
                        }`}
                      >
                        <ExternalLink size={14} /> Preview Page
                      </a>

                      {/* Your Button Preview */}
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-4 text-center">
                          Your Button Preview:
                        </label>
                        <div className="bg-black/30 border border-gray-800 rounded-xl p-6 flex items-center justify-center gap-3">
                          <div className="w-11 h-11 bg-blue-600/20 border-2 border-blue-500/40 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Mail className="w-7 h-7" />
                          </div>
                          {/* Underlined text link */}
                          <a
                            href={name && qmail ? generatedUrl : "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-base md:text-lg text-white underline decoration-blue-500 decoration-2 underline-offset-8 hover:text-blue-300 transition-colors"
                          >
                            {buttonText}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Embed Snippet Display */}
                  <AnimatePresence>
                    {showEmbed && name && qmail && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6 overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                            Button Embed Code
                          </h5>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(embedCode);
                              setCopiedEmbed(true);
                              setTimeout(() => setCopiedEmbed(false), 2000);
                            }}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                          >
                            {copiedEmbed ? "Copied!" : "Copy Code"}
                          </button>
                        </div>
                        <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap bg-black p-4 rounded-lg border border-gray-800 leading-relaxed overflow-x-auto">
                          {embedCode}
                        </pre>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </StrategyCard>

            {/* Stage 2: Deploy Your Links and Buttons */}
            <StrategyCard
              step="2"
              title="Stage 2: Deploy Your Links and Buttons"
              color="purple"
            >
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  Now that you've generated your personalized link and button,
                  it's time to share them with your audience. The more places
                  you deploy, the more opportunities for engagement and revenue!
                </p>

                {/* Deployment Checklist */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-blue-400" />
                    Deployment Checklist
                  </h4>

                  {/* Website & Blog */}
                  <div className="mb-6">
                    <h5 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-3">
                      Website & Blog
                    </h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-3">
                        <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Add the button to your website's Contact page
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Place in your website header, footer, or sidebar
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Include at the end of blog posts</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Add to your About Me / Bio page</span>
                      </li>
                    </ul>
                  </div>

                  {/* Social Media */}
                  <div className="mb-6">
                    <h5 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-3">
                      Social Media Profiles
                    </h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Add direct link to your Instagram bio</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Include in your Twitter/X bio or pinned tweet
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Add to your YouTube channel description and video
                          descriptions
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Include in your TikTok bio link</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Add to LinkedIn profile and posts</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Include in your Linktree or similar link-in-bio
                          service
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Email & Newsletters */}
                  <div className="mb-6">
                    <h5 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-3">
                      Email & Mailing Lists
                    </h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Add button to your email signature</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Send announcement to your existing mailing list
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Include in your newsletter template footer</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>Add to autoresponder sequences</span>
                      </li>
                    </ul>
                  </div>

                  {/* Creative Ideas */}
                  <div>
                    <h5 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-3">
                      Creative Ideas
                    </h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Add clickable end cards to your YouTube videos
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Create Instagram/Facebook Stories with "Swipe Up" or
                          link stickers
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Add QR code version to printed materials or
                          merchandise
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Include in podcast show notes and descriptions
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Pin a post about your new secure messaging on social
                          platforms
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                         <Target className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span>
                          Mention in live streams with on-screen link overlay
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-10 h-10 text-yellow-400" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span>
                        <strong>Announce it:</strong> Let your followers know
                        you've upgraded to a spam-free, secure messaging system
                        and explain why.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span>
                        <strong>Create urgency:</strong> Mention that messages
                        through this system get priority attention from you.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span>
                        <strong>Be consistent:</strong> Use the same button/link
                        across all platforms for brand recognition.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span>
                        <strong>Update regularly:</strong> Remind your audience
                        periodically that this is the best way to reach you
                        directly.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </StrategyCard>

            {/* Stage 3: Get Paid */}
            <StrategyCard step="3" title="Stage 3: Get Paid" color="green">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We need to link our payment system to yours. We will need your
                  contact information and to know how you want to be paid.
                </p>

                {/* Notes Section */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">
                    Important Notes:
                  </h4>
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>
                        This is a beta project launched on January 9th 2026 so
                        please give us your patience as we bring ourselves up to
                        the high standards we know you expect and deserve.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>
                        We are using PayPal because they have a high degree of
                        security. But the price of this is that sometimes they
                        freeze funds. If our funds are frozen for any reason,
                        your payment may be delayed for as much as six months.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>
                        Because we are just starting and have huge development
                        costs, we are splitting the revenues with you 50/50. So
                        if you charge $10 for an email, you will get $5.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Payment Registration Form */}
                {paymentFormSuccess ? (
                  <div className="bg-gray-800 border border-green-500 p-8 rounded-xl text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">
                      Registration Submitted!
                    </h4>
                    <p className="text-gray-400">
                      Thank you for registering. We will review your information
                      and set up your payment link shortly.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handlePaymentFormSubmit}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                  >
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="w-10 h-10 text-green-400" />
                      Payment Registration Form
                    </h4>

                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={influencerFullName}
                          onChange={(e) =>
                            setInfluencerFullName(e.target.value)
                          }
                          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                          placeholder="Your full legal name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={influencerEmail}
                          onChange={(e) => setInfluencerEmail(e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={influencerPhone}
                          onChange={(e) => setInfluencerPhone(e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                          QMail Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={influencerQMail}
                          onChange={(e) => setInfluencerQMail(e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all font-mono text-sm"
                          placeholder="Your.Name@Domain#123.Giga"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                        PayPal Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={influencerPayPal}
                        onChange={(e) => setInfluencerPayPal(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                        placeholder="your-paypal@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This is the email associated with your PayPal account
                        where we will send payments.
                      </p>
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
                      <div className="mb-4 p-3 bg-gray-800 border border-red-500 rounded-lg text-red-400 text-sm">
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
                          <>
                            <DollarSign size={24} />
                            Submit Registration
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </StrategyCard>

            {/* Stage 4: Getting Support */}
            <StrategyCard step="4" title="Getting Support" color="gold">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We are here to serve you. If you need help, have any
                  suggestions, want more features or anything, let us know!
                </p>

                {/* Telegram Link */}
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

                {/* Notes Section */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">
                    Note:
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>
                        If calling, leave a message and your call will be
                        returned.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>
                        You can send text messages to the same phone number.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>
                        The support website is in the process of being
                        implemented.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Contact Information SVG - harder for scrapers to parse */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <Contact className="w-10 h-10 text-yellow-400" />
                    Contact Information
                  </h4>
                  <svg
                    viewBox="0 0 400 160"
                    className="w-full max-w-md"
                    role="img"
                    aria-label="Contact information: Phone (530) 591-7028, QMail Sean.Worthington@CEO#C23.Giga, Email CloudCoin@Protonmail.com, Web Support.CloudCoin.com"
                  >
                    {/* Background */}
                    <rect width="400" height="160" fill="#111827" rx="8" />

                    {/* Phone */}
                    <text
                      x="20"
                      y="35"
                      fill="#facc15"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Phone:
                    </text>
                    <text
                      x="80"
                      y="35"
                      fill="#d1d5db"
                      fontSize="12"
                      fontFamily="monospace"
                    >
                      (530) 591-7028
                    </text>

                    {/* QMail */}
                    <text
                      x="20"
                      y="65"
                      fill="#facc15"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      QMail:
                    </text>
                    <text
                      x="80"
                      y="65"
                      fill="#d1d5db"
                      fontSize="12"
                      fontFamily="monospace"
                    >
                      Sean.Worthington@CEO#C23.Giga
                    </text>

                    {/* Email */}
                    <text
                      x="20"
                      y="95"
                      fill="#facc15"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Email:
                    </text>
                    <text
                      x="80"
                      y="95"
                      fill="#d1d5db"
                      fontSize="12"
                      fontFamily="monospace"
                    >
                      CloudCoin@Protonmail.com
                    </text>

                    {/* Web */}
                    <text
                      x="20"
                      y="125"
                      fill="#facc15"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Web:
                    </text>
                    <text
                      x="80"
                      y="125"
                      fill="#60a5fa"
                      fontSize="12"
                      fontFamily="monospace"
                    >
                      https://Support.CloudCoin.com
                    </text>
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
