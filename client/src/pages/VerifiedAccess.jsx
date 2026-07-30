import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2, ShieldCheck, Users, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { usePaypalConfig } from '../hooks/usePaypalConfig';
import { track } from '../utils/analytics';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Server-authoritative address prices — must match /api/fulfill-influencer.
// Colors match the class coding used on the register/success pages
// (bit=blue, byte=green, kilo=purple, mega=yellow, giga=red).
const ADDRESS_TIERS = [
  { key: 'bit', label: 'Bit', price: 10, color: 'text-blue-400' },
  { key: 'byte', label: 'Byte', price: 20, color: 'text-green-400' },
  { key: 'kilo', label: 'Kilo', price: 50, color: 'text-purple-400' },
  { key: 'mega', label: 'Mega', price: 100, color: 'text-yellow-400' },
  { key: 'giga', label: 'Giga', price: 1000, color: 'text-red-400' },
];
const CART_KEYS = ADDRESS_TIERS.map((t) => t.key);

const VerifiedAccess = () => {
  useDocumentMeta({ title: 'Send a Private Message', description: 'Send a priority paid message through QMail.', path: '/access', noindex: true });

  const { config: paypalConfig, loading: paypalConfigLoading, error: paypalConfigError } = usePaypalConfig();
  // Payments are switched on/off server-side (PAYMENTS_ENABLED in server/index.js)
  const paymentsDisabled = !paypalConfig?.paymentsEnabled;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const buttonRef = useRef(null);

  // Token verification state
  const [verifyStatus, setVerifyStatus] = useState("checking"); // "checking" | "verified" | "unverified" | "no-token"

  // New state for the redesigned form
  const [wantEmail, setWantEmail] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('message');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Social proof
  const [socialProof, setSocialProof] = useState(null);

  // Optional "buy your own address(es)" cart — collapsed & empty by default.
  const [showAddressCart, setShowAddressCart] = useState(false);
  const [walletStock, setWalletStock] = useState(null);
  const [quantities, setQuantities] = useState({ bit: 0, byte: 0, kilo: 0, mega: 0, giga: 0 });
  // Mirrored into a ref so PayPal's createOrder/onApprove (memoized in
  // renderPayPalButtons) can always read the latest cart without needing
  // the callback recreated — and the buttons torn down — on every +/- click.
  const quantitiesRef = useRef(quantities);

  const setQuantityFor = (key, updater) => {
    setQuantities((prev) => {
      const next = { ...prev, [key]: updater(prev[key]) };
      quantitiesRef.current = next;
      return next;
    });
  };

  const stockFor = (key) => (walletStock ? walletStock[key] ?? 0 : null);

  const incrementQty = (key) => {
    const stock = stockFor(key);
    if (stock !== null && quantities[key] >= stock) return;
    setQuantityFor(key, (q) => q + 1);
  };

  const decrementQty = (key) => {
    setQuantityFor(key, (q) => Math.max(0, q - 1));
  };

  // Reads the ref (not React state) so it always reflects the cart at the
  // moment PayPal invokes createOrder/onApprove.
  const getCartItems = () =>
    CART_KEYS.filter((k) => quantitiesRef.current[k] > 0).map((k) => ({
      class: k,
      quantity: quantitiesRef.current[k],
    }));

  const getCartTotalFromRef = () =>
    ADDRESS_TIERS.reduce((sum, t) => sum + quantitiesRef.current[t.key] * t.price, 0);

  // Title Case Utility
  const toTitleCase = (str) => {
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const recipientRaw = searchParams.get('recipient') || 'QMail User';
  const recipientName = toTitleCase(recipientRaw.replace(/%20/g, ' '));
  const firstName = recipientName.split(' ')[0];
  const inboxFee = parseInt(searchParams.get('cost') || '10', 10);

  const customBg = searchParams.get('bg') ? `#${searchParams.get('bg')}` : '#0a0a1a';
  const customBtn = searchParams.get('btn') ? `#${searchParams.get('btn')}` : '#3b82f6';

  // Get the address from the 'addr' URL parameter
  const influencerAddress = searchParams.get('addr')
    ? decodeURIComponent(searchParams.get('addr'))
    : 'Recipient@QMail.Example';

  // Token from URL
  const linkToken = searchParams.get('token') || '';

  // Track page load and fetch social proof
  useEffect(() => {
    track('verified_access_load', { influencer: recipientName, inboxFee });
    fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/social-proof`)
      .then(r => r.json())
      .then(setSocialProof)
      .catch(() => {});
  }, []);

  // Sold-out tiers are disabled so nobody can pay for an address we can't deliver
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-stock`)
      .then((r) => r.json())
      .then(setWalletStock)
      .catch(() => setWalletStock(null));
  }, []);

  // Verify token with backend on page load
  useEffect(() => {
    if (!linkToken) {
      setVerifyStatus("no-token");
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/verify-influencer?token=${linkToken}&addr=${encodeURIComponent(influencerAddress)}`
        );
        const data = await res.json();
        setVerifyStatus(data.verified ? "verified" : "unverified");
      } catch {
        setVerifyStatus("unverified");
      }
    };
    verify();
  }, [linkToken, influencerAddress]);

  // Package options based on inbox fee
  const packages = {
    message: {
      label: 'Just Message',
      price: inboxFee,
      description: `1 message to ${firstName}`
    },
    basic: {
      label: 'Basic',
      price: inboxFee + 5,
      description: `1 message + small balance`
    },
    standard: {
      label: 'Standard',
      price: 25,
      description: `1 message + credits for more`,
      recommended: true
    },
    best: {
      label: 'Best Value',
      price: 50,
      description: `1 message + credits for 5+`
    }
  };

  // Calculate the actual payment amount
  const getPaymentAmount = () => {
    if (showCustom && customAmount) {
      const amount = parseInt(customAmount, 10);
      return Math.max(inboxFee, Math.min(1000, amount));
    }
    return packages[selectedPackage]?.price || packages.standard.price;
  };

  const paymentAmount = getPaymentAmount();
  const balanceAmount = paymentAmount - inboxFee;
  const cloudCoinsTotal = paymentAmount * 10;
  const cloudCoinsPostage = inboxFee * 10;
  const cloudCoinsBalance = balanceAmount * 10;

  // Optional address cart total + grand total charged via PayPal
  const cartTotal = useMemo(
    () => ADDRESS_TIERS.reduce((sum, t) => sum + quantities[t.key] * t.price, 0),
    [quantities]
  );
  const cartQuantityTotal = useMemo(
    () => CART_KEYS.reduce((sum, k) => sum + quantities[k], 0),
    [quantities]
  );
  const grandTotal = paymentAmount + cartTotal;

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current) {
      buttonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          const cartItems = getCartItems();
          const cartDescription = cartItems.length
            ? ` + ${cartItems.map((i) => `${i.quantity}x .${i.class}`).join(', ')}`
            : '';
          return actions.order.create({
            purchase_units: [{
              // Cart quantities are read from the ref at call time so
              // +/- clicks never need this callback recreated.
              amount: { value: (paymentAmount + getCartTotalFromRef()).toString() },
              description: `QMail: Message to ${recipientName} + CloudCoins${cartDescription}`
            }]
          });
        },
        onApprove: async (data, actions) => {
          let order;
          try {
            order = await actions.order.capture();
          } catch (err) {
            setPaypalError('We could not complete payment capture. Please try again or contact support.');
            return;
          }

          const firstName = order.payer.name.given_name;
          const lastName = order.payer.name.surname;
          const buyerEmail = order.payer.email_address || '';
          const items = getCartItems();
          const grand = paymentAmount + getCartTotalFromRef();

          try {
            const response = await fetch(
              `${import.meta.env.VITE_BASE_URL}/api/fulfill-influencer`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firstName,
                  lastName,
                  buyerEmail,
                  paypalOrderID: data.orderID,
                  coinsDollars: paymentAmount,
                  items,
                  wantBonusAddress: wantEmail,
                  influencerName: recipientName,
                  influencerAddress,
                  influencerInboxFee: inboxFee
                })
              }
            );

            const result = await response.json();

            if (!result.success) {
              // Payment already captured above — make that unmistakably clear.
              setPaypalError(
                `Your payment was received (PayPal order ${data.orderID}), but we ran into a problem fulfilling your order. Please contact support and we will make this right.${
                  result.error ? ` Details: ${result.error}` : ''
                }`
              );
              return;
            }

            // Track successful payment
            track('payment_complete', { influencer: recipientName, amount: grand, package: selectedPackage });

            // Navigate to influencer success page with all data
            navigate('/success-influencer', {
              state: {
                userData: { firstName, lastName },
                recipientName,
                influencerAddress,
                paymentAmount: grand,
                inboxFee,
                cloudCoins: result.cloudCoins,
                cloudCoinsLockerCode: result.cloudCoinsLockerCode,
                addresses: result.addresses,
                partialError: result.partial ? result.error : undefined
              }
            });

          } catch (err) {
            console.error('Fulfillment error:', err);
            setPaypalError(
              `Your payment was received (PayPal order ${data.orderID}), but we could not confirm your order due to a network error. Please contact support — do not pay again.`
            );
          }
        },
        onError: (err) => {
          console.error("PayPal Error:", err);
          track('payment_error', { influencer: recipientName, amount: paymentAmount + getCartTotalFromRef() });
          setPaypalError("Payment failed to initialize. Please try again.");
        },
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' }
      }).render(buttonRef.current);
    }
  }, [paymentAmount, recipientName, navigate, wantEmail, influencerAddress, inboxFee, selectedPackage]);

  useEffect(() => {
    if (paypalConfigLoading) return;
    if (paypalConfigError || !paypalConfig?.clientId) {
      setPaypalError(paypalConfigError || "PayPal Configuration Missing.");
      return;
    }

    const scriptId = 'paypal-sdk-script';
    const clientId = paypalConfig.clientId;

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;

      script.onload = () => {
        setIsPaypalLoaded(true);
        setPaypalError(null);
        setTimeout(renderPayPalButtons, 100);
      };

      script.onerror = () => {
        setPaypalError("PayPal failed to load. Check your connection or ad-blocker.");
      };

      document.body.appendChild(script);
    } else {
      setIsPaypalLoaded(true);
      setTimeout(renderPayPalButtons, 100);
    }
  }, [renderPayPalButtons, paypalConfigLoading, paypalConfigError, paypalConfig]);

  // Re-render PayPal buttons when amount changes
  useEffect(() => {
    if (isPaypalLoaded) {
      renderPayPalButtons();
    }
  }, [paymentAmount, isPaypalLoaded, renderPayPalButtons]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-3 md:p-6 transition-colors duration-1000"
      style={{ backgroundColor: customBg }}
    >
      {/* ── Verification Banner ── */}
      {verifyStatus === "checking" && (
        <div className="w-full max-w-5xl mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/40 border border-white/10 text-gray-400 text-sm">
          <Loader2 size={16} className="animate-spin shrink-0" />
          <span>Verifying this page…</span>
        </div>
      )}
      {verifyStatus === "verified" && (
        <div className="w-full max-w-5xl mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-900/30 border border-green-500/40 text-green-300 text-sm">
          <ShieldCheck size={16} className="shrink-0 text-green-400" />
          <span><strong>Verified page</strong> — This is the official Distributed Mail page for <strong>{recipientName}</strong>.</span>
        </div>
      )}
      {verifyStatus === "no-token" && (
        <div className="w-full max-w-5xl mb-4 px-5 py-4 rounded-2xl bg-yellow-900/20 border border-yellow-500/30 text-sm">
          <div className="flex items-start gap-3 text-yellow-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-yellow-400" />
            <div>
              <p className="font-bold text-yellow-200 mb-1">Verification token missing</p>
              <p className="text-yellow-300/80">This link does not include a verification token. It may have been truncated by a social media platform, or the influencer may not have finished setup. Check that you have the full URL, or contact the person who shared it.</p>
            </div>
          </div>
        </div>
      )}
      {verifyStatus === "unverified" && (
        <div className="w-full max-w-5xl mb-4 px-5 py-4 rounded-2xl bg-red-900/30 border border-red-500/40 text-sm">
          <div className="flex items-start gap-3 text-red-300">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-bold text-red-200 mb-1">This page could not be verified</p>
              <p>The verification token does not match any registered influencer. This may be a fake or spoofed page. <strong>Do not make any payments.</strong> If you believe this is an error, contact support below.</p>
            </div>
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 md:gap-12 bg-black/40 backdrop-blur-3xl p-6 md:p-10 lg:p-16 rounded-[24px] md:rounded-[40px] border border-white/10 shadow-2xl"
      >
        {/* Left Side: Information (appears second on mobile) */}
        <div className="space-y-8 order-2 lg:order-1">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">
              Send {firstName} a Private, Priority Message
            </h1>
            <p className="text-xl font-mono opacity-80" style={{ color: customBtn }}>
              {influencerAddress}
            </p>
          </div>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              <span className="text-white font-bold">{recipientName} uses Distributed Mail (QMail).</span> Messages are designed for strong privacy with postage that helps filter spam.
            </p>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-lg">
                <span className="text-white font-bold">{firstName}</span> charges <span className="text-white font-bold">${inboxFee}</span> per email to accept messages from people not on their contact list.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-white font-bold mb-2">Why is there a cost?</h3>
              <p>
                Paid postage makes mass spam expensive and helps real messages stand out. It does not guarantee a reply — response times vary by person.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm italic">
                <span className="text-white font-bold not-italic">Less spam by design:</span> Because postage is required, bulk spam is far less profitable. Your message is delivered as a paid priority message.
              </p>
            </div>

            {/* Social Proof — only real API data */}
            <div className="flex flex-col gap-2 pt-2">
              {socialProof && socialProof.totalPurchases > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users size={14} className="text-blue-400 shrink-0" />
                  <span><strong className="text-white">{socialProof.totalPurchases}</strong> people have used QMail{socialProof.recentSales > 0 ? ` — ${socialProof.recentSales} this week` : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Payment Gateway (appears first on mobile) */}
        <div className="flex flex-col order-1 lg:order-2">
          <div className="bg-white/5 p-5 md:p-8 rounded-[24px] md:rounded-[32px] border border-white/10 space-y-6">

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-white/5 mb-4">
                <Mail size={28} style={{ color: customBtn }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Private, Paid-Access Messaging</h2>
              <p className="text-gray-500 text-xs">Send {firstName} a priority QMail message</p>
            </div>

            {/* Purchase Credits */}
            <div className="space-y-3 py-4 border-y border-white/5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Purchase QMail Credits (CloudCoins)</p>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: customBtn }} />
                <span>Use these credits to send QMails to {firstName} and for future messages</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: customBtn }} />
                <span>The QMails you send are private and priority</span>
              </div>
              <label className="flex items-start gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantEmail}
                  onChange={(e) => setWantEmail(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500 mt-0.5 shrink-0"
                />
                <span>Also get your own QMail address — <strong className="text-white">free</strong> ($20 value)</span>
              </label>
            </div>

            {/* Optional: buy additional QMail address(es) */}
            <div className="py-4 border-b border-white/5">
              <button
                type="button"
                onClick={() => setShowAddressCart((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-300 transition-colors"
              >
                <span>
                  Buy your own QMail address(es){' '}
                  <span className="normal-case font-normal text-gray-500">(optional)</span>
                </span>
                {showAddressCart ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAddressCart && (
                <div className="space-y-2 pt-3">
                  {ADDRESS_TIERS.map((t) => {
                    const stock = stockFor(t.key);
                    const soldOut = stock === 0;
                    const qty = quantities[t.key];
                    const atStockLimit = stock !== null && qty >= stock;
                    return (
                      <div
                        key={t.key}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/20 ${
                          soldOut ? 'opacity-50' : ''
                        } ${qty > 0 ? 'ring-1 ring-white/10' : ''}`}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-bold ${t.color}`}>.{t.label}</span>
                          <span className="text-gray-500 text-xs">${t.price}</span>
                          {soldOut && (
                            <span className="text-[9px] text-red-400 uppercase font-bold tracking-widest">Sold Out</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementQty(t.key)}
                            disabled={qty === 0}
                            aria-label={`Decrease .${t.label} quantity`}
                            className="w-6 h-6 rounded-md bg-white/10 text-gray-300 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-mono font-bold text-white text-sm">{qty}</span>
                          <button
                            type="button"
                            onClick={() => incrementQty(t.key)}
                            disabled={soldOut || atStockLimit}
                            aria-label={`Increase .${t.label} quantity`}
                            style={{ backgroundColor: customBtn }}
                            className="w-6 h-6 rounded-md text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {cartQuantityTotal > 0 && (
                    <p className="text-xs text-gray-500 pt-1">
                      {cartQuantityTotal} address{cartQuantityTotal > 1 ? 'es' : ''} added — ${cartTotal} total
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Package Selection */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose Your Package</p>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(packages).map(([key, pkg]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedPackage(key); setShowCustom(false); track('package_select', { package: key, price: pkg.price, influencer: recipientName }); }}
                    className={`relative p-3 rounded-xl border text-center transition-all ${
                      selectedPackage === key && !showCustom
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {pkg.recommended && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">Popular</span>
                    )}
                    <p className="text-white font-bold text-sm">${pkg.price}</p>
                    <p className="text-gray-500 text-[10px]">{pkg.label}</p>
                  </button>
                ))}
              </div>

              {/* Custom Amount Toggle */}
              {!showCustom ? (
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-2"
                >
                  Custom amount...
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min={inboxFee}
                      max={1000}
                      placeholder={`${inboxFee} - 1000`}
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    <button
                      onClick={() => { setShowCustom(false); setCustomAmount(''); }}
                      className="text-xs text-gray-500 hover:text-gray-300 px-2"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Min: ${inboxFee} (inbox fee) | Max: $1,000
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-black/30 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Message to {firstName}:</span>
                <span className="text-white">${inboxFee} <span className="text-gray-500 text-xs">({cloudCoinsPostage} CC)</span></span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Your Balance:</span>
                <span className="text-white">${balanceAmount} <span className="text-gray-500 text-xs">({cloudCoinsBalance} CC)</span></span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                <span>Message/Credits Subtotal:</span>
                <span>${paymentAmount} <span className="text-gray-500 text-xs font-normal">({cloudCoinsTotal} CC)</span></span>
              </div>
              {ADDRESS_TIERS.filter((t) => quantities[t.key] > 0).map((t) => (
                <div key={t.key} className="flex justify-between text-gray-400">
                  <span>{quantities[t.key]} × .{t.label} address{quantities[t.key] > 1 ? 'es' : ''}:</span>
                  <span className="text-white">${quantities[t.key] * t.price}</span>
                </div>
              ))}
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10 text-base">
                <span>Total:</span>
                <span>${grandTotal}</span>
              </div>
            </div>

            {/* PayPal Buttons */}
            <div className="min-h-[120px] flex items-center justify-center">
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
              ) : verifyStatus === "unverified" ? (
                <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-500/20 text-xs flex items-center gap-2 w-full">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Payments are disabled — this page could not be verified as an official influencer page.</span>
                </div>
              ) : verifyStatus === "no-token" ? (
                <div className="text-yellow-400 bg-yellow-400/10 p-4 rounded-xl border border-yellow-500/20 text-xs flex items-center gap-2 w-full">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Payments are disabled — this link is missing a verification token. Ask the sender for the correct link.</span>
                </div>
              ) : paypalError ? (
                <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-500/20 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{paypalError}</span>
                </div>
              ) : !isPaypalLoaded ? (
                <Loader2 className="animate-spin" size={32} style={{ color: customBtn }} />
              ) : (
                <div ref={buttonRef} className="w-full"></div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-4 text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-400/80">Secured by PayPal</span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <Lock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Quantum Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 max-w-md w-full"
      >
        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Need Help?
          </h4>
          <svg
            viewBox="0 0 400 160"
            className="w-full"
            role="img"
            aria-label="Contact information: Phone (530) 591-7028, QMail Sean.Worthington@CEO#C23.Giga, Email CloudCoin@Protonmail.com, Web Support.CloudCoin.com"
          >
            <rect width="400" height="160" fill="#111827" rx="8" />
            <text x="20" y="35" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">Phone:</text>
            <text x="80" y="35" fill="#d1d5db" fontSize="12" fontFamily="monospace">(530) 591-7028</text>
            <text x="20" y="65" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">QMail:</text>
            <text x="80" y="65" fill="#d1d5db" fontSize="12" fontFamily="monospace">Sean.Worthington@CEO#C23.Giga</text>
            <text x="20" y="95" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">Email:</text>
            <text x="80" y="95" fill="#d1d5db" fontSize="12" fontFamily="monospace">CloudCoin@Protonmail.com</text>
            <text x="20" y="125" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">Web:</text>
            <text x="80" y="125" fill="#60a5fa" fontSize="12" fontFamily="monospace">https://Support.CloudCoin.com</text>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifiedAccess;