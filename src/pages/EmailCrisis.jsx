import React, { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { 
  Shield, 
  AlertTriangle,
  Eye,
  DollarSign,
  Server,
  Lock,
  Zap,
  TrendingUp,
  Users,
  Target,
  Brain,
  FileWarning,
  Ban,
  Skull,
  ShieldAlert,
  Database
} from 'lucide-react'

// Three.js Background Component - Network Under Attack
const ThreeBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.position.z = 50

    // Create network nodes
    const nodes = []
    const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const normalNodeMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 })
    const compromisedNodeMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 })

    // Create node positions in a network pattern
    for (let i = 0; i < 50; i++) {
      const node = new THREE.Mesh(nodeGeometry, normalNodeMaterial.clone())
      node.position.x = (Math.random() - 0.5) * 80
      node.position.y = (Math.random() - 0.5) * 60
      node.position.z = (Math.random() - 0.5) * 40
      node.userData.originalPosition = node.position.clone()
      node.userData.compromised = false
      node.userData.compromiseTime = Math.random() * 10
      nodes.push(node)
      scene.add(node)
    }

    // Create connections between nodes
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.2 
    })
    const compromisedLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0.4 
    })

    const connections = []
    nodes.forEach((node, i) => {
      // Connect to nearest 3 nodes
      const distances = nodes.map((otherNode, j) => ({
        node: otherNode,
        distance: node.position.distanceTo(otherNode.position),
        index: j
      }))
      .filter((d, j) => j !== i)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)

      distances.forEach(({ node: otherNode }) => {
        const points = [node.position, otherNode.position]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(geometry, lineMaterial.clone())
        line.userData.nodes = [node, otherNode]
        connections.push(line)
        scene.add(line)
      })
    })

    // Create warning particles
    const particleCount = 100
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 100
      particlePositions[i + 1] = (Math.random() - 0.5) * 100
      particlePositions[i + 2] = (Math.random() - 0.5) * 50
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({ 
      color: 0xef4444, 
      size: 0.15,
      transparent: true,
      opacity: 0.4
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // Animation
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01

      // Rotate entire scene slowly
      scene.rotation.y = time * 0.05

      // Animate nodes - compromise them over time
      nodes.forEach((node, i) => {
        // Pulse animation
        const scale = 1 + Math.sin(time * 2 + i) * 0.1
        node.scale.set(scale, scale, scale)

        // Compromise nodes in a wave
        if (time > node.userData.compromiseTime && !node.userData.compromised) {
          node.material = compromisedNodeMaterial.clone()
          node.userData.compromised = true
        }

        // Shake compromised nodes
        if (node.userData.compromised) {
          node.position.x = node.userData.originalPosition.x + Math.sin(time * 5 + i) * 0.3
          node.position.y = node.userData.originalPosition.y + Math.cos(time * 5 + i) * 0.3
        }
      })

      // Update connections
      connections.forEach(line => {
        const [node1, node2] = line.userData.nodes
        const points = [node1.position, node2.position]
        line.geometry.setFromPoints(points)
        
        // Change color if either node is compromised
        if (node1.userData.compromised || node2.userData.compromised) {
          line.material = compromisedLineMaterial.clone()
        }
      })

      // Animate particles
      const positions = particles.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.05
        if (positions[i + 1] < -50) {
          positions[i + 1] = 50
        }
      }
      particles.geometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.4 }}
    />
  )
}

// Professional Card
const Card = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay }}
      className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-colors"
    >
      {children}
    </motion.div>
  )
}

// Stat Card
const StatCard = ({ icon: Icon, value, label, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay }}
      className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
    >
      <div className="w-10 h-10 text-gray-400 mb-4">
        <Icon className="w-full h-full" />
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  )
}

