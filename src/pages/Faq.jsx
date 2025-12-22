import React, { useState, memo } from 'react'
import { motion, LazyMotion, domAnimation, m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ChevronDown,
  ChevronUp,
  Shield,
  Server,
  Bell,
  Coins,
  Lock,
  Users,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  DollarSign,
  FileText,
  Cpu,
  HelpCircle
} from 'lucide-react'

// Reusable Card Component
const Card = memo(({ children, delay = 0 }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px", amount: 0.2 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
        {children}
      </div>
    </m.div>
  )
})

Card.displayName = 'Card'

// FAQ Item Component
const FAQItem = memo(({ question, answer, delay = 0, isOpen, onToggle }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, delay }}
      className="border border-gray-700/50 rounded-xl bg-gray-900/30 hover:bg-gray-900/50 transition-all duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex justify-between items-center hover:text-blue-400 transition-colors"
      >
        <h3 className="text-lg md:text-xl font-semibold text-white pr-4">{question}</h3>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-6 h-6 text-blue-400" />
        </m.div>
      </button>
      
      <m.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6">
          <div className="text-gray-400 leading-relaxed space-y-4">
            {answer}
          </div>
        </div>
      </m.div>
    </m.div>
  )
})

FAQItem.displayName = 'FAQItem'

// Phase Card Component
const PhaseCard = memo(({ phase, title, status, description, features, delay = 0 }) => {
  const statusColors = {
    'Current': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Coming Soon': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Future': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }

  return (
    <Card delay={delay}>
      <div className="text-center">
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${statusColors[status]} mb-3`}>
            {status}
          </span>
          <h3 className="text-2xl font-bold text-white mb-2">Phase {phase}</h3>
          <h4 className="text-xl text-blue-400 font-semibold">{title}</h4>
        </div>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
})

PhaseCard.displayName = 'PhaseCard'

// 3D Floating Question Marks Animation
// 3D Floating Question Marks Animation
const FloatingQuestionsAnimation = memo(() => {
  // Generate question marks with 3D positioning
  const questionMarks = [
    { size: 80, x: 15, y: 20, z: 0, delay: 0, color: 'from-blue-400 to-cyan-400' },
    { size: 60, x: 75, y: 15, z: 50, delay: 0.2, color: 'from-purple-400 to-pink-400' },
    { size: 90, x: 40, y: 60, z: 100, delay: 0.4, color: 'from-cyan-400 to-blue-400' },
    { size: 70, x: 85, y: 55, z: 30, delay: 0.6, color: 'from-pink-400 to-purple-400' },
    { size: 50, x: 25, y: 80, z: 70, delay: 0.8, color: 'from-blue-400 to-purple-400' },
    { size: 65, x: 60, y: 35, z: 20, delay: 1.0, color: 'from-cyan-400 to-pink-400' },
  ]

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-96 mb-12"
      style={{ 
        perspective: '1000px',
        perspectiveOrigin: 'center center'
      }}
    >
      {/* Central large question mark */}
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
          rotateY: 360
        }}
        transition={{ 
          scale: { duration: 0.6, delay: 0.3 },
          opacity: { duration: 0.6, delay: 0.3 },
          rotateY: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }
        }}
      >
        <div className="glass-strong rounded-3xl p-8 text-center shadow-2xl">
          <HelpCircle className="w-24 h-24 text-blue-400 mx-auto" />
        </div>
      </m.div>

      {/* Floating question marks around */}
      {questionMarks.map((qm, i) => (
        <m.div
          key={i}
          className="absolute"
          style={{
            left: `${qm.x}%`,
            top: `${qm.y}%`,
            transform: 'translate(-50%, -50%)',
            transformStyle: 'preserve-3d',
          }}
          initial={{ 
            scale: 0, 
            opacity: 0
          }}
          animate={{ 
            scale: 1, 
            opacity: 0.6,
          }}
          transition={{ 
            scale: { duration: 0.6, delay: qm.delay },
            opacity: { duration: 0.6, delay: qm.delay }
          }}
        >
          <m.div
            animate={{
              rotateX: 360,
              rotateY: 180,
              y: [-10, 10, -10],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              rotateX: {
                duration: 8 + i,
                repeat: Infinity,
                ease: "linear"
              },
              rotateY: {
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "linear"
              },
              y: {
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: {
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div 
              className={`bg-gradient-to-br ${qm.color} rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-lg`}
              style={{
                width: qm.size,
                height: qm.size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle 
                className="text-white"
                style={{ width: qm.size * 0.6, height: qm.size * 0.6 }}
              />
            </div>
          </m.div>
        </m.div>
      ))}

      {/* Animated connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(147, 51, 234, 0.5)" />
          </linearGradient>
        </defs>
        {questionMarks.slice(0, 4).map((qm, i) => (
          <m.line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${qm.x}%`}
            y2={`${qm.y}%`}
            stroke="url(#gradient)"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.5, 0] 
            }}
            transition={{ 
              duration: 3,
              delay: qm.delay + 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => {
        const randomX = Math.random() * 100
        const randomY = Math.random() * 100
        const randomDelay = Math.random() * 2
        
        return (
          <m.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              delay: randomDelay,
              ease: "easeInOut"
            }}
          />
        )
      })}
    </div>
  )
})

