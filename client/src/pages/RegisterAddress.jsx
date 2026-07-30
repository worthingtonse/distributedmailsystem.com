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
import bitIcon from "../assets/stakes/bit.svg";
import byteIcon from "../assets/stakes/byte.svg";
import kiloIcon from "../assets/stakes/kilo.svg";
import megaIcon from "../assets/stakes/mega.svg";
import gigaIcon from "../assets/stakes/giga.svg";
import epicIcon from "../assets/stakes/epic.svg";
import {
  User,
  Check,
  Copy,
  AtSign,
  Info,
  ShieldAlert,
  Smartphone,
  HardDrive,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { track } from "../utils/analytics";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const InfoPopover = ({ label, children }) => (
  <div className="relative inline-flex group align-middle">
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
    >
      <Info size={12} />
    </button>
    <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-blue-400/20 bg-slate-950/95 p-3 text-left text-[11px] leading-relaxed text-gray-300 opacity-0 invisible translate-y-2 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0">
      {children}
    </div>
  </div>
);

const AllLevels = ({ className = "" }) => (
  <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-4 ${className}`}>
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="text-cyan-300" size={14} />
        <span className="text-[11px] font-black uppercase tracking-widest text-cyan-200">
          All Levels
        </span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">
        All levels get free <strong className="text-white">"welfare" storage</strong> if below the QMail server admin's threshold. There is no limit to qmail size when paid for.
      </p>
    </div>
    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="text-blue-300" size={14} />
        <span className="text-[11px] font-black uppercase tracking-widest text-blue-200">
          All Levels
        </span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">
        All levels can subscribe. Optional subscriptions can automatically pay QMail servers so you do not need to keep CloudCoins in your wallet.
      </p>
    </div>
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="text-emerald-300" size={14} />
        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
          Portable
        </span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">
        All levels allow the software to be stored on a USB drive and taken offline.
      </p>
    </div>
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="text-yellow-300" size={14} />
        <span className="text-[11px] font-black uppercase tracking-widest text-yellow-200">
          Wallet Storage
        </span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">
        Every level can store at least <strong className="text-white">50,000</strong> coins.
      </p>
    </div>
  </div>
);

const RegisterAddress = () => {
  useDocumentMeta({
    title: 'Claim Your QMail Address',
    description: 'Register a permanent QMail mailbox from $10. Your mailbox key unlocks stake features. 30-day money-back on address registration.',
    path: '/register',
  });

  const { config: paypalConfig, loading: paypalConfigLoading, error: paypalConfigError } = usePaypalConfig();
  // Payments are switched on/off server-side (PAYMENTS_ENABLED in server/index.js)
  const paymentsDisabled = !paypalConfig?.paymentsEnabled;
  // Brand/niche tag shown in the influencer address preview (cosmetic only —
  // influencer sign-ups are closed for Phase II, nothing is submitted with it)
  const [customGroup, setCustomGroup] = useState("");
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
  const navigate = useNavigate();
  const [iframeHeight, setIframeHeight] = useState(800);
  const [isInfluencerMode, setIsInfluencerMode] = useState(false);

  // Mailbox keys
  const tiers = [
    {
      key: "bit",
      name: ".Bit",
      price: 10,
      trust: "Entry level",
      best: "Casual users, testing",
      proUnlock: "Nothing extra",
      proDetails: "The .bit level includes the shared stake features only.",
      icon: bitIcon,
      color: "text-blue-400",
    },
    {
      key: "byte",
      name: ".Byte",
      price: 20,
      trust: "Basic commitment",
      best: "Everyday personal qmail",
      proUnlock: "1M Limit",
      proDetails: "Now you can store up to 1 Million coins in your wallet.",
      icon: byteIcon,
      color: "text-green-400",
    },
    {
      key: "kilo",
      name: ".Kilo",
      price: 50,
      trust: "Moderate stake",
      best: "Freelancers, small creators",
      proUnlock: "Encryption & Max Coins",
      proDetails: "Wallet can store an infinite number of coins. Wallet can be encrypted.",
      icon: kiloIcon,
      color: "text-purple-400",
    },
    {
      key: "mega",
      name: ".Mega",
      price: 100,
      trust: "Strong signal of legitimacy",
      best: "Professionals, businesses",
      proUnlock: "Own a Node",
      proDetails: "You can host your own QMail server (node) and earn CloudCoins for helping secure the network.",
      icon: megaIcon,
      color: "text-yellow-400",
    },
    {
      key: "giga",
      name: ".Giga",
      price: 1000,
      trust: "Highest trust — serious users only",
      best: "Executives, high-profile individuals",
      proUnlock: "Customize",
      proDetails: "",
      icon: gigaIcon,
      color: "text-red-400",
    },
    {
      key: "epic",
      name: ".Epic",
      contactOnly: true,
      trust: "Elite tier — verified influencers & institutions",
      best: "Contact us for more information: 20.123@giga",
      proUnlock: "VIP",
      proDetails: "Custom deployment and white-glove setup for special cases.",
      icon: epicIcon,
      color: "text-cyan-300",
    },
  ];

  const CART_KEYS = ["bit", "byte", "kilo", "mega", "giga"];
  const MAX_CART_TOTAL = 20;

  // Per-class cart quantities. Mirrored into a ref (the same pattern this
  // file used to use for inboxFee/customGroup) so PayPal's createOrder/
  // onApprove callbacks can always read the latest cart without
  // renderPayPalButtons needing to be re-created (and the buttons torn
  // down) on every +/- click.
  const [quantities, setQuantities] = useState({
    bit: 0,
    byte: 0,
    kilo: 0,
    mega: 0,
    giga: 0,
  });
  const quantitiesRef = useRef(quantities);

  const setQuantityFor = (key, updater) => {
    setQuantities((prev) => {
      const next = { ...prev, [key]: updater(prev[key]) };
      quantitiesRef.current = next;
      return next;
    });
  };

  const totalQuantity = useMemo(
    () => CART_KEYS.reduce((sum, k) => sum + quantities[k], 0),
    [quantities],
  );

  const grandTotal = useMemo(
    // Skip contact-only tiers (.Epic has no price / no cart quantity) so the
    // total is a real number (0 when the cart is empty) rather than NaN.
    () => tiers.reduce((sum, t) => (t.contactOnly ? sum : sum + quantities[t.key] * t.price), 0),
    [quantities],
  );

  const stockFor = (key) => (walletStock ? walletStock[key] ?? 0 : null);

  const incrementQty = (key) => {
    if (totalQuantity >= MAX_CART_TOTAL) return;
    const stock = stockFor(key);
    if (stock !== null && quantities[key] >= stock) return;
    setQuantityFor(key, (q) => q + 1);
  };

  const decrementQty = (key) => {
    setQuantityFor(key, (q) => Math.max(0, q - 1));
  };

  // Reads the ref (not React state) so it always reflects the cart at the
  // moment PayPal invokes createOrder/onApprove, however long the buttons
  // have been sitting on screen without a re-render.
  const getCartItems = () =>
    CART_KEYS.filter((k) => quantitiesRef.current[k] > 0).map((k) => ({
      class: k,
      quantity: quantitiesRef.current[k],
    }));

  const getGrandTotalFromRef = () =>
    tiers.reduce((sum, t) => (t.contactOnly ? sum : sum + quantitiesRef.current[t.key] * t.price), 0);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.frameHeight) {
        setIframeHeight(event.data.frameHeight);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleGroupChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
    setCustomGroup(value);
  };

  // Influencer sign-ups are closed for Phase II (see the "Coming Soon"
  // placeholder below, which never mounts a PayPal button container) — this
  // callback only ever needs to render the regular mixed-cart checkout.
  const renderPayPalButtons = useCallback(() => {
    const attemptRender = (container) => {
      if (!window.paypal || !container) return false;
      container.innerHTML = "";
      window.paypal
        .Buttons({
          createOrder: (data, actions) =>
            actions.order.create({
              purchase_units: [
                {
                  amount: { value: getGrandTotalFromRef().toString() },
                  description: `QMail Registration: ${getCartItems()
                    .map((i) => `${i.quantity}x .${i.class}`)
                    .join(", ")}`,
                },
              ],
            }),
          onApprove: async (data, actions) => {
            let order;
            try {
              order = await actions.order.capture();
            } catch (err) {
              setPaypalError(
                "We could not complete payment capture. Please try again or contact support.",
              );
              return;
            }

            const firstName = order.payer.name.given_name;
            const lastName = order.payer.name.surname;
            const buyerEmail = order.payer.email_address || "";
            const items = getCartItems();

            try {
              const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/fulfill-order`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firstName,
                    lastName,
                    buyerEmail,
                    items,
                    paypalOrderID: data.orderID,
                  }),
                },
              );
              const result = await response.json();
              if (!result.success) {
                // Payment already captured above — make that unmistakably clear.
                setPaypalError(
                  `Your payment was received (PayPal order ${data.orderID}), but we ran into a problem generating your address. Please contact support and we will make this right.${
                    result.error ? ` Details: ${result.error}` : ""
                  }`,
                );
                return;
              }
              navigate("/success", {
                state: {
                  addresses: result.addresses,
                  firstName,
                  lastName,
                  partialError: result.partial ? result.error : undefined,
                },
              });
            } catch (err) {
              setPaypalError(
                `Your payment was received (PayPal order ${data.orderID}), but we could not confirm your order due to a network error. Please contact support — do not pay again.`,
              );
            }
          },
        })
        .render(container);
      return true;
    };

    // If the container ref isn't attached yet (still mounting), retry after a
    // short delay — matches the file's original render-retry pattern.
    if (!attemptRender(buttonRef.current)) {
      setTimeout(() => attemptRender(buttonRef.current), 500);
    }
  // createOrder/onApprove read quantitiesRef.current (via getCartItems /
  // getGrandTotalFromRef) at call time, so changing cart quantities never
  // needs to re-create this callback or tear down the rendered buttons.
  }, [navigate]);

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

  // Only the 0 <-> 1+ boundary matters for (re)mounting the button container —
  // using this boolean (rather than the raw totalQuantity) keeps clicking the
  // +/- steppers from tearing the rendered PayPal buttons down and back up.
  const hasCartItems = totalQuantity >= 1;

  useEffect(() => {
    // Influencer sign-ups are closed (Phase II) — never render PayPal there
    if (isPaypalLoaded && hasCartItems && !isInfluencerMode && !paymentComplete && !paypalError) {
      // 300ms delay gives AnimatePresence time to mount the correct container
      // before PayPal tries to render into it
      setTimeout(renderPayPalButtons, 300);
    }
  }, [
    isPaypalLoaded,
    hasCartItems,
    renderPayPalButtons,
    paymentComplete,
    paypalError,
    isInfluencerMode,
  ]);

  return (
    <>
      <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto">
          {/* --- HERO SECTION --- */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Claim Your Unique <br />
              <span className="qmail-gradient-text">
                Decentralized Qmail Address
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-sm md:text-base text-gray-300 leading-relaxed">
              Your mailbox key determines what your QMail software can do. Choose the address that matches how much power you want.
            </p>
            <p className="mt-3 text-xs md:text-sm font-bold uppercase tracking-[0.28em] text-cyan-300/90">
              Windows, Mac, and Linux desktop apps are available now.
            </p>

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
                /* REGULAR MODE — Full mailbox-key selection flow */
                /* ============================================ */
                  <motion.div
                    key="regular-flow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-16 bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-800"
                  >
                    {/* --- SELECTION FORM --- */}
                    <div className="space-y-12">

                      {/* STEP 1: TIER */}
                      <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">
                            1
                          </span>
                          Choose Your Mailbox Key & Status Indicator:
                        </h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          QMail uses a one-time registration fee to activate your address. Higher keys signal more trust and unlock more capability. Address registration is refundable within 30 days — see Terms.
                        </p>

                        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent p-5 md:p-6">
                          <div className="flex flex-wrap items-start gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center shrink-0">
                              <Sparkles className="text-cyan-300" size={20} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base md:text-lg font-black text-white">
                                  STAKING LEVELS
                                </h3>
                                <InfoPopover label="How QMail staking scales">
                                  The program functions differently based on the mailbox key that is purchased. .bit, .byte, .kilo, .mega, and .giga each unlock a different experience.
                                </InfoPopover>
                              </div>
                              <p className="text-sm text-cyan-100/90 leading-relaxed max-w-3xl">
                                Buy a better qmail address and your software will do more.
                              </p>
                              <p className="text-xs text-cyan-200/80 leading-relaxed">
                                These features are in development now but are expected very soon, so people should get these qmails now to take advantage of them in the near future.
                              </p>
                            </div>
                          </div>
                        </div>

                        <AllLevels className="pt-2" />

                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
                          <table className="w-full table-fixed text-left text-[10px] md:text-[11px]">
                            <colgroup>
                              <col className="w-[10%]" />
                              <col className="w-[17%]" />
                              <col className="w-[10%]" />
                              <col className="w-[28%]" />
                              <col className="w-[35%]" />
                            </colgroup>
                            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 uppercase tracking-widest font-bold">
                                <tr>
                                  <th className="px-3 py-4 md:px-4 border-b border-gray-700/30 text-center">
                                    <div className="flex items-center justify-center gap-2">Quantity</div>
                                  </th>
                                  <th className="px-3 py-4 md:px-4 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">Mailbox Key</div>
                                  </th>
                                  <th className="px-3 py-4 md:px-4 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">Price</div>
                                  </th>
                                  <th className="px-3 py-4 md:px-4 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">
                                      Status & Best For
                                      <InfoPopover label="Status and trust">
                                        Higher stakes act as a stronger trust signal. That helps the system distinguish casual use from serious, high-trust registrations.
                                      </InfoPopover>
                                    </div>
                                  </th>
                                  <th className="px-3 py-4 md:px-4 border-b border-gray-700/30">
                                    <div className="flex items-center gap-2">
                                      Stake Features
                                      <InfoPopover label="Stake software unlocks">
                                        The better the qmail address, the more the software will do.
                                      </InfoPopover>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800/70">
                                {tiers.map((t, index) => {
                                  const soldOut = walletStock
                                    ? (walletStock[t.key] ?? 0) === 0
                                    : false;
                                  const qty = quantities[t.key];
                                  const stock = stockFor(t.key);
                                  const atStockLimit = stock !== null && qty >= stock;
                                  const atCartLimit = totalQuantity >= MAX_CART_TOTAL;
                                  // Per-animal height: squirrel (.bit) smallest, dragon
                                  // (.epic) largest, the rest a shared middle height.
                                  const iconHeight =
                                    t.key === "bit" ? "h-6" : t.key === "epic" ? "h-16" : "h-8";
                                  const statusSummary = `${t.trust}, ${t.best}`;
                                  return (
                                  <tr
                                    key={t.key}
                                    className={`hover:bg-gray-800/30 transition-all duration-300 ${
                                      qty > 0
                                        ? "bg-blue-600/10 border-l-4 border-blue-500"
                                        : ""
                                    } ${index % 2 === 0 ? "bg-gray-900/20" : "bg-black/20"}`}
                                  >
                                    <td className="px-3 py-4 md:px-4 text-center align-top">
                                      {t.contactOnly ? (
                                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 rounded-full px-3 py-1.5">
                                          Contact&nbsp;Us
                                        </span>
                                      ) : (
                                      <div className={`flex flex-col items-center gap-2 ${soldOut ? "opacity-50" : ""}`}>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => decrementQty(t.key)}
                                            disabled={soldOut || qty === 0}
                                            aria-label={`Decrease ${t.name} quantity`}
                                            className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 flex items-center justify-center hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                          >
                                            <Minus size={14} />
                                          </button>
                                          <span className="w-6 text-center font-mono font-black text-white text-base">
                                            {qty}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => incrementQty(t.key)}
                                            disabled={soldOut || atStockLimit || atCartLimit}
                                            aria-label={`Increase ${t.name} quantity`}
                                            className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-400 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                          >
                                            <Plus size={14} />
                                          </button>
                                        </div>
                                        <div className="text-center font-bold uppercase tracking-widest text-[9px] text-gray-500">
                                          {soldOut ? "Sold Out" : qty > 0 ? "In Cart" : ""}
                                        </div>
                                      </div>
                                      )}
                                    </td>
                                    <td className={`px-3 py-4 md:px-4 font-black text-lg align-top ${t.color}`}>
                                      <div className="flex items-center gap-2 md:gap-3">
                                        {/* Fixed-width, right-aligned box: icons grow
                                            leftward from a common edge so the class
                                            names all line up regardless of icon width. */}
                                        <span className="flex justify-end items-center w-16 md:w-20 shrink-0">
                                          <img
                                            src={t.icon}
                                            alt=""
                                            aria-hidden="true"
                                            className={`${iconHeight} w-auto`}
                                          />
                                        </span>
                                        {t.name}
                                      </div>
                                    </td>
                                    <td className="px-3 py-4 md:px-4 font-mono text-white font-bold text-lg align-top">
                                      {t.contactOnly ? (
                                        <div className="flex items-center gap-2 flex-wrap leading-tight">
                                          <span className="text-green-400 text-sm whitespace-nowrap">
                                            Free
                                          </span>
                                          <InfoPopover label="Free for verified influencers">
                                            For verified influencers.
                                          </InfoPopover>
                                        </div>
                                      ) : (
                                        <span className="bg-gray-800 px-3 py-1 rounded-full">
                                          ${t.price}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-4 md:px-4 text-gray-300 font-medium align-top">
                                      {statusSummary}
                                    </td>
                                    <td className="px-3 py-4 md:px-4 text-gray-300 font-medium align-top">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200">
                                            {t.proUnlock}
                                          </span>
                                          {t.proDetails && (
                                            <InfoPopover label={`${t.name} stake details`}>
                                              {t.proDetails}
                                            </InfoPopover>
                                          )}
                                        </div>
                                        {t.key === "kilo" && (
                                          <ul className="space-y-1 text-gray-300 text-[11px] leading-relaxed">
                                            <li>• Wallet can store an infinite number of coins.</li>
                                            <li>• Wallet can be encrypted.</li>
                                          </ul>
                                        )}
                                        {t.key === "mega" && (
                                          <ul className="space-y-1 text-gray-300 text-[11px] leading-relaxed">
                                            <li>• Host your own QMail server and earn CloudCoins.</li>
                                          </ul>
                                        )}
                                        {t.key === "giga" && (
                                          <ul className="space-y-1 text-gray-300 text-[11px] leading-relaxed">
                                            <li>• Can be registered as an influencer.</li>
                                            <li>• Can create a custom symbol.</li>
                                            <li>• Identity can be verified as true.</li>
                                          </ul>
                                        )}
                                      </div>
                                    </td>
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
                          {/* Order summary — one line per class in the cart */}
                          <div className="space-y-3">
                            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                              Order Summary
                            </h3>
                            {totalQuantity === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-2">
                                Use the +/- controls above to add addresses to your cart.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {tiers
                                  .filter((t) => quantities[t.key] > 0)
                                  .map((t) => (
                                    <div
                                      key={t.key}
                                      className="flex justify-between items-center text-sm text-gray-300"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className="flex justify-end items-center w-12 shrink-0">
                                          <img
                                            src={t.icon}
                                            alt=""
                                            aria-hidden="true"
                                            className={`${t.key === "bit" ? "h-4" : "h-5"} w-auto`}
                                          />
                                        </span>
                                        {quantities[t.key]} × {t.name} (${t.price} ea)
                                      </span>
                                      <span className="font-mono font-bold text-white">
                                        ${quantities[t.key] * t.price}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                            <div className="flex justify-between items-center font-black text-2xl text-white pt-3 border-t border-gray-800">
                              <span>Total:</span>
                              <span>${grandTotal}</span>
                            </div>
                          </div>

                          <div className="min-h-[150px] flex items-center justify-center">
                            <div className="w-full space-y-4">
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
                              ) : (
                                <>
                                  {totalQuantity < 2 && (
                                    <div className="text-center py-4 px-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-sm font-semibold text-gray-300 leading-relaxed">
                                      Your recipients need QMail addresses too. Add at least two addresses if you plan to message them directly.
                                    </div>
                                  )}
                                  {paypalError ? (
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
                                </>
                              )}
                            </div>
                          </div>

                          {!paymentsDisabled && (
                          <div className="space-y-3 pt-2 border-t border-gray-800">
                            <p className="text-left text-xs text-gray-400 leading-relaxed">
                              30-day money-back on address registration (see Terms).
                            </p>
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
                          Phase I (Completed)
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Your address is automatically published in the DRD. The First/Second words come directly from your card name.
                        </p>
                      </div>
                      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 opacity-60">
                        <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-sm">
                          Phase II (80% Deployed)
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