function EmailCrisis() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section with Three.js Background */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{ opacity }}
      >
        <ThreeBackground />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950" />

        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-red-600/20 rounded-2xl mb-8"
            >
              <ShieldAlert className="w-12 h-12 text-red-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="text-red-400">
                The Hidden Crisis
              </span>
              <br />
              <span className="text-white">in Your Inbox</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Email is the backbone of modern communication—and it's{' '}
              <span className="text-red-400 font-medium">fundamentally broken</span>. 
              Here's why the system you rely on every day is actively working against you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/quantum-safe">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors"
                >
                  See the QMail Solution →
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section 1: The Spoofing Epidemic */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-xl mb-6">
              <Users className="w-10 h-10 text-red-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Anyone Can Pretend to Be{' '}
              <span className="text-red-400">Anyone</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The Spoofing Epidemic
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto mb-12">
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">The Problem:</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    SMS and email have <span className="text-red-400 font-medium">no sender authentication</span>. 
                    A scammer can make a message appear to come from your bank, your boss, or your family member 
                    using freely available online tools.
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-xl font-semibold text-red-400 mb-4">The Technical Reality:</h4>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500">From:</span>
                      <span className="text-gray-400">yourtrustedbank@secure.com</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-400">Actually sent from:</span>
                      <span className="text-gray-400">scammer_in_basement.ru</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-500">
                        The email protocol has no way to verify this. <span className="text-red-400 font-medium">None.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-yellow-500 mb-3">Emotional Hook:</h4>
                  <p className="text-gray-400 leading-relaxed">
                    Imagine receiving an "urgent" message from your child's school. You click the link. 
                    Your identity is stolen. <span className="text-red-400 font-medium">This happens thousands of times every single day.</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Real-World Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <StatCard
              icon={DollarSign}
              value="$43B"
              label="Lost to email fraud in 2023"
              delay={0.1}
            />
            <StatCard
              icon={Target}
              value="1 in 4"
              label="People targeted by phishing"
              delay={0.15}
            />
            <StatCard
              icon={AlertTriangle}
              value="90%"
              label="Cyber attacks start with spoofed email"
              delay={0.2}
            />
          </div>

          {/* QMail Solution Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 mb-3">QMail Solution:</h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-4">
                    With QMail, every sender is <span className="text-blue-400 font-medium">cryptographically verified</span> through QMAIL. 
                    Spoofing is <span className="text-white font-medium">mathematically impossible</span>.
                  </p>
                  <Link 
                    to="/quantum-safe"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    See How QMail Prevents This →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Your Messages Are Wide Open */}
      <section className="py-20 md:py-32 relative bg-gray-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-xl mb-6">
              <Eye className="w-10 h-10 text-purple-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Standard Email is Sent in{' '}
              <span className="text-purple-400">Plain Text</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your Messages Are Wide Open
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto mb-12">
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">The Problem:</h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    When you send a standard email or SMS, it travels <span className="text-purple-400 font-medium">unencrypted</span> across 
                    the internet. Your mobile carrier, ISPs, government agencies, and sophisticated attackers can read every word.
                  </p>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-purple-400 mb-3">The Visual Analogy:</h4>
                    <p className="text-gray-400 text-lg">
                      Sending email today is like <span className="text-red-400 font-medium">mailing postcards</span>. 
                      Anyone who handles them can read them.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white mb-4">Real-World Impact:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Cell-site simulators ("Stingrays") capture SMS messages in public areas',
                      'ISPs routinely scan email for advertising data',
                      'The SS7 network (SMS routing) has been exploited for years',
                      'Your "private" messages aren\'t private at all'
                    ].map((impact, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-4">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-sm">{impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* QMail Solution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 mb-3">QMail Solution:</h3>
                  <ul className="space-y-2 mb-4">
                    {[
                      'Every message sharded into 2-32 encrypted pieces',
                      'Each piece encrypted with AES-256',
                      'Distributed across independent servers',
                      'Even if an attacker intercepts one piece, they get nothing'
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/quantum-safe"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    Learn About Quantum-Safe Encryption →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: The Spam Tax */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600/20 rounded-xl mb-6">
              <DollarSign className="w-10 h-10 text-yellow-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              You're Paying Billions for{' '}
              <span className="text-yellow-400">Junk You Never Asked For</span>
            </h2>
            <p className="text-xl text-gray-400">The Spam Tax</p>
          </motion.div>

          {/* Stat Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            <StatCard icon={TrendingUp} value="347B" label="Emails sent daily" delay={0.05} />
            <StatCard icon={Ban} value="150B" label="Are spam (45%)" delay={0.1} />
            <StatCard icon={DollarSign} value="$20.5B" label="Annual cost to businesses" delay={0.15} />
            <StatCard icon={AlertTriangle} value="16 min" label="Wasted per employee, per day" delay={0.2} />
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
            {/* Infrastructure Waste */}
            <Card delay={0.1}>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <Server className="w-6 h-6 text-gray-400" />
                The Infrastructure Waste
              </h3>
              <p className="text-gray-500 mb-4">All that spam requires:</p>
              <ul className="space-y-2">
                {[
                  'Massive data centers',
                  'Redundant storage systems',
                  'Bandwidth clogging networks',
                  'Energy consumption equivalent to 3 million homes'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400">
                    <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Attention Tax */}
            <Card delay={0.15}>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <Brain className="w-6 h-6 text-gray-400" />
                The Attention Tax
              </h3>
              <ul className="space-y-3">
                {[
                  { value: '121', label: 'average emails received per day' },
                  { value: '28%', label: 'of your workday spent managing email' },
                  { value: 'Context switching', label: 'destroys productivity' },
                  { value: 'Mental load', label: 'is making us sick' }
                ].map((item, i) => (
                  <li key={i} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold text-lg">{item.value}</div>
                    <div className="text-gray-500 text-sm">{item.label}</div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Why Filters Don't Work */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card>
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <FileWarning className="w-6 h-6 text-yellow-400" />
                Why Filters Don't Work:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Spammers adapt faster than filters',
                  'False positives block important messages',
                  'You\'re still storing and processing the junk',
                  'The problem keeps getting worse'
                ].map((reason, i) => (
                  <div key={i} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <Skull className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">{reason}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* QMail Solution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 mb-3">QMail Solution:</h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-4">
                    Economic barriers mean spam is <span className="text-white font-medium">never sent in the first place</span>. 
                    The cost of sending becomes prohibitive for mass mailers, while remaining negligible for real humans.
                  </p>
                  <Link 
                    to="/get-paid"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    See How QMail Eliminates Spam Forever →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Centralized = Vulnerable */}
      <section className="py-20 md:py-32 relative bg-gray-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-xl mb-6">
              <Database className="w-10 h-10 text-red-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your Email Lives in a{' '}
              <span className="text-red-400">Single Point of Failure</span>
            </h2>
            <p className="text-xl text-gray-400">Centralized = Vulnerable</p>
          </motion.div>

          <div className="max-w-6xl mx-auto mb-12">
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">The Problem:</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Traditional email stores all your messages on centralized servers controlled by a handful of tech giants. 
                    When those servers go down—or get hacked—<span className="text-red-400 font-medium">you lose everything</span>.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-red-400 mb-4">Real Breaches:</h4>
                  <div className="space-y-3">
                    {[
                      { company: 'Yahoo', detail: '3 billion accounts compromised (2013)' },
                      { company: 'Microsoft', detail: '30,000 organizations hacked via Exchange servers (2021)' },
                      { company: 'Gmail', detail: 'Billions of users locked out (2020 outage)' }
                    ].map((breach, i) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-white font-medium">{breach.company}:</span>{' '}
                            <span className="text-gray-400">{breach.detail}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-xl font-semibold text-white mb-4">The Deeper Issue:</h4>
                  <p className="text-gray-500 mb-3">These companies:</p>
                  <ul className="space-y-2">
                    {[
                      'Scan your messages for advertising',
                      'Share data with government agencies',
                      'Can shut down your account without warning',
                      'Own your identity'
                    ].map((issue, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <Eye className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* QMail Solution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Server className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 mb-3">QMail Solution:</h3>
                  <ul className="space-y-2 mb-4">
                    {[
                      'No central server to hack',
                      'Messages distributed across 32 independent nodes',
                      'You own your QMail address (it\'s a cryptographic certificate)',
                      'No company can lock you out or read your mail'
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/qmail-architecture"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    Learn About QMAIL Architecture →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: The Hidden Costs */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-xl mb-6">
              <DollarSign className="w-10 h-10 text-purple-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              "Free" Email is the{' '}
              <span className="text-purple-400">Most Expensive Kind</span>
            </h2>
            <p className="text-xl text-gray-400">The Hidden Costs</p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
            {/* Cost Cards */}
            {[
              {
                icon: Target,
                title: 'Your Data is the Product',
                items: [
                  'Every message scanned',
                  'Behavior tracked and sold',
                  'Ad profile built and monetized',
                  'Worth ~$200/year per user to Google'
                ]
              },
              {
                icon: AlertTriangle,
                title: 'Your Time is Stolen',
                items: [
                  '16 minutes daily sorting spam',
                  'Context switching costs 25 minutes per interruption',
                  '$1,250+ per employee annually in lost productivity'
                ]
              },
              {
                icon: ShieldAlert,
                title: 'Your Security is Compromised',
                items: [
                  'Average cost of email-based breach: $4.35 million',
                  'Ransomware attacks: $4.54 million average',
                  'Identity theft: $1,100 per victim to resolve'
                ]
              },
              {
                icon: Brain,
                title: 'Your Mental Health Suffers',
                items: [
                  'Information overload increases stress by 23%',
                  '"Email anxiety" is a documented condition',
                  'Constant inbox pressure linked to burnout'
                ]
              }
            ].map((cost, index) => (
              <Card key={cost.title} delay={index * 0.05}>
                <div className="w-10 h-10 text-gray-400 mb-4">
                  <cost.icon className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{cost.title}</h3>
                <ul className="space-y-2">
                  {cost.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* CTA Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-8 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Ready for a Better Way?</h3>
              <p className="text-xl text-gray-400 mb-6">
                QMail flips the model: <span className="text-white font-medium">you get paid</span>, 
                spammers pay you, and your attention becomes valuable again.
              </p>
              <Link to="/get-paid">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors"
                >
                  Get Early Access →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final Section: Why This Can't Be Fixed */}
      <section className="py-20 md:py-32 relative bg-gray-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-xl mb-6">
                <Skull className="w-10 h-10 text-red-400" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                The System is{' '}
                <span className="text-red-400">Unfixable by Design</span>
              </h2>
            </div>

            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">The Hard Truth:</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    These aren't bugs. They're <span className="text-red-400 font-medium">fundamental architectural flaws</span> baked 
                    into protocols designed in the 1970s for a world of 500 users, not 5 billion.
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-xl font-semibold text-red-400 mb-4">You Cannot Patch:</h4>
                  <ul className="space-y-3">
                    {[
                      'The lack of sender authentication',
                      'Plain text transmission',
                      'Centralized control',
                      'The economic incentive to spam'
                    ].map((flaw, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400">{flaw}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Incremental improvements (encryption, filters, verification badges) are{' '}
                    <span className="text-red-400 font-medium">Band-Aids on a severed artery</span>.
                  </p>
                </div>

                <div className="text-center pt-6">
                  <h4 className="text-2xl font-semibold text-white mb-4">The Only Solution:</h4>
                  <p className="text-xl text-gray-400 mb-6">
                    Start over with a new foundation.
                  </p>
                  <p className="text-2xl font-semibold text-blue-400 mb-8">
                    That's exactly what we built.
                  </p>
                  <Link to="/quantum-safe">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition-colors"
                    >
                      See the QMail Solution →
                    </motion.button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default EmailCrisis