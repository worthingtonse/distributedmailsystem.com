import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const NotFound = () => {
  useDocumentMeta({
    title: "Page Not Found",
    description: "This page does not exist. Return home or claim a QMail address.",
    noindex: true,
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        <p className="text-blue-400 font-bold tracking-widest text-sm mb-4">
          404
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Page not found
        </h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          That link doesn&apos;t lead anywhere. Head home, read how QMail works,
          or claim your mailbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
          >
            Claim a QMail Address
          </Link>
          <Link
            to="/faq"
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:border-blue-500/50 transition-colors"
          >
            FAQ
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
