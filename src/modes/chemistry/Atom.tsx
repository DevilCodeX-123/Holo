import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface AtomProps {
  position: [number, number, number] | THREE.Vector3
  element: string
  color: string
  protons: number
  electrons: number
}

export const Atom: React.FC<AtomProps> = ({ position, element, color, protons, electrons }) => {
  const groupRef = useRef<THREE.Group>(null)
  const nucleusRef = useRef<THREE.Group>(null)
  
  // Create a realistic nucleus with multiple particles
  const particles = useMemo(() => {
    return Array.from({ length: Math.min(protons * 2, 20) }).map((_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ),
      color: i % 2 === 0 ? '#ff3333' : '#3333ff' // Protons and Neutrons
    }))
  }, [protons])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
    if (nucleusRef.current) {
      nucleusRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
      nucleusRef.current.rotation.z = Math.cos(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <group position={position} ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Nucleus */}
        <group ref={nucleusRef}>
          {particles.map((p, i) => (
            <mesh key={i} position={p.position}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial 
                color={p.color} 
                emissive={p.color} 
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          ))}
          {/* Central Glow */}
          <Sparkles count={20} scale={0.5} size={2} speed={0.4} color={color} />
        </group>

        {/* Electron Shells */}
        {Array.from({ length: Math.ceil(electrons / 2) }).map((_, i) => (
          <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <mesh>
              <torusGeometry args={[0.6 + i * 0.3, 0.005, 16, 100]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
            {/* Animated Electron */}
            <MovingElectron radius={0.6 + i * 0.3} speed={1 + i * 0.5} color={color} />
          </group>
        ))}

        <Text
          position={[0, 1.2, 0]}
          fontSize={0.25}
          color="white"
          font="/fonts/Inter-Bold.woff"
          anchorX="center"
          anchorY="middle"
        >
          {element}
        </Text>
      </Float>
    </group>
  )
}

const MovingElectron = ({ radius, speed, color }: { radius: number, speed: number, color: string }) => {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed
      ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0)
    }
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  )
}
