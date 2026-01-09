import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const VerifiedAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const buttonRef = useRef(null);

  // New state for the redesigned form
  const [wantEmail, setWantEmail] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Title Case Utility
  const toTitleCase = (str) => {
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const recipientRaw = searchParams.get('recipient') || 'Connie Willis';
  const recipientName = toTitleCase(recipientRaw.replace(/%20/g, ' '));
  const firstName = recipientName.split(' ')[0];
  const inboxFee = parseInt(searchParams.get('cost') || '10', 10);

  const customBg = searchParams.get('bg') ? `#${searchParams.get('bg')}` : '#0a0a1a';
  const customBtn = searchParams.get('btn') ? `#${searchParams.get('btn')}` : '#3b82f6';

  // Get the address from the 'addr' URL parameter
  const influencerAddress = searchParams.get('addr')
    ? decodeURIComponent(searchParams.get('addr'))
    : `${recipientName.replace(/\s+/g, '.')}@Example.Giga`;

  // Package options based on inbox fee
  const packages = {
    basic: {
      label: 'Basic',
      price: inboxFee + 5,
      description: `1 message + small balance`
    },
    standard: {
      label: 'Standard',
      price: 25,
      description: `1 message + balance for more`,
      recommended: true
    },
    best: {
      label: 'Best Value',
      price: 50,
      description: `1 message + balance for 5+ more`
    }
  };

  // Calculate the actual payment amount
  const getPaymentAmount = () => {
    if (showCustom && customAmount) {
      const amount = parseInt(customAmount, 10);
      return Math.max(inboxFee + 1, Math.min(1000, amount));
    }
    return packages[selectedPackage]?.price || packages.standard.price;
  };

  const paymentAmount = getPaymentAmount();
  const balanceAmount = paymentAmount - inboxFee;
  const cloudCoinsTotal = paymentAmount * 10;
  const cloudCoinsPostage = inboxFee * 10;
  const cloudCoinsBalance = balanceAmount * 10;

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current) {
      buttonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: paymentAmount.toString() },
              description: `QMail: Message to ${recipientName} + CloudCoins`
            }]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          const firstName = order.payer.name.given_name;
          const lastName = order.payer.name.surname;

          let emailData = null;
          let cloudCoinsData = null;

          try {
            // Step 1: If user wants their own QMail address, register it
            if (wantEmail) {
              const mailboxResponse = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/generate-mailbox`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firstName,
                    lastName,
                    amountPaid: 20, // .byte stake (free with purchase)
                    inboxFee: 1,   // Fixed inbox fee for new users
                    description: 'QMail'
                  })
                }
              );

              const mailboxResult = await mailboxResponse.json();

              if (!mailboxResult.success) {
                setPaypalError(mailboxResult.error || 'Failed to create your QMail address. Please contact support.');
                return;
              }

              emailData = {
                email: mailboxResult.email,
                lockerCode: mailboxResult.lockerCode
              };
            }

            // Step 2: Always generate CloudCoins locker for the payment amount
            const cloudCoinsResponse = await fetch(
              `${import.meta.env.VITE_BASE_URL}/api/generate-cloudcoins-locker`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  dollarAmount: paymentAmount,
                  firstName,
                  lastName
                })
              }
            );

            const cloudCoinsResult = await cloudCoinsResponse.json();

            if (!cloudCoinsResult.success) {
              setPaypalError(cloudCoinsResult.error || 'Failed to generate CloudCoins locker. Please contact support.');
              return;
            }

            cloudCoinsData = {
              cloudCoins: cloudCoinsResult.cloudCoins,
              cloudCoinsLockerCode: cloudCoinsResult.cloudCoinsLockerCode
            };

            // Step 3: Log the affiliate sale
            try {
              await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/log-affiliate-sale`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    influencerName: recipientName,
                    influencerAddress,
                    influencerInboxFee: inboxFee,
                    buyerFirstName: firstName,
                    buyerLastName: lastName,
                    buyerEmail: order.payer.email_address,
                    paymentAmount,
                    cloudCoinsPurchased: cloudCoinsData.cloudCoins,
                    createdEmailAddress: wantEmail,
                    emailAddressCreated: emailData?.email || ''
                  })
                }
              );
            } catch (logErr) {
              // Don't fail the transaction if logging fails
              console.error('Failed to log affiliate sale:', logErr);
            }

            // Navigate to influencer success page with all data
            navigate('/success-influencer', {
              state: {
                userData: { firstName, lastName },
                recipientName,
                influencerAddress,
                paymentAmount,
                inboxFee,
                // Email data (if they wanted an address)
                email: emailData?.email || null,
                emailLockerCode: emailData?.lockerCode || null,
                // CloudCoins data
                cloudCoins: cloudCoinsData.cloudCoins,
                cloudCoinsLockerCode: cloudCoinsData.cloudCoinsLockerCode
              }
            });

          } catch (err) {
            console.error('Payment processing error:', err);
            setPaypalError('An error occurred processing your payment. Please contact support.');
          }
        },
        onError: (err) => {
          console.error("PayPal Error:", err);
          setPaypalError("Payment failed to initialize. Please try again.");
        },
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' }
      }).render(buttonRef.current);
    }
  }, [paymentAmount, recipientName, navigate, wantEmail, cloudCoinsBalance, influencerAddress, inboxFee]);

  useEffect(() => {
    const scriptId = 'paypal-sdk-script';
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setPaypalError("PayPal Configuration Missing.");
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
  }, [renderPayPalButtons]);

  // Re-render PayPal buttons when amount changes
  useEffect(() => {
    if (isPaypalLoaded) {
      renderPayPalButtons();
    }
  }, [paymentAmount, isPaypalLoaded, renderPayPalButtons]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-1000"
      style={{ backgroundColor: customBg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 bg-black/40 backdrop-blur-3xl p-10 md:p-16 rounded-[40px] border border-white/10 shadow-2xl"
      >
        {/* Left Side: Information */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">
              {recipientName}
            </h1>
            <p className="text-xl font-mono opacity-80" style={{ color: customBtn }}>
              {influencerAddress}
            </p>
          </div>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              <span className="text-white font-bold">{recipientName} uses Distributed Mail.</span> This is an open standard for sending 100% private, quantum-safe messages.
            </p>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-lg">
                <span className="text-white font-bold">{firstName}</span> charges <span className="text-white font-bold">${inboxFee}</span> per email to read messages from people not on their contact list.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-white font-bold mb-2">Why is there a cost?</h3>
              <p>
                {firstName} receives thousands of messages. To ensure they read yours, they use the "Postage Guarantee." This keeps spam out and real messages in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm italic">
                <span className="text-white font-bold not-italic">Zero Spam:</span> Because postage is required, spammers cannot afford to email them. Your message lands in their <strong className="text-white">"Priority Inbox."</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Gateway */}
        <div className="flex flex-col">
          <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 space-y-6">

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-white/5 mb-4">
                <Mail size={28} style={{ color: customBtn }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">The Most Private Email System In The World</h2>
              <p className="text-gray-500 text-xs">Send {firstName} a quantum-safe message</p>
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
                <span>Uncheck this box if you do not want a free email address ($20 value)</span>
              </label>
            </div>

            {/* Package Selection */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose Your Package</p>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(packages).map(([key, pkg]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedPackage(key); setShowCustom(false); }}
                    className={`relative p-3 rounded-xl border text-center transition-all ${
                      selectedPackage === key && !showCustom
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
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
                      min={inboxFee + 1}
                      max={1000}
                      placeholder={`${inboxFee + 1} - 1000`}
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
                    Min: ${inboxFee + 1} (inbox fee + $1) | Max: $1,000
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
                <span>Total:</span>
                <span>${paymentAmount} <span className="text-gray-500 text-xs font-normal">({cloudCoinsTotal} CC)</span></span>
              </div>
            </div>

            {/* PayPal Buttons */}
            <div className="min-h-[120px] flex items-center justify-center">
              {paypalError ? (
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

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Quantum Safe</span>
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
