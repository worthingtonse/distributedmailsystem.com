import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-3">QMail</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The future of secure, decentralized messaging. Own your digital
                identity.
              </p>
            </div>

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

          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center sm:text-left">
                © 2026 RaidaTech. All rights reserved.
              </p>
              <Link
                to="/register"
                className="px-6 py-3 rounded-full font-bold text-base border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
