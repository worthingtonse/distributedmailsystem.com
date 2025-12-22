import React from 'react'
import { motion } from 'framer-motion'

function Vision() {
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
          More Than an App. A Movement.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12"
        >
          We believe in a free, private, and equitable internet for everyone.
        </motion.p>

        {/* Vision Sections */}
        <div className="max-w-3xl mx-auto space-y-12">
          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-blue-500 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-6">The Problem with Email Today</h3>
            <p className="text-white/80">
              Email, while essential, is built on 50-year-old technology. It's centralized, constantly spied on, and controlled by a few large corporations who profit from your data.
            </p>
          </motion.div>

          {/* Our Mission */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-blue-500 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
            <p className="text-white/80">
              Our mission is to give digital sovereignty back to the individual. QMail is the first step: a communication protocol that is owned by its users, not by a company.
            </p>
          </motion.div>

          {/* Roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-blue-500 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-6">The Roadmap (Phase 1)</h3>
            <p className="text-white/80">
              QMail Phase 1 is the launch of this foundation. It focuses on the most critical components: quantum-safe security and decentralized, plain-text messaging. This is the solid ground upon which we will build the future of communication.
            </p>
          </motion.div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Be a Part of the Future</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all">
            Join the Waitlist
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Vision