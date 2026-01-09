import React, { useRef, memo } from 'react'
import { motion, LazyMotion, domAnimation, m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Scissors, 
  Lock, 
  Globe, 
  RefreshCw,
  Puzzle,
  Zap,
  FileText,
  CheckCircle2,
  ArrowRight,
  Server,
  Eye,
  Ban,
  DollarSign,
  Mail
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
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300">
        {children}
      </div>
    </m.div>
  )
})

Card.displayName = 'Card'

// Step Component
const StepCard = memo(({ step, title, description, icon: Icon, details, delay = 0 }) => {
  return (
    <Card delay={delay}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6">
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full mb-3">
            Step {step}
          </span>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        </div>
        
        <p className="text-gray-400 text-lg leading-relaxed mb-6">
          {description}
        </p>
        
        {details && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
            <p className="text-gray-300 text-sm leading-relaxed">
              {details}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
})

StepCard.displayName = 'StepCard'

function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: Scissors,
      title: 'The "Shredding" (Data Striping)',
      description: 'When you hit send, your email isn\'t sent as a single file. Instead, your DMS client acts like a digital shredder. It splits your message and attachments into tiny, unrecognizable pieces called "stripes."',
      details: 'Imagine taking a photograph and cutting it into 5 puzzle pieces. Looking at just one piece tells you nothing about the whole picture.'
    },
    {
      step: 2,
      icon: Lock,
      title: 'The Lock (Encryption)',
      description: 'Before these pieces leave your device, each one is locked inside a digital vault using AES-128 bit encryption. Even if someone managed to intercept a stripe, all they would see is scrambled noise.',
      details: 'Military-grade encryption ensures that even with quantum computers, your data remains secure.'
    },
    {
      step: 3,
      icon: Globe,
      title: 'The Scatter (Distribution)',
      description: 'This is where the magic happens. We don\'t store your puzzle pieces in one place. They are distributed across the global network.',
      details: 'Piece A goes to France, Piece B to Singapore, Piece C to Brazil. Independent servers mean no single point of failure.'
    },
    {
      step: 4,
      icon: RefreshCw,
      title: 'Self-Healing Data (Parity)',
      description: 'What happens if a server goes offline? Do you lose your email? No. We create special "backup pieces" known as Parity.',
      details: 'Think of Parity like the solution key to a Sudoku puzzle. If one piece goes missing, the system mathematically rebuilds it instantly.'
    },
    {
      step: 5,
      icon: Puzzle,
      title: 'Perfect Reassembly',
      description: 'When you (or your recipient) open the email, the client pulls the pieces from around the world, uses your private key to unlock them, and stitches them back together in milliseconds.',
      details: 'The result: A 100% private message that lived nowhere and everywhere at the same time.'
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Complete Privacy',
      description: 'Your messages cannot be read by anyone - not ISPs, not governments, not even us.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Ban,
      title: 'Zero Spam',
      description: 'Economic barriers eliminate spam by design. Set your price for unknown senders.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: DollarSign,
      title: 'Get Paid',
      description: 'Monetize your attention. Friends email free, advertisers pay your rate.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Server,
      title: 'Decentralized',
      description: 'No single point of control or failure. You own your data and your server.',
      gradient: 'from-orange-500 to-red-500'
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
                  <span className="text-white">How It Works:</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    The Digital Puzzle of Privacy
                  </span>
                </h1>
              </m.div>

              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed"
              >
                Most email providers store your messages in one big filing cabinet (their data center). 
                If hackers break into that cabinet—or if the company decides to peek inside—your private life is exposed.
              </m.p>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-8 border border-blue-500/30 mb-12"
              >
                <p className="text-lg md:text-xl text-blue-200 leading-relaxed">
                  <span className="font-bold text-blue-300">QMail doesn't store your emails.</span>{' '}
                  It scatters them across the globe like a jigsaw puzzle. No single server, no single company, no single hacker can ever read your message.
                </p>
              </m.div>

              {/* Animated RAIDA Network Visualization */}
              <div className="relative w-full max-w-5xl mx-auto h-80 mb-12">
                {/* Central Message */}
                <m.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="glass-strong rounded-2xl p-6 text-center">
                    <Mail className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Your Email</p>
                  </div>
                </m.div>

                {/* RAIDA Nodes in a circle */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 360) / 8;
                  const radius = 180;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <m.div
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                    >
                      <div className="glass rounded-xl p-4 text-center">
                        <Shield className="w-8 h-8 text-purple-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">Server {i + 1}</p>
                      </div>
                    </m.div>
                  );
                })}

                {/* Animated connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 360) / 8;
                    const radius = 180;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <m.line
                        key={i}
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${x}px)`}
                        y2={`calc(50% + ${y}px)`}
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 1.0 + i * 0.05, duration: 0.5 }}
                      />
                    );
                  })}
                </svg>

                {/* Animated data packets traveling */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 360) / 8;
                  const radius = 180;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <m.div
                      key={`packet-${i}`}
                      className="absolute left-1/2 top-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{
                        x: [0, x * 0.5, x],
                        y: [0, y * 0.5, y],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        delay: 1.7 + i * 0.1,
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* The 5-Step Process */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                The{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  5-Step Process
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Here's exactly what happens when you send an email through QMail
              </p>
            </m.div>

            <div className="max-w-3xl mx-auto space-y-8 relative">
              {steps.map((step, index) => (
                <div key={step.step} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-full h-12 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent transform -translate-x-0.5 z-0" />
                  )}
                  
                  <StepCard
                    step={step.step}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    details={step.details}
                    delay={index * 0.1}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Analogy Section */}
        <section className="py-20 md:py-32 relative bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Think of Traditional Email as{' '}
                    <span className="text-red-400">Postcards</span>
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-red-400 mb-4">Traditional Email</h3>
                      <ul className="space-y-2 text-left text-gray-400">
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                          <span>Sent as one complete file</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Eye className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                          <span>Anyone can read it in transit</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Server className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                          <span>Stored in one place (vulnerable)</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-blue-400 mb-4">QMail Distributed</h3>
                      <ul className="space-y-2 text-left text-gray-400">
                        <li className="flex items-start gap-2">
                          <Scissors className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                          <span>Shredded into puzzle pieces</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Lock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                          <span>Each piece encrypted separately</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Globe className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                          <span>Distributed globally (unhackable)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                The{' '}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Result
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                A revolutionary messaging system that puts privacy and profit back in your hands
              </p>
            </m.div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} delay={index * 0.05}>
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${benefit.gradient} rounded-xl mb-4`}>
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section className="py-20 md:py-32 relative bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-6">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Next Step: Join the Revolution
                  </h2>
                  
                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    Now that you understand how it works, you can join the community. Set your price for unknown 
                    senders, get paid for your attention, and even run your own server for direct payments.
                  </p>

                  <div className="bg-blue-900/30 rounded-xl p-6 mb-8 border border-blue-500/30">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">Economic Innovation:</h3>
                    <p className="text-gray-300 leading-relaxed">
                      The DMS protocol is so efficient, a $2K server does the same work as a $20K server in a 
                      tech giant's data center. <span className="text-cyan-400 font-semibold">You can setup your own email server 
                      and get paid directly for it!</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Link to="/register">
                      <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2 mr-4 mb-4"
                      >
                        Claim Your Address
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

export default HowItWorks