import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Star, Crown, Check, ShieldCheck } from "lucide-react";
import { usePaypalConfig } from "../hooks/usePaypalConfig";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const Subscribe = () => {
  useDocumentMeta({
    title: "QMail Credits Subscription",
    description:
      "Subscribe for monthly QMail tip credits to pay server capacity and inbox fees. Manage billing in PayPal.",
    path: "/subscribe",
  });

  const { config: paypalConfig, loading: paypalConfigLoading, error: paypalConfigError } = usePaypalConfig();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const buttonRef = useRef(null);

  const plans = [
    {
      id: paypalConfig?.planIdCasual || '',
      name: "Casual User",
      price: "5",
      capacity: "50 MB/Month",
      bestFor: "Pure text communication and occasional photos.",
      description: "Monthly tip credits for the Distributed Mail System — about 50 MB-Months of capacity for lean, private messaging.",
      icon: Zap,
      bullets: [
        { title: "How it works", text: "After payment, your subscription is recorded in PayPal. Credits are applied to your QMail usage according to your plan." },
        { title: "Rollover", text: "Unused tip capacity is intended to roll over month to month while your subscription remains active." }
      ]
    },
    {
      id: paypalConfig?.planIdTypical || '',
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

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current && selectedPlan) {
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
          onApprove: (data) => {
            setSubscriptionId(data.subscriptionID || null);
            setSubscribed(true);
          },
          onError: (err) => {
            console.error("PayPal Error:", err);
          }
        })
        .render(buttonRef.current);
    }
  }, [selectedPlan]);

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
    if (isPaypalLoaded && selectedPlan && !subscribed) {
      setTimeout(renderPayPalButtons, 100);
    }
  }, [isPaypalLoaded, selectedPlan, renderPayPalButtons, subscribed]);

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-500/20">
            Monthly QMail credits
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Subscribe for Sending Credits
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Sending mail costs tips unless you are on the receiver&apos;s whitelist.
            These plans fund monthly capacity (MB-Months) on the network.
          </p>
          <p className="text-sm text-yellow-300/90 mt-4 max-w-2xl mx-auto leading-relaxed">
            Automatic locker top-up is still being finished. After you subscribe in PayPal, keep your subscription ID —
            support will help apply credits until full automation ships. Need a mailbox first?{" "}
            <Link to="/register" className="underline hover:text-yellow-200">Claim an address</Link>.
          </p>
        </div>

        {!subscribed ? (
          <>
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
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wide border border-blue-500/20">
                      {plan.capacity}
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
                       <div className="animate-in fade-in zoom-in duration-300 bg-black/20 rounded-xl p-4">
                          <div ref={buttonRef}></div>
                       </div>
                    ) : (
                      <div className="w-full py-4 rounded-xl border border-gray-700 text-gray-500 text-center text-sm font-bold uppercase tracking-wider group-hover:border-gray-600 group-hover:text-gray-400 transition-colors">
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
                <span className="text-lg font-bold mb-1">Buy Tips Without A Subscription</span>
                <span className="text-xs text-blue-400 font-medium tracking-wide uppercase">
                  Used to pay the InBox-fees of VIP Receivers
                </span>
                <div className="absolute inset-0 rounded-3xl ring-2 ring-white/5 group-hover:ring-blue-500/30 transition-all" />
              </a>
            </div>
          </>
        ) : (
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
            <p className="text-gray-300 text-lg mb-4">
              Your PayPal subscription is active. Manage or cancel anytime in your PayPal account.
            </p>
            {subscriptionId && (
              <p className="text-sm text-blue-300 font-mono mb-4 break-all">
                Subscription ID: {subscriptionId}
              </p>
            )}
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Fully automatic monthly credit delivery is coming soon. Please save this confirmation and contact support
              (or use your QMail support address) if credits are not applied promptly. CloudCoin postage purchases are
              non-refundable per our Terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/download"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
              >
                Download QMail Client
              </Link>
              <button
                onClick={() => { setSubscribed(false); setSubscriptionId(null); }}
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