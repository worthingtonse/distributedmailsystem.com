import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Download,
  Lock,
  Send,
  Share2,
  ShieldCheck,
  Key,
  Loader2,
  Check,
  Copy,
  Globe,
  Zap,
  Server,
  Users,
  Target,
  GraduationCap,
  Settings,
  DollarSign,
  AtSign,
} from "lucide-react";

const FunnelSuccess = () => {
  const { state } = useLocation();
  const [isProvisioning, setIsProvisioning] = useState(true);
  const [provisionStep, setProvisionStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Real-time setup state
  const [inboxFee, setInboxFee] = useState("10");
  const [definer, setDefiner] = useState(state?.definer || "Verified User");

  const userAddress = state?.generatedAddress || "Mega~User.Name#7D2P";
  const userFirstName = state?.userData?.firstName || "User";

  // Provisioning Simulation
  const steps = [
    "Generating Quantum-Safe Keys...",
    "Sharding Identity across 32 Global Nodes...",
    "Syncing Distributed Resource Directory (DRD)...",
    "Finalizing Decentralized Inbox...",
  ];

  useEffect(() => {
    if (provisionStep < steps.length) {
      const timer = setTimeout(
        () => setProvisionStep((prev) => prev + 1),
        1200
      );
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setIsProvisioning(false), 800);
    }
  }, [provisionStep]);

  const handleCopy = () => {
    navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discoveryLinks = [
    {
      title:
        "Run your own Qmail server from home (optional) and get paid for it!",
      icon: Server,
      color: "text-green-400",
    },
    {
      title: "Turbocharge your Influencer Income.",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      title:
        "Include your entire organization and keep your privacy (Enterprise Solutions).",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Marketers: Pay your customers to read your messages.",
      icon: Target,
      color: "text-purple-400",
    },
    {
      title:
        "Become a Certified QMail Secure User, Qmail Server Administration, QMail Marketing or even a Certified QMail Developer.",
      icon: GraduationCap,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen py-24 bg-[#05050a] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-600"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] bg-purple-600 opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {isProvisioning ? (
            /* --- REAL TIME PROVISIONING EXPERIENCE --- */
            <motion.div
              key="provisioning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-full border-b-2 border-blue-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck
                    size={48}
                    className="text-blue-400 animate-pulse"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-4">
                Provisioning Identity
              </h2>
              <div className="h-6 overflow-hidden max-w-sm w-full mx-auto">
                <motion.p
                  key={provisionStep}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-blue-400 font-mono text-sm"
                >
                  {steps[provisionStep]}
                </motion.p>
              </div>
            </motion.div>
          ) : (
            /* --- SUCCESS CONTENT --- */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-green-400 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tighter">
                  Success, {userFirstName}!
                </h1>
                <p className="text-gray-400">
                  Your decentralized identity is now live on the mesh.
                </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Side: Identity & Controls */}
                <div className="lg:col-span-7 space-y-8">
                  {/* The Address Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 whitespace-nowrap">
                      <AtSign size={14} /> Your Copy-Paste Address
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                      <code className="text-xl md:text-2xl text-white font-mono flex-1 break-all text-center md:text-left">
                        {userAddress}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest text-center md:text-left italic">
                      Copy and paste this into your email client to start
                      sending private messages.
                    </p>
                  </div>

                  {/* Real-Time Config Card */}
                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-blue-500/20 p-8 rounded-[2.5rem]">
                    <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-8 flex items-center gap-2 whitespace-nowrap">
                      <Settings size={14} /> Quick Setup (Live Updates)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Input Group 1 */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest flex items-center h-6 mb-2 whitespace-nowrap">
                          Global Inbox Fee
                        </label>
                        <div className="relative group">
                          <DollarSign
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors"
                            size={16}
                          />
                          <input
                            type="number"
                            value={inboxFee}
                            onChange={(e) => setInboxFee(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:border-blue-500 outline-none transition-all shadow-inner"
                          />
                        </div>

                        <p className="text-[10px] text-gray-500 italic mt-2 min-h-[1.5rem]">
                          Strangers pay this to reach you.
                        </p>
                      </div>

                      {/* Input Group 2 */}
                      <div className="flex flex-col">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest flex items-center h-6 mb-2 whitespace-nowrap">
                          Identify Yourself
                        </label>

                        <div className="relative group">
                          <AtSign
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors"
                            size={16}
                          />
                          <input
                            type="text"
                            value={definer}
                            onChange={(e) => setDefiner(e.target.value)}
                            placeholder="e.g. Lead Developer"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:border-purple-500 outline-none transition-all shadow-inner"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-2 min-h-[1.5rem]">
                          Visible in the Global Directory.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Software Download */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-white font-bold mb-2 flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-xs">
                        <Download size={16} className="text-blue-400" /> Core
                        Software
                      </h3>
                      <p className="text-sm text-gray-400">
                        Claim your full inbox and manage coins with the native
                        client.
                      </p>
                    </div>
                    <button className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2">
                      <Download size={18} /> Download for OS
                    </button>
                  </div>
                </div>

                {/* Right Side: Next Steps & Links */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem]">
                    <h3 className="text-lg font-black text-white mb-8 uppercase tracking-tighter">
                      What's Next?
                    </h3>
                    <div className="space-y-4">
                      {discoveryLinks.map((link, i) => (
                        <motion.a
                          key={i}
                          href="#"
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(255,255,255,0.05)",
                          }}
                          className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 transition-all group"
                        >
                          <div
                            className={`p-3 rounded-xl bg-white/5 ${link.color} group-hover:bg-white/10`}
                          >
                            <link.icon size={20} />
                          </div>
                          <span className="text-sm text-gray-400 group-hover:text-white transition-colors leading-relaxed">
                            {link.title}
                          </span>
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  {/* Viral Referral */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-[2.5rem] shadow-xl">
                    <h4 className="font-black text-white uppercase tracking-widest text-xs mb-2">
                      Viral Referral Engine
                    </h4>
                    <p className="text-sm text-blue-100 mb-6">
                      Refer a friend and get $10 in CloudCoins credited to your
                      locker instantly.
                    </p>
                    <button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <Share2 size={16} /> Share Referral Link
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FunnelSuccess;
