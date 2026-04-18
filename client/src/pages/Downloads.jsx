import React from "react";
import { motion } from "framer-motion";
import { Download, Monitor, Smartphone, HardDrive } from "lucide-react";

const Downloads = () => {
  const platforms = [
    {
      name: "Windows",
      icon: Monitor,
      description: "Windows 10 or later",
      url: "#",
    },
    {
      name: "macOS",
      icon: Monitor,
      description: "macOS 12 or later",
      url: "#",
    },
    {
      name: "Linux",
      icon: HardDrive,
      description: "Ubuntu, Debian, Fedora",
      url: "#",
    },
    {
      name: "Android",
      icon: Smartphone,
      description: "Android 10 or later",
      url: "#",
    },
    {
      name: "iOS",
      icon: Smartphone,
      description: "iOS 15 or later",
      url: "#",
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
            Get the QMail client for your platform and start sending secure, decentralized email.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, i) => (
            <motion.a
              key={platform.name}
              href={platform.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all group"
            >
              <platform.icon
                size={40}
                className="text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-xl font-bold text-white mb-2">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{platform.description}</p>
              <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all">
                <Download size={16} /> Download
              </span>
            </motion.a>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Downloads will be available soon. Join our Telegram for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
