import React, { memo } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  Users,
  ArrowRight,
  DollarSign,
  Lock,
  CreditCard,
  CheckCircle2,
  Share2,
  MessageSquare,
  Gift,
  ShieldCheck,
  Zap,
  Layout,
  Globe,
} from "lucide-react";

// Reusable component for each strategic phase
const StrategyCard = memo(({ title, children, step, color = "blue" }) => {
  const colors = {
    blue: "border-blue-500/30 bg-blue-900/10 text-blue-400",
    green: "border-green-500/30 bg-green-900/10 text-green-400",
    purple: "border-purple-500/30 bg-purple-900/10 text-purple-400",
    gold: "border-yellow-500/30 bg-yellow-900/10 text-yellow-400",
  };

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`relative p-8 rounded-2xl border ${colors[color]} backdrop-blur-sm mb-12`}
    >
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-xl font-bold text-white shadow-lg">
        {step}
      </div>
      <h3
        className={`text-2xl font-bold mb-4 ${
          color === "gold" ? "text-yellow-400" : "text-white"
        }`}
      >
        {title}
      </h3>
      {children}
    </m.div>
  );
});

StrategyCard.displayName = "StrategyCard";

function SalesStrategy() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20 bg-black">
        {/* Header: Core Campaign Concept */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white uppercase tracking-tighter">
                Sales Funnel <span className="text-blue-500">Strategy</span>
              </h1>
              <h2 className="text-2xl font-mono text-blue-400 mb-8 tracking-widest">
                CAMPAIGN: VERIFIED ACCESS
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Leveraging <strong>"The Gatekeeper Strategy"</strong>: using the
                desire to reach an influencer to onboard users into the
                CloudCoin/QMail ecosystem.
              </p>
            </m.div>
          </div>
        </section>

        {/* Funnel Flow Architecture */}
        <section className="py-12 pb-32">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Phase 1: The Trigger */}
            <StrategyCard
              step="1"
              title="Phase 1: The Trigger (Influencer Website)"
              color="blue"
            >
              <div className="space-y-4">
                <p className="text-gray-300">
                  <strong className="text-blue-400">Target Location:</strong>{" "}
                  Influencer "Contact" or "About" pages.
                </p>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                  <p className="text-[10px] text-gray-500 mb-3 uppercase font-black tracking-widest text-center border-b border-gray-800 pb-2">
                    Visual Mockup
                  </p>
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white underline decoration-blue-500 decoration-2 underline-offset-8">
                      Send me a Private Message
                    </span>
                  </div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-gray-400">
                  URL: {import.meta.env.VITE_BASE_URL}
                  /access?recipient=connie_willis&cost=10
                </div>
              </div>
            </StrategyCard>

            {/* Phase 2: The Pitch */}
            <StrategyCard
              step="2"
              title="Phase 2: The Landing Page (The Pitch)"
              color="purple"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-wide text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  STATUS: Verified Connection | Destination: Secured
                </div>

                <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-white mb-2 underline decoration-purple-500">
                    The Psychology
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Influencers receive thousands of messages. To ensure a read,
                    they use the <strong>"Postage Guarantee."</strong>
                    The cost deters spammers while prioritizing real human
                    interaction in a quantum-safe environment.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {/* Option 1: Basic */}
                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h5 className="font-bold text-white mb-2">
                      Tier 1: Basic Access
                    </h5>
                    <p className="text-xs text-gray-400 mb-4">
                      1 Private Encrypted Message + Server Postage.
                    </p>
                    <div className="text-2xl font-black text-white">$10.00</div>
                  </div>

                  {/* Option 2: Upsell */}
                  <div className="relative bg-gradient-to-br from-blue-900/60 to-purple-900/60 p-6 rounded-xl border border-blue-500/50 shadow-2xl shadow-blue-500/10">
                    <div className="absolute -top-3 right-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded">
                      BEST VALUE
                    </div>
                    <h5 className="font-bold text-white mb-2">
                      Tier 2: Beta Founder
                    </h5>
                    <p className="text-xs text-blue-200 mb-4">
                      Includes $100 in CloudCoins + Custom Address.
                    </p>
                    <div className="text-2xl font-black text-white">$20.00</div>
                  </div>
                </div>
              </div>
            </StrategyCard>

            {/* Phase 3: The Gateway */}
            <StrategyCard
              step="3"
              title="Phase 3: The Payment Gateway"
              color="green"
            >
              <div className="flex items-start gap-5">
                <CreditCard className="w-10 h-10 text-green-400 flex-shrink-0" />
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Goal: Capture fiat currency and User Contact Info for
                    CloudCoin delivery.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="bg-black/40 p-3 rounded-lg border border-gray-800">
                      <strong className="text-green-400 block text-xs mb-1 uppercase">
                        Mobile
                      </strong>
                      <span className="text-gray-300 text-xs italic">
                        Required for Locker Key via SMS.
                      </span>
                    </li>
                    <li className="bg-black/40 p-3 rounded-lg border border-gray-800">
                      <strong className="text-green-400 block text-xs mb-1 uppercase">
                        Email
                      </strong>
                      <span className="text-gray-300 text-xs italic">
                        For receipts and backup key.
                      </span>
                    </li>
                  </ul>
                  <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-lg">
                    <h5 className="text-xs font-black text-blue-400 uppercase mb-1">
                      Phase 3.5: Order Bump
                    </h5>
                    <p className="text-gray-300 text-xs italic">
                      Add "Quantum Privacy Handbook" PDF for $5.
                    </p>
                  </div>
                </div>
              </div>
            </StrategyCard>

            {/* Phase 4: Success */}
            <StrategyCard
              step="4"
              title="Phase 4: Success & Composition"
              color="gold"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border-l-4 border-yellow-500">
                  <Gift className="text-yellow-500 w-8 h-8" />
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Asset Delivery
                    </h4>
                    <p className="text-gray-400 text-xs">
                      Locker Key delivered immediately via SMS.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h5 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
                      <Layout size={14} /> Web-Editor
                    </h5>
                    <p className="text-xs text-gray-500">
                      Web-based UI allows immediate message sending using
                      CloudCoin credits.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h5 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
                      <Globe size={14} /> Viral Engine
                    </h5>
                    <p className="text-xs text-gray-500">
                      Affiliate links: Refer a friend, get $10 in coins.
                    </p>
                  </div>
                </div>
              </div>
            </StrategyCard>

            {/* Strategy Logic Summary */}
            <m.div
              className="mt-20 p-10 bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 shadow-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-widest">
                Why This Strategy Wins
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                    <Lock size={20} />
                  </div>
                  <h4 className="font-bold text-white">The "Velvet Rope"</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Buying access to a celebrity justifies the software purchase
                    immediately.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                    <DollarSign size={20} />
                  </div>
                  <h4 className="font-bold text-white">The "No-Brainer"</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    The jump from $10 to $20 for $100 in value is mathematically
                    irresistible.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                    <Users size={20} />
                  </div>
                  <h4 className="font-bold text-white">Network Seeding</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Once users have coins, they are incentivized to convert
                    friends so they can use the system together.
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}

export default SalesStrategy;
