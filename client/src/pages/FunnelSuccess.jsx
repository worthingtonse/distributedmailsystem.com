import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Download,
  Lock,
  Send,
  Share2,
  ShieldCheck,
  Key,
  Loader2,
  Check,
  Copy,
  Globe,
  Zap,
  Server,
  Users,
  Target,
  GraduationCap,
  Settings,
  DollarSign,
  AtSign,
  Info,
  AlertTriangle,
  RefreshCw,
  FileText,
  Gift,
  MessageCircle,
  ExternalLink,
  Rocket,
  BookOpen,
} from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

// Visual style per address class — matches the color coding used on the
// registration page (bit=blue, byte=green, kilo=purple, mega=yellow, giga=red)
const CLASS_STYLES = {
  bit: { label: "Bit", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  byte: { label: "Byte", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  kilo: { label: "Kilo", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  mega: { label: "Mega", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  giga: { label: "Giga", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

// Small reusable "value + copy button" row used for the qmail address and
// both locker keys on each address card, plus the support address.
const CopyableRow = ({ value, textClass = "" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3">
      <code className={`flex-1 break-all font-mono leading-snug ${textClass}`}>{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 px-4 py-2 bg-blue-600 rounded-lg font-bold text-sm flex items-center gap-1.5 hover:bg-blue-500 transition-all"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
};

// One card per fulfilled address: the qmail itself, its class badge, the
// Mailbox Locker Key, and — when present — the Bonus Coins locker key.
const AddressCard = ({ addr }) => {
  const style = CLASS_STYLES[addr.class] || CLASS_STYLES.bit;
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <AtSign size={14} /> QMail Address
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.bg} ${style.border} ${style.color}`}
        >
          .{style.label}
        </span>
      </div>
      <CopyableRow value={addr.qmail} textClass="text-xl md:text-2xl font-semibold text-white" />

      <div className="pt-4 border-t border-white/10 space-y-2">
        <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
          <Key size={14} /> Mailbox Locker Key
        </h4>
        <CopyableRow value={addr.lockerKey} textClass="text-lg font-semibold text-green-300" />
        <p className="text-[11px] text-gray-500 italic leading-relaxed">
          Enter this Locker Key in your QMail software to claim your address coin.
        </p>
      </div>

      {addr.bonusLockerKey && (
        <div className="pt-4 border-t border-white/10 space-y-2">
          <h4 className="text-xs font-black text-yellow-400 flex items-center gap-2 leading-relaxed">
            <Gift size={14} className="shrink-0" /> Bonus Coins: Put this Locker Key into the
            Wallet part of your QMail software.
          </h4>
          <CopyableRow value={addr.bonusLockerKey} textClass="text-lg font-semibold text-yellow-300" />
        </div>
      )}
    </div>
  );
};

const FunnelSuccess = () => {
  useDocumentMeta({
    title: "Registration Complete",
    description: "Your QMail registration is complete. Download the Windows client to get started.",
    path: "/success",
    noindex: true,
  });

  const { state } = useLocation();
  const [isProvisioning, setIsProvisioning] = useState(true);
  const [provisionStep, setProvisionStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousLoading, setAnonymousLoading] = useState(false);
  const [anonymousError, setAnonymousError] = useState(null);

  // Real-time setup state
  const [inboxFee, setInboxFee] = useState("10");
  const [definer, setDefiner] = useState(state?.definer || "Verified User");

  // New locker-key flow: state.addresses = [{ qmail, class, lockerKey, bonusLockerKey }].
  // Older flow (still reachable) instead passes { email, walletDownloadUrl, ... } directly —
  // keep that legacy rendering path intact when state.addresses isn't present.
  const addresses = Array.isArray(state?.addresses) && state.addresses.length > 0
    ? state.addresses
    : null;
  const partialError = state?.partialError || null;

  const userAddress = state?.email || state?.generatedAddress || "(Email not received - please complete registration)";
  const lockerCode = state?.lockerCode || "";
  const walletDownloadUrl = state?.walletDownloadUrl || "";
  const userFirstName = state?.firstName || "User";
  const userLastName = state?.lastName || "";

  // Display address: include name prefix only if not anonymous
  // Canonical addresses (e.g. 23.45.2@bit) are complete on their own -
  // no name prefix like the old @adjective.noun.tier format needed
  const displayAddress = userAddress;

  // Brief loading steps after payment (address already created server-side).
  // Kept short — the Locker Keys should never be held up more than ~3s.
  const steps = [
    "Confirming your registration...",
    "Preparing your address details...",
    "Almost ready...",
    "Finalizing Decentralized Inbox...",
  ];

  useEffect(() => {
    if (provisionStep < steps.length) {
      const timer = setTimeout(
        () => setProvisionStep((prev) => prev + 1),
        650
      );
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setIsProvisioning(false), 350);
    }
  }, [provisionStep]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // In the new flow there can be several addresses — anonymize each one.
  // The endpoint only accepts a single email per call, so we fan out.
  const anonymizeTargets = addresses
    ? addresses.map((a) => a.qmail)
    : (userAddress ? [userAddress] : []);

  const handleAnonymousToggle = async () => {
    if (isAnonymous || anonymousLoading || anonymizeTargets.length === 0) {
      // Already anonymous — no undo (names already removed from server)
      return;
    }
    setAnonymousLoading(true);
    setAnonymousError(null);
    try {
      const results = await Promise.all(
        anonymizeTargets.map((email) =>
          fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/make-anonymous`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
            .then((r) => r.json())
            .catch(() => ({ success: false }))
        )
      );
      // Only report success if EVERY address was scrubbed — a partial success
      // would falsely tell the buyer all their names were removed.
      if (results.every((r) => r && r.success)) {
        setIsAnonymous(true);
      } else {
        setAnonymousError(
          "We couldn't remove your name from every address. Please try again or contact support."
        );
      }
    } catch (err) {
      console.error("Failed to make anonymous:", err);
      setAnonymousError("Something went wrong. Please try again.");
    }
    setAnonymousLoading(false);
  };

  const discoveryLinks = [
    {
      title:
        "Run your own Qmail server from home (optional) and get paid for it!",
      icon: Server,
      color: "text-green-400",
    },
    {
      title: "Turbocharge your Influencer Income.",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      title:
        "Include your entire organization and keep your privacy (Enterprise Solutions).",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Marketers: Pay your customers to read your messages.",
      icon: Target,
      color: "text-purple-400",
    },
    {
      title:
        "Become a Certified QMail Secure User, Qmail Server Administration, QMail Marketing or even a Certified QMail Developer.",
      icon: GraduationCap,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen py-24 bg-[#05050a] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-600"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] bg-purple-600 opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {isProvisioning ? (
            /* --- REAL TIME PROVISIONING EXPERIENCE --- */
            <motion.div
              key="provisioning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-full border-b-2 border-blue-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck
                    size={48}
                    className="text-blue-400 animate-pulse"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-4">
                Provisioning Identity
              </h2>
              <div className="h-6 overflow-hidden max-w-sm w-full mx-auto">
                <motion.p
                  key={provisionStep}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-blue-400 font-mono text-sm"
                >
                  {steps[provisionStep]}
                </motion.p>
              </div>
            </motion.div>
          ) : (
            /* --- SUCCESS CONTENT --- */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {addresses ? (
                /* ============================================ */
                /* NEW FLOW — locker-key delivery                */
                /* ============================================ */
                <>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 text-green-400 shrink-0 mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                      {addresses.length === 1
                        ? "Your QMail address is:"
                        : "Your QMail addresses are:"}
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                      Save these details somewhere safe — you'll need the Locker Keys to claim
                      your coins inside the QMail software.
                    </p>
                  </div>

                  {partialError && (
                    <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/40 p-6 rounded-[2.5rem] flex items-start gap-4 shadow-2xl">
                      <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={22} />
                      <div>
                        <p className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">
                          Your Payment Was Received
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {partialError} Our support team has been notified and will make sure
                          you receive everything you paid for.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address(es) + software download on the left, the wallet
                      top-up upsell beside them on the right — side by side so
                      the page no longer reads as "finished" after the address
                      (the old stacked layout created a false bottom). */}
                  <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                    {/* Left: QMail address card(s) + software download */}
                    <div className="space-y-6">
                      <div className={`grid gap-6 ${addresses.length > 1 ? "sm:grid-cols-2" : ""}`}>
                        {addresses.map((addr, i) => (
                          <AddressCard key={`${addr.qmail}-${i}`} addr={addr} />
                        ))}
                      </div>

                      <div className="text-center lg:text-left">
                        <a
                          href="https://CloudCoinConsortium.com/use.php"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-gray-200 transition-all"
                        >
                          <Download size={20} /> Download the QMail Software
                          <ExternalLink size={16} className="opacity-60" />
                        </a>
                      </div>
                    </div>

                    {/* Right: Subscription upsell */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-10 rounded-[2.5rem] shadow-xl text-center flex flex-col justify-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Rocket className="text-white" size={22} />
                        <h3 className="font-black text-white uppercase tracking-widest text-sm">
                          Subscribe to QMail Servers
                        </h3>
                      </div>
                      <p className="text-sm text-blue-100 max-w-xl mx-auto mb-6 leading-relaxed">
                        QMail servers are run by independent administrators — usually out of their
                        own garage, on their own electricity and internet connection. They need to
                        get paid for their service, and we'll pay them for you. Want to run one
                        yourself? You'll be able to sign up as an administrator too in Phase 3.
                      </p>
                      <Link
                        to={`/subscribe?addresses=${encodeURIComponent(
                          addresses.map((a) => a.qmail).join(","),
                        )}`}
                        state={{ addresses: addresses.map((a) => a.qmail) }}
                        className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all mx-auto"
                      >
                        See Subscription Plans
                      </Link>
                    </div>
                  </div>

                  {/* Links / help */}
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Link
                        to="/getting-started"
                        className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                      >
                        <BookOpen size={18} /> Getting Started
                      </Link>
                      <Link
                        to="/about-qmail"
                        className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                      >
                        <Info size={18} /> About QMail
                      </Link>
                      <a
                        href="https://t.me/distributedmailsystem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                      >
                        <MessageCircle size={18} /> Telegram Group
                      </a>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">
                          Support via QMail
                        </p>
                        <CopyableRow value="20.123@giga" textClass="text-base text-white" />
                      </div>
                      <a
                        href="mailto:CloudCoin@Protonmail.com"
                        className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                      >
                        <Mail size={18} /> CloudCoin@Protonmail.com
                      </a>
                    </div>
                  </div>

                  {/* Go Anonymous */}
                  <div className="text-center">
                    <button
                      onClick={handleAnonymousToggle}
                      disabled={isAnonymous || anonymousLoading}
                      className={`inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full border transition-all ${
                        isAnonymous
                          ? "bg-green-600/20 border-green-500/30 text-green-400 cursor-default"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      <Lock size={16} />
                      {anonymousLoading
                        ? "Updating..."
                        : isAnonymous
                        ? "Anonymous"
                        : "Go Anonymous"}
                    </button>
                    <p className="text-[11px] text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
                      Removes your name from {addresses.length > 1 ? "these addresses" : "this address"}{" "}
                      so no one can look {addresses.length > 1 ? "them" : "it"} up by name in the
                      Distributed Resource Directory.
                    </p>
                    {anonymousError && (
                      <p className="text-[11px] text-red-400 mt-2 max-w-md mx-auto">{anonymousError}</p>
                    )}
                  </div>
                </>
              ) : (
                /* ============================================ */
                /* LEGACY FLOW — wallet-ZIP delivery (unchanged) */
                /* ============================================ */
                <>
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 text-green-400 shrink-0">
                    <CheckCircle2 size={36} />
                  </div>
                  Success!
                </h1>
                <p className="text-gray-400">
                  Your decentralized identity is now live on the Distributed Resource Directory and others can search you up.
                </p>
              </div>

              {/* Beta & First-Run Notice */}
              <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 p-8 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <AlertTriangle size={18} /> Please Read Before You Start
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        QMail is a beta product
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        You may run into a few hiccups while we polish things.
                        Thank you for being an early adopter — your feedback
                        makes QMail better.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        Upgrade QMail first thing
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Your zip contains an older version of QMail.exe. The
                        first time you open QMail, a pop-up will let you know a
                        new version is available — install that upgrade before
                        doing anything else.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        Read the included documents
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Your zip folder includes About_Qmail.txt and
                        Quick_Start_Guide.txt. Reading them first will make
                        your QMail experience much more enjoyable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Side: Identity & Controls */}
                <div className="lg:col-span-7 space-y-8">
                  {/* The Address Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                        <AtSign size={14} /> Your Copy-Paste Address
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAnonymousToggle}
                          disabled={isAnonymous || anonymousLoading}
                          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                            isAnonymous
                              ? "bg-green-600/20 border-green-500/30 text-green-400 cursor-default"
                              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                          }`}
                        >
                          <Lock size={14} />
                          {anonymousLoading ? "Updating..." : isAnonymous ? "Anonymous" : "Go Anonymous"}
                        </button>
                        <div className="group relative">
                          <Info className="text-gray-500 hover:text-blue-400 transition-colors cursor-help" size={16} />
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-56 leading-relaxed">
                            Remove your name from your address. No one will be able to look you up by name in the Distributed Resource Directory.
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                      <code className="text-xl md:text-2xl text-white font-mono flex-1 break-all text-center md:text-left">
                        {displayAddress}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest text-center md:text-left italic">
                      Copy and paste this into your email client to start
                      sending private messages.
                    </p>
                    <Link
                      to="/download"
                      className="mt-6 w-full bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Download the Qmail Software
                    </Link>
                  </div>

                  {/* Locker Code Card */}
                  {lockerCode && (
                    <div className="bg-white/5 backdrop-blur-xl border border-green-500/20 p-6 rounded-[2rem]">
                      <h3 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2 whitespace-nowrap">
                        <Key size={14} /> Your Locker Code
                      </h3>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <code className="text-2xl text-green-400 font-mono">
                          {lockerCode}
                        </code>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-3 italic">
                        Save this code securely. You'll need it to access your mailbox.
                      </p>
                    </div>
                  )}

                  {/* Preconfigured Wallet Download Card */}
                  {walletDownloadUrl && (
                    <div className="bg-white/5 backdrop-blur-xl border border-blue-500/20 p-6 rounded-[2rem]">
                      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 whitespace-nowrap">
                        <Download size={14} /> Your Preconfigured Wallet
                      </h3>
                      <a
                        href={walletDownloadUrl}
                        className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> Download Wallet Zip
                      </a>
                      <p className="text-[10px] text-gray-500 mt-3 italic">
                        Save this file somewhere safe. This link works a limited
                        number of times, then the file is permanently deleted from
                        our server.
                      </p>
                    </div>
                  )}

                  {/* Real-Time Config Card */}
                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-blue-500/20 p-8 rounded-[2.5rem]">
                    <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap">
                      <Settings size={14} /> Inbox Settings — Phase II Preview
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-8">
                      These settings aren't active yet. We're building them now as part of
                      Phase II — you'll be able to configure your inbox here soon.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Input Group 1 — Inbox Fee ships in Phase II, shown disabled as a preview */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest flex items-center h-6 mb-2 whitespace-nowrap gap-2">
                          Global Inbox Fee
                          <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full text-[8px] tracking-widest">
                            Phase II — Coming Soon
                          </span>
                        </label>
                        <div className="relative group opacity-50">
                          <DollarSign
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                            size={16}
                          />
                          <input
                            type="number"
                            value={inboxFee}
                            disabled
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-400 font-mono outline-none shadow-inner cursor-not-allowed"
                          />
                        </div>

                        <p className="text-[10px] text-yellow-200/70 italic mt-2 min-h-[1.5rem]">
                          Not available yet — in Phase II you'll be able to set the fee strangers pay to reach you.
                        </p>
                      </div>

                      {/* Input Group 2 — profile editing ships in Phase II, shown disabled as a preview */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest flex items-center h-6 mb-2 whitespace-nowrap gap-2">
                          Identify Yourself
                          <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full text-[8px] tracking-widest">
                            Phase II — Coming Soon
                          </span>
                        </label>

                        <div className="relative group opacity-50">
                          <AtSign
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                            size={16}
                          />
                          <input
                            type="text"
                            value={definer}
                            disabled
                            placeholder="e.g. Lead Developer"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-400 font-mono outline-none shadow-inner cursor-not-allowed"
                          />
                        </div>
                        <p className="text-[10px] text-yellow-200/70 italic mt-2 min-h-[1.5rem]">
                          Not available yet — in Phase II this title will be visible in the Global Directory.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side: Next Steps & Links */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem]">
                    <h3 className="text-lg font-black text-white mb-8 uppercase tracking-tighter">
                      What's Next in Phase II?
                    </h3>
                    <div className="space-y-4">
                      {discoveryLinks.map((link, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]"
                        >
                          <div
                            className={`p-3 rounded-xl bg-white/5 ${link.color}`}
                          >
                            <link.icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm text-gray-400 leading-relaxed block">
                              {link.title}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-yellow-400/80 mt-1 inline-block">
                              Coming in Phase II
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Viral Referral — ships in Phase II, shown disabled as a preview */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-black text-white uppercase tracking-widest text-xs">
                        Viral Referral Engine
                      </h4>
                      <span className="bg-black/30 border border-white/20 text-yellow-300 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                        Phase II — Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-blue-100 mb-6">
                      Coming in Phase II: refer a friend and get $10 in CloudCoins
                      credited to your locker.
                    </p>
                    <button
                      disabled
                      className="w-full bg-white/10 py-3 rounded-xl text-white/50 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Share2 size={16} /> Share Referral Link
                    </button>
                  </div>
                </div>
              </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FunnelSuccess;
