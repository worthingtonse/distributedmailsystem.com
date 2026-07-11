import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Monitor, Smartphone, HardDrive, Clock } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const WINDOWS_DOWNLOAD_URL = "/downloads/qmail.for.windows.zip";

const Downloads = () => {
  useDocumentMeta({
    title: "Download QMail for Windows",
    description:
      "Download the QMail client for Windows. Claim your mailbox address and start using spam-resistant, private email.",
  });

  const platforms = [
    {
      name: "Windows",
      icon: Monitor,
      description: "Windows 10 or later",
      available: true,
      url: WINDOWS_DOWNLOAD_URL,
    },
    {
      name: "macOS",
      icon: Monitor,
      description: "macOS 12 or later",
      available: false,
    },
    {
      name: "Linux",
      icon: HardDrive,
      description: "Ubuntu, Debian, Fedora",
      available: false,
    },
    {
      name: "Android",
      icon: Smartphone,
      description: "Android 10 or later",
      available: false,
    },
    {
      name: "iOS",
      icon: Smartphone,
      description: "iOS 15 or later",
      available: false,
    },
  ];

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Download <span className="qmail-gradient-text">QMail</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The QMail desktop client is available for Windows today. Other
            platforms are on the roadmap.
          </p>
          <p className="text-sm text-blue-300/80 mt-4">
            Need an address first?{" "}
            <Link to="/register" className="underline hover:text-blue-200">
              Claim your QMail mailbox
            </Link>{" "}
            (from $10 · 30-day money-back).
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, i) => {
            const Icon = platform.icon;
            const cardClass =
              "bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center transition-all " +
              (platform.available
                ? "hover:border-blue-500/50 group"
                : "opacity-80");

            const content = (
              <>
                <Icon
                  size={40}
                  className={
                    "mx-auto mb-4 transition-transform " +
                    (platform.available
                      ? "text-blue-400 group-hover:scale-110"
                      : "text-gray-500")
                  }
                />
                <h3 className="text-xl font-bold text-white mb-2">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {platform.description}
                </p>
                {platform.available ? (
                  <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm group-hover:bg-blue-500 transition-all">
                    <Download size={16} /> Download for Windows
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-gray-800 text-gray-400 px-6 py-3 rounded-xl font-bold text-sm border border-gray-700">
                    <Clock size={16} /> Coming Soon
                  </span>
                )}
              </>
            );

            return platform.available ? (
              <motion.a
                key={platform.name}
                href={platform.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cardClass}
              >
                {content}
              </motion.a>
            ) : (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cardClass}
                aria-disabled="true"
              >
                {content}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center space-y-3">
          <p className="text-gray-500 text-sm">
            Windows build is the current release. Mac, Linux, and mobile clients
            ship in later phases.
          </p>
          <Link
            to="/register"
            className="inline-flex text-blue-400 hover:text-blue-300 text-sm font-semibold"
          >
            Don&apos;t have a mailbox yet? Register here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
