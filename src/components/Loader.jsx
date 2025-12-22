import React from 'react'
import { motion } from 'framer-motion'

function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2a] to-[#2a2a3a] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          rotate: [0, 360],
          scale: [0.5, 1, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full"
      >
        <div className="absolute inset-2 border-4 border-transparent border-b-blue-300 border-l-blue-300 rounded-full animate-pulse"></div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-1/4 text-white text-xl font-bold"
      >
        Loading QMail
      </motion.p>
    </div>
  )
}

export default Loader