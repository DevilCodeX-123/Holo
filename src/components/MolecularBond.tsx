import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHoloStore } from '../store/useHoloStore'

interface Props {
  fromId: string
  toId: string
}

/**
 * A holographic bond between two atoms.
 * Periodically pulses with 'electron flow' to show a shared connection.
 */
export const MolecularBond: React.FC<Props> = ({ fromId, toId }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  
  const atoms = useHoloStore(state => state.activeElements)
  const atomA = atoms.find(a => a.id === fromId)
  const atomB = atoms.find(a => a.id === toId)

  useFrame(({ clock }) => {
    if (!meshRef.current || !atomA || !atomB) return

    // Position & Orientation
    const start = new THREE.Vector3(...atomA.position)
    const end = new THREE.Vector3(...atomB.position)
    
    // Midpoint
    const mid = start.clone().lerp(end, 0.5)
    meshRef.current.position.copy(mid)
    
    // Rotation & Scale
    const dir = end.clone().sub(start)
    const dist = dir.length()
    
    // Skip if elements are exactly at the same point (unlikely but safe)
    if (dist > 0.001) {
      meshRef.current.lookAt(end)
      meshRef.current.rotateX(Math.PI / 2) // Cylinder is y-up by default
      meshRef.current.scale.set(1, dist, 1)
    }

    // Pulsing Electron Flow
    if (matRef.current) {
      const t = clock.getElapsedTime()
      matRef.current.opacity = 0.3 + Math.sin(t * 8) * 0.2
    }
  })

  if (!atomA || !atomB) return null

  return (
    <mesh ref={meshRef} renderOrder={500}>
      <cylinderGeometry args={[0.025, 0.025, 1, 8]} />
      <meshBasicMaterial 
        ref={matRef} 
        color="#00f2ff" 
        transparent 
        opacity={0.4} 
        depthWrite={false}
      />
    </mesh>
  )
}
