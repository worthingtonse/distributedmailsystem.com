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
  HelpCircle,
  HardDrive
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
const FloatingQuestionsAnimation = memo(() => {
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
    </div>
  )
})

FloatingQuestionsAnimation.displayName = 'FloatingQuestionsAnimation'

function FAQ() {
  const [openItems, setOpenItems] = useState(new Set([0]))

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
      category: 'General',
      icon: Globe,
      items: [
        {
          question: 'What is QMail?',
          answer: (
            <div>
              <p>QMail is a decentralized, quantum-safe email protocol. Unlike traditional email where your messages live on a company's server, QMail shreds your messages into encrypted fragments and distributes them across multiple independent servers. No single server can read your mail or know who you're talking to.</p>
            </div>
          )
        },
        {
            question: 'Who develops QMail?',
            answer: (
              <div>
                <p>QMail is developed by the Perfect Money Foundation, an organization dedicated to building distributed information systems that protect user privacy and promote a decentralized internet economy.</p>
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
                  <p><strong className="text-blue-400">Traditional Encrypted Email:</strong> Your message is locked in a box (encrypted), but the whole box sits in one data center. Hackers target the box, and the service provider still manages the centralized metadata (who you email, when, how often).</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p><strong className="text-blue-400">QMail:</strong> We don't just lock the box—we shred the contents into fragments, encrypt each piece separately, and scatter them across independent servers worldwide. No complete message exists anywhere in the cloud.</p>
                </div>
              </div>
            </div>
          )
        },
        {
            question: 'What can mail servers see about my messages?',
            answer: (
              <div>
                <p>Server operators can see pseudo-anonymous metadata like user IDs, timestamps, and approximate message sizes. However, they <strong className="text-red-400">cannot see</strong> message content, recipient identity, subject lines, or attachments. They literally lack the mathematical components to reassemble your message.</p>
              </div>
            )
          },
        {
          question: 'Who owns/controls the servers?',
          answer: (
            <div>
              <p>The network is composed of independently operated servers around the world. No one company or entity controls them all. You have the freedom to choose which servers you trust or even run your own.</p>
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
              <p>QMail flips email economics: strangers must attach a small CloudCoin payment (a "tip") to reach your inbox. If you whitelist a contact, they send for free. This makes spam economically impossible while paying you for your attention.</p>
            </div>
          )
        },
        {
          question: 'What currency is used for payments?',
          answer: (
            <div>
              <p>QMail is powered by <strong className="text-cyan-400">CloudCoin</strong>, a quantum-safe digital currency designed specifically for fast, secure microtransactions without energy waste or blockchain delays.</p>
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
            question: 'What is CBDF?',
            answer: (
              <div>
                <p>Compact Binary Document Format (CBDF) is our replacement for bloated HTML/CSS. It uses binary codes to define layouts, making messages up to 99% smaller than traditional emails. One byte can accomplish what normally takes 100+ bytes of markup.</p>
              </div>
            )
          },
        {
          question: 'What is "data striping" and how does it work?',
          answer: (
            <div>
              <p>Your email is shredded into 5-32 "stripes." Each stripe is encrypted with a unique AES-256 key and sent to a different server. We also create "parity" stripes so that if a server goes offline, your message can still be reconstructed mathematically.</p>
            </div>
          )
        },
        {
          question: 'Can I send large attachments?',
          answer: (
            <div>
              <p>Yes. QMail theoretically supports attachments up to several gigabytes. Because server operators are compensated per megabyte stored, there is no economic incentive for them to limit your storage capacity.</p>
            </div>
          )
        }
      ]
    }
  ]

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />
          
          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-4xl mx-auto text-center">
              <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="text-white">Frequently Asked</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Questions
                  </span>
                </h1>
              </m.div>

              <m.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">
                Everything you need to know about QMail, distributed messaging, and the future of private communication.
              </m.p>

              <FloatingQuestionsAnimation />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Development <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Roadmap</span>
              </h2>
            </m.div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {developmentPhases.map((phase, index) => (
                <PhaseCard key={phase.phase} {...phase} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {faqData.map((category, categoryIndex) => (
          <section key={category.category} className={`py-20 md:py-32 relative ${categoryIndex % 2 === 1 ? 'bg-gradient-to-b from-transparent via-gray-900/20 to-transparent' : ''}`}>
            <div className="container mx-auto px-4">
              <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6">
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{category.category}</h2>
              </m.div>

              <div className="max-w-4xl mx-auto space-y-4">
                {category.items.map((item, index) => {
                  const globalIndex = categoryIndex * 100 + index
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
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/register">
                      <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
                      >
                        Claim Address
                        <ArrowRight className="w-5 h-5" />
                      </m.button>
                    </Link>
                    
                    <Link to="/subscribe">
                      <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-8 py-4 border-2 border-gray-600 hover:border-blue-500 text-white rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
                      >
                        Subscribe
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