import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  DollarSign,
  Users,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Calculator,
  TrendingUp,
  Share2,
  Mail,
} from "lucide-react";
import { track } from "../utils/analytics";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const Card = memo(({ children, delay = 0, className = "" }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.3, delay }}
    className={className}
  >
    {children}
  </m.div>
));
Card.displayName = "Card";

// Earnings Calculator Widget
const EarningsCalculator = memo(() => {
  const [followers, setFollowers] = useState(10000);
  const [clickRate, setClickRate] = useState(0.5);
  const [inboxFee, setInboxFee] = useState(10);

  const monthlyClicks = Math.round(followers * (clickRate / 100));
  // Assume 10% of clickers convert to buyers
  const conversionRate = 0.1;
  const monthlyBuyers = Math.round(monthlyClicks * conversionRate);
  // Average order is inbox fee + $5 balance
  const avgOrder = inboxFee + 5;
  const monthlyRevenue = monthlyBuyers * avgOrder;
  const yourShare = Math.round(monthlyRevenue * 0.5);

  const formatNumber = (n) => n.toLocaleString();

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6 md:p-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Earnings Calculator</h3>
          <p className="text-gray-400 text-sm">See what you could earn</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Followers slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-gray-300">Your Followers</label>
            <span className="text-sm font-bold text-white">{formatNumber(followers)}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={1000000}
            step={1000}
            value={followers}
            onChange={(e) => setFollowers(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1K</span>
            <span>1M</span>
          </div>
        </div>

        {/* Click rate slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-gray-300">Link Click Rate</label>
            <span className="text-sm font-bold text-white">{clickRate}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={clickRate}
            onChange={(e) => setClickRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Inbox fee slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-gray-300">Your Inbox Fee</label>
            <span className="text-sm font-bold text-white">${inboxFee}</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={inboxFee}
            onChange={(e) => setInboxFee(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$5</span>
            <span>$100</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatNumber(monthlyClicks)}</p>
            <p className="text-xs text-gray-400">Monthly Clicks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatNumber(monthlyBuyers)}</p>
            <p className="text-xs text-gray-400">Buyers (10%)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${formatNumber(avgOrder)}</p>
            <p className="text-xs text-gray-400">Avg. Order</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
          <p className="text-sm text-green-300 font-semibold mb-1">Your Estimated Monthly Earnings</p>
          <p className="text-5xl font-black text-white">${formatNumber(yourShare)}</p>
          <p className="text-xs text-gray-400 mt-2">Based on 50/50 revenue share</p>
        </div>
      </div>
    </div>
  );
});
EarningsCalculator.displayName = "EarningsCalculator";

function Influencers() {
  useDocumentMeta({ title: 'Get Paid to Receive Emails', description: 'Turn your audience into revenue. Share one link, earn 50% every time a follower messages you through QMail.' });

  const steps = [
    {
      icon: Zap,
      title: "Create Your Link",
      description: "Sign up for free. We verify your identity via a $0 PayPal transaction, then instantly generate your custom link.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Share2,
      title: "Share It Everywhere",
      description: "Post your link on social media, your website, YouTube descriptions, email signatures — anywhere your audience is.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      title: "Get Paid",
      description: "Every time someone pays to message you, you earn 50%. Payments go directly to your PayPal account.",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const benefits = [
    { text: "Completely free to set up", icon: CheckCircle2 },
    { text: "You set your own inbox price", icon: DollarSign },
    { text: "50% of every sale goes to you", icon: TrendingUp },
    { text: "Eliminates spam and time-wasters", icon: Shield },
    { text: "Your followers get quantum-safe privacy", icon: Mail },
    { text: "Works with any social media platform", icon: Users },
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen pt-20">

        {/* Hero */}
        <section className="py-16 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold mb-6">
                  <DollarSign className="w-4 h-4" />
                  Free to join — earn from day one
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                  Get Paid Every Time{" "}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Someone Emails You
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                  Turn your audience into revenue. Share one link, and every follower who wants to reach you pays a small fee — you keep 50%.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    onClick={() => track('influencer_cta_click', { location: 'hero' })}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95"
                  >
                    Start Earning — It's Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-600 hover:border-green-500 text-white font-bold rounded-full hover:bg-green-500/10 transition-all"
                  >
                    <Calculator className="w-5 h-5" />
                    See What You Could Earn
                  </button>
                </div>
              </m.div>
            </div>
          </div>
        </section>

        {/* How It Works — 3 Steps */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Three Steps to{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Start Earning
                </span>
              </h2>
              <p className="text-gray-400 text-lg">No technical skills required. Set up in under 5 minutes.</p>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, i) => (
                <Card key={step.title} delay={i * 0.1}>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all text-center h-full">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-sm font-bold text-white">
                      {i + 1}
                    </div>
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl mb-6 mt-2`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section id="calculator" className="py-16 md:py-24 scroll-mt-24 relative bg-gradient-to-b from-transparent via-green-900/5 to-transparent">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                How Much Could{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  You Earn?
                </span>
              </h2>
              <p className="text-gray-400 text-lg">Drag the sliders to estimate your monthly earnings</p>
            </m.div>

            <EarningsCalculator />
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Why Influencers{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Love QMail
                </span>
              </h2>
            </m.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <Card key={b.text} delay={i * 0.05}>
                  <div className="flex items-start gap-3 bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition-all">
                    <b.icon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm font-medium">{b.text}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-700/50 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                  It costs you nothing. Create your link in under 5 minutes and start earning from your very next post.
                </p>
                <Link
                  to="/register"
                  onClick={() => track('influencer_cta_click', { location: 'bottom' })}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95"
                >
                  Create Your Link Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-gray-500 text-sm mt-4">
                  Already signed up?{" "}
                  <Link to="/strategy" className="text-blue-400 hover:text-blue-300 underline">
                    Go to your dashboard
                  </Link>
                </p>
              </div>
            </m.div>
          </div>
        </section>

      </div>
    </LazyMotion>
  );
}

export default Influencers;
