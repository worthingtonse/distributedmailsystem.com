import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, User, Zap, Star, Hexagon, Check, 
  Copy, AtSign, Info, ShieldAlert, Smartphone, Monitor, HardDrive, 
  Lock, ArrowRight, Shield
} from 'lucide-react';

const RegisterAddress = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState('free'); 
  const [customGroup, setCustomGroup] = useState('');
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef(null);

  // Allegiance Levels from your provided text
  const tiers = [
    { name: 'Bit', price: 10, trust: 'Entry level', best: 'Casual users, testing', icon: Zap, color: 'text-blue-400' },
    { name: 'Byte', price: 20, trust: 'Basic commitment', best: 'Everyday personal email', icon: Hexagon, color: 'text-green-400' },
    { name: 'Kilo', price: 50, trust: 'Moderate stake', best: 'Freelancers, small creators', icon: Star, color: 'text-purple-400' },
    { name: 'Mega', price: 100, trust: 'Strong signal of legitimacy', best: 'Professionals, businesses', icon: ShieldCheck, color: 'text-yellow-400' },
    { name: 'Giga', price: 1000, trust: 'Highest trust — serious users only', best: 'Executives, high-profile individuals', icon: User, color: 'text-red-400' },
  ];

  const totalPrice = useMemo(() => {
    const base = selectedTier ? selectedTier.price : 0;
    const extra = selectedEdition === 'pro' ? 10 : 0;
    return base + extra;
  }, [selectedTier, selectedEdition]);

  const generateSN = () => Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');

  const handleGroupChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    setCustomGroup(value);
  };

  const renderPayPalButtons = useCallback(() => {
    if (window.paypal && buttonRef.current && selectedTier) {
      buttonRef.current.innerHTML = '';
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: totalPrice.toString() },
              description: `DMS Registration: .${selectedTier.name} + ${selectedEdition} edition`
            }]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          const payer = order.payer.name;
          const status = selectedTier.name;
          const groupPart = customGroup ? `~${customGroup}` : '';
          const namePart = `.${payer.given_name}.${payer.surname}`;
          const serialPart = `#${generateSN()}`;
          setGeneratedAddress(`${status}${groupPart}${namePart}${serialPart}`);
          setPaymentComplete(true);
        },
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' }
      }).render(buttonRef.current);
    }
  }, [selectedTier, customGroup, totalPrice, selectedEdition]);

  useEffect(() => {
    const scriptId = 'paypal-sdk-script';
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;
      script.onload = () => setIsPaypalLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsPaypalLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isPaypalLoaded && selectedTier && !paymentComplete) {
      setTimeout(renderPayPalButtons, 100);
    }
  }, [isPaypalLoaded, selectedTier, renderPayPalButtons, paymentComplete, selectedEdition]);

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen bg-[#0a0a1a]">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HERO SECTION --- */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Claim Your Unique <br/>
            <span className="qmail-gradient-text">Decentralized Email Address</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Break free from Big Tech providers like Gmail or Outlook scanning your inbox and owning your data.
          </p>
          <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl inline-block">
            <p className="text-blue-400 font-bold italic">DMS is fully decentralized — no single company controls it.</p>
          </div>
        </header>

        {/* --- EXAMPLE ADDRESSES --- */}
        <section className="mb-20 bg-gray-900 p-8 rounded-[2rem] border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Info className="text-blue-400" /> Real-World Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {[
              "Giga~CEO-VivaTech.John.Doe#8D2P",
              "Bit~Go-49ers!.Laura.Croft#UYV4",
              "Mega~Developer.Ron.Wagner#CA93",
              "Kilo~的我大个.Wo.Chang#89RE"
            ].map((ex, i) => (
              <div key={i} className="bg-black p-4 rounded-xl border border-gray-800 text-gray-300 text-sm">
                {ex}
              </div>
            ))}
          </div>
        </section>

        {!paymentComplete ? (
          <div className="space-y-16">
            
            {/* --- ADDRESS FORMAT & SPAM PROTECTION --- */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 h-full">
                <h3 className="text-xl font-bold text-white mb-6">How DMS Addresses Work</h3>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p><b className="text-blue-400">Allegiance Level:</b> Your "domain" that signals commitment.</p>
                  <p><b className="text-purple-400">~ Self-Describer:</b> Optional! Identity, role, or personality (e.g., "CEO-VivaTech").</p>
                  <p><b className="text-white">. Name:</b> Pulled from your payment card name for verification.</p>
                  <p><b className="text-cyan-400"># Mailbox ID:</b> A unique random code for your address.</p>
                </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 h-full">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-yellow-500" /> Economic Anti-Spam
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  DMS requires a <b>refundable stake</b> to activate your address. 
                  This incentive makes high-volume abuse impractical while proving you are serious.
                </p>
                <div className="mt-6 p-4 bg-black rounded-xl border border-yellow-500/20 text-xs text-yellow-200">
                  "Higher stakes = higher trust. Legitimate professionals won't risk their reputation on spam".
                </div>
              </div>
            </div>

            {/* --- ALLEGIANCE TABLE --- */}
            <section className="bg-gray-900 rounded-[2rem] border border-gray-800 overflow-hidden">
              <div className="p-8 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Allegiance Levels & Status</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black text-gray-400 uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="p-5">Level</th>
                      <th className="p-5">Stake</th>
                      <th className="p-5">Status & Trust Signal</th>
                      <th className="p-5">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {tiers.map((t) => (
                      <tr key={t.name} className="hover:bg-black/50 transition-colors">
                        <td className={`p-5 font-bold ${t.color}`}>{t.name}</td>
                        <td className="p-5 font-mono text-white">${t.price}</td>
                        <td className="p-5 text-gray-300">{t.trust}</td>
                        <td className="p-5 text-gray-500 italic">{t.best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* --- SELECTION FORM --- */}
            <div className="bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-800 space-y-12">
              
              {/* STEP 1: TIER */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">1</span>
                  Select Your Allegiance Level
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {tiers.map((tier) => (
                    <button
                      key={tier.name}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 ${
                        selectedTier?.name === tier.name 
                          ? `bg-blue-600 border-blue-400 text-white shadow-xl scale-105` 
                          : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <tier.icon size={32} />
                      <div className="text-center font-bold uppercase tracking-widest text-xs">{tier.name}</div>
                      <div className="font-mono text-sm">${tier.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: EDITION SELECTOR */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-sm flex items-center justify-center font-mono">2</span>
                  Software Edition
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setSelectedEdition('free')}
                    className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${selectedEdition === 'free' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black border-gray-800 opacity-60'}`}
                  >
                    <Monitor className="text-blue-400" />
                    <div className="text-left">
                      <div className="font-bold text-white">Free Edition</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">Standard Client</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setSelectedEdition('pro')}
                    className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${selectedEdition === 'pro' ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-black border-gray-800 opacity-60'}`}
                  >
                    <HardDrive className="text-purple-400" />
                    <div className="text-left">
                      <div className="font-bold text-white">Pro Edition (+$10)</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">Runs on USB</div>
                    </div>
                  </button>
                  <div className="p-6 rounded-2xl border border-dashed border-gray-800 flex items-center gap-4 opacity-40 grayscale cursor-not-allowed">
                    <Smartphone className="text-gray-500" />
                    <div className="text-left">
                      <div className="font-bold text-gray-500">Mobile Edition</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold italic">Coming Soon</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: PREVIEW & CHECKOUT */}
              <AnimatePresence>
                {selectedTier && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pt-10 border-t border-gray-800">
                    <div className="grid md:grid-cols-2 gap-8 items-end">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Optional Self-Describer</label>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl text-gray-700 font-mono">~</span>
                          <input 
                            type="text" 
                            value={customGroup}
                            onChange={handleGroupChange}
                            placeholder="e.g. CEO-VivaTech"
                            className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-xl font-mono"
                          />
                        </div>
                      </div>
                      <div className="bg-black p-6 rounded-2xl border border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase block mb-2 font-bold tracking-widest">Address Preview</span>
                        <div className="text-lg md:text-xl font-mono text-white break-all">
                          <span className={selectedTier.color}>{selectedTier.name}</span>
                          {customGroup && <span className="text-purple-400">~{customGroup}</span>}
                          <span className="text-gray-400">.Your.Name</span>
                          <span className="text-cyan-500">#8D2P</span>
                        </div>
                      </div>
                    </div>

                    <div className="max-w-md mx-auto space-y-8 bg-black p-8 rounded-3xl border border-gray-800 shadow-2xl">
                      <div className="flex justify-between items-center font-black text-2xl text-white">
                        <span>Total Due:</span>
                        <span>${totalPrice}</span>
                      </div>
                      <div ref={buttonRef} className="w-full"></div>
                      <p className="text-[10px] text-gray-500 text-center leading-relaxed italic">
                        * Note that refunds are available up to 30 days after your purchase.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- PHASE INFO --- */}
            <div className="grid md:grid-cols-2 gap-6 pb-20">
              <div className="bg-gray-900 p-8 rounded-2xl border border-blue-500/20">
                <h4 className="font-black text-white mb-2 uppercase tracking-tighter">Phase I (Current)</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Your address is automatically published in the DRD. The First/Second words come directly from your card name.</p>
              </div>
              <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 opacity-60">
                <h4 className="font-black text-white mb-2 uppercase tracking-tighter">Phase II (Coming Soon)</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Edit your profile, add details, and customize your inbox presence.</p>
              </div>
            </div>
          </div>
        ) : (
          /* --- SUCCESS STATE --- */
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-900 p-12 rounded-[3rem] text-center space-y-8 border border-green-500/30">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-green-400">
              <Check size={48} />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Identity Claimed!</h2>
            <div className="bg-black p-8 rounded-3xl border border-gray-800 inline-block w-full max-w-2xl">
              <code className="text-2xl text-blue-400 font-mono break-all leading-relaxed">{generatedAddress}</code>
            </div>
            <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
              Your address is now active in the Distributed Resource Directory (DRD).
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <button onClick={() => window.location.reload()} className="bg-blue-600 px-12 py-4 rounded-full font-black text-white hover:bg-blue-500 transition-all">
                Access My Inbox
              </button>
              <button onClick={() => {navigator.clipboard.writeText(generatedAddress); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className="bg-gray-800 px-8 py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 border border-gray-700">
                {copied ? <Check size={18}/> : <Copy size={18}/>} {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegisterAddress;