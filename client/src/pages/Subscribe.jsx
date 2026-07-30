import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  Crown,
  Check,
  ShieldCheck,
  Plus,
  X,
  Mail,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { usePaypalConfig } from "../hooks/usePaypalConfig";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

// A QMail address is 1–3 dot-separated bytes (0–255 each), an '@', then the
// class word. 'epic' is a valid class too (e.g. support/VIP tiers) even though
// it isn't sold through the store, so it must pass validation here.
const QMAIL_ADDRESS_REGEX = /^\d{1,3}(\.\d{1,3}){0,2}@(bit|byte|kilo|mega|giga|epic)$/i;
function isValidQmailAddress(value) {
  const trimmed = String(value).trim();
  if (!QMAIL_ADDRESS_REGEX.test(trimmed)) return false;
  // Regex allows up to 3 digits per octet; enforce the real 0–255 byte range.
  return trimmed.split("@")[0].split(".").every((o) => Number(o) <= 255);
}

let addressIdSeq = 0;
function nextAddressId() {
  addressIdSeq += 1;
  return `addr-${addressIdSeq}-${Math.random().toString(36).slice(2, 7)}`;
}

// Split totalCoins evenly across `count` addresses, remainder to the first one.
function splitCoins(totalCoins, count) {
  if (!count || count <= 0) return [];
  const base = Math.floor(totalCoins / count);
  const remainder = totalCoins - base * count;
  return Array.from({ length: count }, (_, i) => base + (i === 0 ? remainder : 0));
}

const Subscribe = () => {
  useDocumentMeta({
    title: "QMail Credits Subscription",
    description:
      "Subscribe for monthly QMail tip credits to pay server capacity and inbox fees. Manage billing in PayPal.",
    path: "/subscribe",
  });

  const location = useLocation();
  const { config: paypalConfig, loading: paypalConfigLoading, error: paypalConfigError } = usePaypalConfig();
  // payments-enabled=false (server switch) closes subscription sales too, same as /register.
  const paymentsDisabled = !paypalConfig?.paymentsEnabled;
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSuccess, setRecordSuccess] = useState(null); // null | true | false
  const [recordError, setRecordError] = useState(null);
  const buttonRef = useRef(null);

  // Addresses to top up — prefilled from the success page (state or ?addresses=),
  // or empty so the subscriber can type them in manually.
  const [rows, setRows] = useState(() => {
    const stateAddresses = location.state?.addresses;
    if (Array.isArray(stateAddresses) && stateAddresses.length > 0) {
      return stateAddresses
        .filter(Boolean)
        .map((a) => ({ id: nextAddressId(), value: String(a).trim(), readOnly: true }));
    }
    const params = new URLSearchParams(location.search);
    const q = params.get("addresses");
    if (q) {
      const parsed = q.split(",").map((s) => s.trim()).filter(Boolean);
      if (parsed.length > 0) {
        return parsed.map((a) => ({ id: nextAddressId(), value: a, readOnly: true }));
      }
    }
    return [];
  });

  // Consent to receive service qmails from the subscription address (20.100@giga).
  // Defaults on, since subscribing implies wanting those messages.
  const [allowSubscriptionQmails, setAllowSubscriptionQmails] = useState(true);

  const addressesRef = useRef([]);
  const allowQmailsRef = useRef(true);

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextAddressId(), value: "", readOnly: false }]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  const hasReadOnlyRows = rows.some((r) => r.readOnly);
  const editableRows = rows.filter((r) => !r.readOnly);
  // Validate EVERY row, including prefilled/readOnly ones — a bad value in the
  // ?addresses= query string must block checkout client-side, not get through
  // to an active-but-unrecorded subscription rejected only server-side.
  const rowsValid = rows.length > 0 && rows.every((r) => isValidQmailAddress(r.value));
  // Email is no longer collected here — PayPal provides the buyer's email at
  // purchase, so checkout only needs a plan and at least one valid address.
  const canCheckout = Boolean(selectedPlan) && rowsValid;

  // Mirror the current, validated values into refs so the PayPal button callbacks
  // (which are only re-created when the plan or checkout-gate changes) can always
  // read the latest addresses/email without tearing down the rendered buttons on
  // every keystroke.
  useEffect(() => {
    addressesRef.current = rows.map((r) => r.value.trim()).filter(Boolean);
  }, [rows]);

  useEffect(() => {
    allowQmailsRef.current = allowSubscriptionQmails;
  }, [allowSubscriptionQmails]);

  const totalCoins = selectedPlan ? Number(selectedPlan.price) * 10 : 0;
  const coinSplit = splitCoins(totalCoins, rows.length);

  const plans = [
    {
      id: paypalConfig?.planIdCasual || '',
      key: "casual",
      name: "Casual User",
      price: "5",
      capacity: "50 MB/Month",
      bestFor: "Pure text communication and occasional photos.",
      description: "Monthly tip credits for the Distributed Mail System — about 50 MB-Months of capacity for lean, private messaging.",
      icon: Zap,
      bullets: [
        { title: "How it works", text: "Coins are delivered to your mailbox monthly and land in your wallet automatically — split across every address you list below." },
        { title: "Rollover", text: "Unused tip capacity is intended to roll over month to month while your subscription remains active." }
      ]
    },
    {
      id: paypalConfig?.planIdTypical || '',
      key: "typical",
      name: "Typical User",
      price: "10",
      capacity: "300 MB/Month",
      bestFor: "Everyday personal use, family photos, and document sharing.",
      description: "A balanced monthly plan with about 300 MB-Months of capacity for text, photos, and light file sharing.",
      icon: Star,
      bullets: [
        { title: "Everyday capacity", text: "Room for documents and media beyond pure text." },
        { title: "Network tips", text: "Tips help pay the operators who store and forward your mail." },
        { title: "Manage anytime", text: "Cancel or change plans from your PayPal subscription settings." }
      ]
    },
    {
      id: paypalConfig?.planIdPower || '',
      key: "power",
      name: "Power User",
      price: "20",
      capacity: "1,000 MB/Month",
      bestFor: "Professionals, small businesses, and marketers.",
      description: "Higher monthly throughput — about 1 GB-Month of capacity for heavier sending needs.",
      icon: Crown,
      bullets: [
        { title: "Heavy lifting", text: "Better fit when you send larger files more often." },
        { title: "Billing clarity", text: "Recurring charge handled by PayPal; keep your receipt for support." }
      ]
    },
  ];

  const recordSubscription = useCallback(async ({ subscriptionID, planKey, addresses, allowSubscriptionQmails: allow }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/record-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionID, planKey, addresses, allowSubscriptionQmails: allow }),
    });
    return res.json();
  }, []);

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current && selectedPlan && canCheckout) {
      buttonRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          style: {
            shape: "pill",
            color: "blue",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: (data, actions) => {
            return actions.subscription.create({
              plan_id: selectedPlan.id,
            });
          },
          onApprove: async (data) => {
            const subId = data.subscriptionID || null;
            setSubscriptionId(subId);
            setSubscribed(true);
            setIsRecording(true);
            setRecordSuccess(null);
            setRecordError(null);
            try {
              const json = await recordSubscription({
                subscriptionID: subId,
                planKey: selectedPlan.key,
                addresses: addressesRef.current,
                allowSubscriptionQmails: allowQmailsRef.current,
              });
              if (json && json.success) {
                setRecordSuccess(true);
              } else {
                setRecordSuccess(false);
                setRecordError((json && json.error) || "Unknown error recording your subscription.");
              }
            } catch (err) {
              setRecordSuccess(false);
              setRecordError(err?.message || "Network error recording your subscription.");
            } finally {
              setIsRecording(false);
            }
          },
          onError: (err) => {
            console.error("PayPal Error:", err);
          }
        })
        .render(buttonRef.current);
    }
  }, [selectedPlan, canCheckout, recordSubscription]);

  useEffect(() => {
    if (paypalConfigLoading) return;
    if (paypalConfigError || !paypalConfig?.clientId) return;

    const scriptId = "paypal-sub-script";
    const clientId = paypalConfig.clientId;

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => {
        setIsPaypalLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setIsPaypalLoaded(true);
    }
  }, [paypalConfigLoading, paypalConfigError, paypalConfig]);

  useEffect(() => {
    if (isPaypalLoaded && canCheckout && !subscribed) {
      setTimeout(renderPayPalButtons, 100);
    }
  }, [isPaypalLoaded, canCheckout, renderPayPalButtons, subscribed]);

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Subscribe to QMail Servers
          </h1>
          {/* Lead paragraph spans full width, centered under the heading. */}
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            QMail servers are run by independent administrators — often from their own home,
            on their own electricity and internet connection. They deserve to be paid for
            keeping the network running, and your subscription pays them for you. Want to run
            a server yourself? You&apos;ll be able to sign up as an administrator in Phase 3.
          </p>
        </div>

        {paymentsDisabled ? (
          /* Kill-switch: payments-enabled=false closes subscriptions too */
          <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-[32px] p-10 text-center">
            <div className="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-3">
              Coming Soon
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Subscriptions are temporarily unavailable while we finish setting up.
              Check back shortly!
            </p>
          </div>
        ) : !subscribed ? (
          <>
            {/* Remaining intro copy on the left, sign-up form on the right — kept
                side by side so the details and the form share one screen instead
                of stacking into a long page with a false bottom. */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 items-start">
              {/* Left: what a QMail-server subscription actually pays for */}
              <div className="space-y-5">
                <p className="text-base text-gray-400 leading-relaxed">
                  During Phase 1 you can use up to 25 servers as they come online. For now we
                  can guarantee nine servers to stripe your data across, so your mail stays
                  redundant and available.
                </p>
                <p className="text-sm text-yellow-300/90 leading-relaxed">
                  Each month we send the administrators enough coins to cover the storage you
                  subscribed for. Anything you don&apos;t use rolls over to the following
                  month for as long as your subscription stays active.
                </p>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-bold text-blue-300">Subscribing more than one
                    mailbox?</span> Your monthly coins are divided evenly across every QMail
                    address you list, so each mailbox receives an equal share of storage (any
                    remainder goes to the first address). Pick a plan and you&apos;ll see each
                    address&apos;s monthly share update in the form.
                  </p>
                </div>
              </div>

              {/* Right: Step 1 — the sign-up form */}
              <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">1</span>
                <h2 className="text-lg font-bold text-white">Your QMail Addresses</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                {hasReadOnlyRows ? (
                  "Carried over from your recent purchase. Remove any you don't want on this subscription, or add more below."
                ) : (
                  <>
                    Every address you list shares your monthly storage, split evenly (any
                    remainder goes to the first address).{" "}
                    Need a mailbox first?{" "}
                    <Link to="/register" className="underline text-blue-400 hover:text-blue-300">
                      Claim an address
                    </Link>
                    .
                  </>
                )}
              </p>

              {rows.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gray-700 mb-6">
                  <Mail className="mx-auto mb-3 text-gray-600" size={32} />
                  <p className="text-gray-300 font-medium mb-1">No QMail addresses added yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Enter the QMail address (or addresses) you'd like this subscription to cover.
                  </p>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                  >
                    <Plus size={16} /> Add QMail Address
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Don&apos;t have a QMail address yet?{" "}
                    <Link to="/register" className="underline text-blue-400 hover:text-blue-300">Buy one first</Link>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {rows.map((row, idx) => {
                    const trimmed = row.value.trim();
                    const showError = trimmed.length > 0 && !isValidQmailAddress(trimmed);
                    return (
                      <div key={row.id}>
                        <div className="flex items-center gap-3">
                          {row.readOnly && !showError ? (
                            <div className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-gray-800 text-gray-200 font-mono text-sm truncate">
                              {row.value}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={row.value}
                              onChange={(e) => updateRow(row.id, e.target.value)}
                              placeholder="e.g. 20.123@giga"
                              className={`flex-1 px-4 py-3 rounded-xl bg-black/30 border text-gray-100 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 ${
                                showError
                                  ? "border-red-500/60 focus:ring-red-500/60"
                                  : "border-gray-700 focus:ring-blue-500/60 focus:border-blue-500/60"
                              }`}
                            />
                          )}
                          <span className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/20">
                            {selectedPlan ? `${coinSplit[idx] ?? 0} CC/mo` : "— CC/mo"}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            aria-label="Remove address"
                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        {showError && (
                          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5 pl-1">
                            <AlertCircle size={12} /> Doesn&apos;t look like a QMail address (e.g. 20.123@giga).
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                  >
                    <Plus size={16} /> Add another address
                  </button>
                </div>
              )}

              {/* Consent to receive service qmails from the subscription address */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowSubscriptionQmails}
                    onChange={(e) => setAllowSubscriptionQmails(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-600 bg-black/30 accent-blue-600 focus:ring-2 focus:ring-blue-500/60"
                  />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Allow qmails from subscription services{" "}
                    <span className="font-mono text-blue-300">(20.100@giga)</span>
                  </span>
                </label>
              </div>
            </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedPlan(plan)}
                  // FIXED: Removed /50 transparency. Now solid bg-gray-900.
                  className={`cursor-pointer relative flex flex-col p-8 rounded-[32px] border-2 transition-all duration-300 shadow-xl ${
                    selectedPlan?.name === plan.name
                      ? "bg-gray-900 border-blue-500 shadow-blue-900/40 ring-1 ring-blue-500/50"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Selected Indicator */}
                  {selectedPlan?.name === plan.name && (
                    <div className="absolute top-6 right-6">
                      <div className="bg-blue-500 rounded-full p-1 shadow-lg shadow-blue-500/50">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    selectedPlan?.name === plan.name ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    <plan.icon size={28} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-black text-white">${plan.price}</span>
                  </div>

                  {/* Capacity Badge */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wide border border-blue-500/20">
                      {plan.capacity}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-lg bg-green-500/10 text-green-300 text-xs font-bold uppercase tracking-wide border border-green-500/20">
                      {Number(plan.price) * 10} CC/Month
                    </span>
                  </div>

                  {/* Best For Section */}
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <p className="text-sm font-bold text-gray-300 mb-1">Best For:</p>
                    <p className="text-sm text-gray-400 italic">{plan.bestFor}</p>
                  </div>

                  {/* Description */}
                  <div className="mb-8 flex-grow">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-4 mb-8">
                    {plan.bullets.map((bullet, i) => (
                      <li key={i} className="text-sm text-gray-400 leading-relaxed">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={14} className="text-blue-400 flex-shrink-0" />
                            <span className="font-bold text-gray-200">{bullet.title}:</span>
                        </div>
                        <span className="block pl-6 text-xs">{bullet.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button Area */}
                  <div className="mt-auto min-h-[50px]">
                    {selectedPlan?.name === plan.name ? (
                      canCheckout ? (
                        <div className="animate-in fade-in zoom-in duration-300 bg-black/20 rounded-xl p-4">
                           <div ref={buttonRef}></div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 bg-black/20 rounded-xl p-4 text-xs text-yellow-300/90">
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>Add a valid QMail address in Step 1 above to continue.</span>
                        </div>
                      )
                    ) : (
                      <div className="w-full py-4 rounded-xl bg-blue-600 text-white text-center text-sm font-bold uppercase tracking-wider group-hover:bg-blue-500 transition-colors">
                        Select Plan
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Buy Credits Without Subscription */}
            <div className="text-center mt-20 mb-10">
              <a
                href="https://cloudcoin.com/pay/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex flex-col items-center justify-center px-10 py-5 bg-gray-900 hover:bg-gray-800 text-white rounded-3xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1"
              >
                <span className="text-lg font-bold mb-1">Buy Coins Without a Subscription</span>
                <span className="text-xs text-blue-400 font-medium tracking-wide uppercase">
                  Used to pay the inbox fees of VIP receivers
                </span>
                <div className="absolute inset-0 rounded-3xl ring-2 ring-white/5 group-hover:ring-blue-500/30 transition-all" />
              </a>
            </div>
          </>
        ) : isRecording ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 p-12 rounded-[40px] text-center shadow-2xl"
          >
            <Loader2 size={48} className="mx-auto mb-6 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Confirming your subscription…</h2>
            <p className="text-gray-400 text-sm">
              Your PayPal subscription is active. We&apos;re recording your delivery addresses now.
            </p>
          </motion.div>
        ) : recordSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-gray-900 border border-green-500/30 p-12 rounded-[40px] text-center shadow-2xl"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <Check size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Payment received — thank you
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Your PayPal subscription is active. Manage or cancel anytime in your PayPal account.
            </p>

            <div className="text-left bg-black/20 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400">Plan</span>
                <span className="text-white font-semibold">{selectedPlan?.name} (${selectedPlan?.price}/mo)</span>
              </div>
              <div className="flex justify-between text-sm mb-4 pb-4 border-b border-gray-800">
                <span className="text-gray-400">Monthly coins</span>
                <span className="text-white font-semibold">{totalCoins} CC</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Per-address split</p>
              <ul className="space-y-1.5 mb-4">
                {rows.map((row, idx) => (
                  <li key={row.id} className="flex justify-between text-sm">
                    <span className="text-gray-300 font-mono truncate mr-3">{row.value.trim()}</span>
                    <span className="text-blue-300 font-semibold whitespace-nowrap">{coinSplit[idx] ?? 0} CC/mo</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm pt-4 border-t border-gray-800">
                <span className="text-gray-400">Subscription qmails</span>
                <span className="text-white font-semibold">{allowSubscriptionQmails ? "Allowed" : "Blocked"}</span>
              </div>
            </div>

            {subscriptionId && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-bold">Subscription ID — save this</p>
                <p className="text-sm text-blue-300 font-mono break-all">{subscriptionId}</p>
              </div>
            )}

            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Please save this confirmation and contact support (or use your QMail support address) if a monthly
              delivery is ever missed. CloudCoin postage purchases are non-refundable per our Terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/download"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
              >
                Download QMail Client
              </Link>
              <button
                onClick={() => {
                  setSubscribed(false);
                  setSubscriptionId(null);
                  setRecordSuccess(null);
                  setRecordError(null);
                }}
                className="text-gray-500 hover:text-white underline"
              >
                Return to Plans
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-gray-900 border border-yellow-500/30 p-12 rounded-[40px] text-center shadow-2xl"
          >
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-400">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Your subscription is active — but we hit a snag
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              PayPal confirmed your subscription and it <span className="font-semibold text-white">is active</span>,
              but we failed to record your delivery addresses on our end.
            </p>
            {subscriptionId && (
              <div className="mb-6 bg-black/30 border border-yellow-500/30 rounded-2xl p-6">
                <p className="text-xs text-yellow-300/80 mb-1 uppercase tracking-wide font-bold">Your Subscription ID</p>
                <p className="text-lg text-yellow-200 font-mono break-all">{subscriptionId}</p>
              </div>
            )}
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Please contact support (or use your QMail support address) with the subscription ID above so we can
              apply your monthly coins manually until this is fixed.
              {recordError ? ` Details: ${recordError}` : ""}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/download"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
              >
                Download QMail Client
              </Link>
              <button
                onClick={() => {
                  setSubscribed(false);
                  setSubscriptionId(null);
                  setRecordSuccess(null);
                  setRecordError(null);
                }}
                className="text-gray-500 hover:text-white underline"
              >
                Return to Plans
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;
