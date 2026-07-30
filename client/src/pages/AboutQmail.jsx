import React, { memo } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Globe,
  Server,
  Shield,
  Key,
  Ban,
  DollarSign,
  Eye,
  Lock,
  Coins,
  ArrowRight,
  CheckCircle2
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

const ALLEGIANCE_LEVELS = [
  { level: 'Bit', stake: '$10', note: 'Entry level — casual users, testing' },
  { level: 'Byte', stake: '$20', note: 'Basic commitment — everyday personal email' },
  { level: 'Kilo', stake: '$50', note: 'Moderate stake — freelancers, small creators' },
  { level: 'Mega', stake: '$100', note: 'Strong signal of legitimacy — professionals, businesses' },
  { level: 'Giga', stake: '$1,000', note: 'Highest stake — executives, high-profile individuals' },
]

function AboutQmail() {
  useDocumentMeta({
    title: 'About QMail',
    description: 'What QMail is and why it exists: decentralized mail, staked addresses, postage economics that discourage spam, and CloudCoin-powered privacy.',
    path: '/about-qmail',
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
                  <span className="text-white">About</span>{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    QMail
                  </span>
                </h1>
              </m.div>

              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl text-gray-400 leading-relaxed"
              >
                QMail is a decentralized email protocol built by the Perfect Money Foundation. Here's what makes it different, and why it's built that way.
              </m.p>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">

              {/* Decentralized, no central provider */}
              <Card>
                <div className="flex items-start gap-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shrink-0">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">Decentralized by Design</h2>
                    <p className="text-gray-400 leading-relaxed mb-3">
                      Traditional email lives on one company's servers — Gmail, Outlook, or a similar central provider that stores your mail, reads your metadata, and can be compelled to hand it over. QMail has no central provider. Messages are shredded into encrypted fragments and distributed across a network of independent servers, so no single server or company holds your complete message.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      Your credentials and identity draw on the same RAIDA-style network of independent, distributed servers used to authenticate CloudCoins — there's no single point of control and no single point of failure.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Staked addresses */}
              <Card delay={0.05}>
                <div className="flex items-start gap-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shrink-0">
                    <Key className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-full">
                    <h2 className="text-2xl font-bold text-white mb-3">Addresses Backed by Staked Coins</h2>
                    <p className="text-gray-400 leading-relaxed mb-6">
                      Every QMail address requires a refundable stake to activate. This makes claiming thousands of throwaway addresses expensive, and it gives every address an "Allegiance Level" — a visible signal of how much the owner has put behind it. A higher stake means more skin in the game, which is a stronger trust signal (though it isn't a guarantee of behavior).
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-gray-500 uppercase text-xs tracking-widest border-b border-gray-700/50">
                            <th className="pb-3 pr-4">Class</th>
                            <th className="pb-3 pr-4">Stake</th>
                            <th className="pb-3">Trust Signal</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          {ALLEGIANCE_LEVELS.map((row) => (
                            <tr key={row.level} className="border-b border-gray-800/60 last:border-0">
                              <td className="py-3 pr-4 font-semibold text-blue-300">{row.level}</td>
                              <td className="py-3 pr-4 font-mono">{row.stake}</td>
                              <td className="py-3 text-gray-400">{row.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Postage economics */}
              <Card delay={0.1}>
                <div className="flex items-start gap-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shrink-0">
                    <Ban className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">Postage Economics Discourage Spam</h2>
                    <p className="text-gray-400 leading-relaxed">
                      Instead of relying only on spam filters, QMail lets you set an inbox fee that unknown senders pay in CloudCoins to reach you. Friends and whitelisted contacts send for free. Because sending to thousands of strangers costs real money per message, mass spam becomes economically impractical rather than just technically filtered.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Privacy */}
              <Card delay={0.15}>
                <div className="flex items-start gap-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shrink-0">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">Privacy by Architecture</h2>
                    <p className="text-gray-400 leading-relaxed mb-3">
                      Because your message is shredded into encrypted stripes and scattered across independent servers, no single provider holds a complete copy of your mail to scan, mine for ads, or claim ownership of. Server operators can see limited metadata — things like timestamps and approximate message size — but not message content, subject lines, or attachments.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      There's no "QMail company" sitting on your inbox. That doesn't make QMail immune to every possible attack, but it removes the single, central target that traditional email providers represent.
                    </p>
                  </div>
                </div>
              </Card>

              {/* CloudCoin currency */}
              <Card delay={0.2}>
                <div className="flex items-start gap-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shrink-0">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">Powered by CloudCoin</h2>
                    <p className="text-gray-400 leading-relaxed">
                      CloudCoin is the digital currency behind QMail's stakes and postage fees. It's designed for small, fast micropayments — the kind of fractions-of-a-cent transactions that make pay-per-message postage practical without credit card fees getting in the way.
                    </p>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-32 relative bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-6">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Claim Your Address?
                  </h2>

                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    Choose your Allegiance Level and get your own decentralized QMail address today.
                  </p>

                  <Link to="/register">
                    <m.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors"
                    >
                      Claim Your Address
                      <ArrowRight className="w-5 h-5" />
                    </m.button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  )
}

export default AboutQmail
