import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

function StarryScene() {
  const starsRef = useRef()

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0003 
    }
  })

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <Stars 
        ref={starsRef}
        radius={100} 
        depth={50} 
        count={2000} // Reduced for performance
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.1}
      />
    </>
  )
}

function StarryBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <Canvas 
        dpr={[1, 1.5]} // Cap pixel ratio to save GPU
        gl={{ antialias: false }} // Disable antialiasing for faster rendering
        camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 1000 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <StarryScene />
      </Canvas>
    </div>
  )
}

export default StarryBackground