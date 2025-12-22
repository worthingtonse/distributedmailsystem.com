import React from 'react'
import { motion } from 'framer-motion'

function Features() {
  const features = [
    {
      title: 'Quantum-Safe Security',
      subtitle: 'Secure for Today, Safe for Tomorrow',
      description: 'Quantum computing poses a significant threat to current encryption methods. QMail introduces QKE (Quantum-Safe Key Exchange) to future-proof your communications, ensuring your data remains secure against emerging technological challenges.'
    },
    {
      title: 'Decentralized Network',
      subtitle: 'No Single Point of Failure. No Central Control',
      description: 'Unlike centralized providers like Google or Microsoft, QMail uses the RAIDA network to distribute your data across multiple servers. This means no single point of failure and enhanced resilience against outages and attacks.'
    },
    {
      title: 'User-Owned and Controlled',
      subtitle: 'Your Data is Yours. Period.',
      description: 'We reject the traditional model of data mining and advertising. Your identity is tied to your own digital certificate (CloudCoin), not an account owned by a corporation. Complete control, zero compromise.'
    },
    {
      title: 'Spam-Resistant by Design',
      subtitle: 'An Inbox for Messages That Matter',
      description: 'QMail\'s unique architecture requires authentication via RAIDA, making it fundamentally difficult and costly for spammers to operate. Enjoy a clean, meaningful communication experience.'
    }
  ]

  return (
    <div className="min-h-screen pt-16 flex flex-col justify-center items-center">
      <div className="container mx-auto px-4 text-center z-10 relative">
        {/* Hero Section */}
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          The Future of Secure Communication is Here
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12"
        >
          QMail is built from the ground up to protect you in ways traditional email can't.
        </motion.p>

        {/* Detailed Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.2 
              }}
              className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-blue-500 transition-all"
            >
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <h4 className="text-xl text-blue-400 mb-4">{feature.subtitle}</h4>
              <p className="text-white/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Experience True Privacy?</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all">
            Join the Waitlist
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Features