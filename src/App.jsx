import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation.jsx'
import StarryBackground from './components/StarryBackground.jsx'
import Loader from './components/Loader.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

// Pages
const Home = lazy(() => import('./pages/Home.jsx'))
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'))
const EmailCrisis = lazy(() => import('./pages/EmailCrisis.jsx'))
const Technology = lazy(() => import('./pages/Technology.jsx'))
const FAQ = lazy(() => import('./pages/Faq.jsx')) 
const Strategy = lazy(() => import('./pages/SalesStrategy.jsx'))
const VerifiedAccess = lazy(() => import('./pages/VerifiedAccess.jsx'))
const FunnelSuccess = lazy(() => import('./pages/FunnelSuccess.jsx'))
const AdminLinkGen = lazy(() => import('./pages/AdminLinkGen.jsx'))
const RegisterAddress = lazy(() => import('./pages/RegisterAddress.jsx'))
const Subscribe = lazy(() => import('./pages/Subscribe.jsx'))
const Whitepaper = lazy(() => import('./pages/Whitepaper.jsx'))

/**
 * AnimatedRoutes Component
 * Separated to access useLocation() which must be inside a <Router>
 */
const AnimatedRoutes = () => {
  const location = useLocation();
  const hideNav = ['/access', '/success'].includes(location.pathname);

  return (
    <div className="relative min-h-screen">
      {!hideNav && <Navigation />}
      
      {/* mode="wait" ensures the current page finishes animating out 
        before the next one (or the loader) animates in.
      */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<Loader />}>
          {/*  We pass 'location' and 'key' to Routes.
            This tells Framer Motion exactly when the path changes, 
            preventing the "screen hang" while lazy chunks load.
          */}
          <Routes location={location} key={location.pathname}>
            {/* Core Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/email-crisis" element={<EmailCrisis />} /> 
            
            {/* Sales Funnel & Onboarding */}
            <Route path="/access" element={<VerifiedAccess />} />
            <Route path="/success" element={<FunnelSuccess />} />
            <Route path="/register" element={<RegisterAddress />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            
            {/* Internal Tools */}
            <Route path="/button" element={<AdminLinkGen />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <StarryBackground />
      <AnimatedRoutes />
    </Router>
  )
}

export default App