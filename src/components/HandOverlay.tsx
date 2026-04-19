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

  return (
    <group ref={groupRef}>
      {/* Joints */}
      {landmarks.map((lm, i) => {
        const pos = landmarkTo3D(lm, 60, 6, aspect)
        const isKey = [4, 8, 12, 16, 20].includes(i)  // Fingertips
        const isThumb = i === 4
        const isIndex = i === 8
        const pinching = isPinching && (isThumb || isIndex)
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[isKey ? 0.07 : 0.04, 12, 12]} />
            <meshStandardMaterial
              color={pinching ? '#ff6600' : isKey ? '#00f2ff' : '#ffffff'}
              emissive={pinching ? '#ff3300' : isKey ? '#00f2ff' : '#00aaff'}
              emissiveIntensity={pinching ? 3 : isKey ? 2 : 0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        )
      })}

      {/* Bones (connections) */}
      {CONNECTIONS.map(([a, b], ci) => {
        const p1 = landmarkTo3D(landmarks[a], 60, 6, aspect)
        const p2 = landmarkTo3D(landmarks[b], 60, 6, aspect)
        const mid = p1.clone().add(p2).multiplyScalar(0.5)
        const dir = p2.clone().sub(p1)
        const len = dir.length()
        const quat = new THREE.Quaternion()
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        return (
          <mesh key={ci} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.015, 0.015, len, 6]} />
            <meshStandardMaterial
              color="#00f2ff"
              emissive="#00f2ff"
              emissiveIntensity={1}
              transparent
              opacity={0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export const HandOverlay = () => {
  const allHands = useHoloStore(state => state.allHands)
  const isHandActive = useHoloStore(state => state.isHandActive)
  const setHand3DPosition = useHoloStore(state => state.setHand3DPosition)
  const aspect = window.innerWidth / window.innerHeight

  useFrame(() => {
    if (allHands.length > 0) {
      const primary = allHands[0]
      const pos3D = landmarkTo3D(primary.indexTip, 60, 6, aspect)
      setHand3DPosition(pos3D)
    }
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
