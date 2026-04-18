import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Eye, Server, Lock, Trash2, Users } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
      <Icon className="w-5 h-5 text-blue-400 shrink-0" />
      {title}
    </h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function Privacy() {
  useDocumentMeta({ title: 'Privacy Policy', description: 'How QMail protects your privacy. We cannot read your messages — our architecture makes surveillance technically impossible.' });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#0a0a1a]">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-400 mb-12">Last updated: April 13, 2026</p>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 md:p-12">

            <Section icon={Shield} title="Our Privacy Philosophy">
              <p>
                QMail (the Distributed Mail System) is built on a fundamental belief: your communications are yours alone. Unlike traditional email providers, we cannot read your messages, scan your attachments, or profile your behavior — because our architecture makes that technically impossible.
              </p>
              <p>
                This policy explains what minimal data we do collect and why.
              </p>
            </Section>

            <Section icon={Mail} title="What We Collect">
              <p><strong className="text-white">When you register an address:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Your first and last name (from PayPal identity verification)</li>
                <li>Your QMail address (generated automatically)</li>
                <li>Your payment amount and selected tier</li>
              </ul>
              <p><strong className="text-white">When you register as an influencer:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Your PayPal email (for revenue share payments)</li>
                <li>Alternative payment method (if provided)</li>
              </ul>
              <p><strong className="text-white">When you purchase CloudCoins via an influencer link:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Your name (from PayPal)</li>
                <li>The payment amount and influencer associated with the purchase</li>
              </ul>
              <p><strong className="text-white">Website analytics:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Anonymous page visit and button click events (no cookies, no IP tracking, no fingerprinting)</li>
              </ul>
            </Section>

            <Section icon={Eye} title="What We Do NOT Collect">
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>The contents of any messages you send or receive</li>
                <li>Your contacts or address book</li>
                <li>Metadata about who you communicate with</li>
                <li>Your IP address or browser fingerprint</li>
                <li>Tracking cookies or advertising identifiers</li>
              </ul>
              <p>
                QMail uses quantum-safe, end-to-end encryption. Messages are encrypted on your device before transmission. We have no technical ability to decrypt them.
              </p>
            </Section>

            <Section icon={Server} title="How Your Data is Used">
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Registration data is used solely to generate and maintain your QMail address</li>
                <li>Payment data is used to process transactions and pay influencer revenue shares</li>
                <li>Analytics data is used in aggregate to improve the website experience</li>
              </ul>
              <p>We never sell, rent, or share your personal data with third parties for marketing purposes.</p>
            </Section>

            <Section icon={Lock} title="Data Security">
              <p>
                Your QMail credentials are secured using the RAIDA (Redundant Array of Independent Detection Agents) network — a decentralized authentication system with no single point of failure. Your private keys never leave your device.
              </p>
            </Section>

            <Section icon={Users} title="Third-Party Services">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-white">PayPal</strong> — for payment processing and identity verification. PayPal's privacy policy governs data they collect during transactions.</li>
                <li><strong className="text-white">Google Fonts</strong> — for typography. No personal data is transmitted.</li>
              </ul>
            </Section>

            <Section icon={Trash2} title="Data Deletion">
              <p>
                You may request deletion of your personal data at any time. Your QMail address can be made anonymous (name removed from the directory) through the settings in your QMail client, or by contacting support.
              </p>
              <p>
                Contact us at <span className="text-blue-400">CloudCoin@Protonmail.com</span> for any privacy-related requests.
              </p>
            </Section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
