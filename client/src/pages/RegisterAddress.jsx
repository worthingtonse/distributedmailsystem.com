import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const RegisterAddress = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState("free");
  const [customGroup, setCustomGroup] = useState("");
  const [inboxFee, setInboxFee] = useState("0");
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [iframeHeight, setIframeHeight] = useState(800);

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
      // Only accept messages that have our frameHeight data
      if (event.data && event.data.frameHeight) {
        setIframeHeight(event.data.frameHeight);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const totalPrice = useMemo(() => {
    const base = selectedTier ? selectedTier.price : 0;
    const extra = selectedEdition === "pro" ? 10 : 0;
    return base + extra;
  }, [selectedTier, selectedEdition]);

  const generateSN = () =>
    Math.floor(Math.random() * 65535)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

  const handleGroupChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
    setCustomGroup(value);
  };

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current && selectedTier) {
      buttonRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: { value: totalPrice.toString() },
                  description: `DMS Registration: .${selectedTier.name} + ${selectedEdition} edition`,
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();

            // Call backend to generate mailbox
            const response = await fetch(
              `${import.meta.env.VITE_BASE_URL}/api/generate-mailbox`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firstName: order.payer.name.given_name,
                  lastName: order.payer.name.surname,
                  amountPaid: totalPrice,
                  inboxFee: parseFloat(inboxFee),
                  description: customGroup || "",
                }),
              },
            );

            const result = await response.json();

            if (!result.success) {
              setPaypalError(
                result.error || "Registration failed. Please try again.",
              );
              return;
            }

            // Pass email and locker code to the success page
            navigate("/success", {
              state: {
                email: result.email,
                lockerCode: result.lockerCode,
                userData: { firstName: order.payer.name.given_name },
              },
            });
          },
          onError: (err) => {
            console.error("PayPal Checkout Error:", err);
            setPaypalError(
              "The payment gateway encountered an error. Please try again.",
            );
          },
          style: {
            layout: "vertical",
            color: "blue",
            shape: "pill",
            label: "pay",
          },
        })
        .render(buttonRef.current);
    }
  }, [selectedTier, customGroup, totalPrice, selectedEdition, inboxFee]);

  useEffect(() => {
    const scriptId = "paypal-sdk-script";
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setPaypalError(
        "PayPal Configuration Missing: Please set VITE_PAYPAL_CLIENT_ID.",
      );
      return;
    }

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
  }, []);

  useEffect(() => {
    if (isPaypalLoaded && selectedTier && !paymentComplete && !paypalError) {
      setTimeout(renderPayPalButtons, 100);
    }
  }, [
    isPaypalLoaded,
    selectedTier,
    renderPayPalButtons,
    paymentComplete,
    selectedEdition,
    paypalError,
    inboxFee,
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

            <div className="flex justify-center gap-6 mb-8">
              <a
                href="https://t.me/+9YVOgaobizw5NjEx"
                target="_blank"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 transition-all"
              >
                <Smartphone size={18} /> Join Telegram
              </a>
              <button
                onClick={() => navigate("/faq")}
                className="flex items-center gap-2 text-gray-400 hover:text-white font-bold bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700 transition-all"
              >
                <Shield size={18} /> Support Center
              </button>
            </div>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Break free from Big Tech providers like Gmail or Outlook scanning
              your inbox and owning your data.
            </p>
          </header>

          {!paymentComplete ? (
            <div className="space-y-16">
              {/* --- ADDRESS FORMAT & SPAM PROTECTION --- */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 h-full">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Parts of Phase I Addresses
                  </h3>
                  <div className="space-y-4 text-sm leading-relaxed mb-6">
                    <p>
                      <b className="text-yellow-400">Semi Verified Name:</b>{" "}
                      Pulled from your payment card name for verification.
                    </p>
                    <p>
                      <b className="text-purple-400">Self-Describer:</b> You in
                      a word.
                    </p>
                    <p>
                      <b className="text-cyan-400">Mailbox ID:</b> Your mailbox
                      ID.
                    </p>
                    <p>
                      <b className="text-blue-400">Stake Level:</b> The amount
                      of money users staked for their address
                      (bit,byte,kilo,mega,giga)
                    </p>
                  </div>

                  {/* Real-World Examples embedded here */}
                  <div className="mt-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Info className="text-blue-400" size={18} /> Real-World
                      Examples
                    </h4>
                    <div className="grid grid-cols-1 gap-3 font-mono">
                      {[
                        "John.Doe@CEO-VivaTech#8D2P.Giga",
                        "Laura.Croft@Go-49ers!#UYV4.Bit",
                        "Ron.Wagner@Developer#CA93.Mega",
                        "Wo.Chang@的我大个#89RE.Kilo",
                      ].map((ex, i) => (
                        <div
                          key={i}
                          className="bg-black p-3 rounded-lg border border-gray-800 text-gray-300 text-xs"
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 h-full">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-yellow-500" /> Economic
                    Anti-Spam
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    DMS requires a <b>refundable stake</b> to activate your
                    address. This incentive makes high-volume abuse impractical
                    while proving you are serious.
                  </p>
                  <div className="mt-6 p-4 bg-black rounded-xl border border-yellow-500/20 text-xs text-yellow-200 mb-6">
                    "Higher stakes = higher trust. Legitimate professionals
                    won't risk their reputation on spam".
                  </div>
                  <div className="mt-4 p-4 bg-black rounded-xl border border-blue-500/20">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">
                      Inbox Fee
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      People must pay you if they want to send you an email. You
                      can set your own inbox fee. You can increase or decrease
                      it later.
                    </p>
                  </div>
                </div>
              </div>

              {/* --- SELECTION FORM --- */}
              <div className="bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-800 space-y-12">
                {/* STEP 1: TIER */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">
                      1
                    </span>
                    Stake Levels & Status:
                  </h2>

                  {/* Stake Levels Table with clickable cards */}
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 uppercase text-[11px] tracking-widest font-bold">
                          <tr>
                            <th className="p-6 border-b border-gray-700/30 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* <ArrowRight size={14} className="text-blue-400" /> */}
                                Select
                              </div>
                            </th>
                            <th className="p-6 border-b border-gray-700/30">
                              <div className="flex items-center gap-2">
                                {/* <Star size={14} className="text-blue-400" /> */}
                                Level
                              </div>
                            </th>
                            <th className="p-6 border-b border-gray-700/30">
                              <div className="flex items-center gap-2">
                                {/* <Shield size={14} className="text-green-400" /> */}
                                Stake
                              </div>
                            </th>
                            <th className="p-6 border-b border-gray-700/30">
                              <div className="flex items-center gap-2">
                                {/* <ShieldCheck size={14} className="text-yellow-400" /> */}
                                Status & Trust Signal
                              </div>
                            </th>
                            <th className="p-6 border-b border-gray-700/30">
                              <div className="flex items-center gap-2">
                                {/* <User size={14} className="text-purple-400" /> */}
                                Best For
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {tiers.map((t, index) => (
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
                                  onClick={() => setSelectedTier(t)}
                                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 min-w-[90px] relative group ${
                                    selectedTier?.name === t.name
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
                                    {selectedTier?.name === t.name
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
                              <td
                                className={`p-6 font-black text-lg ${t.color}`}
                              >
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
                              <td className="p-6 text-gray-300 font-medium">
                                {t.trust}
                              </td>
                              <td className="p-6 text-gray-400 italic text-sm leading-relaxed">
                                {t.best}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* STEP 2 & 3: SELF DESCRIBER AND INBOX FEE IN SAME ROW */}
                <div className="pt-10 border-t border-gray-800">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* STEP 2: SELF DESCRIBER */}
                    <div className="space-y-4">
                      <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">
                          2
                        </span>
                        Self Describer
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl text-gray-700 font-mono">
                          @
                        </span>
                        <input
                          type="text"
                          value={customGroup}
                          onChange={handleGroupChange}
                          placeholder="e.g. CEO-VivaTech"
                          className="w-full bg-gray-900/60 border border-blue-500/30 rounded-2xl px-6 py-4 text-white placeholder-gray-500 outline-none focus:border-blue-500/60 focus:bg-gray-900/80 transition-all text-xl font-mono"
                        />
                      </div>
                    </div>

                    {/* STEP 3: INBOX FEE */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">
                            3
                          </span>
                          Inbox Fee
                        </h2>
                        <div className="group relative">
                          <Info
                            className="text-gray-400 hover:text-blue-400 transition-colors cursor-help"
                            size={16}
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                            Applies to everyone until white lists are enabled in
                            Phase 2
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                      <select
                        value={inboxFee}
                        onChange={(e) => setInboxFee(e.target.value)}
                        className="w-full bg-gray-900/60 border border-blue-500/30 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500/60 focus:bg-gray-900/80 transition-all text-xl font-mono cursor-pointer"
                      >
                        <option value="0">$0 (default)</option>
                        <option value="0.01">$0.01</option>
                        <option value="0.10">$0.10</option>
                        <option value="1">$1</option>
                        <option value="10">$10</option>
                        <option value="20">$20</option>
                        <option value="30">$30</option>
                        <option value="40">$40</option>
                        <option value="50">$50</option>
                        <option value="60">$60</option>
                        <option value="70">$70</option>
                        <option value="80">$80</option>
                        <option value="90">$90</option>
                        <option value="100">$100</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CHECKOUT */}
                <div className="pt-10 border-t border-gray-800">
                  <div className="max-w-md mx-auto space-y-8 bg-black p-8 rounded-3xl border border-gray-800 shadow-2xl">
                    <div className="flex justify-between items-center font-black text-2xl text-white">
                      <span>Stake Your Address:</span>
                      <span>${totalPrice}</span>
                    </div>

                    {/* PayPal Button Container with Error Handling */}
                    <div className="min-h-[150px] flex items-center justify-center">
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
                    </div>

                    <p className="text-[10px] text-gray-500 text-center leading-relaxed italic">
                      * Note that refunds are available up to 30 days after your
                      purchase.
                    </p>
                  </div>
                </div>
              </div>

              {/* --- PHASE STATUS INFO --- Moved to end */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-6 rounded-2xl border border-blue-500/20">
                  <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-sm">
                    Phase I (Current)
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your address is automatically published in the DRD. The
                    First/Second words come directly from your card name.
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 opacity-60">
                  <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-sm">
                    Phase II (Coming Soon)
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Edit your profile, add details, and customize your inbox
                    presence.
                  </p>
                </div>
              </div>
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
                Your address is now active in the Distributed Resource Directory
                (DRD).
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
      <div className=" border-gray-800 pt-10">
        {/* <h3 className="text-xl font-bold text-white mb-6 px-4">Community Discussion</h3> */}
        <div className="rounded-[2.5rem] overflow-hidden bg-black/40 shadow-2xl pb-20">
          <iframe
            src="https://perfectmonetarypolicy.com/feedback_system/widget_embed.php"
            width="100%"
            height={`${iframeHeight}px`}
            frameBorder="0"
            scrolling="no" // No more internal scrollbars
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
