import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useHoloStore } from '../store/useHoloStore'

// The 21 joint connections that form a hand skeleton
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],           // Thumb
  [0,5],[5,6],[6,7],[7,8],           // Index
  [0,9],[9,10],[10,11],[11,12],      // Middle
  [0,13],[13,14],[14,15],[15,16],    // Ring
  [0,17],[17,18],[18,19],[19,20],    // Pinky
  [5,9],[9,13],[13,17],              // Palm
]

// Convert landmark (0-1 screen) to 3D frustum space
function landmarkTo3D(lm: {x:number,y:number,z:number}, fov=60, distance=6, aspect=1) {
  const heightAtZ = 2 * distance * Math.tan((fov * Math.PI) / 180 / 2)
  const widthAtZ = heightAtZ * aspect
  const x = (lm.x - 0.5) * widthAtZ
  const y = (0.5 - lm.y) * heightAtZ
  const z = -lm.z * 3
  return new THREE.Vector3(x, y, z)
}

const HandSkeleton = ({ landmarks, isPinching }: {
  landmarks: {x:number,y:number,z:number}[]
  isPinching: boolean
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const aspect = window.innerWidth / window.innerHeight

  // Generate bone meshes for all standard hand connections
  const boneMeshes = CONNECTIONS.map(([startIdx, endIdx], i) => {
    const start = landmarkTo3D(landmarks[startIdx], 60, 6, aspect)
    const end = landmarkTo3D(landmarks[endIdx], 60, 6, aspect)
    const mid = start.clone().lerp(end, 0.5)
    const dist = start.distanceTo(end)
    
    return (
      <mesh key={i} position={mid} lookAt={end}>
        <cylinderGeometry args={[0.008, 0.008, dist, 8]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.2} depthTest={false} />
      </mesh>
    )
  })

  return (
    <group ref={groupRef}>
      {/* All 21 Joint Dots */}
      {landmarks.map((lm, i) => {
        const pos = landmarkTo3D(lm, 60, 6, aspect)
        const isTip = [4, 8, 12, 16, 20].includes(i)
        const pulsing = isTip && isPinching && (i === 4 || i === 8)

        return (
          <mesh key={i} position={pos} renderOrder={1000}>
            <sphereGeometry args={[isTip ? 0.04 : 0.02, 16, 16]} />
            <meshStandardMaterial
              color={pulsing ? '#ff6600' : isTip ? '#00f2ff' : '#0099ff'}
              emissive={pulsing ? '#ff3300' : isTip ? '#00f2ff' : '#0099ff'}
              emissiveIntensity={pulsing ? 15 : 2}
              transparent
              opacity={0.8}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        )
      })}

      {/* Bones */}
      <group renderOrder={999}>
        {boneMeshes}
      </group>

      {/* Pinch Pulse Effect */}
      {isPinching && (
        <group renderOrder={1001}>
          <mesh position={
             landmarkTo3D(landmarks[4], 60, 6, aspect).add(landmarkTo3D(landmarks[8], 60, 6, aspect)).multiplyScalar(0.5)
          }>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.6} depthTest={false} />
          </mesh>
          <mesh position={landmarkTo3D(landmarks[8], 60, 6, aspect)}>
            <ringGeometry args={[0.15, 0.18, 64]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.4} side={THREE.DoubleSide} depthTest={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}

export const HandOverlay = () => {
  const allHands = useHoloStore(state => state.allHands)
  const isHandActive = useHoloStore(state => state.isHandActive)
  
  useFrame(() => {
    // HandOverlay is purely visual and relies on GestureEngine for logic
  })

  if (!isHandActive || allHands.length === 0) return null

  return (
    <group>
      {allHands.map((hand) => (
        <HandSkeleton
          key={hand.handIdx}
          landmarks={hand.landmarks}
          isPinching={hand.isPinching}
        />
      ))}
    </group>
  )
}
