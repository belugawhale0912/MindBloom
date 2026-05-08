'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Float, Points, PointMaterial, MeshDistortMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function NeuralNetwork({ count = 200, color, speed }) {
  const pointsRef = useRef()
  const linesRef = useRef()

  const { positions, linePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const linePos = []

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 0.5

      const x = r * Math.sin(phi) * Math.cos(theta) * 1.4
      const y = r * Math.sin(phi) * Math.sin(theta) * 1.1
      const z = r * Math.cos(phi)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      for (let j = 0; j < i; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < 0.8 && Math.random() > 0.8) {
          linePos.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
          linePos.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2])
        }
      }
    }
    return {
      positions: pos,
      linePositions: new Float32Array(linePos)
    }
  }, [count])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001 * speed
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += 0.001 * speed
    }
  })

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color={color}
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

function ScanningRing({ color, speed }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.getElapsedTime() * speed
      ringRef.current.position.y = Math.sin(t) * 2
      ringRef.current.scale.setScalar(1 + Math.cos(t) * 0.2)
      ringRef.current.material.opacity = (Math.cos(t) + 1) * 0.5 * 0.4
    }
  })

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function BrainHemisphere({ position, color, speed, distort, pulse }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      const s = 1 + Math.sin(t * pulse) * 0.02
      meshRef.current.scale.set(s, s, s)
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]} position={position} scale={[1.2, 0.9, 1]}>
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={1}
          transparent
          opacity={0.15}
          wireframe
        />
      </Sphere>
    </Float>
  )
}

function BrainCore({ severity }) {
  const config = useMemo(() => {
    switch (severity) {
      case 'High':
        return { color: '#f43f5e', distort: 0.4, speed: 2.5, pulse: 4, particleCount: 400 }
      case 'Moderate':
        return { color: '#f59e0b', distort: 0.2, speed: 1.2, pulse: 2, particleCount: 300 }
      default: // Low
        return { color: '#10b981', distort: 0.1, speed: 0.6, pulse: 1, particleCount: 200 }
    }
  }, [severity])

  return (
    <group>
      <BrainHemisphere position={[-0.7, 0, 0]} {...config} />
      <BrainHemisphere position={[0.7, 0, 0]} {...config} />

      <NeuralNetwork count={config.particleCount} color={config.color} speed={config.speed} />
      <ScanningRing color={config.color} speed={config.speed * 0.5} />

      {/* Central Core Glow */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color={config.color} transparent opacity={0.05} blending={THREE.AdditiveBlending} />
      </Sphere>
    </group>
  )
}

export default function AssessmentBrain({ severity }) {
  return (
    <div className="w-full h-[400px] relative rounded-3xl overflow-hidden bg-[#020617]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,0.2),transparent_70%)]" />

      <Canvas camera={{ position: [0, 0, 7], fov: 40 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color={severity === 'High' ? '#f43f5e' : '#10b981'} intensity={0.5} />

        <BrainCore severity={severity} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* Interface Overlays */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl" />

      {/* Technical data points */}
      <div className="absolute top-6 left-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${severity === 'High' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' :
            severity === 'Moderate' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
              'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            } animate-pulse`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Neural Matrix Active</span>
            <span className="text-[8px] font-medium text-white/30 tracking-widest uppercase">System Frequency: {severity === 'High' ? '4.8Hz' : severity === 'Moderate' ? '2.4Hz' : '1.2Hz'}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-8 text-right">
        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest block">Core Synchronization</span>
        <span className="text-[10px] font-mono text-white/40">{Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_50%,rgba(2,6,23,0.6)_100%)]" />
    </div>
  )
}