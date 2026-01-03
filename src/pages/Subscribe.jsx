import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Crown, Check } from "lucide-react";

const Subscribe = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const buttonRef = useRef(null);

  const plans = [
    {
      id: "P-BASIC",
      name: "Starter Top-up",
      price: "10",
      coins: "1000",
      icon: Zap,
      features: [],
    },
    {
      id: "P-PRO",
      name: "Power User",
      price: "20",
      coins: "2500",
      icon: Crown,
      features: ["25% Bonus Credits"],
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
            const planId =
              selectedPlan.price === "10"
                ? import.meta.env.VITE_PAYPAL_PLAN_ID_BASIC
                : import.meta.env.VITE_PAYPAL_PLAN_ID_PRO;

            if (!planId) {
              console.error(
                "PayPal Plan ID is missing in environment variables."
              );
              return;
            }

            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: (data, actions) => {
            setSubscribed(true);
          },
        })
        .render(buttonRef.current);
    }
  }, [selectedPlan]);

  useEffect(() => {
    const scriptId = "paypal-sub-script";
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      console.error(
        "PayPal Client ID is missing. Please check your .env file."
      );
      return;
    }

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
  }, []);

  useEffect(() => {
    if (isPaypalLoaded && selectedPlan && !subscribed) {
      setTimeout(renderPayPalButtons, 100);
    }
  }, [isPaypalLoaded, selectedPlan, renderPayPalButtons, subscribed]);

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-500/20">
            Receivers Get Paid & Senders Pay
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Get Credits Needed Sending Emails
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            You may receive payment for receiving emails but sending emails
            costs credits unless you're on the receiver's whitelist. QMail
            server administrators also need to be paid a micropayment based on
            how many megabytes you want to send and how long you want to keep
            them on the qmail array.
          </p>
        </div>

        {!subscribed ? (
          <>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer relative overflow-hidden p-8 rounded-[32px] border-2 transition-all duration-300 shadow-2xl ${
                    selectedPlan?.id === plan.id
                      ? "bg-gray-900 border-blue-500 shadow-blue-900/40 ring-1 ring-blue-500/50"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700 hover:shadow-xl"
                  }`}
                >
                  {selectedPlan?.id === plan.id && (
                    <div className="absolute top-0 right-0 p-4">
                      <div className="bg-blue-500 rounded-full p-1">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      selectedPlan?.id === plan.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    <plan.icon size={28} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 font-medium">/month</span>
                  </div>

                  {plan.features.length > 0 && (
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm text-gray-300"
                        >
                          <Shield size={16} className="text-blue-400" /> {feat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {selectedPlan?.id === plan.id && (
                    <div className="min-h-[150px] animate-in fade-in slide-in-from-bottom-4 bg-black/20 rounded-xl p-4">
                      <div ref={buttonRef}></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Buy Credits Without Subscription Button */}
            <div className="text-center mt-12">
              <a
                href="https://cloudcoin.com/pay/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-2xl border border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-105"
              >
                Buy Credits Without A Subscription
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
              Subscription Active!
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Your CloudCoin locker will now be automatically topped up every
              month.
              <br />
              You can manage your subscription in your PayPal dashboard.
            </p>
            <button
              onClick={() => setSubscribed(false)}
              className="text-gray-500 hover:text-white underline"
            >
              Return to Plans
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;
