import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Why QMail', path: '/email-crisis' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Technology', path: '/technology' }, 
    { name: 'Strategy', path: '/strategy' },     
    { name: 'FAQs', path: '/faq' },
    { name: 'About', path: '/about' }
  ]

  const menuVariants = {
    hidden: { opacity: 0, y: -50, transition: { duration: 0.2 } },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-black/20 backdrop-blur-md'
      }`}>
    
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo Section */}
        <Link to="/">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <motion.svg width="40" height="40" viewBox="0 0 100 100" whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }}>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="3" />
              <motion.path d="M 50 25 Q 70 25 70 45 Q 70 60 55 65 L 65 75" fill="none" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" />
              <motion.circle cx="50" cy="45" r="8" fill="url(#logoGradient)" />
            </motion.svg>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                QMail
              </span>
              <span className="text-[10px] text-blue-300/70 font-medium tracking-wider">QUANTUM-SAFE</span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          {navItems.map((item, index) => (
            <motion.div key={item.path} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Link to={item.path} className="relative group">
                <span className={`text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                  {item.name}
                </span>
                <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400" animate={{ scaleX: location.pathname === item.path ? 1 : 0 }} />
              </Link>
            </motion.div>
          ))}

          {/* Updated Influencers Button with Responsive Tooltip */}
          <div className="relative">
            <Link to="/button">
              <motion.button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="relative px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full text-white font-semibold text-sm overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500" initial={{ x: '100%' }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }} />
                <span className="relative z-10">Influencers</span>
              </motion.button>
            </Link>

            {/* Responsive Tooltip component */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  // CHANGED: Removed left-1/2 -translate-x-1/2, Added right-0 and max-w responsive constraints
                  className="absolute top-full mt-3 right-0 w-64 max-w-[85vw] md:max-w-xs p-4 bg-gray-900 border border-blue-500/30 rounded-2xl shadow-2xl backdrop-blur-xl z-[60]"
                >
                  <div className="flex gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Info size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">Partner Portal</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Access internal tools to generate custom messaging links and embeddable buttons for influencer campaigns.
                      </p>
                    </div>
                  </div>
                  {/* Tooltip Arrow - CHANGED: moved to the right to align with button */}
                  <div className="absolute -top-1.5 right-8 w-3 h-3 bg-gray-900 border-t border-l border-blue-500/30 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <motion.div className="lg:hidden" whileTap={{ scale: 0.9 }}>
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div variants={menuVariants} initial="hidden" animate="visible" exit="exit" className="lg:hidden bg-gray-900/98 backdrop-blur-xl border-t border-blue-500/20 max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <Link to={item.path} onClick={() => setIsOpen(false)} className={`block py-3 px-4 rounded-lg text-base font-medium ${location.pathname === item.path ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-300 hover:text-white'}`}>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={itemVariants} className="pt-4">
                <Link to="/button" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full text-white font-semibold text-base">
                    Influencers
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation