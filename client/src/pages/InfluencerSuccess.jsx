import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Download,
  Lock,
  Send,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Coins,
  ArrowRight,
  AtSign,
} from "lucide-react";

const InfluencerSuccess = () => {
  const { state } = useLocation();
  const [isProvisioning, setIsProvisioning] = useState(true);
  const [provisionStep, setProvisionStep] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedEmailLocker, setCopiedEmailLocker] = useState(false);
  const [copiedCloudCoins, setCopiedCloudCoins] = useState(false);

  // Debug: log the state
  console.log("InfluencerSuccess state:", state);

  // Extract data from state
  const userFirstName = state?.userData?.firstName || "User";
  const userLastName = state?.userData?.lastName || "";
  const recipientName = state?.recipientName || "the influencer";
  const influencerAddress = state?.influencerAddress || "";
  const paymentAmount = state?.paymentAmount || 0;
  const inboxFee = state?.inboxFee || 0;

  // Email data (if they created an address)
  const userEmail = state?.email || null;
  const emailLockerCode = state?.emailLockerCode || null;

  // CloudCoins data
  const cloudCoins = state?.cloudCoins || 0;
  const cloudCoinsLockerCode = state?.cloudCoinsLockerCode || "";

  // Provisioning Steps
  const steps = [
    "Generating Quantum-Safe Keys...",
    "Securing CloudCoins in Locker...",
    "Syncing with RAIDA Network...",
    "Finalizing Your Account...",
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

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="min-h-screen py-24 bg-[#05050a] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-600"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] bg-green-600 opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <AnimatePresence mode="wait">
          {isProvisioning ? (
            /* --- PROVISIONING ANIMATION --- */
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
                  className="w-32 h-32 rounded-full border-b-2 border-green-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck
                    size={48}
                    className="text-green-400 animate-pulse"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-4">
                Processing Payment
              </h2>
              <div className="h-6 overflow-hidden max-w-sm w-full mx-auto">
                <motion.p
                  key={provisionStep}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-green-400 font-mono text-sm"
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
              className="space-y-10"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-green-400 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                  Success, {userFirstName}!
                </h1>
                <p className="text-gray-400 text-lg">
                  You're ready to send a private message to <span className="text-white font-bold">{recipientName}</span>
                </p>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8">

                {/* Left Column: Email Address & Email Locker (if created) */}
                <div className="space-y-6">
                  {userEmail ? (
                    <>
                      {/* Email Address Card */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <AtSign size={14} /> Your New QMail Address
                        </h3>
                        <div className="bg-black/40 p-5 rounded-xl border border-white/5 mb-4">
                          <code className="text-lg md:text-xl text-white font-mono break-all">
                            {userEmail}
                          </code>
                        </div>
                        <button
                          onClick={() => handleCopy(userEmail, setCopiedEmail)}
                          className="w-full px-6 py-3 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all"
                        >
                          {copiedEmail ? <Check size={18} /> : <Copy size={18} />}
                          {copiedEmail ? "Copied!" : "Copy Address"}
                        </button>
                      </div>

                      {/* Email Locker Code */}
                      <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 p-6 rounded-[2rem]">
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Key size={14} /> Email Locker Code
                        </h3>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-3">
                          <code className="text-lg text-purple-400 font-mono break-all">
                            {emailLockerCode}
                          </code>
                        </div>
                        <button
                          onClick={() => handleCopy(emailLockerCode, setCopiedEmailLocker)}
                          className="w-full px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-600/30 transition-all"
                        >
                          {copiedEmailLocker ? <Check size={16} /> : <Copy size={16} />}
                          {copiedEmailLocker ? "Copied!" : "Copy Code"}
                        </button>
                        <p className="text-xs text-gray-500 mt-3">
                          This code will allow your QMail client to download the credentials to your mail from a virtual locker. You will be prompted to enter this code the first time you start the QMail Client.
                        </p>
                      </div>
                    </>
                  ) : (
                    /* No email created */
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
                      <div className="text-center py-8">
                        <Mail size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Email Address Created</h3>
                        <p className="text-sm text-gray-500">
                          You chose not to create a QMail address. You can still send messages to {recipientName} using the QMail Client.
                        </p>
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all"
                        >
                          Create an Address Later <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Recipient Info */}
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Sending To
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Send size={20} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{recipientName}</p>
                        <p className="text-xs text-gray-500 font-mono">{influencerAddress}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                      <p>Inbox Fee: <span className="text-white">${inboxFee}</span> ({inboxFee * 10} CloudCoins)</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: CloudCoins Locker & Next Steps */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-xl border border-green-500/20 p-8 rounded-[2rem]">
                    <h3 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Coins size={14} /> Your CloudCoins Locker Code
                    </h3>
                    <div className="bg-black/40 p-5 rounded-xl border border-white/5 mb-4">
                      <code className="text-xl md:text-2xl text-green-400 font-mono break-all">
                        {cloudCoinsLockerCode}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(cloudCoinsLockerCode, setCopiedCloudCoins)}
                      className="w-full px-6 py-3 bg-green-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-500 transition-all"
                    >
                      {copiedCloudCoins ? <Check size={18} /> : <Copy size={18} />}
                      {copiedCloudCoins ? "Copied!" : "Copy Locker Code"}
                    </button>
                    <div className="mt-4 p-4 bg-black/30 rounded-xl">
                      <p className="text-sm text-gray-400">
                        <span className="text-white font-bold">{cloudCoins} CloudCoins</span> (${paymentAmount} value)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your QMail Client will use this key to access a virtual locker and download CloudCoins into your program. This can only be used one time.
                      </p>
                    </div>
                  </div>

                  {/* What's Next */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-4">
                      Next Steps
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">1</div>
                        <p className="text-sm text-gray-300">Download the QMail Client software below</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">2</div>
                        <p className="text-sm text-gray-300">Enter your Email Locker Code when the program prompts you at the first startup</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">3</div>
                        <p className="text-sm text-gray-300">Enter your CloudCoins Locker Code into the wallet part of the QMail Client to download your credits</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">4</div>
                        <p className="text-sm text-gray-300">Compose and send your message to <span className="text-white font-mono">{influencerAddress}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/20 p-8 rounded-[2rem]">
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center">
                    <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                      <Download size={18} className="text-blue-400" /> Download QMail Client
                    </h3>
                    <p className="text-sm text-gray-400">
                      Get the desktop client to send your message and manage your CloudCoins.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="/downloads/qmail.for.windows.zip"
                      download
                      className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-gray-200 transition-all flex items-center gap-3"
                    >
                      <Download size={20} /> Windows
                    </a>
                    <a
                      href="/downloads/qmail.for.macs.zip"
                      download
                      className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-gray-200 transition-all flex items-center gap-3"
                    >
                      <Download size={20} /> Mac
                    </a>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-gray-500 text-xs">
                  <Lock size={12} />
                  <span className="font-bold uppercase tracking-widest">End-to-End Quantum Safe Encryption</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InfluencerSuccess;
