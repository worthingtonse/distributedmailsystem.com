import React, { useState, useEffect, memo } from "react";
import {
  motion,
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
  Ban,
  Award,
  FileCheck,
  ChevronDown,
  ArrowDown,
} from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import QmailDelivery from "../components/QmailDelivery";

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

// Custom problem-area icons — each drawn to support its card's point
const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Copies fanning out at every hop — surveillance is baked in
const CopiesIcon = ({ className = "" }) => (
  <svg className={className} {...svgBase}>
    <rect x="3" y="3" width="12" height="8.5" rx="1.5" opacity="0.4" />
    <rect x="6" y="6" width="12" height="8.5" rx="1.5" opacity="0.7" />
    <rect x="9" y="9" width="12" height="8.5" rx="1.5" />
    <path d="M9 10l6 4 6-4" />
  </svg>
);

// Content locked, but the address lines above stay exposed
const MetadataIcon = ({ className = "" }) => (
  <svg className={className} {...svgBase}>
    <line x1="4" y1="4" x2="15" y2="4" />
    <line x1="4" y1="7.5" x2="11" y2="7.5" />
    <rect x="6" y="12" width="12" height="8" rx="1.5" />
    <path d="M8.5 12v-1.5a3.5 3.5 0 0 1 7 0V12" />
  </svg>
);

// A bundle of dynamite with a lit fuse — encryption on a countdown
const TimebombIcon = ({ className = "" }) => (
  <svg className={className} {...svgBase}>
    <rect x="4.5" y="10" width="12" height="11" rx="2" />
    <path d="M8.5 10v11M12.5 10v11" />
    <path d="M4.5 13.5h12M4.5 17.5h12" />
    <path d="M10.5 10c0-2.2 1.2-3 3.2-2.4" />
    <path d="M13.7 4.4v3.2M12.1 6h3.2M12.6 4.9l2.2 2.2M14.8 4.9l-2.2 2.2" />
  </svg>
);

// An envelope paired with a coin — reaching the inbox has a price
const InboxFeeIcon = ({ className = "" }) => (
  <svg className={className} {...svgBase}>
    <rect x="2" y="8" width="12" height="9" rx="1.5" />
    <path d="M2 9.5l6 4 6-4" />
    <circle cx="18" cy="9" r="4.5" />
    <path d="M18 6.5v5" />
    <path d="M19.6 7.6a1.7 1.7 0 0 0-1.6-.9c-.9 0-1.6.5-1.6 1.2 0 1.7 3.2.9 3.2 2.5 0 .7-.7 1.2-1.6 1.2a1.8 1.8 0 0 1-1.6-.9" />
  </svg>
);

// Problem card with an optional ⓘ that reveals an authoritative citation
const ProblemCard = ({ problem, delay }) => {
  const [open, setOpen] = useState(false);
  const Icon = problem.icon;
  return (
    <Card delay={delay}>
      <div className="relative text-center">
        {problem.citation && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`Source for ${problem.title}`}
            className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 rounded-full border border-gray-600/70 text-gray-400 text-xs font-serif italic leading-none hover:text-white hover:border-blue-500/70 transition-colors"
          >
            i
          </button>
        )}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${problem.gradient} rounded-2xl mb-6`}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">{problem.title}</h3>
        <p className="text-gray-400 leading-relaxed">{problem.description}</p>
        {open && problem.citation && (
          <div className="mt-4 text-left text-sm bg-gray-950/70 border border-gray-700/60 rounded-xl p-3">
            <p className="text-gray-300">{problem.citation.text}</p>
            <a
              href={problem.citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              {problem.citation.source} →
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};

function Home() {
  useDocumentMeta({
    title: "Spam-Free Private Email",
    description:
      "QMail is quantum-safe, spam-resistant email. Claim your mailbox from $10 with a 30-day money-back window. Get paid to receive mail.",
    path: "/",
  });

  const scrollToNextSection = () => {
    const element = document.getElementById("problems");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const problemAreas = [
    {
      icon: CopiesIcon,
      title: "Surveillance Guaranteed",
      description:
        "A sent email is never just one copy. It lands on your device, your mail server, every relay along the route, the recipient's server, and their device. Once it leaves your outbox, no one can recall it or control who ends up holding a copy.",
      gradient: "from-red-500 to-orange-500",
      citation: {
        text: "Edward Snowden's 2013 disclosures revealed programs that tapped directly into the servers of major internet and email providers, collecting user communications at scale.",
        source: "The Guardian — NSA Prism program (Snowden revelations)",
        url: "https://www.theguardian.com/world/2013/jun/06/us-tech-giants-nsa-data",
      },
    },
    {
      icon: MetadataIcon,
      title: "Metadata Trails",
      description:
        "Encryption hides the words, not the envelope. Who you wrote, who wrote you, when, how often, subject lines, and message size all stay exposed — and metadata alone can map your relationships and routines.",
      gradient: "from-orange-500 to-yellow-500",
      citation: {
        text: "Encryption protects the content of a message, but metadata — who, whom, and when — is generally not hidden and can reveal a great deal.",
        source: "EFF — Why Metadata Matters",
        url: "https://ssd.eff.org/module/why-metadata-matters",
      },
    },
    {
      icon: TimebombIcon,
      title: "Encryption Shelf Life",
      description:
        "Today's encryption isn't permanent. An adversary can capture your encrypted mail now and simply store it, waiting for tomorrow's computers to break it. What's secret today may be an open book in a decade.",
      gradient: "from-purple-500 to-pink-500",
      citation: {
        text: "Adversaries may steal encrypted data today to decrypt once quantum computers mature — the 'harvest now, decrypt later' threat.",
        source: "CISA — Post-Quantum Cryptography Initiative",
        url: "https://www.cisa.gov/quantum",
      },
    },
    {
      icon: InboxFeeIcon,
      title: "Spam = Income",
      description:
        "QMail doesn't magically block spam — it prices it. To reach your inbox, a sender pays your inbox fee. Unwanted mass mail becomes expensive, and you get paid for the attention you give.",
      gradient: "from-cyan-500 to-blue-500",
      citation: {
        text: "Requiring senders to pay a cost to send raises the price of bulk unsolicited mail — the economic approach to fighting spam.",
        source: "Dwork & Naor — Pricing via Processing (1992)",
        url: "https://www.wisdom.weizmann.ac.il/~naor/PAPERS/pvp.pdf",
      },
    },
  ];

  const solutions = [
    {
      icon: Shield,
      title: "Shredded Delivery",
      description:
        "Messages are shredded, encrypted with AES encryption, dispersed among tens of mail servers including inexpensive QMail servers owned by you, your friends and family.",
      link: "/register",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Lock,
      title: "Post-Quantum Cryptography (PQC)",
      description:
        "We use a newly invented quantum-safe key exchange system that stays secure even when quantum computers arrive.",
      link: "/register",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Globe,
      title: "You Own Your Address",
      description:
        "Your address belongs only to you. It's locked to a secret key, not handed out by a company or middleman — so no one can take it, sell it, or shut it down. Later you can list yourself in the public QMail directory (Phase II) so people can find you, or stay private. It's yours to keep.",
      link: "/register",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const comparisonData = [
    {
      feature: "Attachment Limits",
      traditional: "25MB",
      qmail: "None",
      icon: CheckCircle2,
    },
    {
      feature: "Upload Speed",
      traditional: "Slow",
      qmail: "Ten to 20 times faster",
      icon: CheckCircle2,
    },
    {
      feature: "Download Speed",
      traditional: "Slow",
      qmail: "Ten to 20 times faster",
      icon: CheckCircle2,
    },
    {
      feature: "Send Times",
      traditional: "Many seconds",
      qmail: "Less than two seconds",
      icon: CheckCircle2,
    },
    {
      feature: "Addresses",
      traditional: "Are Assigned",
      qmail: "Based on CloudCoins",
      icon: CheckCircle2,
    },
    {
      feature: "Encryption",
      traditional: "Vulnerable",
      qmail: "Quantum Safe",
      icon: CheckCircle2,
    },
    {
      feature: "Editing Sent",
      traditional: "Not possible",
      qmail: "Possible before received",
      implementationNote: true,
      icon: CheckCircle2,
    },
    {
      feature: "Deleting Sent",
      traditional: "Not possible",
      qmail: "Possible before received",
      implementationNote: true,
      icon: CheckCircle2,
    },
    {
      feature: "Meta Data",
      traditional: "All can see To, From, Subject etc",
      qmail: "None Exposed",
      icon: CheckCircle2,
    },
    {
      feature: "Storage",
      traditional: "One server",
      qmail: "Striped on 10 to 32 servers",
      icon: CheckCircle2,
    },
    {
      feature: "Server Locations",
      traditional: "Data Center",
      qmail: "Distributed Globally",
      icon: CheckCircle2,
    },
    {
      feature: "Login",
      traditional: "Username, Password & 2FA",
      qmail: "Certificate (CloudCoin)",
      icon: CheckCircle2,
    },
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
      icon: CheckCircle2,
    },
    {
      feature: "Spam Protection",
      traditional: "Unreliable filters",
      qmail: "Economic barriers",
      icon: CheckCircle2,
    },
    {
      feature: "Privacy",
      traditional: "Read by servers & ISPs",
      qmail: "End-to-end confidential",
      icon: CheckCircle2,
    },
    {
      feature: "Message Size",
      traditional: "Bloated HTML (1MB+)",
      qmail: "Compact binary (10KB)",
      icon: CheckCircle2,
    },
    {
      feature: "Control",
      traditional: "Controlled by tech giants",
      qmail: "You own your mailbox and your email server too (optional)",
      icon: CheckCircle2,
    },
    {
      feature: "Cost Model",
      traditional: "Pay with your data",
      qmail: "Get paid for your attention",
      icon: CheckCircle2,
    },
    {
      feature: "Set Inbox Fee",
      traditional: "Not Possible, Major Spam and Phishing",
      qmail: "Senders must pay",
      icon: CheckCircle2,
    },
    {
      feature: "Set Avatar Symbols",
      traditional: "Nearly impossible",
      qmail: "Customizable",
      icon: CheckCircle2,
    },
    {
      feature: "White List",
      traditional: "No",
      qmail: "Remove Inbox Fees for friends",
      icon: CheckCircle2,
    },
    {
      feature: "Black List",
      traditional: "Difficult Filters",
      qmail: "Easy",
      icon: CheckCircle2,
    },
    {
      feature: "Address Revocation",
      traditional: "Anytime",
      qmail: "Can't be done",
      icon: CheckCircle2,
    },
  ];

  const services = [
    "Get a QMail address",
    "Set your Inbox price to get paid for your attention and pay others for their attention too",
    "Run your own QMail server from home (optional) and get paid for it!",
    "Turbocharge your Influencer Income by setting an inbox fee",
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
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />

          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-5xl mx-auto text-center">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <QmailDelivery className="mb-10" />
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                  The Most Secure Messaging System in the World
                </h1>

                <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                  QMail is an <span className="font-bold">open standard</span> for decentralized mail — designed so no single company owns your inbox. Claim a permanent address, get paid to receive emails, and keep stronger privacy by default.
                </p>

                <div className="flex flex-col gap-3 justify-center items-center pt-4 w-full max-w-sm mx-auto sm:max-w-none sm:flex-row sm:gap-4">
                  <AnimatedButton
                    to="/register"
                    variant="primary"
                    size="large"
                    className="w-full sm:w-auto min-w-[160px]"
                  >
                    Claim Your QMail Address
                  </AnimatedButton>
                  <AnimatedButton
                    to="/subscribe"
                    variant="secondary"
                    size="large"
                    className="w-full sm:w-auto min-w-[140px]"
                  >
                    Buy Credits
                  </AnimatedButton>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Creators:{" "}
                  <Link to="/influencers" className="text-green-400/90 hover:text-green-300 underline">
                    earn when fans message you
                  </Link>{" "}
                  (Phase II)
                </p>

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

        {/* For Influencers Section */}
        <section className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-transparent via-green-900/5 to-transparent">
          <div className="container mx-auto px-4">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-xl rounded-3xl border border-green-500/20 p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold mb-4">
                      <DollarSign className="w-3 h-3" />
                      Phase II — join the waitlist
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Influencers:{" "}
                      <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Get Paid
                      </span>{" "}
                      for Every Message
                    </h2>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Share your QLink with your audience. Every follower who wants to reach you pays a small fee — you keep 85% (15% platform fee). Free to join when Phase II opens.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/influencers"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-green-500/25 transition-all text-sm"
                      >
                        See How It Works
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-green-500/30 text-green-400 font-bold rounded-full hover:bg-green-500/10 transition-all text-sm"
                      >
                        Claim a Mailbox Now
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { step: "1", title: "Create your QLink", desc: "Free signup — verified via a $0.01 PayPal micro-charge" },
                      { step: "2", title: "Share your QLink everywhere", desc: "Social media, bio links, email signatures" },
                      { step: "3", title: "Get paid", desc: "85% of every purchase goes to your PayPal" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-green-500/10">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </section>

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
                The traditional email system is fundamentally broken.
              </p>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {problemAreas.map((problem, index) => (
                <ProblemCard
                  key={problem.title}
                  problem={problem}
                  delay={index * 0.1}
                />
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
                AI and Quantum Computers make email dangerous — Switch to QMail Now
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
                QMail is a complete reimagining of digital communication built for a post-quantum world.
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
                    communications. By removing the server, we've removed the
                    single point of failure and the
                    <span className="text-blue-400 font-semibold">
                      {" "}
                      incentive for surveillance
                    </span>
                    ."
                  </blockquote>

                  <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-gray-700/50">
                    {[
                      { icon: Shield, text: "Decentralized" },
                      { icon: FileCheck, text: "Your Own Address" },
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
                      {row.implementationNote && (
                        <span className="ml-1 text-[#ffd800]" aria-label="Feature still being implemented">
                          *
                        </span>
                      )}
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
                  to="/influencers"
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
                    into your own home. It's more private,
                    you have more space and you own the foundation."
                  </p>

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

                  <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 max-w-3xl mx-auto flex flex-col items-center text-center">
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-300 mb-4 sm:mb-6 px-2">
                      QMail addresses look something like these:
                      <span className="block mt-2 font-mono text-blue-400 text-xs sm:text-sm lg:text-base space-x-4">
                        <span className="whitespace-nowrap">26.84@giga</span>
                        <span className="whitespace-nowrap">188.2@byte</span>
                        <span className="whitespace-nowrap">1.15.245@bit</span>
                      </span>
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
      </div>
    </LazyMotion>
  );
}

export default Home;
