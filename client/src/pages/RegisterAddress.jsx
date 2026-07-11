import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { usePaypalConfig } from "../hooks/usePaypalConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  User,
  Zap,
  Star,
  Hexagon,
  Check,
  Copy,
  AtSign,
  Info,
  ShieldAlert,
  Smartphone,
  Monitor,
  HardDrive,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { track } from "../utils/analytics";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const RegisterAddress = () => {
  useDocumentMeta({ title: 'Get Started', description: 'Claim your unique decentralized QMail address. Register as a user or sign up free as an influencer.' });

  const { config: paypalConfig, loading: paypalConfigLoading, error: paypalConfigError } = usePaypalConfig();
  // Payments are switched on/off server-side (PAYMENTS_ENABLED in server/index.js)
  const paymentsDisabled = !paypalConfig?.paymentsEnabled;
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState("free");
  const [customGroup, setCustomGroup] = useState("");
  const [inboxFee, setInboxFee] = useState("0");

  // Refs for values used inside PayPal callbacks — prevents re-creating
  // renderPayPalButtons on every keystroke which causes DOM crash
  const customGroupRef = useRef("");
  const inboxFeeRef = useRef("0");

  const handleCustomGroupChange = (val) => {
    setCustomGroup(val);
    customGroupRef.current = val;
  };

  const handleInboxFeeChange = (val) => {
    setInboxFee(val);
    inboxFeeRef.current = val;
  };
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [walletStock, setWalletStock] = useState(null);

  // Sold-out tiers are disabled so nobody can pay for a wallet we can't deliver
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-stock`)
      .then((r) => r.json())
      .then(setWalletStock)
      .catch(() => setWalletStock(null));
  }, []);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef(null);
  const influencerButtonRef = useRef(null);
  const navigate = useNavigate();
  const [iframeHeight, setIframeHeight] = useState(800);
  const [isInfluencerMode, setIsInfluencerMode] = useState(false);

  // Stake Levels
  const tiers = [
    {
      name: ".Bit",
      price: 10,
      trust: "Entry level",
      best: "Casual users, testing",
      icon: Zap,
      color: "text-blue-400",
    },
    {
      name: ".Byte",
      price: 20,
      trust: "Basic commitment",
      best: "Everyday personal email",
      icon: Hexagon,
      color: "text-green-400",
    },
    {
      name: ".Kilo",
      price: 50,
      trust: "Moderate stake",
      best: "Freelancers, small creators",
      icon: Star,
      color: "text-purple-400",
    },
    {
      name: ".Mega",
      price: 100,
      trust: "Strong signal of legitimacy",
      best: "Professionals, businesses",
      icon: ShieldCheck,
      color: "text-yellow-400",
    },
    {
      name: ".Giga",
      price: 1000,
      trust: "Highest trust — serious users only",
      best: "Executives, high-profile individuals",
      icon: User,
      color: "text-red-400",
    },
  ];

  // Set default tier to .Bit on mount
  useEffect(() => {
    if (!selectedTier) {
      setSelectedTier(tiers[0]);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.frameHeight) {
        setIframeHeight(event.data.frameHeight);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const totalPrice = useMemo(() => {
    if (isInfluencerMode) return 0;  // display $0 to user
    const base = selectedTier ? selectedTier.price : 0;
    const extra = selectedEdition === "pro" ? 10 : 0;
    return base + extra;
  }, [selectedTier, selectedEdition, isInfluencerMode]);

  const generateSN = () =>
    Math.floor(Math.random() * 65535)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

  const handleGroupChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
    handleCustomGroupChange(value);
  };

  const renderPayPalButtons = useCallback(() => {
    // Use the correct container ref based on current mode
    const activeRef = isInfluencerMode ? influencerButtonRef : buttonRef;

    // If ref not yet attached (container still mounting), retry after short delay
    if (!activeRef.current) {
      setTimeout(() => {
        const retryRef = isInfluencerMode ? influencerButtonRef : buttonRef;
        if (window.paypal && retryRef.current) {
          retryRef.current.innerHTML = "";
          window.paypal.Buttons({
            createOrder: (data, actions) => actions.order.create({
              purchase_units: [{
                // PayPal rejects $0 in production — send $0.01 for identity verification
                // Backend still receives amountPaid: 0 (no actual charge)
                amount: { value: isInfluencerMode ? "0.01" : totalPrice.toString() },
                description: isInfluencerMode
                  ? "QMail Influencer Identity Verification"
                  : `QMail Registration: .${selectedTier?.name} + ${selectedEdition} edition`,
              }],
            }),
            onApprove: async (data, actions) => {
              try {
                const order = await actions.order.capture();
                const response = await fetch(
                  `${import.meta.env.VITE_BASE_URL}/api/generate-mailbox`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      firstName: order.payer.name.given_name,
                      lastName: order.payer.name.surname,
                      amountPaid: totalPrice,
                      inboxFee: parseFloat(inboxFeeRef.current),
                      description: customGroupRef.current || (isInfluencerMode ? "Influencer" : ""),
                      paypalOrderID: data.orderID,
                    }),
                  }
                );
                const result = await response.json();
                if (!result.success) { setPaypalError(result.error || "Registration failed."); return; }
                if (isInfluencerMode) {
                  track('influencer_signup_complete', { name: `${order.payer.name.given_name} ${order.payer.name.surname}` });
                  navigate("/strategy", { state: { verifiedName: `${order.payer.name.given_name} ${order.payer.name.surname}`, qmail: result.email, paypalEmail: order.payer.email_address || "", token: result.token || "" } });
                } else {
                  navigate("/success", { state: { email: result.email, walletDownloadUrl: result.walletDownloadUrl || null, firstName: order.payer.name.given_name, lastName: order.payer.name.surname } });
                }
              } catch { setPaypalError("We could not complete payment capture. Please try again or contact support."); }
            },
          }).render(retryRef.current);
        }
      }, 500);
      return;
    }

    if (window.paypal && activeRef.current && (selectedTier || isInfluencerMode)) {
      activeRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  // PayPal rejects $0 in production — send $0.01 for identity verification
                  // Backend still receives amountPaid: 0 (no actual charge)
                  amount: { value: isInfluencerMode ? "0.01" : totalPrice.toString() },
                  description: isInfluencerMode
                    ? "QMail Influencer Identity Verification"
                    : `QMail Registration: .${selectedTier.name} + ${selectedEdition} edition`,
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            try {
              const order = await actions.order.capture();
              const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/generate-mailbox`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firstName: order.payer.name.given_name,
                    lastName: order.payer.name.surname,
                    amountPaid: totalPrice,
                    inboxFee: parseFloat(inboxFeeRef.current),
                    description:
                      customGroupRef.current || (isInfluencerMode ? "Influencer" : ""),
                    paypalOrderID: data.orderID,
                  }),
                },
              );
              const result = await response.json();
              if (!result.success) {
                setPaypalError(result.error || "Registration failed.");
                return;
              }
              if (isInfluencerMode) {
                track('influencer_signup_complete', { name: `${order.payer.name.given_name} ${order.payer.name.surname}` });
                navigate("/strategy", {
                  state: {
                    verifiedName: `${order.payer.name.given_name} ${order.payer.name.surname}`,
                    qmail: result.email,
                    paypalEmail: order.payer.email_address || "",
                    token: result.token || "",
                  },
                });
              } else {
                navigate("/success", {
                  state: {
                    email: result.email,
                    walletDownloadUrl: result.walletDownloadUrl || null,
                    firstName: order.payer.name.given_name,
                    lastName: order.payer.name.surname,
                  },
                });
              }
            } catch (err) {
              setPaypalError("We could not complete payment capture. Please try again or contact support.");
            }
          },
        })
        .render(activeRef.current);
    }
  // customGroup and inboxFee intentionally excluded — using refs to avoid
  // re-creating this callback on every keystroke (causes PayPal DOM crash)
  }, [selectedTier, totalPrice, selectedEdition, isInfluencerMode]);

  useEffect(() => {
    if (paypalConfigLoading) return;
    if (paypalConfigError || !paypalConfig?.clientId) {
      setPaypalError(
        paypalConfigError || "PayPal Configuration Missing: server did not return a client ID.",
      );
      return;
    }

    const scriptId = "paypal-sdk-script";
    const clientId = paypalConfig.clientId;

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;

      script.onload = () => {
        setIsPaypalLoaded(true);
        setPaypalError(null);
      };

      script.onerror = () => {
        setPaypalError(
          "Failed to load PayPal. Please disable any ad-blockers and refresh the page.",
        );
      };

      document.body.appendChild(script);
    } else {
      setIsPaypalLoaded(true);
    }
  }, [paypalConfigLoading, paypalConfigError, paypalConfig]);

  useEffect(() => {
    // Influencer sign-ups are closed (Phase II) — never render PayPal there
    if (isPaypalLoaded && selectedTier && !isInfluencerMode && !paymentComplete && !paypalError) {
      // 300ms delay gives AnimatePresence time to mount the correct container
      // before PayPal tries to render into it
      setTimeout(renderPayPalButtons, 300);
    }
  }, [
    isPaypalLoaded,
    selectedTier,
    renderPayPalButtons,
    paymentComplete,
    selectedEdition,
    paypalError,
    isInfluencerMode,
  ]);

  return (
    <>
      <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen bg-[#0a0a1a]">
        <div className="max-w-5xl mx-auto">
          {/* --- HERO SECTION --- */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Claim Your Unique <br />
              <span className="qmail-gradient-text">
                Decentralized Email Address
              </span>
            </h1>

          </header>

          {!paymentComplete ? (
            <div className="space-y-16">

              {/* ============================================ */}
              {/* INFLUENCER MODE — Simplified streamlined UI  */}
              {/* ============================================ */}
              <AnimatePresence mode="wait">
                {isInfluencerMode ? (
                  <motion.div
                    key="influencer-flow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Influencer Explainer Banner */}
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-8 text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                        <Sparkles className="text-purple-400" size={28} />
                      </div>
                      <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-black text-white">
                          Influencer Address — Free & Verified
                        </h2>
                        <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Phase II — Coming Soon
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mx-auto">
                        Your address will be generated using the <strong className="text-purple-400">exact name on your PayPal account</strong> — no manual entry needed. This verified name prevents impersonators from creating fake lookalike addresses.
                      </p>
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-left">
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                          <div className="text-purple-400 font-bold mb-1">✓ Zero Cost</div>
                          <div className="text-gray-400">No stake required — completely free for verified influencers.</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                          <div className="text-purple-400 font-bold mb-1">✓ Name-Verified</div>
                          <div className="text-gray-400">Your real name from PayPal goes into your address — impossible to fake.</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                          <div className="text-purple-400 font-bold mb-1">✓ Anti-Phishing</div>
                          <div className="text-gray-400">Hackers can't create lookalike pages — your address is cryptographically unique.</div>
                        </div>
                      </div>
                    </div>

                    {/* Influencer form card */}
                    <div className="bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-purple-500/20 space-y-10">

                      {/* STEP 1 (Influencer): Self Describer */}
                      <div className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-purple-600 text-sm flex items-center justify-center font-mono">
                            1
                          </span>
                          Your Brand / Niche Tag{" "}
                          <span className="text-sm font-normal text-gray-500">(optional)</span>
                        </h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Add a word that describes you — like your brand name, niche, or platform handle. This becomes the <span className="text-purple-400 font-mono">@tag</span> in your address.
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl text-gray-700 font-mono">@</span>
                          <input
                            type="text"
                            value={customGroup}
                            onChange={handleGroupChange}
                            placeholder="e.g. FitnessWithLaura"
                            className="max-w-md bg-gray-900/60 border border-purple-500/30 rounded-2xl px-6 py-4 text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:bg-gray-900/80 transition-all text-xl font-mono"
                          />
                        </div>

                        {/* Live preview of what their address will look like */}
                        <div className="mt-2 bg-black/60 border border-gray-700/50 rounded-2xl px-6 py-4">
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest font-bold">Your address will look like:</p>
                          <code className="text-blue-300 font-mono text-sm break-all">
                            FirstName.LastName@{customGroup || "YourTag"}#XXXX.Influencer
                          </code>
                          <p className="text-[10px] text-gray-600 mt-1">
                            FirstName & LastName are pulled automatically from your PayPal — no typing needed.
                          </p>
                        </div>
                      </div>

                      {/* CHECKOUT — Influencer */}
                      <div className="pt-8 border-t border-gray-800">
                        <div className="max-w-md mx-auto space-y-6 bg-black p-8 rounded-3xl border border-purple-500/20 shadow-2xl">
                          <div className="flex justify-between items-center font-black text-2xl text-white">
                            <span>Identity verification:</span>
                            <span className="text-green-400">$0.01</span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed text-center">
                            When influencer sign-ups open, PayPal verifies your identity with a $0.01 micro-charge. Your verified PayPal name is used to create your unique address.
                          </p>

                          {/* Influencer sign-ups are closed until the client software
                              supports influencer accounts (Phase II) */}
                          <div className="min-h-[150px] flex items-center justify-center">
                            <div className="text-center py-6 w-full">
                              <div className="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-3">
                                Phase II — Coming Soon
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                The QMail client software isn't ready for influencer
                                accounts yet. We're building this now — join our
                                Telegram below to be notified the moment sign-ups open.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                ) : (

                /* ============================================ */
                /* REGULAR MODE — Full stake selection flow     */
                /* ============================================ */
                  <motion.div
                    key="regular-flow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-16"
                  >
                    {/* --- SELECTION FORM --- */}
                    <div className="bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-800 space-y-12">

                      {/* STEP 1: TIER */}
                      <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">
                            1
                          </span>
                          Choose Your Stake Level & Status Indicator:
                        </h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          DMS requires a one-time registration fee (stake) to activate your address. Higher stakes signal higher trust and help make high-volume abuse impractical. Address registration is refundable within 30 days — see Terms.
                        </p>
                        <p className="text-xs text-yellow-300/90 font-bold flex items-center gap-2">
                          <Monitor size={14} className="shrink-0" />
                          Currently available for Windows Desktop — Mac &amp; Linux coming soon.
                        </p>

                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 uppercase text-[11px] tracking-widest font-bold">
                                <tr>
                                  <th className="p-6 border-b border-gray-700/30 text-center">
                                    <div className="flex items-center justify-center gap-2">Select</div>
                                  </th>
                                  <th className="p-6 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">Level</div>
                                  </th>
                                  <th className="p-6 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">Stake</div>
                                  </th>
                                  <th className="p-6 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">Status & Trust Signal</div>
                                  </th>
                                  <th className="p-6 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">Best For</div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {tiers.map((t, index) => {
                                  const soldOut = walletStock
                                    ? (walletStock[t.name.slice(1).toLowerCase()] ?? 0) === 0
                                    : false;
                                  return (
                                  <tr
                                    key={t.name}
                                    className={`hover:bg-gray-800/30 transition-all duration-300 ${
                                      selectedTier?.name === t.name
                                        ? "bg-blue-600/10 border-l-4"
                                        : ""
                                    } ${index % 2 === 0 ? "bg-gray-900/20" : "bg-black/20"}`}
                                  >
                                    <td className="p-6 text-center">
                                      <button
                                        onClick={() => !soldOut && setSelectedTier(t)}
                                        disabled={soldOut}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 min-w-[90px] relative group ${
                                          soldOut
                                            ? "bg-gray-900/30 border-gray-800 text-gray-600 cursor-not-allowed opacity-60"
                                            : selectedTier?.name === t.name
                                            ? `bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20 scale-105`
                                            : "bg-gray-900/50 border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-gray-800/50 hover:scale-102"
                                        }`}
                                      >
                                        <t.icon
                                          size={24}
                                          className={
                                            selectedTier?.name === t.name
                                              ? "text-white"
                                              : t.color
                                          }
                                        />
                                        <div className="text-center font-bold uppercase tracking-widest text-[10px]">
                                          {soldOut
                                            ? "Sold Out"
                                            : selectedTier?.name === t.name
                                            ? "Selected"
                                            : "Select"}
                                        </div>
                                        {selectedTier?.name === t.name && (
                                          <div className="absolute -top-0 -right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check size={14} className="text-white" />
                                          </div>
                                        )}
                                      </button>
                                    </td>
                                    <td className={`p-6 font-black text-lg ${t.color}`}>
                                      <div className="flex items-center gap-3">
                                        <t.icon size={18} />
                                        {t.name}
                                      </div>
                                    </td>
                                    <td className="p-6 font-mono text-white font-bold text-lg">
                                      <span className="bg-gray-800 px-3 py-1 rounded-full">
                                        ${t.price}
                                      </span>
                                    </td>
                                    <td className="p-6 text-gray-300 font-medium">{t.trust}</td>
                                    <td className="p-6 text-gray-400 italic text-sm leading-relaxed">{t.best}</td>
                                  </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* CHECKOUT — Regular */}
                      <div className="pt-10">
                        <div className="max-w-md mx-auto space-y-8 bg-black p-8 rounded-3xl border border-gray-800 shadow-2xl">
                          <div className="flex justify-between items-center font-black text-2xl text-white">
                            <span>Stake Your Address:</span>
                            <span>${totalPrice}</span>
                          </div>

                          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                            <Monitor className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs text-yellow-200/90 leading-relaxed">
                              <span className="font-bold text-yellow-300">Windows Desktop only (for now).</span>{" "}
                              The QMail software runs on Windows Desktop today. Mac and Linux versions are
                              coming soon — your address will work on them as soon as they're released.
                            </p>
                          </div>

                          <div className="min-h-[150px] flex items-center justify-center">
                            {paymentsDisabled ? (
                              <div className="text-center py-6 w-full">
                                <div className="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-3">
                                  Coming Soon
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                  Payments are temporarily unavailable while we finish
                                  setting up. Check back shortly!
                                </p>
                              </div>
                            ) : paypalError ? (
                              <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-500/20 text-sm flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                <span>{paypalError}</span>
                              </div>
                            ) : !isPaypalLoaded ? (
                              <div className="animate-pulse text-gray-500 text-xs font-bold uppercase tracking-widest">
                                Initialising PayPal...
                              </div>
                            ) : (
                              <div ref={buttonRef} className="w-full"></div>
                            )}
                          </div>

                          {!paymentsDisabled && (
                          <div className="space-y-3 pt-2 border-t border-gray-800">
                            <ul className="text-left text-xs text-gray-400 space-y-1.5">
                              <li>• Unique QMail address tied to your verified PayPal name</li>
                              <li>• Windows desktop client access</li>
                              <li>• 30-day money-back on address registration (see Terms)</li>
                            </ul>
                            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                              Secure checkout via PayPal.{" "}
                              <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a>
                              {" · "}
                              <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy</a>
                            </p>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      <button
                        onClick={() => { if (!isInfluencerMode) track('influencer_signup_start'); setIsInfluencerMode(!isInfluencerMode); }}
                        className={`flex items-center gap-2 font-bold px-6 py-3 rounded-full border transition-all ${
                          isInfluencerMode
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-400"
                        }`}
                      >
                        <User size={18} />{" "}
                        {isInfluencerMode
                          ? "Influencer Preview Active"
                          : "Influencers: Free Sign-Up (Phase II — Coming Soon)"}
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 opacity-80">
                      <a
                        href="https://t.me/+9YVOgaobizw5NjEx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-300 text-sm font-medium px-3 py-2 transition-all"
                      >
                        <Smartphone size={16} /> Telegram community
                      </a>
                      <a
                        href="https://support.cloudcoin.com/en/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-300 text-sm font-medium px-3 py-2 transition-all"
                      >
                        <Shield size={16} /> CloudCoin support
                      </a>
                    </div>

                    {/* --- PHASE STATUS INFO --- */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900 p-6 rounded-2xl border border-blue-500/20">
                        <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-sm">
                          Phase I (Current)
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Your address is automatically published in the DRD. The First/Second words come directly from your card name.
                        </p>
                      </div>
                      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 opacity-60">
                        <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-sm">
                          Phase II (Coming Soon)
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Edit your profile, add details, and customize your inbox presence.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* --- SUCCESS STATE --- */
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 p-12 rounded-[3rem] text-center space-y-8 border border-green-500/30"
            >
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-green-400">
                <Check size={48} />
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                Identity Claimed!
              </h2>
              <div className="bg-black p-8 rounded-3xl border border-gray-800 inline-block w-full max-w-2xl">
                <code className="text-2xl text-blue-400 font-mono break-all leading-relaxed">
                  {generatedAddress}
                </code>
              </div>
              <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                Your address is now active in the Distributed Resource Directory (DRD).
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 px-12 py-4 rounded-full font-black text-white hover:bg-blue-500 transition-all"
                >
                  Access My Inbox
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="bg-gray-800 px-8 py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 border border-gray-700"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}{" "}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- DISCUSSION / FEEDBACK SYSTEM --- */}
      <div className="border-gray-800 pt-10">
        <div className="rounded-[2.5rem] overflow-hidden bg-black/40 shadow-2xl pb-20">
          <iframe
            src="https://perfectmonetarypolicy.com/feedback_system/widget_embed.php"
            width="100%"
            height={`${iframeHeight}px`}
            frameBorder="0"
            scrolling="no"
            style={{
              display: "block",
              background: "transparent",
              transition: "height 0.3s ease",
            }}
            title="DMS Community Discussion"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default RegisterAddress;