FloatingQuestionsAnimation.displayName = 'FloatingQuestionsAnimation'

function FAQ() {
  const [openItems, setOpenItems] = useState(new Set([0])) // First item open by default

  const toggleItem = (index) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const developmentPhases = [
    {
      phase: 1,
      title: 'The Core',
      status: 'Current',
      description: 'The foundation is operational. You can send "shredded" emails across our distributed network.',
      features: [
        'Send striped emails across 5+ servers',
        'Automatically generated email addresses',
        'All standards, protocols, and APIs released',
        'Developer documentation available'
      ]
    },
    {
      phase: 2,
      title: 'The Security Upgrade',
      status: 'Coming Soon',
      description: 'Advanced quantum-safe security and decentralized directory services.',
      features: [
        'Distributed Key Exchange (quantum-safe)',
        'Distributed Resource Directory',
        'Custom email address registration',
        'Independent server listing'
      ]
    },
    {
      phase: 3,
      title: 'The Efficiency Revolution',
      status: 'Future',
      description: 'CBDF integration for ultra-efficient, rich-formatted messaging.',
      features: [
        'Compact Binary Document Format',
        '65,000+ font support',
        '90% smaller message sizes',
        'Advanced formatting options'
      ]
    }
  ]

  const faqData = [
    {
      category: 'Development',
      icon: Cpu,
      items: [
        {
          question: 'What stage of development is QMail in?',
          answer: (
            <div>
              <p>We are currently in Phase 1 of a 3-Phase rollout:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><strong className="text-white">Phase 1 (Current):</strong> The Core is operational. Send shredded emails across 5+ servers with auto-generated addresses.</li>
                <li><strong className="text-white">Phase 2 (Next):</strong> Distributed Key Exchange and Resource Directory for custom addresses and quantum-safe security.</li>
                <li><strong className="text-white">Phase 3 (Future):</strong> CBDF integration for ultra-compact, rich-formatted messages.</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      category: 'Privacy & Servers',
      icon: Shield,
      items: [
        {
          question: 'How is QMail different from encrypted email services like ProtonMail?',
          answer: (
            <div>
              <p>ProtonMail and similar services encrypt email, but they still store your complete messages in one place. Here's why QMail is fundamentally different:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-gray-800/50 rounded p-3">
                  <p><strong className="text-blue-400">Traditional Encrypted Email:</strong> Your message is locked in a box (encrypted), but the whole box sits in one data center. Hackers target the box, governments subpoena the box, and the company can still see metadata (who you email, when, how often).</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">QMail:</strong> We don't just lock the box—we shred the contents into puzzle pieces, encrypt each piece separately, and scatter them across independent servers worldwide. No complete message exists anywhere. Even if someone hacked every server, they'd only have encrypted fragments.</p>
                </div>
              </div>
              <p className="mt-4">Think of it this way: ProtonMail is a safe in one location. QMail is 25 pieces of a treasure map buried on different continents.</p>
            </div>
          )
        },
        {
          question: 'Who owns/controls the servers?',
          answer: (
            <div>
              <p>This is where QMail's true power shines:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">No Single Owner:</strong> The network is composed of independently operated servers around the world. No one company, government, or entity controls them all.</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">Your Choice:</strong> You choose which servers to trust. Want to only use servers in privacy-respecting countries? You can. Want to use your friend's server? You can do that too.</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                  <p><strong className="text-purple-400">Run Your Own:</strong> The ultimate control—operate your own server and get paid directly for providing email services to others.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          question: 'Can I run my own server?',
          answer: (
            <div>
              <p><strong className="text-green-400">Absolutely!</strong> This is one of the core features of the distributed model.</p>
              <div className="mt-4 space-y-3">
                <p><strong className="text-white">Economic Advantage:</strong> The DMS protocol is so efficient that a $2K server does the same work as a $20K server in a tech giant's data center.</p>
                <p><strong className="text-blue-400">Direct Income:</strong> Get paid directly for providing email services to others.</p>
                <p><strong className="text-purple-400">Full Control:</strong> Own your data, set your policies, choose your users.</p>
              </div>
              <p className="mt-4">Server setup documentation and support will be available as we progress through Phase 2.</p>
            </div>
          )
        },
        {
          question: 'Is QMail compatible with existing email?',
          answer: (
            <div>
              <p>QMail represents a fundamental departure from traditional email protocols, but we're building bridges:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">Phase 1:</strong> QMail-to-QMail communication works natively</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">Future Phases:</strong> Gateway services will allow controlled interaction with traditional email systems</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <p><strong className="text-yellow-400">Migration Tools:</strong> Import your contacts and essential data from existing email providers</p>
                </div>
              </div>
              <p className="mt-4">The goal is to create a superior alternative that people <em>want</em> to switch to, not force compatibility with broken systems.</p>
            </div>
          )
        }
      ]
    },
    {
      category: 'Economics & Monetization',
      icon: DollarSign,
      items: [
        {
          question: 'How does the "get paid for email" model work?',
          answer: (
            <div>
              <p>QMail flips traditional email economics on its head:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">Friends Email Free:</strong> People on your whitelist can email you at no cost, just like always.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">Strangers Pay:</strong> Anyone not on your list must attach a small payment (you set the price—$0.01, $1, or $100). If you don't want their message, you keep the money. If you do want it, you can whitelist them for future free communication.</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                  <p><strong className="text-purple-400">Spam Becomes Profitable:</strong> Every unwanted email puts money in your pocket instead of wasting your time.</p>
                </div>
              </div>
              <p className="mt-4">This single change makes spam economically impossible while turning your inbox into an asset.</p>
            </div>
          )
        },
        {
          question: 'What currency is used for payments?',
          answer: (
            <div>
              <p>QMail is powered by <strong className="text-cyan-400">CloudCoin</strong>, a quantum-safe digital currency designed specifically for fast, secure microtransactions.</p>
              <div className="mt-4 space-y-3">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                  <p><strong className="text-cyan-400">Why CloudCoin?</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Instant transactions (no blockchain delays)</li>
                    <li>Zero transaction fees</li>
                    <li>Quantum-safe by design</li>
                    <li>Perfect for microtransactions ($0.01 payments work)</li>
                    <li>No mining, no energy waste</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">CloudCoin is built on the same RAIDA technology that powers QMail's security.</p>
            </div>
          )
        },
        {
          question: 'How much can I earn?',
          answer: (
            <div>
              <p>Your earnings depend entirely on two factors:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">Your Price:</strong> You set how much strangers must pay to email you. Set it at $0.01 for legitimate professional contacts, or $10+ if you're a celebrity/executive.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">Your Reach:</strong> The more visible you are, the more unsolicited emails you get, and the more you earn from legitimate opportunities.</p>
                </div>
              </div>
              <p className="mt-4"><strong className="text-white">Example:</strong> A mid-level professional receiving 10 unsolicited emails/day at $0.25 each earns $900/year. A public figure with 100 emails/day at $5 each earns $182,500/year.</p>
              <p className="mt-3 text-gray-400">Additionally, if you run your own server, you earn direct income from users who store their email with you.</p>
            </div>
          )
        }
      ]
    },
    {
      category: 'Technical Details',
      icon: Cpu,
      items: [
        {
          question: 'What is "data striping" and how does it work?',
          answer: (
            <div>
              <p>Data striping is the core technology that makes QMail unhackable. Here's how it works:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-gray-800/50 rounded p-3">
                  <p><strong className="text-white">Step 1: Shredding</strong></p>
                  <p className="mt-2">Your email is split into 5 pieces (stripes), kind of like cutting a photo into puzzle pieces. Each piece is useless on its own.</p>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p><strong className="text-white">Step 2: Encryption</strong></p>
                  <p className="mt-2">Each stripe is encrypted separately with military-grade AES-128 encryption before leaving your device.</p>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p><strong className="text-white">Step 3: Distribution</strong></p>
                  <p className="mt-2">These encrypted pieces are sent to 5 different servers around the world. Server A gets piece 1, Server B gets piece 2, etc.</p>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <p><strong className="text-white">Step 4: Parity (Self-Healing)</strong></p>
                  <p className="mt-2">We create "parity" pieces—mathematical backups. If any server goes offline, your email can be mathematically reconstructed from the remaining pieces.</p>
                </div>
              </div>
              <p className="mt-4 text-blue-400">Result: Your email lives nowhere and everywhere at the same time. No single server, no single hacker, no single government can access your message.</p>
            </div>
          )
        },
        {
          question: 'What happens if one of the servers goes offline?',
          answer: (
            <div>
              <p>This is where QMail's redundancy shines:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">Parity to the Rescue:</strong> We don't just store 5 pieces—we store additional "parity" pieces that act like solution keys to a Sudoku puzzle. If any piece goes missing, it can be mathematically rebuilt from the others.</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">You'll Never Notice:</strong> If a server is down, your client automatically pulls from backup servers. Your email still arrives instantly.</p>
                </div>
              </div>
              <p className="mt-4">In fact, we can lose up to 40% of the servers and your messages remain perfectly accessible. Try doing that with Gmail's data centers!</p>
            </div>
          )
        },
        {
          question: 'Is QMail truly quantum-safe?',
          answer: (
            <div>
              <p>Yes, and here's why it matters:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <p><strong className="text-red-400">The Threat:</strong> Quantum computers (expected within 10 years) will break all current encryption—RSA, elliptic curve, everything that protects today's email, banking, and internet traffic.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">QMail's Defense:</strong> We use RAIDA (Redundant Array of Independent Detection Agents) authentication, which doesn't rely on math that quantum computers can break. Even with infinite computing power, an attacker can't forge your identity or decrypt your messages.</p>
                </div>
              </div>
              <p className="mt-4">QMail is built to last 50+ years, not just until the next security vulnerability is discovered.</p>
            </div>
          )
        }
      ]
    },
    {
      category: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          question: 'Can QMail see my messages?',
          answer: (
            <div>
              <p><strong className="text-green-400">Absolutely not.</strong> This isn't just a policy—it's mathematically impossible.</p>
              <div className="mt-4 space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">No Complete Message Exists:</strong> Your email never exists as a complete file on any server. Each server only has an encrypted fragment.</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                  <p><strong className="text-purple-400">End-to-End Encryption:</strong> Messages are encrypted on your device before being shredded and distributed. Only you and your recipient have the keys.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">Zero Knowledge:</strong> We couldn't read your messages even if we wanted to. Unlike Gmail, ProtonMail, or any centralized service, we literally don't have access.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          question: 'What about government surveillance or subpoenas?',
          answer: (
            <div>
              <p>This is where distributed architecture becomes powerful:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-gray-800/50 rounded p-3">
                  <p><strong className="text-white">Traditional Email:</strong> A government can subpoena Google, and boom—all your emails are handed over. One company, one jurisdiction, one point of failure.</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">QMail:</strong> Your email pieces are spread across servers in multiple countries with different legal systems. A subpoena in the US can't touch servers in Switzerland, Iceland, or Japan. Even if they got all the servers (impossible), they'd only have encrypted fragments.</p>
                </div>
              </div>
              <p className="mt-4 text-green-400">You can even choose to only use servers in specific jurisdictions you trust. Complete control.</p>
            </div>
          )
        },
        {
          question: 'How does QMail handle spam and phishing?',
          answer: (
            <div>
              <p>QMail eliminates spam through economics, not filters:</p>
              <div className="mt-4 space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">Economic Barrier:</strong> Spammers send billions of emails because it costs them nothing. With QMail, every email to a stranger costs money. Spam becomes instantly unprofitable.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p><strong className="text-green-400">Whitelist System:</strong> People you know email you for free. Everyone else pays your price. You decide who gets through.</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                  <p><strong className="text-purple-400">Cryptographic Identity:</strong> Every QMail address is cryptographically verified. No spoofing, no impersonation, no phishing as we know it.</p>
                </div>
              </div>
              <p className="mt-4">The result: Zero spam, zero phishing, and you get paid for any unwanted messages that slip through.</p>
            </div>
          )
        }
      ]
    }
  ]

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />
          
          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-4xl mx-auto text-center">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="text-white">Frequently Asked</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Questions
                  </span>
                </h1>
              </m.div>

              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed"
              >
                Everything you need to know about QMail, distributed messaging, and the future of private communication.
              </m.p>

              {/* 3D Floating Questions Animation */}
              <FloatingQuestionsAnimation />
            </div>
          </div>
        </section>

        {/* Development Roadmap Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Development{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Roadmap
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                QMail is rolling out in three carefully planned phases, each building on the last
              </p>
            </m.div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {developmentPhases.map((phase, index) => (
                <PhaseCard
                  key={phase.phase}
                  phase={phase.phase}
                  title={phase.title}
                  status={phase.status}
                  description={phase.description}
                  features={phase.features}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        {faqData.map((category, categoryIndex) => (
          <section key={category.category} className={`py-20 md:py-32 relative ${categoryIndex % 2 === 1 ? 'bg-gradient-to-b from-transparent via-gray-900/20 to-transparent' : ''}`}>
            <div className="container mx-auto px-4">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6">
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {category.category}
                </h2>
              </m.div>

              <div className="max-w-4xl mx-auto space-y-4">
                {category.items.map((item, index) => {
                  const globalIndex = categoryIndex * 100 + index // Unique index across all categories
                  return (
                    <FAQItem
                      key={globalIndex}
                      question={item.question}
                      answer={item.answer}
                      delay={index * 0.05}
                      isOpen={openItems.has(globalIndex)}
                      onToggle={() => toggleItem(globalIndex)}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-20 md:py-32 relative bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-6">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Experience the Future of Email?
                  </h2>
                  
                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    Join thousands of early adopters who are already using QMail's distributed messaging system.
                  </p>

                  <div className="space-y-4">
                    <Link to="/how-it-works">
                      <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2 mr-4 mb-4"
                      >
                        Learn How It Works
                        <ArrowRight className="w-5 h-5" />
                      </m.button>
                    </Link>
                    
                    <Link to="/email-crisis">
                      <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-8 py-4 border-2 border-gray-600 hover:border-blue-500 text-white rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
                      >
                        Why We Built This
                        <ArrowRight className="w-5 h-5" />
                      </m.button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  )
}

export default FAQ