import React, { memo, useState } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Download,
  Key,
  Gift,
  Send,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Mail,
  ArrowRight,
  AtSign
} from 'lucide-react'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

// Reusable Card Component (matches HowItWorks / FAQ styling)
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
const StepCard = memo(({ step, title, description, icon: Icon, children, delay = 0 }) => {
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

        {children}
      </div>
    </Card>
  )
})

StepCard.displayName = 'StepCard'

// Copy-to-clipboard row (matches the pattern used on the success page)
const CopyableRow = memo(({ value }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-3 bg-black/40 rounded-xl border border-white/5 p-3 max-w-sm mx-auto">
      <code className="flex-1 text-left break-all font-mono text-white">{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 px-3 py-2 bg-blue-600 rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-blue-500 transition-all text-white"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
})

CopyableRow.displayName = 'CopyableRow'

function GettingStarted() {
  useDocumentMeta({
    title: 'Getting Started with QMail',
    description: 'A step-by-step guide to downloading QMail, claiming your address, depositing your Bonus Coins, and sending your first message.',
    path: '/getting-started',
  })

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />

          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="text-white">Getting Started</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    with QMail
                  </span>
                </h1>
              </m.div>

              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl text-gray-400 leading-relaxed"
              >
                Just claimed a QMail address? Here's everything you need to do to start sending private mail.
              </m.p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">

              <StepCard
                step={1}
                icon={Download}
                title="Download the QMail Software"
                description="QMail runs as a desktop client. Download and install it before you do anything else — you'll need it to claim your address and manage your CloudCoins."
              >
                <a
                  href="https://CloudCoinConsortium.com/use.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  <Download size={18} /> Download the QMail Software
                  <ExternalLink size={14} className="opacity-60" />
                </a>
              </StepCard>

              <StepCard
                step={2}
                icon={Key}
                title="Claim Your Address"
                description={<>After purchase, you received a QMail address (it looks like <code className="text-blue-300 font-mono">20.123@giga</code>) along with a Mailbox Locker Key.</>}
              >
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 text-left">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Open the QMail software and enter your Mailbox Locker Key when prompted. This claims the address coin and makes the address yours.
                  </p>
                </div>
              </StepCard>

              <StepCard
                step={3}
                icon={Gift}
                title="Deposit Your Bonus Coins"
                description="Most registrations include 200 CloudCoins as a Bonus Coins Locker Key, separate from the Mailbox Locker Key."
              >
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 text-left">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Put the Bonus Coins Locker Key into the <strong className="text-yellow-300">Wallet</strong> part of the QMail software (not the mailbox screen). This deposits the 200 CloudCoins into your wallet so you have postage ready to go.
                  </p>
                </div>
              </StepCard>

              <StepCard
                step={4}
                icon={Send}
                title="Send Your First Message"
                description="Once your address is claimed and your wallet has coins, you're ready to send mail. CloudCoins in your wallet pay for postage — the small fee that keeps unsolicited mail out of people's inboxes."
              />

              <StepCard
                step={5}
                icon={RefreshCw}
                title="Keep Your Coins Topped Up"
                description="When your wallet runs low, you can top it back up with a one-time purchase or a recurring monthly delivery straight to your mailbox."
              >
                <Link to="/subscribe">
                  <m.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors"
                  >
                    See Subscription Plans
                    <ArrowRight className="w-5 h-5" />
                  </m.button>
                </Link>
              </StepCard>

            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-20 md:py-32 relative bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Need a Hand?
                </h2>
                <p className="text-gray-400 text-lg">
                  If you get stuck at any step, reach out — we're happy to help.
                </p>
              </m.div>

              <Card>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-4">
                    <a
                      href="https://t.me/distributedmailsystem"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                    >
                      <MessageCircle size={18} /> Telegram Group
                      <ExternalLink size={14} className="opacity-60" />
                    </a>

                    <Link
                      to="/faq"
                      className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                    >
                      <HelpCircle size={18} /> Frequently Asked Questions
                    </Link>

                    <a
                      href="mailto:CloudCoin@Protonmail.com"
                      className="flex items-center gap-3 text-gray-300 hover:text-blue-300 text-sm font-bold transition-all"
                    >
                      <Mail size={18} /> CloudCoin@Protonmail.com
                    </a>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                      <AtSign size={14} /> Support via QMail
                    </p>
                    <CopyableRow value="20.123@giga" />
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

export default GettingStarted
