import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useHoloStore } from '../store/useHoloStore'

export const HandOverlay = () => {
  const { handLandmarks, isHandActive, setHand3DPosition } = useHoloStore()
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!isHandActive || !handLandmarks || handLandmarks.length === 0) return

    const landmarks = handLandmarks[0]
    
    groupRef.current?.children.forEach((child, i) => {
      const landmark = landmarks[i]
      if (landmark) {
        // Adjust for mobile aspect ratios and standard distance
        const x = (0.5 - landmark.x) * 12 // Slightly wider range
        const y = (0.5 - landmark.y) * 8  // Slightly taller range
        const z = (0.5 - landmark.z) * 5  // Centered depth
        child.position.set(x, y, z)
        
        // Sync index finger tip (landmark 8)
        if (i === 8) {
          setHand3DPosition(new THREE.Vector3(x, y, z))
        }
      }
    })
  })

  if (!isHandActive) return null

  return (
    <group ref={groupRef}>
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial 
            color="#00f2ff" 
            emissive="#00f2ff" 
            emissiveIntensity={2}
            transparent 
            opacity={0.6} 
          />
        </mesh>
      ))}
    </group>
  )
}
