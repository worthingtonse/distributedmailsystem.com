import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ExternalLink, ShieldCheck, UserPlus, Code, Palette } from 'lucide-react';

const AdminLinkGen = () => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('10');
  const [bgColor, setBgColor] = useState('#0a0a1a'); // Default dark
  const [btnColor, setBtnColor] = useState('#3b82f6'); // Default blue
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  
  // const baseUrl = window.location.origin + "/access";
  const baseUrl = (import.meta.env.VITE_BASE_URL || window.location.origin) + "/access";
  // Encode colors for the URL (removing # for cleaner params)
  const generatedUrl = `${baseUrl}?recipient=${encodeURIComponent(name)}&cost=${cost}&bg=${bgColor.replace('#', '')}&btn=${btnColor.replace('#', '')}`;

  const toTitleCase = (str) => {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const influencerName = name || 'Influencer';
  const buttonText = toTitleCase(`Send Message To ${influencerName}`);

  const logoSvgWhite = `<svg width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="margin-right:12px; vertical-align:middle;">
    <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="6" />
    <path d="M 50 25 Q 70 25 70 45 Q 70 60 55 65 L 65 75" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" />
    <circle cx="50" cy="45" r="10" fill="white" />
  </svg>`;

  const embedCode = `<a href="${generatedUrl}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; padding:14px 28px; background:${btnColor}; color:#ffffff; font-family:'Inter', sans-serif; font-weight:700; font-size:16px; text-decoration:none; border-radius:50px; transition:all 0.2s ease; box-shadow:0 4px 15px rgba(0,0,0,0.3); border:none; cursor:pointer;" onmouseover="this.style.transform='scale(1.03)';" onmouseout="this.style.transform='scale(1)';">
  ${logoSvgWhite}
  <span>${buttonText}</span>
</a>`;

  const handleCopy = () => {
    if (!name) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4 text-blue-400 border border-blue-500/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Asset Generator</h1>
          <p className="text-gray-400 italic">Customize the landing page and generate influencer links</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Section */}
          <div className="lg:col-span-2 space-y-6 bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Influencer Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                  placeholder="e.g. Tabeen" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Message Cost (USD)</label>
                <input 
                  type="number" 
                  value={cost} 
                  onChange={(e) => setCost(e.target.value)} 
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 border-t border-gray-800 pt-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-2">
                  <Palette size={14}/> Page Background
                </label>
                <div className="flex items-center gap-3">
                   <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)} 
                    className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden" 
                  />
                   <code className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">{bgColor}</code>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-2">
                  <Palette size={14}/> Button Accent
                </label>
                <div className="flex items-center gap-3">
                   <input 
                    type="color" 
                    value={btnColor} 
                    onChange={(e) => setBtnColor(e.target.value)} 
                    className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden" 
                  />
                   <code className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">{btnColor}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-4">
            <button 
              disabled={!name} 
              onClick={handleCopy} 
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                name ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {copied ? <><Check size={18}/> Copied!</> : <><Copy size={18}/> Copy Direct Link</>}
            </button>
            <button 
              disabled={!name} 
              onClick={() => setShowEmbed(!showEmbed)} 
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                name ? 'bg-gradient-to-r from-blue-600 to-purple-500 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Code size={18} /> {showEmbed ? "Hide Embed Code" : "Embed Button"}
            </button>
            <a 
              href={name ? generatedUrl : "#"} 
              target="_blank" 
              rel="noreferrer" 
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                name ? 'border-gray-700 text-gray-400 hover:bg-white/5' : 'border-gray-800 text-gray-800 pointer-events-none'
              }`}
            >
              <ExternalLink size={14} /> Preview Page
            </a>
          </div>
        </div>

        {/* Embed Snippet Display */}
        <AnimatePresence>
          {showEmbed && name && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-black/80 rounded-3xl border border-blue-500/30 p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Button Embed Code</h3>
                <button 
                  onClick={() => { 
                    navigator.clipboard.writeText(embedCode); 
                    setCopiedEmbed(true); 
                    setTimeout(() => setCopiedEmbed(false), 2000); 
                  }} 
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                >
                  {copiedEmbed ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap bg-gray-900 p-4 rounded-xl border border-gray-800 leading-relaxed">
                {embedCode}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions for Team - RESTORED SECTION */}
        <div className="mt-12 bg-blue-500/5 border border-blue-500/10 p-8 rounded-3xl shadow-lg">
          <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
            <ShieldCheck size={20} /> Deployment Instructions
          </h4>
          <ol className="text-sm text-gray-400 space-y-4 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Configure Assets:</strong> Enter the influencer's name, set their required postage cost, and select their preferred brand colors.
            </li>
            <li>
              <strong>Direct Link:</strong> Copy the "Direct Link" for use in Instagram bios, Twitter profiles, or Linktree pages.
            </li>
            <li>
              <strong>Embed Button:</strong> Provide the "Embed Button" code to influencers with their own websites. They simply need to paste this HTML snippet into their site's code.
            </li>
            <li>
              <strong>The Result:</strong> When users click these assets, they are sent to a customized <strong>Verified Access</strong> landing page where they pay the postage to send a private message.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminLinkGen;