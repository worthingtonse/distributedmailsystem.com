import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, DollarSign, Shield, Scale, RefreshCw, Ban } from 'lucide-react';
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

export default function Terms() {
  useDocumentMeta({ title: 'Terms of Service', description: 'Terms of Service for QMail, the Distributed Mail System.' });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#0a0a1a]">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-gray-400 mb-12">Last updated: April 13, 2026</p>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 md:p-12">

            <Section icon={FileText} title="Agreement to Terms">
              <p>
                By accessing or using QMail (the Distributed Mail System) at distributedmailsystem.com, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
              </p>
              <p>
                QMail is operated by RaidaTech. "We," "us," and "our" refer to RaidaTech. "You" and "your" refer to the user.
              </p>
            </Section>

            <Section icon={Shield} title="Service Description">
              <p>
                QMail is a decentralized, quantum-safe email system. The service includes:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Registration and management of QMail addresses</li>
                <li>Purchase of CloudCoins (digital postage credits)</li>
                <li>Influencer link generation and revenue sharing</li>
                <li>Desktop client software for sending and receiving messages</li>
              </ul>
              <p>
                QMail is currently in <strong className="text-white">Phase I (Beta)</strong>. Features may change, and some functionality is under active development.
              </p>
            </Section>

            <Section icon={DollarSign} title="Payments and Refunds">
              <p><strong className="text-white">Address Registration:</strong> Registration requires a stake payment (ranging from $10 to $1,000) via PayPal. This stake activates your address and signals your commitment to the network.</p>
              <p><strong className="text-white">CloudCoin Purchases:</strong> CloudCoins are digital postage credits. Once purchased, CloudCoins are non-refundable as they are immediately loaded into the RAIDA network.</p>
              <p><strong className="text-white">Refund Policy:</strong> Address registration payments are refundable within 30 days of purchase. Contact support to request a refund.</p>
              <p><strong className="text-white">Influencer Revenue Share:</strong> Influencers receive 50% of affiliate sales. Payments are made via PayPal. Payment timing may be affected by PayPal's fund holding policies.</p>
            </Section>

            <Section icon={RefreshCw} title="Influencer Program">
              <p>
                Influencers may generate custom links to share with their audience. By participating, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Not misrepresent the service or make false claims</li>
                <li>Not use deceptive or misleading marketing practices</li>
                <li>Not impersonate other individuals when creating links</li>
                <li>Accept that revenue share percentages may change with notice</li>
              </ul>
              <p>
                We reserve the right to terminate influencer accounts that violate these terms.
              </p>
            </Section>

            <Section icon={Ban} title="Prohibited Uses">
              <p>You agree not to use QMail to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Send unsolicited bulk messages (spam)</li>
                <li>Distribute malware or harmful content</li>
                <li>Engage in illegal activity</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Impersonate others or create fraudulent accounts</li>
                <li>Attempt to circumvent the postage system</li>
              </ul>
            </Section>

            <Section icon={AlertTriangle} title="Disclaimer of Warranties">
              <p>
                QMail is provided "as is" and "as available." We make no warranties, express or implied, regarding the service's reliability, availability, or fitness for a particular purpose.
              </p>
              <p>
                As a Phase I beta product, we cannot guarantee uninterrupted service. We are not liable for any losses resulting from service interruptions, data loss, or security breaches beyond our control.
              </p>
            </Section>

            <Section icon={Scale} title="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, RaidaTech's total liability for any claims arising from your use of QMail shall not exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
              <p>
                We are not liable for indirect, incidental, special, consequential, or punitive damages.
              </p>
            </Section>

            <Section icon={FileText} title="Changes to Terms">
              <p>
                We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. Material changes will be communicated via the website.
              </p>
              <p>
                Questions? Contact us at <span className="text-blue-400">CloudCoin@Protonmail.com</span>
              </p>
            </Section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
