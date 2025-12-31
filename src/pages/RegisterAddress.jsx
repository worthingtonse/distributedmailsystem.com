import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Zap, Star, Hexagon, Check, Copy, AtSign } from 'lucide-react';

const RegisterAddress = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [customGroup, setCustomGroup] = useState('');
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef(null);

  // DEFINED HERE: "tiers" (not Statuses)
  const tiers = [
    { name: 'Bit', price: '10', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Byte', price: '20', icon: Hexagon, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { name: 'Kilo', price: '30', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Mega', price: '50', icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { name: 'Giga', price: '90', icon: User, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  const generateSN = () => {
    return Math.floor(Math.random() * 4095).toString(16).toUpperCase().padStart(3, '0');
  };

  const sanitizeGroup = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, ''); 
  };

  const handleGroupChange = (e) => {
    setCustomGroup(sanitizeGroup(e.target.value));
  };

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current && selectedTier) {
      buttonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: selectedTier.price },
              description: `Registration for .${selectedTier.name} Address`
            }]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          const payerName = order.payer.name;
          
          const status = selectedTier.name;
          const groupPart = customGroup ? `~${customGroup}` : '';
          const namePart = `.${payerName.given_name}.${payerName.surname}`;
          const serialPart = `#${generateSN()}`;
          
          const finalAddress = `${status}${groupPart}${namePart}${serialPart}`;
          
          setGeneratedAddress(finalAddress);
          setPaymentComplete(true);
        },
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' }
      }).render(buttonRef.current);
    }
  }, [selectedTier, customGroup]);

  useEffect(() => {
    const scriptId = 'paypal-sdk-script';
    // Use Sandbox Client ID from Env or default to 'sb'
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;
      script.onload = () => { setIsPaypalLoaded(true); };
      document.body.appendChild(script);
    } else {
      setIsPaypalLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isPaypalLoaded && selectedTier && !paymentComplete) {
      setTimeout(renderPayPalButtons, 100);
    }
  }, [isPaypalLoaded, selectedTier, renderPayPalButtons, paymentComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-xl bg-blue-600/20 mb-4 text-blue-400 border border-blue-500/30">
            <AtSign size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Claim Your Identity
          </h1>
          <p className="text-xl text-gray-400">
            Secure your permanent, verified address on the Distributed Mail System.
          </p>
        </div>

        {!paymentComplete ? (
          <div className="space-y-8">
            {/* Step 1: Select Tier */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {tiers.map((tier) => (
                <button
                  key={tier.name}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${
                    selectedTier?.name === tier.name 
                      ? `${tier.bg} ${tier.border} ring-2 ring-offset-2 ring-offset-black ring-blue-500 scale-105` 
                      : 'bg-gray-900 border-gray-800 hover:bg-gray-800' // Opaque background here too
                  }`}
                >
                  <tier.icon size={24} className={tier.color} />
                  <div className="text-center">
                    <div className="font-bold text-white text-sm">{tier.name}</div>
                    <div className="text-xs text-gray-400 font-mono">${tier.price}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Step 2: Custom Group */}
            <AnimatePresence>
              {selectedTier && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl"
                >
                  <div>
                    <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
                      Group / Title (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-lg">~</span>
                      <input 
                        type="text" 
                        value={customGroup}
                        onChange={handleGroupChange}
                        placeholder="Founder, CEO, Team..."
                        className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all font-mono"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Appears after status. Alphanumeric only. e.g. {selectedTier.name}~<b>Founder</b>.YourName
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-black border border-gray-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Address Preview</span>
                    <div className="text-lg md:text-xl font-mono text-white break-all">
                      <span className={selectedTier.color}>{selectedTier.name}</span>
                      {customGroup && <span className="text-gray-400">~{customGroup}</span>}
                      <span className="text-gray-400">.FirstName.LastName</span>
                      <span className="text-gray-600">#???</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-800">
                    <p className="text-center text-sm text-gray-400 mb-6">
                      Identity verified via PayPal. <br/>
                      Your verified name will be permanently stamped to this address.
                    </p>
                    <div className="min-h-[150px] flex items-center justify-center">
                       <div ref={buttonRef} className="w-full max-w-sm"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Success State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 p-10 rounded-[40px] border border-blue-500/30 text-center space-y-8 shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400 border border-green-500/30">
              <Check size={40} />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Address Minted!</h2>
              <p className="text-gray-400">Your secure Distributed Mail address is ready.</p>
            </div>

            <div className="bg-black/80 p-6 rounded-2xl border border-gray-800 relative group">
              <code className="text-xl md:text-2xl font-mono text-blue-400 break-all">
                {generatedAddress}
              </code>
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              >
                {copied ? <Check size={18}/> : <Copy size={18}/>}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Please save this address. It is now linked to your identity on the blockchain.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegisterAddress;