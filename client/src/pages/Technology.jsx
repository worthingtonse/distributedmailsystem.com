import React, { memo } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { 
  FileCode, 
  Binary, 
  Shield, 
  Smartphone, 
  Zap, 
  Eye, 
  Lock, 
  Globe, 
  Server, 
  Database,
  CheckCircle2,
  XCircle,
  Cpu
} from 'lucide-react'

const Card = memo(({ children, className = "" }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    className={`relative bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 ${className}`}
  >
    {children}
  </m.div>
))

Card.displayName = 'Card'

// 3D Binary Encryption Visualization
const BinaryEncryptionAnimation = memo(() => {
  // Binary streams data
  const binaryStreams = [
    { id: 1, x: 20, y: 15, rotation: 45, color: 'text-blue-400', delay: 0 },
    { id: 2, x: 80, y: 20, rotation: -30, color: 'text-cyan-400', delay: 0.2 },
    { id: 3, x: 50, y: 75, rotation: 60, color: 'text-purple-400', delay: 0.4 },
    { id: 4, x: 15, y: 65, rotation: -45, color: 'text-green-400', delay: 0.6 },
  ]

  // Generate random binary strings
  const generateBinary = () => {
    return Array.from({ length: 8 }, () => Math.random() > 0.5 ? '1' : '0').join('')
  }

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto h-96 mb-12"
      style={{ 
        perspective: '1200px',
        perspectiveOrigin: 'center center'
      }}
    >
      {/* Central processor/encryption core */}
      <m.div
        className="absolute left-1/2 top-1/2 z-20"
        style={{
          transform: 'translate(-50%, -50%)',
          transformStyle: 'preserve-3d'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
        }}
        transition={{ 
          duration: 0.8,
          delay: 0.3
        }}
      >
        <m.div
          animate={{
            rotateY: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative">
            {/* Core cube */}
            <div className="glass-strong rounded-2xl p-8 shadow-2xl border-2 border-blue-500/30">
              <Cpu className="w-20 h-20 text-blue-400 mx-auto" />
              <p className="text-sm font-semibold text-center mt-2 text-blue-300">CBDF Engine</p>
            </div>
            
            {/* Pulsing encryption rings */}
            {[...Array(3)].map((_, i) => (
              <m.div
                key={i}
                className="absolute inset-0 rounded-2xl border-2 border-blue-400/30"
                animate={{
                  scale: [1, 1.3 + i * 0.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </m.div>
      </m.div>

      {/* Orbiting encryption shields */}
      {[...Array(4)].map((_, i) => {
        const angle = (i * 360) / 4;
        const radius = 150;
        
        return (
          <m.div
            key={`shield-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5
            }}
          >
            <m.div
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
              }}
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotateY: {
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
                <Lock className="w-8 h-8 text-purple-400" />
              </div>
            </m.div>
          </m.div>
        );
      })}

      {/* Binary data streams */}
      {binaryStreams.map((stream) => (
        <m.div
          key={stream.id}
          className="absolute"
          style={{
            left: `${stream.x}%`,
            top: `${stream.y}%`,
            transform: `translate(-50%, -50%) rotate(${stream.rotation}deg)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: stream.delay }}
        >
          <div className="flex flex-col gap-1">
            {[...Array(5)].map((_, i) => (
              <m.div
                key={i}
                className={`${stream.color} font-mono text-xs font-bold whitespace-nowrap`}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                {generateBinary()}
              </m.div>
            ))}
          </div>
        </m.div>
      ))}

      {/* Distributed server nodes */}
      {[
        { x: 10, y: 30, name: 'EU', color: 'blue', delay: 0.8 },
        { x: 90, y: 35, name: 'ASIA', color: 'cyan', delay: 1.0 },
        { x: 25, y: 85, name: 'US', color: 'purple', delay: 1.2 },
        { x: 75, y: 80, name: 'SA', color: 'green', delay: 1.4 },
      ].map((node) => (
        <m.div
          key={node.name}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: node.delay }}
        >
          <m.div
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`bg-${node.color}-500/20 backdrop-blur-sm rounded-lg p-3 border border-${node.color}-400/30`}>
              <Server className={`w-6 h-6 text-${node.color}-400 mx-auto mb-1`} />
              <p className="text-xs text-gray-300 font-semibold text-center">{node.name}</p>
            </div>
          </m.div>
        </m.div>
      ))}

      {/* Data packets traveling to nodes */}
      {[...Array(8)].map((_, i) => {
        const startX = 50 + (Math.random() - 0.5) * 10;
        const startY = 50 + (Math.random() - 0.5) * 10;
        const endX = [10, 90, 25, 75][i % 4];
        const endY = [30, 35, 85, 80][i % 4];
        
        return (
          <m.div
            key={`packet-${i}`}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
            }}
            animate={{
              left: [`${startX}%`, `${endX}%`, `${startX}%`],
              top: [`${startY}%`, `${endY}%`, `${startY}%`],
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        );
      })}

      {/* Quantum shield effect */}
      <m.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating tech particles */}
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 3;
        const colors = ['bg-blue-400', 'bg-purple-400', 'bg-cyan-400', 'bg-green-400'];
        
        return (
          <m.div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 ${colors[i % 4]} rounded-full`}
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: randomDelay,
              ease: "easeInOut"
            }}
          />
        );
      })}

      {/* Connection grid lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <linearGradient id="tech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.5)" />
          </linearGradient>
        </defs>
        
        {/* Lines from center to nodes */}
        {[
          [50, 50, 10, 30],
          [50, 50, 90, 35],
          [50, 50, 25, 85],
          [50, 50, 75, 80],
        ].map((coords, i) => (
          <m.line
            key={i}
            x1={`${coords[0]}%`}
            y1={`${coords[1]}%`}
            x2={`${coords[2]}%`}
            y2={`${coords[3]}%`}
            stroke="url(#tech-gradient)"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.6, 0] 
            }}
            transition={{ 
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  )
})

BinaryEncryptionAnimation.displayName = 'BinaryEncryptionAnimation'

function Technology() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20">
        
        {/* Header */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="text-white">Technology</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Deep Dive
                  </span>
                </h1>
              </m.div>

              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed"
              >
                Compact Binary Document Format (CBDF) & The Quantum Shield
              </m.p>

              {/* 3D Binary Encryption Animation */}
              <BinaryEncryptionAnimation />
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <m.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-red-500 pl-4">
                The Problem: Email is Stuck in the 1990s
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-red-500/20">
                  <div className="bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Database className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Bloat</h3>
                  <p className="text-gray-400">
                    HTML is text-based and verbose. A simple "Hello" is wrapped in kilobytes of styling tags, wasting storage and bandwidth.
                  </p>
                </Card>
                <Card className="border-red-500/20">
                  <div className="bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Inconsistency</h3>
                  <p className="text-gray-400">
                    Emails look different in Outlook, Gmail, and Apple Mail because every client renders code differently.
                  </p>
                </Card>
                <Card className="border-red-500/20">
                  <div className="bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Security Risks</h3>
                  <p className="text-gray-400">
                    HTML allows for tracking pixels, malicious scripts (XSS), and external resource loading that compromises privacy.
                  </p>
                </Card>
              </div>
            </m.div>
          </div>
        </section>

        {/* The Solution: CBDF */}
        <section className="py-20 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <m.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  The Solution: <span className="text-blue-400">CBDF</span>
                </h2>
                <p className="text-xl text-gray-300">
                  Compact Binary Document Format is a binary-first presentation layer designed specifically for the Distributed Mail ecosystem.
                </p>
              </m.div>

              <div className="space-y-12">
                {/* Advantage 1 */}
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Binary className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">1. Extreme Compression</h3>
                      <p className="text-gray-400 mb-4">
                        HTML requires opening and closing tags. CBDF uses binary tokens. A formatting instruction that takes 50 bytes in HTML might take only 2 bytes in CBDF.
                      </p>
                      <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                          <strong>Network Benefit:</strong> Reduces source file size by 80-90%, dramatically lowering CloudCoin storage costs and transmission time.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Advantage 2 */}
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">2. "Pixel-Perfect" Rendering</h3>
                      <p className="text-gray-400 mb-4">
                        CBDF works like a modernized, ultra-lightweight PDF. It looks exactly the same on a smartwatch, desktop, or mobile phone.
                      </p>
                      <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                        <p className="text-purple-300 text-sm">
                          <strong>Typography:</strong> Supports 65,000+ fonts ensuring magazine-quality typography without downloading heavy web-fonts.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Advantage 3 */}
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">3. Zero-Trust Security Model</h3>
                      <p className="text-gray-400 mb-4">
                        CBDF is strictly a document format. It cannot execute scripts, silently phone home, or run malicious code.
                      </p>
                      <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20">
                        <p className="text-green-300 text-sm">
                          <strong>Privacy by Default:</strong> No external CSS or images via HTTP means "tracking pixels" are technically impossible.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-white mb-12">Comparison: HTML vs. CBDF</h2>
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-6 text-gray-400 font-medium">Feature</th>
                    <th className="py-4 px-6 text-red-400 font-bold">Legacy HTML Email</th>
                    <th className="py-4 px-6 text-blue-400 font-bold">QMail CBDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="py-4 px-6 text-white">Data Type</td>
                    <td className="py-4 px-6 text-gray-400">Verbose Text (ASCII/UTF-8)</td>
                    <td className="py-4 px-6 text-blue-300 font-semibold">Compact Binary</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">File Size</td>
                    <td className="py-4 px-6 text-gray-400">Heavy (High bandwidth cost)</td>
                    <td className="py-4 px-6 text-blue-300 font-semibold">Ultra-Light (Minimal cost)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Rendering</td>
                    <td className="py-4 px-6 text-gray-400">Unpredictable (Varies by client)</td>
                    <td className="py-4 px-6 text-blue-300 font-semibold">100% Consistent</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Security</td>
                    <td className="py-4 px-6 text-gray-400">High Risk (Scripts, External Links)</td>
                    <td className="py-4 px-6 text-blue-300 font-semibold">Secure (No execution capability)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Privacy</td>
                    <td className="py-4 px-6 text-gray-400">Vulnerable to Tracking Pixels</td>
                    <td className="py-4 px-6 text-blue-300 font-semibold">Immune to Tracking</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Phase 2: Quantum Shield */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 font-semibold mb-4">
                  Phase 2 Technology
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">The Quantum Shield</h2>
                
                <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6 mb-12">
                  <h3 className="text-xl font-bold text-red-400 mb-2">The Looming Threat: "Harvest Now, Decrypt Later"</h3>
                  <p className="text-gray-400">
                    Hackers are already recording SSL/TLS encrypted traffic today. Once Quantum computers arrive, they will solve the math problems underlying current encryption instantly. Every recorded connection will be unlocked.
                  </p>
                </div>
              </m.div>

              <div className="grid gap-12">
                {/* DKE */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="text-yellow-400" />
                    Distributed Key Exchange (DKE)
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Unlike SSL, which relies on a math problem that can be solved, DKE relies on <strong className="text-white">network architecture</strong>.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-blue-400 font-bold mb-1">1. Split</div>
                      <div className="text-sm text-gray-400">Client generates a key and splits it into fragments.</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-purple-400 font-bold mb-1">2. Route</div>
                      <div className="text-sm text-gray-400">Fragments travel via London, Tokyo, and New York separately.</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-green-400 font-bold mb-1">3. Assemble</div>
                      <div className="text-sm text-gray-400">Recipient reassembles the key from different directions.</div>
                    </div>
                  </div>
                  
                  <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <p className="text-yellow-200/80">
                      <strong>Why it is Quantum Safe:</strong> Even if a hacker intercepts the traffic from the London server, they only get one fragment. Without the other fragments (which traveled via completely different routes), the key is mathematically impossible to reconstruct.
                    </p>
                  </Card>
                </div>

                {/* DRD */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Globe className="text-cyan-400" />
                    Distributed Resource Directory (DRD)
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Replacing centralized authorities like DNS and Certificate Authorities with a decentralized registry.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                      <div>
                        <strong className="text-white">User Registration:</strong>
                        <p className="text-gray-400">Register immutable Email Addresses (e.g., jane.doe@qmail).</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                      <div>
                        <strong className="text-white">Server Listing:</strong>
                        <p className="text-gray-400">Individuals can register their own independent servers to join the grid.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </LazyMotion>
  )
}

export default Technology