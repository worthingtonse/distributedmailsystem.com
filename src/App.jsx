import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation.jsx'
import StarryBackground from './components/StarryBackground.jsx'
import Loader from './components/Loader.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'


// Pages - Using explicit extensions and correct casing for resolution
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

// Helper component to handle conditional Navigation
const MainLayout = ({ children }) => {
  const location = useLocation();
  const hideNav = ['/access', '/success'].includes(location.pathname);

  return (
    <div className="relative min-h-screen">
      {!hideNav && <Navigation />}
      {children}
    </div>
  );
};

/**
 * Main Application Component
 * Handles routing, persistence of background elements, and scroll management.
 */
function App() {
  return (
    <Router>
      {/* Utility to reset scroll position on every navigation change */}
      <ScrollToTop />
      
      {/* Persistent 3D Starry Background across all routes */}
      <StarryBackground />
      <MainLayout>

      {/* <div className="relative min-h-screen">
        <Navigation /> */}
        
        {/* AnimatePresence allows for exit animations when components are unmounted */}
        <AnimatePresence mode="wait">
          <Suspense fallback={<Loader />}>
            <Routes>
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
              
              {/* Internal Tools */}
              <Route path="/button" element={<AdminLinkGen />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
        </MainLayout>
       
      {/* </div> */}
    </Router>
  )
}

export default App