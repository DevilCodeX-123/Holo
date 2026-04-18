import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

interface AtomProps {
  position: [number, number, number]
  element: string
  color: string
  electrons: number
  shells: number[]
}

export const Atom: React.FC<AtomProps> = ({ position, element, color, electrons, shells }) => {
  const nucleusRef = useRef<THREE.Group>(null)
  const electronRefs = useRef<THREE.Group[]>([])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    
    // Rotate nucleus slightly
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = t * 0.5
    }

    // Move electrons
    electronRefs.current.forEach((group, i) => {
      if (group) {
        group.rotation.y = t * (1 + i * 0.5)
        group.rotation.x = t * (0.5 + i * 0.2)
      }
    })
  })

  return (
    <group position={position}>
      {/* Nucleus */}
      <group ref={nucleusRef}>
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {element}
        </Text>
      </group>

      {/* Electron Shells and Electrons */}
      {shells.map((count, shellIndex) => (
        <group key={shellIndex} ref={el => electronRefs.current[shellIndex] = el!}>
          {/* Shell Wireframe */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6 + shellIndex * 0.4, 0.01, 16, 100]} />
            <meshBasicMaterial color="white" transparent opacity={0.1} />
          </mesh>

          {/* Electrons on this shell */}
          {Array.from({ length: count }).map((_, eIndex) => {
            const angle = (eIndex / count) * Math.PI * 2
            const radius = 0.6 + shellIndex * 0.4
            return (
              <mesh key={eIndex} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#fff" emissive="#00f2ff" emissiveIntensity={2} />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Ambient Glow */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}
