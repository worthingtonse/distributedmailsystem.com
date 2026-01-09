import React, { memo, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowRight,
  DollarSign,
  Lock,
  CreditCard,
  CheckCircle2,
  Share2,
  MessageSquare,
  Gift,
  ShieldCheck,
  Zap,
  Layout,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Code,
  Palette,
  AtSign,
  UserPlus,
  Type,
  Mail,
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
      className={`relative p-8 rounded-2xl border ${colors[color]} backdrop-blur-sm mb-12`}
    >
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-xl font-bold text-white shadow-lg">
        {step}
      </div>
      <h3
        className={`text-2xl font-bold mb-4 ${
          color === "gold" ? "text-yellow-400" : "text-white"
        }`}
      >
        {title}
      </h3>
      {children}
    </m.div>
  );
});

StrategyCard.displayName = "StrategyCard";

function SalesStrategy() {
  // Form state
  const [name, setName] = useState('');
  const [qmail, setQmail] = useState('');
  const [cost, setCost] = useState('10');
  const [bgColor, setBgColor] = useState('#0a0a1a');
  const [btnColor, setBtnColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textFont, setTextFont] = useState('Inter');
  const [buttonText, setButtonText] = useState('Send Me a Private Message');
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Influencer payment form state
  const [influencerFullName, setInfluencerFullName] = useState('');
  const [influencerEmail, setInfluencerEmail] = useState('');
  const [influencerPhone, setInfluencerPhone] = useState('');
  const [influencerQMail, setInfluencerQMail] = useState('');
  const [influencerPayPal, setInfluencerPayPal] = useState('');
  const [alternativePayment, setAlternativePayment] = useState('');
  const [paymentFormSubmitting, setPaymentFormSubmitting] = useState(false);
  const [paymentFormSuccess, setPaymentFormSuccess] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState('');

  const handlePaymentFormSubmit = async (e) => {
    e.preventDefault();
    setPaymentFormSubmitting(true);
    setPaymentFormError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/register-influencer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: influencerFullName,
            email: influencerEmail,
            phone: influencerPhone,
            qmailAddress: influencerQMail,
            paypalEmail: influencerPayPal,
            alternativePayment: alternativePayment,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setPaymentFormSuccess(true);
        // Clear form
        setInfluencerFullName('');
        setInfluencerEmail('');
        setInfluencerPhone('');
        setInfluencerQMail('');
        setInfluencerPayPal('');
        setAlternativePayment('');
      } else {
        setPaymentFormError(result.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setPaymentFormError('Network error. Please try again.');
    } finally {
      setPaymentFormSubmitting(false);
    }
  };

  const baseUrl = (import.meta.env.VITE_BASE_URL || window.location.origin) + "/access";

  const generatedUrl = `${baseUrl}?recipient=${encodeURIComponent(name)}&addr=${encodeURIComponent(qmail)}&cost=${cost}&bg=${bgColor.replace('#', '')}&btn=${btnColor.replace('#', '')}`;

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
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                Influencers: Get Paid For Your Attention!
              </h1>
              <ul className="text-gray-300 max-w-2xl mx-auto mb-8 text-left inline-block space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Doesn't cost you anything
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  A Constant Revenue Stream
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Keeps Your Inbox Free of Clutter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Stop Emails from Antagonists and Time Wasters
                </li>
              </ul>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-tighter">
                Sales Funnel <span className="text-blue-500">Strategy</span>
              </h2>
              <h3 className="text-2xl font-mono text-blue-400 mb-8 tracking-widest">
                1. Create a link. 2. Post the Link. 3. Receive $$$!
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Requires that you have a QMail address. For instant payments, you will need a PayPal account. You can get paid in other ways but it will take more time.
              </p>
            </m.div>
          </div>
        </section>

        {/* Funnel Flow Architecture */}
        <section className="py-12 pb-32">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Stage 1: Call Your Followers to Action */}
            <StrategyCard
              step="1"
              title="Stage 1: Call Your Followers to Action"
              color="blue"
            >
              <div className="space-y-6">
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Put an affiliate link or button on your webpage, social media or other communication.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Tell your followers that if they want to send you an email, the link is on your webpage. (takes less than five seconds)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    To generate more interest, tell them that you have become an early adopter of a new email system called the Distributed Mail System and that they will need to use your link to join. (Less than 5 seconds)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    You can also tell them that this system allows you to receive emails without having to deal with thousands of junk mails, spams, phishing attempts and so you are much more likely to read and respond.
                  </li>
                </ul>

                {/* Generate Your Link and Buttons Form */}
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-white mb-2">Generate Your Link and Buttons</h4>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Settings Section */}
                    <div className="lg:col-span-2 space-y-5 bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Influencer's Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AtSign size={12}/> Influencer's QMail
                          </label>
                          <input
                            type="text"
                            value={qmail}
                            onChange={(e) => setQmail(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                            placeholder="Joe.Doe@WhatEver#8FD.Giga"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Influencer's InBox Fee (USD)</label>
                          <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Button Text</label>
                          <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Text Font</label>
                          <select
                            value={textFont}
                            onChange={(e) => setTextFont(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Roboto">Roboto</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-5 border-t border-gray-800 pt-5">
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                            <Palette size={14}/> Background
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">{bgColor}</code>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                            <Palette size={14}/> Button Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={btnColor}
                              onChange={(e) => setBtnColor(e.target.value)}
                              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">{btnColor}</code>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                            <Type size={14}/> Text Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                            />
                            <code className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">{textColor}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-3">
                      <button
                        disabled={!name || !qmail}
                        onClick={handleCopy}
                        className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-sm ${
                          name && qmail ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {copied ? <><Check size={16}/> Copied!</> : <><Copy size={16}/> Copy Direct Link</>}
                      </button>
                      <button
                        disabled={!name || !qmail}
                        onClick={() => setShowEmbed(!showEmbed)}
                        className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-sm ${
                          name && qmail ? 'bg-gradient-to-r from-blue-600 to-purple-500 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <Code size={16} /> {showEmbed ? "Hide Embed Code" : "Embed Button"}
                      </button>
                      <a
                        href={name && qmail ? generatedUrl : "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                          name && qmail ? 'border-gray-700 text-gray-400 hover:bg-white/5' : 'border-gray-800 text-gray-700 pointer-events-none'
                        }`}
                      >
                        <ExternalLink size={14} /> Preview Page
                      </a>

                      {/* Your Button Preview */}
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Your Button:</label>
                        <div className="flex items-center justify-center gap-3">
                          {/* Fixed logo circle - not customizable */}
                          <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          {/* Underlined text link */}
                          <a
                            href={name && qmail ? generatedUrl : "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-lg text-white underline decoration-blue-500 decoration-2 underline-offset-8 hover:text-blue-300 transition-colors"
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
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-black/80 rounded-2xl border border-blue-500/30 p-6 shadow-2xl overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Button Embed Code</h5>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(embedCode);
                              setCopiedEmbed(true);
                              setTimeout(() => setCopiedEmbed(false), 2000);
                            }}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                          >
                            {copiedEmbed ? 'Copied' : 'Copy Code'}
                          </button>
                        </div>
                        <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap bg-gray-900 p-4 rounded-xl border border-gray-800 leading-relaxed">
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
                  Now that you've generated your personalized link and button, it's time to share them with your audience.
                  The more places you deploy, the more opportunities for engagement and revenue!
                </p>

                {/* Deployment Checklist */}
                <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    Deployment Checklist
                  </h4>

                  {/* Website & Blog */}
                  <div className="mb-6">
                    <h5 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">Website & Blog</h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add the button to your website's Contact page
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Place in your website header, footer, or sidebar
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Include at the end of blog posts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add to your About Me / Bio page
                      </li>
                    </ul>
                  </div>

                  {/* Social Media */}
                  <div className="mb-6">
                    <h5 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">Social Media Profiles</h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add direct link to your Instagram bio
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Include in your Twitter/X bio or pinned tweet
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add to your YouTube channel description and video descriptions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Include in your TikTok bio link
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add to LinkedIn profile and posts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Include in your Linktree or similar link-in-bio service
                      </li>
                    </ul>
                  </div>

                  {/* Email & Newsletters */}
                  <div className="mb-6">
                    <h5 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">Email & Mailing Lists</h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add button to your email signature
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Send announcement to your existing mailing list
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Include in your newsletter template footer
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add to autoresponder sequences
                      </li>
                    </ul>
                  </div>

                  {/* Creative Ideas */}
                  <div>
                    <h5 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">Creative Ideas</h5>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add clickable end cards to your YouTube videos
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Create Instagram/Facebook Stories with "Swipe Up" or link stickers
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Add QR code version to printed materials or merchandise
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Include in podcast show notes and descriptions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Pin a post about your new secure messaging on social platforms
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">☐</span>
                        Mention in live streams with on-screen link overlay
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span><strong>Announce it:</strong> Let your followers know you've upgraded to a spam-free, secure messaging system and explain why.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span><strong>Create urgency:</strong> Mention that messages through this system get priority attention from you.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span><strong>Be consistent:</strong> Use the same button/link across all platforms for brand recognition.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span><strong>Update regularly:</strong> Remind your audience periodically that this is the best way to reach you directly.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </StrategyCard>

            {/* Stage 3: Get Paid */}
            <StrategyCard
              step="3"
              title="Stage 3: Get Paid"
              color="green"
            >
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We need to link our payment system to yours. We will need your contact information and to know how you want to be paid.
                </p>

                {/* Notes Section */}
                <div className="bg-yellow-900/10 border border-yellow-500/20 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">Notes:</h4>
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      This is a beta project launched on January 9th 2026 so please give us your patience as we bring ourselves up to the high standards we know you expect and deserve.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      We are using PayPal because they have a high degree of security. But the price of this is that sometimes they freeze funds. If our funds are frozen for any reason, your payment may be delayed for as much as six months.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      Because we are just starting and have huge development costs, we are splitting the revenues with you 50/50. So if you charge $10 for an email, you will get $5.
                    </li>
                  </ul>
                </div>

                {/* Payment Registration Form */}
                {paymentFormSuccess ? (
                  <div className="bg-green-900/20 border border-green-500/30 p-8 rounded-xl text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Registration Submitted!</h4>
                    <p className="text-gray-400">Thank you for registering. We will review your information and set up your payment link shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentFormSubmit} className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-400" />
                      Payment Registration Form
                    </h4>

                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-xs font-black text-green-400 uppercase tracking-widest mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={influencerFullName}
                          onChange={(e) => setInfluencerFullName(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                          placeholder="Your full legal name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-green-400 uppercase tracking-widest mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={influencerEmail}
                          onChange={(e) => setInfluencerEmail(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-xs font-black text-green-400 uppercase tracking-widest mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={influencerPhone}
                          onChange={(e) => setInfluencerPhone(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-green-400 uppercase tracking-widest mb-2">QMail Address *</label>
                        <input
                          type="text"
                          required
                          value={influencerQMail}
                          onChange={(e) => setInfluencerQMail(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all font-mono text-sm"
                          placeholder="Your.Name@Domain#123.Giga"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-xs font-black text-green-400 uppercase tracking-widest mb-2">PayPal Email Address *</label>
                      <input
                        type="email"
                        required
                        value={influencerPayPal}
                        onChange={(e) => setInfluencerPayPal(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all"
                        placeholder="your-paypal@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">This is the email associated with your PayPal account where we will send payments.</p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-black text-green-400 uppercase tracking-widest mb-2">Alternative Payment Options</label>
                      <textarea
                        value={alternativePayment}
                        onChange={(e) => setAlternativePayment(e.target.value)}
                        rows={3}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none transition-all resize-none"
                        placeholder="If you prefer a different payment method (crypto, bank transfer, etc.), please describe it here..."
                      />
                    </div>

                    {paymentFormError && (
                      <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {paymentFormError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={paymentFormSubmitting}
                      className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        paymentFormSubmitting
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/20'
                      }`}
                    >
                      {paymentFormSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <DollarSign size={18} />
                          Submit Registration
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </StrategyCard>

            {/* Stage 4: Getting Support */}
            <StrategyCard
              step="4"
              title="Getting Support"
              color="gold"
            >
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  We are here to serve you. If you need help, have any suggestions, want more features or anything, let us know!
                </p>

                {/* Telegram Link */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
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
                <div className="bg-yellow-900/10 border border-yellow-500/20 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">Note:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      If calling, leave a message and your call will be returned.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      You can send text messages to the same phone number.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      The support website is in the process of being implemented.
                    </li>
                  </ul>
                </div>

                {/* Contact Information SVG - harder for scrapers to parse */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
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
                    <text x="20" y="35" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">Phone:</text>
                    <text x="80" y="35" fill="#d1d5db" fontSize="12" fontFamily="monospace">(530) 591-7028</text>

                    {/* QMail */}
                    <text x="20" y="65" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">QMail:</text>
                    <text x="80" y="65" fill="#d1d5db" fontSize="12" fontFamily="monospace">Sean.Worthington@CEO#C23.Giga</text>

                    {/* Email */}
                    <text x="20" y="95" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">Email:</text>
                    <text x="80" y="95" fill="#d1d5db" fontSize="12" fontFamily="monospace">CloudCoin@Protonmail.com</text>

                    {/* Web */}
                    <text x="20" y="125" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">Web:</text>
                    <text x="80" y="125" fill="#60a5fa" fontSize="12" fontFamily="monospace">https://Support.CloudCoin.com</text>
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
