import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Mail, Download, Lock, Send, 
  Twitter, Facebook, Share2, ShieldCheck, Key, Paperclip, Loader2, Check
} from 'lucide-react';

const FunnelSuccess = () => {
  const { state } = useLocation();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const toTitleCase = (str) => {
    return str ? str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Connie Willis';
  };

  const recipientName = toTitleCase(state?.recipientName || 'Connie Willis');
  const userFirstName = state?.userData?.firstName || 'User';
  const referralLink = `https://distributedmailsystem.com/ref/${userFirstName.toLowerCase().replace(/\s+/g, '')}`;

  // Social Sharing Functions
  const shareOnX = () => {
    const text = encodeURIComponent(`I just joined the QMail movement! Get your gift of privacy and earn CloudCoins here:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      alert("Message Sent Securely via Distributed Mesh!");
      setIsSending(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen py-20 flex items-center justify-center p-6 bg-[#05050a] relative overflow-hidden">
      {/* Background elements preserved for consistency with /access */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] bg-purple-600 opacity-50"></div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Step 1 & 2: Main Area */}
        <div className="lg:col-span-8 space-y-8 text-left">
          {/* Success Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-5 mb-4">
               <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                  <CheckCircle2 size={32} />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight">Success!</h1>
                  <p className="text-gray-400 leading-tight">Your payment was successful. Welcome, {userFirstName}.</p>
               </div>
            </div>
            <p className="text-sm text-gray-400 ml-[76px]">
              You can now compose your message to <span className="text-white font-bold">{recipientName}</span> below.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 1. Your Assets */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                 <Key size={16} className="text-blue-400" /> 1. Your CloudCoins
              </h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">Your Locker Key has been texted to you.</p>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-blue-300 text-center tracking-wider">
                Locker Code: 8392-XXXX-XXXX-9921
              </div>
              <p className="text-[10px] text-gray-600 mt-4 uppercase font-bold tracking-widest italic">Keep this safe!</p>
            </div>

            {/* 2. Download Software */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                   <Download size={16} className="text-blue-400" /> 2. Download Software
                </h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  To use your coins and claim your custom email address, download the QMail Core.
                </p>
              </div>
              <button className="w-full py-5 px-2 bg-white/10 border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                <Download size={30} className="text-white" /> 
                Download for Windows/Mac/Linux
              </button>
            </div>
          </div>

          {/* Step 2: Message Composer */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-md">
            <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase tracking-widest text-sm">
              <Mail size={20} className="text-blue-400" /> Step 2: Compose Message
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <input 
                type="text" 
                placeholder="Subject Line" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-blue-500 transition-all text-sm shadow-inner"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <textarea 
                placeholder="Body Text" 
                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl px-6 py-6 text-white outline-none focus:border-blue-500 transition-all resize-none text-sm leading-relaxed"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button type="button" className="flex-1 py-5 border border-white/10 rounded-2xl text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                   <Paperclip size={16} /> Attach File
                </button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="flex-[1.5] py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 min-h-[3.5rem]"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="animate-spin" size={16}/> 
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} /> 
                      <span>Send Securely</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Viral Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-10 rounded-[40px] sticky top-20 text-left">
            <h3 className="text-2xl font-black text-white mb-4 uppercase leading-tight">Step 3: Viral Engine</h3>
            <p className="text-blue-400 font-bold mb-2 text-sm tracking-wide">Want to earn CloudCoins?</p>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Give your friends the gift of privacy. Refer a friend: Share the link below. If they buy a Beta Bundle, you get <span className="text-white font-bold">$10 in CloudCoins</span> and they get a bonus 50 coins.
            </p>
            
            <div className="space-y-6">
              <div className="p-5 bg-black/60 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Your Referral Link</p>
                <div className="flex items-center gap-3">
                   <code className="text-[10px] text-blue-400 truncate font-mono flex-1 min-w-0">{referralLink}</code>
                   <button 
                     onClick={handleCopyLink}
                     className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 shrink-0 relative"
                   >
                     {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16}/>}
                   </button>
                </div>
                {copied && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] text-green-400 font-medium mt-2 uppercase tracking-wide"
                  >
                    ✓ Copied to clipboard
                  </motion.div>
                )}
              </div>

              {/* Functional Social Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={shareOnX}
                  className="py-5 bg-black/40 border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/40 transition-all group"
                >
                   <Twitter size={18} className="text-[#1DA1F2]" /> Share on X
                </button>
                <button 
                  onClick={shareOnFacebook}
                  className="py-5 bg-black/40 border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#4267B2]/20 hover:border-[#4267B2]/40 transition-all group"
                >
                   <Facebook size={18} className="text-[#4267B2]" /> Share on Facebook
                </button>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-600">
               <ShieldCheck size={28} className="opacity-50" />
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Quantum Verification</p>
                 <p className="text-[9px] lowercase italic font-medium">Node connection active</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FunnelSuccess;