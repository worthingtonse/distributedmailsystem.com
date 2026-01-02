import React, { useRef, useState, useEffect, memo } from "react";
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
  ChevronDown,
  ArrowDown,
} from "lucide-react";

// Optimized Card Component with React.memo
const Card = memo(({ children, delay = 0, className = "" }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px", amount: 0.2 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={`relative group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300">
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
    size = "default",
  }) => {
    const baseClasses =
      "rounded-full font-bold transition-all duration-300 active:scale-95 whitespace-nowrap flex items-center justify-center";
    const sizeClasses =
      size === "small"
        ? "px-4 py-2 text-sm"
        : size === "large"
        ? "px-8 py-4 text-lg"
        : "px-6 py-3 text-base";
    const variantClasses =
      variant === "primary"
        ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
        : variant === "secondary"
        ? "border-2 border-gray-600 hover:border-blue-500 text-white hover:bg-blue-500/10 transition-colors"
        : "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors";

    const ButtonContent = (
      <button
        type={type}
        onClick={onClick}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      >
        {children}
      </button>
    );

    return to ? <Link to={to}>{ButtonContent}</Link> : ButtonContent;
  }
);

AnimatedButton.displayName = "AnimatedButton";

// Improved Progress Indicator instead of fixed nav
const ProgressIndicator = memo(() => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sections = [
      "hero",
      "problems",
      "solutions",
      "comparison",
      "services",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            setIsVisible(entry.target.id !== "hero");
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -20% 0px" }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 hidden sm:block">
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-full px-4 py-2 border border-gray-700/50 shadow-lg">
        <div className="flex items-center gap-2">
          {["problems", "solutions", "comparison", "services"].map(
            (section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSection === section
                    ? "bg-blue-400 scale-125"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to ${section} section`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
});

ProgressIndicator.displayName = "ProgressIndicator";

// Improved Footer component
const Footer = memo(() => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            {/* Brand */}
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-3">QMail</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The future of secure, decentralized messaging. Own your digital
                identity.
              </p>
            </div>

            {/* Support */}
            <div className="text-center sm:text-left">
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <div className="space-y-2">
                <Link
                  to="/register"
                  className="text-blue-400 hover:text-blue-300 text-sm block transition-colors"
                >
                  Contact Support
                </Link>
                <p className="text-gray-500 text-xs break-all">
                  Giga~RaidaTech.Customer.Support#0F39
                </p>
                <Link
                  to="/support"
                  className="text-blue-400 hover:text-blue-300 text-sm block transition-colors"
                >
                  Help Center
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="text-center sm:text-left">
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <div className="space-y-2">
                <Link
                  to="/privacy"
                  className="text-blue-400 hover:text-blue-300 text-sm block transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-blue-400 hover:text-blue-300 text-sm block transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Development Status */}
            <div className="text-center sm:text-left">
              <h4 className="text-white font-semibold mb-3">Development</h4>
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <p className="text-blue-300 text-xs font-medium mb-1">
                  Phase I
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Some features are in development. Join our journey!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center sm:text-left">
                © 2026 RaidaTech. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <AnimatedButton to="/register" variant="outline" size="small">
                  Get Started
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

// Scroll indicator component for better UX
const ScrollIndicator = memo(({ onClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
    >
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group"
        aria-label="Scroll to next section"
      >
        <span className="text-sm font-medium">Discover More</span>
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
          <m.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2 group-hover:bg-white/80"
          />
        </div>
      </button>
    </m.div>
  );
});

ScrollIndicator.displayName = "ScrollIndicator";

function Home() {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const scrollToNextSection = () => {
    const element = document.getElementById("problems");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
      title: "Decentralized",
      description:
        "Your messages are shredded, encrypted, and distributed across 32 servers using QMAIL technology. Even quantum computers can't decrypt them.",
      link: "/register",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: DollarSign,
      title: "Consumer Driven",
      description:
        "Set your price. Unknown senders pay you to reach your inbox. Friends and trusted contacts? They're always free.",
      link: "/register",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Zero Spam, Guaranteed",
      description:
        "Economic barriers eliminate spam by design. No filters needed. No false positives. Just a clean inbox.",
      link: "/register",
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

  const services = [
    "Get a QMail address",
    "Set your Inbox price to get paid for your attention and pay others for their attention too",
    "Run your own QMail server from home (optional) and get paid for it!",
    "Turbocharge your Influencer Income",
    "Include your entire organization and keep your privacy (Enterprise Solutions)",
    "Marketers: Pay your customers to read your messages",
    "Become a Certified QMail Secure User, QMail Server Administration, QMail Marketing or even a Certified QMail Developer",
    "Use it for your whole organization",
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen">
        <ProgressIndicator />

        {/* Hero Section */}
        <m.section
          id="hero"
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
          style={{ opacity }}
        >
          {/* Static gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />

          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-5xl mx-auto text-center">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                  Email{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Revolution
                  </span>
                  <br />
                  Starts Now
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                  The first messaging system where{" "}
                  <span className="text-blue-400 font-semibold">
                    senders pay you
                  </span>{" "}
                  instead of selling your data. Zero spam. Quantum-safe
                  security. Own your digital identity.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 justify-center items-center pt-4 w-full max-w-sm mx-auto sm:max-w-none sm:flex-row sm:gap-4">
                  <AnimatedButton
                    to="/register"
                    variant="primary"
                    size="large"
                    className="w-full sm:w-auto min-w-[160px]"
                  >
                    Get Early Access
                  </AnimatedButton>
                  <AnimatedButton
                    to="/button"
                    variant="secondary"
                    size="large"
                    className="w-full sm:w-auto min-w-[140px]"
                  >
                    Influencers Here
                  </AnimatedButton>
                </div>

                {/* Scroll CTA */}
                <div className="pt-6 sm:pt-8">
                  <button
                    onClick={scrollToNextSection}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-full transition-all duration-300 text-xs sm:text-sm lg:text-base text-center"
                  >
                    <span className="break-words">
                      Why Your Inbox is a Disaster
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </m.div>
            </div>
          </div>
        </m.section>

        {/* Problems Section */}
        <section
          id="problems"
          className="py-16 sm:py-20 lg:py-32 relative bg-gradient-to-b from-transparent via-red-900/5 to-transparent"
        >
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Your Inbox is a{" "}
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Disaster
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Traditional email was designed in 1982 for a small, trusted
                network of researchers. Today's internet has 5 billion users,
                and email is fundamentally broken.
              </p>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {problemAreas.map((problem, index) => (
                <Card key={problem.title} delay={index * 0.1}>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${problem.gradient} rounded-2xl mb-6`}
                    >
                      <problem.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {problem.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 }}
              className="text-center mt-12"
            >
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold text-xl inline-flex items-center gap-2"
              >
                Traditional Email Can't Be Fixed - Claim Your QMail Address Now
              </Link>
            </m.div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-16 sm:py-20 lg:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Welcome to the Future of{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Messaging
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                QMail isn't just better email—it's a complete reimagining of
                digital communication built for the modern world.
              </p>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <Card key={solution.title} delay={index * 0.1}>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${solution.gradient} rounded-2xl mb-6`}
                    >
                      <solution.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {solution.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {solution.description}
                    </p>
                    <Link
                      to="/register"
                      className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-2"
                    >
                      Claim Your Address...
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 sm:py-20 lg:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
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
                      Open Standard Technology
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
                      { icon: Shield, text: "Decentralized" },
                      { icon: FileCheck, text: "Consumer Driven" },
                      { icon: Globe, text: "Open Standard" },
                      { icon: Server, text: "Distributed Architecture" },
                    ].map((badge, i) => (
                      <m.div
                        key={badge.text}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
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
        <section
          id="comparison"
          className="py-16 sm:py-20 lg:py-32 relative bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"
        >
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
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
              viewport={{ once: true, margin: "-50px" }}
              className="max-w-6xl mx-auto"
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
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.05 }}
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
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.3 }}
                className="text-center mt-6 sm:mt-8"
              >
                <Link
                  to="/button"
                  className="text-blue-400 hover:text-blue-300 font-semibold text-lg inline-flex items-center gap-2"
                >
                  Influencers, Get Paid to Receive Emails →
                </Link>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 sm:py-20 lg:py-32 relative">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="max-w-5xl mx-auto"
            >
              <Card>
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                    Ready to Take Back Your Inbox?
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-4 sm:mb-6 font-semibold">
                    Be The Boss, Not The Product
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-6 sm:mb-8 lg:mb-12 italic leading-relaxed max-w-3xl mx-auto px-4">
                    "It's like moving your data out of a rented storage unit and
                    into your own home in a gated community. It's more private,
                    you have more space and spammers pay you rent."
                  </p>

                  {/* Services List */}
                  <div className="text-left max-w-4xl mx-auto mb-6 sm:mb-8 lg:mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-gray-300">
                      {services.map((service, index) => (
                        <m.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-800/30 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm lg:text-base leading-relaxed">
                            {service}
                          </span>
                        </m.div>
                      ))}
                    </div>
                  </div>

                  {/* Contact CTA */}
                  <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 max-w-3xl mx-auto flex flex-col items-center text-center">
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-300 mb-4 sm:mb-6 px-2">
                      Send us a QMail at <br className="sm:hidden" />
                      <Link
                        to="/register"
                        className="text-blue-400 hover:text-blue-300 font-mono text-xs sm:text-sm lg:text-base transition-colors break-all"
                      >
                        "Giga~RaidaTech.Customer.Support#0F39"
                      </Link>
                    </p>
                    <AnimatedButton
                      to="/register"
                      variant="primary"
                      size="large"
                      className="w-full sm:w-auto"
                    >
                      Get Started Now
                    </AnimatedButton>
                  </div>
                </div>
              </Card>
            </m.div>
          </div>
        </section>

        <Footer />
      </div>
    </LazyMotion>
  );
}

export default Home;
