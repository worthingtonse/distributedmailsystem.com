import React, { memo } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  FileText,
  Shield,
  Zap,
  Lock,
  Globe,
  Server,
  Cpu,
  Database,
  CheckCircle2,
  TrendingUp,
  Key,
  Layers,
  Activity,
  Binary,
  Network,
  Sparkles,
} from "lucide-react";

// Enhanced Card Component with animations
const Card = memo(({ children, delay = 0, className = "" }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px", amount: 0.2 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`relative group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
        {children}
      </div>
    </m.div>
  );
});

Card.displayName = "Card";

// 3D Floating Document Animation for Hero Section
const FloatingDocumentsAnimation = memo(() => {
  const documents = [
    { size: 60, x: 15, y: 25, z: 0, delay: 0, color: 'from-blue-400 to-cyan-400', icon: FileText },
    { size: 50, x: 80, y: 20, z: 50, delay: 0.2, color: 'from-purple-400 to-pink-400', icon: Shield },
    { size: 70, x: 25, y: 70, z: 100, delay: 0.4, color: 'from-cyan-400 to-blue-400', icon: Lock },
    { size: 55, x: 75, y: 65, z: 30, delay: 0.6, color: 'from-pink-400 to-purple-400', icon: Server },
    { size: 45, x: 35, y: 40, z: 70, delay: 0.8, color: 'from-blue-400 to-purple-400', icon: Binary },
    { size: 65, x: 65, y: 45, z: 20, delay: 1.0, color: 'from-cyan-400 to-pink-400', icon: Network },
  ];

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-96 mb-12"
      style={{ 
        perspective: '1000px',
        perspectiveOrigin: 'center center'
      }}
    >
      {/* Central large document */}
      <m.div
        className="absolute left-1/2 top-1/2 z-20"
        style={{
          transform: 'translate(-50%, -50%)',
          transformStyle: 'preserve-3d'
        }}
        initial={{ scale: 0, opacity: 0, rotateY: -180 }}
        animate={{ 
          scale: 1,
          opacity: 1,
          rotateY: 0
        }}
        transition={{ 
          scale: { duration: 0.8, delay: 0.3 },
          opacity: { duration: 0.8, delay: 0.3 },
          rotateY: { duration: 1.2, delay: 0.5 }
        }}
      >
        <div className="glass-strong rounded-3xl p-8 text-center shadow-2xl">
          <FileText className="w-24 h-24 text-blue-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-blue-300">Whitepaper</div>
        </div>
      </m.div>

      {/* Floating documents around */}
      {documents.map((doc, i) => {
        const IconComponent = doc.icon;
        return (
          <m.div
            key={i}
            className="absolute"
            style={{
              left: `${doc.x}%`,
              top: `${doc.y}%`,
              transform: 'translate(-50%, -50%)',
              transformStyle: 'preserve-3d',
            }}
            initial={{ 
              scale: 0, 
              opacity: 0,
              rotateY: -90,
              z: doc.z
            }}
            animate={{ 
              scale: 1, 
              opacity: 0.7,
              rotateY: 0,
              y: [0, -10, 0],
            }}
            transition={{ 
              scale: { duration: 0.6, delay: doc.delay },
              opacity: { duration: 0.6, delay: doc.delay },
              rotateY: { duration: 0.8, delay: doc.delay + 0.2 },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: doc.delay + 1
              }
            }}
          >
            <div 
              className={`glass rounded-2xl p-4 bg-gradient-to-r ${doc.color} shadow-lg`}
              style={{
                fontSize: `${doc.size}px`,
                transform: `translateZ(${doc.z}px)`
              }}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </m.div>
        );
      })}
    </div>
  );
});

FloatingDocumentsAnimation.displayName = "FloatingDocumentsAnimation";

// Animated Architecture Card
const ArchitectureCard = memo(({ arch, index, delay = 0 }) => {
  return (
    <Card delay={delay}>
      <m.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <m.div 
          className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400"
          initial={{ rotate: -180, opacity: 0 }}
          whileInView={{ rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
        >
          <arch.icon size={28} />
        </m.div>
        <h3 className="text-2xl font-bold text-white mb-4">{arch.title}</h3>
        <p className="text-gray-400 mb-6">{arch.description}</p>
        <m.div 
          className="p-4 bg-black/40 rounded-xl border border-white/5 text-sm text-gray-500 italic"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 0.4 }}
        >
          {arch.details}
        </m.div>
      </m.div>
    </Card>
  );
});

ArchitectureCard.displayName = "ArchitectureCard";

// Animated Encryption Layer
const EncryptionLayer = memo(({ layer, index, delay = 0 }) => {
  return (
    <Card delay={delay}>
      <m.div 
        className="flex items-start gap-4"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <m.div 
          className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
        >
          <Lock size={20} />
        </m.div>
        <div>
          <m.h4 
            className="text-xl font-bold text-white mb-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: delay + 0.2 }}
          >
            {layer.title}
          </m.h4>
          <m.p 
            className="text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: delay + 0.3 }}
          >
            {layer.text}
          </m.p>
        </div>
      </m.div>
    </Card>
  );
});

EncryptionLayer.displayName = "EncryptionLayer";

// Animated Spec Row
const SpecRow = memo(({ spec, index, delay = 0 }) => {
  return (
    <m.tr
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="hover:bg-white/5 transition-colors"
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <td className="p-4 md:p-6 text-gray-400 font-medium">{spec.label}</td>
      <td className="p-4 md:p-6 text-blue-400 font-mono text-sm">{spec.value}</td>
    </m.tr>
  );
});

SpecRow.displayName = "SpecRow";

function Whitepaper() {
  const architectures = [
    {
      icon: Server,
      title: "RAID-Style Distribution",
      description: "Messages are split into 2-32 encrypted fragments (stripes) and distributed across independent global mail servers.",
      details: "Reassembly requires all stripes and knowledge of their correct order (32! combinations), which no single server possesses.",
    },
    {
      icon: Shield,
      title: "Quantum-Safe Key Exchange",
      description: "Establishment of session keys using protocols designed to resist attacks from both classical and quantum computers.",
      details: "Layered with AES-256 per-stripe encryption and a final transposition cipher barrier.",
    },
    {
      icon: Cpu,
      title: "CBDF Optimization",
      description: "Compact Binary Document Format replaces HTML/CSS, reducing message sizes by up to 99%.",
      details: "A $4,000 DMS server handles the same load as a $40,000 SMTP server due to binary efficiency.",
    },
  ];

  const encryptionLayers = [
    { title: "Layer 1: Per-Stripe AES-256", text: "Each stripe is independently encrypted with a unique key, creating up to 32 separate cryptographic barriers." },
    { title: "Layer 2: QKE Protocol", text: "Quantum-Safe Key Exchange establishment that remains secure against future quantum computing capabilities." },
    { title: "Layer 3: Transposition Cipher", text: "Even if stripes are decrypted, the order must be determined from 2.6 × 10^35 possible permutations." },
  ];

  const economicFeatures = [
    "Recipients set 'tip' prices for unknown senders.",
    "Whitelisted contacts (friends/family) bypass payments.",
    "Server operators earn a percentage of transaction fees.",
    "Prohibitive fees filter low-value mass marketing messages.",
  ];

  const technicalSpecs = [
    { label: "Encryption", value: "AES-256 (Stripes) & Post-Quantum KE" },
    { label: "Stripe Count", value: "2-32 Configurable Fragments" },
    { label: "Protocol", value: "Binary TCP (RAIDA Ports 50000-50024)" },
    { label: "Message Format", value: "CBDF (Compact Binary Document Format)" },
    { label: "Storage", value: "Local SQLite & Sharded Global Network" },
    { label: "Payment", value: "CloudCoin Micropayment Integration" },
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />
          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-4xl mx-auto text-center">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <m.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FileText size={14} /> Technical Summary
                </m.div>
                <h1 className="text-4xl md:text-7xl font-bold text-white mb-6">
                  The QMail <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Whitepaper
                  </span>
                </h1>
                <m.p 
                  className="text-xl text-gray-400 leading-relaxed mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  A fundamental reimagining of email architecture. Privacy guaranteed by mathematics—not policy.
                </m.p>
              </m.div>

              {/* 3D Floating Documents Animation */}
              <FloatingDocumentsAnimation />
            </div>
          </div>
        </section>

        {/* Core Architecture */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Core{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Architecture
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Three fundamental innovations that make QMail mathematically impossible to compromise
              </p>
            </m.div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {architectures.map((arch, i) => (
                <ArchitectureCard 
                  key={i} 
                  arch={arch} 
                  index={i}
                  delay={i * 0.2}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Encryption Stack */}
        <section className="py-20 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Encryption{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Stack
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Multiple layers of cryptographic protection that compound exponentially
                </p>
              </m.div>
              <div className="space-y-6">
                {encryptionLayers.map((layer, i) => (
                  <EncryptionLayer 
                    key={i} 
                    layer={layer} 
                    index={i}
                    delay={i * 0.2}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Economic Model */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <m.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  Economic Model:{' '}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Attention Payments
                  </span>
                </h2>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                  QMail introduces CloudCoin micropayments to solve the spam problem at its root. 
                  By assigning measurable value to attention, we create a self-regulating marketplace.
                </p>
                <ul className="space-y-4">
                  {economicFeatures.map((item, i) => (
                    <m.li 
                      key={i} 
                      className="flex items-center gap-3 text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <CheckCircle2 className="text-green-400 shrink-0" size={20} />
                      {item}
                    </m.li>
                  ))}
                </ul>
              </m.div>
              <m.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10">
                  <m.div 
                    className="text-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <m.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                    </m.div>
                    <h3 className="text-2xl font-bold text-white mb-4">Marketplace of Attention</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Spam becomes economically impossible when every message costs the sender currency 
                      that is paid directly to the receiver or the supporting infrastructure nodes.
                    </p>
                  </m.div>
                </Card>
              </m.div>
            </div>
          </div>
        </section>

        {/* Technical Specs Table */}
        <section className="py-20 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-6">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Technical{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Specifications
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Complete technical overview of QMail's implementation details
                </p>
              </m.div>
              <m.div 
                className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-800">
                    {technicalSpecs.map((spec, i) => (
                      <SpecRow 
                        key={i} 
                        spec={spec} 
                        index={i}
                        delay={i * 0.1}
                      />
                    ))}
                  </tbody>
                </table>
              </m.div>
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}

export default Whitepaper;