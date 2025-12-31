import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';

const VerifiedAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const buttonRef = useRef(null);
  
  // Title Case Utility
  const toTitleCase = (str) => {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const recipientRaw = searchParams.get('recipient') || 'Connie Willis';
  const recipientName = toTitleCase(recipientRaw.replace(/%20/g, ' '));
  const firstName = recipientName.split(' ')[0]; // For shortened mentions like "Connie charges..."
  const displayCost = searchParams.get('cost') || '10';
  
  const customBg = searchParams.get('bg') ? `#${searchParams.get('bg')}` : '#0a0a1a';
  const customBtn = searchParams.get('btn') ? `#${searchParams.get('btn')}` : '#3b82f6';

  const address = recipientName.toLowerCase().includes('connie') 
    ? 'Bigfoot@Blue.Rocks.Giga' 
    : `${recipientName.toLowerCase().replace(/\s+/g, '.') }@Blue.Rocks.Giga`;

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current) {
      buttonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: displayCost },
              description: `Postage Guarantee for ${recipientName}`
            }]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          navigate('/success', { state: { userData: { firstName: order.payer.name.given_name, email: order.payer.email_address }, recipientName } });
        },
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' }
      }).render(buttonRef.current);
    }
  }, [displayCost, recipientName, navigate]);

  useEffect(() => {
    const scriptId = 'paypal-sdk-script';
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =   script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;
      script.onload = () => { setIsPaypalLoaded(true); setTimeout(renderPayPalButtons, 100); };
      document.body.appendChild(script);
    } else {
      setIsPaypalLoaded(true);
      setTimeout(renderPayPalButtons, 100);
    }
  }, [renderPayPalButtons]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-1000"
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
              {address}
            </p>
          </div>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              <span className="text-white font-bold">{recipientName} uses Distributed Mail.</span> This is an open standard for sending 100% private, quantum-safe messages. Your message will be sharded (shredded) and scattered across a decentralized mesh of random, sovereign servers.
            </p>
            
            <div className="pt-4">
              <h3 className="text-white font-bold mb-2">Why is there a cost?</h3>
              <p>
                {firstName} receives thousands of messages a day. To ensure they read yours, they use the "Postage Guarantee."
              </p>
            </div>

            <p>
              {firstName} charges <span className="text-white font-bold">${displayCost}.00</span> to receive a prioritized, private distributed email.
            </p>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm italic">
                <span className="text-white font-bold not-italic">Zero Spam:</span> Because postage is required, spammers cannot afford to email them. Your message is guaranteed to land in their <strong className="text-white">"Priority Inbox."</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Gateway */}
        <div className="flex flex-col justify-center">
          <div className="bg-white/5 p-10 rounded-[32px] border border-white/10 text-center space-y-8">
            <div className="inline-flex p-4 rounded-2xl bg-white/5">
              <Mail size={32} style={{ color: customBtn }} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-widest">Postage Guarantee</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Connection Gateway</p>
            </div>

            <div className="py-6 border-y border-white/5">
                <p className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-1">Required Postage</p>
                <p className="text-4xl font-black text-white">${displayCost}.00</p>
            </div>

            <div className="min-h-[150px] flex items-center justify-center">
              {!isPaypalLoaded ? (
                <Loader2 className="animate-spin" size={32} style={{ color: customBtn }} />
              ) : (
                <div ref={buttonRef} className="w-full"></div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Quantum Safe</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifiedAccess;