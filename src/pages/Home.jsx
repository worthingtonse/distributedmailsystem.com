import React, { useRef, useState, memo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  LazyMotion,
  domAnimation,
  m,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  Lock,
  DollarSign,
  Globe,
  Server,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Ban,
  Award,
  FileCheck,
} from "lucide-react";

// Optimized Card Component with React.memo
const Card = memo(({ children, delay = 0 }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px", amount: 0.2 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300">
        {children}
      </div>
    </m.div>
  );
});

Card.displayName = "Card";

// Optimized button component
const AnimatedButton = memo(
  ({
    children,
    variant = "primary",
    to,
    onClick,
    type = "button",
    className = "",
  }) => {
    const baseClasses =
      "px-8 py-4 rounded-full font-bold text-lg transition-transform active:scale-95 whitespace-nowrap flex items-center justify-center";
    const variantClasses =
      variant === "primary"
        ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white"
        : "border-2 border-gray-600 hover:border-blue-500 text-white transition-colors";

    const ButtonContent = (
      <button
        type={type}
        onClick={onClick}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {children}
      </button>
    );

    return to ? (
      <Link to={to} className={className}>
        {ButtonContent}
      </Link>
    ) : (
      ButtonContent
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

function Home() {
  const heroRef = useRef(null);
  const [email, setEmail] = useState("");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const problemAreas = [
    {
      icon: Ban,
      title: "Drowning in Spam",
      description:
        "150 billion spam messages sent daily. Half of all email is junk you never asked for.",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: AlertTriangle,
      title: "Phishing & Fraud",
      description:
        "Email spoofing is trivially easy. You can't trust who's really sending you messages.",
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      icon: Eye,
      title: "Zero Privacy",
      description:
        "Your messages travel unencrypted, read by servers, corporations, and governments.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      title: "Hidden Costs",
      description:
        '"Free" email isn\'t free. You pay with your data, attention, and security.',
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  const solutions = [
    {
      icon: Shield,
      title: "Quantum-Safe Security",
      description:
        "Your messages are shredded, encrypted, and distributed across 32 servers using QMAIL technology. Even quantum computers can't decrypt them.",
      link: "/quantum-safe",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: DollarSign,
      title: "Get Paid for Your Attention",
      description:
        "Set your price. Unknown senders pay you to reach your inbox. Friends and trusted contacts? They're always free.",
      link: "/get-paid",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Zero Spam, Guaranteed",
      description:
        "Economic barriers eliminate spam by design. No filters needed. No false positives. Just a clean inbox.",
      link: "/features",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const comparisonData = [
    {
      feature: "Sender Verification",
      traditional: "None (easily spoofed)",
      qmail: "Cryptographic authentication",
      icon: CheckCircle2,
    },
    {
      feature: "Message Security",
      traditional: "Plain text or basic encryption",
      qmail: "Quantum-safe, sharded, distributed",
      icon: Shield,
    },
    {
      feature: "Spam Protection",
      traditional: "Unreliable filters",
      qmail: "Economic barriers",
      icon: Ban,
    },
    {
      feature: "Privacy",
      traditional: "Read by servers & ISPs",
      qmail: "End-to-end confidential",
      icon: Lock,
    },
    {
      feature: "Message Size",
      traditional: "Bloated HTML (1MB+)",
      qmail: "Compact binary (10KB)",
      icon: Zap,
    },
    {
      feature: "Control",
      traditional: "Controlled by tech giants",
      qmail: "You own your mailbox",
      icon: Globe,
    },
    {
      feature: "Cost Model",
      traditional: "Pay with your data",
      qmail: "Get paid for your attention",
      icon: DollarSign,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen">
        {/* Hero Section */}
        <m.section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
          style={{ opacity }}
        >
          {/* Static gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />

          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-5xl mx-auto text-center">
              {/* Main Headline */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Email is Broken.
                  </span>
                  <br />
                  <span className="text-white">Let's Fix It</span>
                </h1>
              </m.div>

              {/* Subheadline */}
              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              >
                QMail is an{" "}
                <span className="text-blue-400 font-semibold">
                  open-standard
                </span>
                ,{" "}
                <span className="text-purple-400 font-semibold">
                  open-source
                </span>
                ,{" "}
                <span className="text-cyan-400 font-semibold">
                  quantum-safe
                </span>
                ,{" "}
                <span className="text-green-400 font-semibold">
                  decentralized
                </span>{" "}
                messaging system that is consumer-driven. Its micro-transaction
                model allows you to charge people to send you emails and allows
                anyone to setup an email server in their garage. This model
                eliminates spam, phishing, spoofing and surveillance by
                tech-giants, hackers and even governments.
              </m.p>

              {/* CTA Buttons */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <AnimatedButton variant="primary">
                  Get Early Access →
                </AnimatedButton>

                <AnimatedButton variant="secondary" to="/how-it-works">
                  See How It Works
                </AnimatedButton>
              </m.div>
            </div>
          </div>
        </m.section>

        {/* Problem Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Your Inbox is a{" "}
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Disaster
                </span>
              </h2>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {problemAreas.map((problem, index) => (
                <Card key={problem.title} delay={index * 0.03}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${problem.gradient} p-3 flex items-center justify-center`}
                    >
                      <problem.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {problem.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-center mt-12"
            >
              <Link
                to="/email-crisis"
                className="text-blue-400 hover:text-blue-300 font-semibold text-lg inline-flex items-center gap-2 group"
              >
                Learn Why Traditional Email Can't Be Fixed →
              </Link>
            </m.div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 md:py-32 relative bg-gradient-to-b from-transparent via-blue-900/5 to-transparent">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Welcome to the{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Future of Messaging
                </span>
              </h2>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {solutions.map((solution, index) => (
                <Card key={solution.title} delay={index * 0.05}>
                  <div className="flex flex-col h-full">
                    <div
                      className={`w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br ${solution.gradient} p-4 flex items-center justify-center`}
                    >
                      <solution.icon className="w-full h-full text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">
                      {solution.title}
                    </h3>

                    <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
                      {solution.description}
                    </p>

                    <Link
                      to={solution.link}
                      className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-2 group"
                    >
                      Learn More →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6">
                    <Award className="w-12 h-12 text-white" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Built on{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Patented U.S. Technology
                    </span>
                  </h2>

                  <blockquote className="text-xl md:text-2xl text-gray-300 italic mb-8 leading-relaxed">
                    "QMail represents a fundamental paradigm shift in secure
                    communications. Its QMAIL architecture makes data breaches
                    not just difficult, but
                    <span className="text-blue-400 font-semibold">
                      {" "}
                      mathematically impractical
                    </span>
                    ."
                  </blockquote>

                  <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-gray-700/50">
                    {[
                      { icon: Shield, text: "Quantum-Safe Certified" },
                      { icon: FileCheck, text: "U.S. Patent Pending" },
                      { icon: Globe, text: "Open Standard" },
                      { icon: Server, text: "Distributed Architecture" },
                    ].map((badge, i) => (
                      <m.div
                        key={badge.text}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <badge.icon className="w-8 h-8 text-blue-400" />
                        <span className="text-sm text-gray-400">
                          {badge.text}
                        </span>
                      </m.div>
                    ))}
                  </div>
                </div>
              </Card>
            </m.div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section className="py-20 md:py-32 relative bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It's{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Different
                </span>
              </h2>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-700/50">
                  <div className="text-gray-400 font-semibold text-sm md:text-base">
                    Feature
                  </div>
                  <div className="text-gray-400 font-semibold text-sm md:text-base">
                    Traditional Email
                  </div>
                  <div className="text-blue-400 font-semibold text-sm md:text-base">
                    QMail
                  </div>
                </div>

                {/* Table Rows */}
                {comparisonData.map((row, index) => (
                  <m.div
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: index * 0.02 }}
                    className="grid grid-cols-3 gap-4 p-6 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 font-medium text-white text-sm md:text-base">
                      <row.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span>{row.feature}</span>
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm flex items-center">
                      {row.traditional}
                    </div>
                    <div className="text-green-400 text-xs md:text-sm flex items-center font-medium">
                      {row.qmail}
                    </div>
                  </m.div>
                ))}
              </div>

              <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.2 }}
                className="text-center mt-8"
              >
                <Link
                  to="/technology"
                  className="text-blue-400 hover:text-blue-300 font-semibold text-lg inline-flex items-center gap-2"
                >
                  See the Full Technical Comparison →
                </Link>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* Final CTA Section with Form */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Take Back Your Inbox?
                  </h2>
                  <p className="text-xl text-gray-400 mb-10">
                    Join the QMail revolution. Be among the first to experience
                    messaging the way it should be.
                  </p>

                  {/* Email Signup Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="max-w-2xl mx-auto mb-12"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gray-800/30 border border-gray-700 rounded-2xl sm:rounded-full backdrop-blur-md focus-within:border-blue-500 transition-all">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-6 py-4 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-lg"
                      />
                      <AnimatedButton
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                      >
                        Request Early Access
                      </AnimatedButton>
                    </div>
                  </form>

                  {/* Trust Badges */}
                  <div className="pt-8 border-t border-gray-700/50 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { icon: Shield, text: "Quantum-Safe Certified" },
                      { icon: FileCheck, text: "U.S. Patented Technology" },
                      { icon: Globe, text: "Open Standard" },
                      { icon: Server, text: "Distributed Architecture" },
                    ].map((item, i) => (
                      <div
                        key={item.text}
                        className="flex flex-col items-center gap-2"
                      >
                        <item.icon className="w-6 h-6 text-blue-400" />
                        <span className="text-xs text-gray-400 text-center">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </m.div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}

export default Home;
