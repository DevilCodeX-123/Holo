import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useHoloStore } from '../../store/useHoloStore'
import { Grabbable } from '../../components/Grabbable'

export const PhysicsScene: React.FC = () => {
  const { selectedTopic, physicsParams } = useHoloStore()

  const renderLab = () => {
    switch (selectedTopic) {
      case 'motion':
        return <MotionLab />
      case 'gravity':
        return <GravityLab />
      case 'waves':
        return <WaveLab />
      default:
        return (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.4}
              color="#7000ff"
              anchorX="center"
              anchorY="middle"
            >
              SELECT A PHYSICS MODULE
            </Text>
          </Float>
        )
    }
  }

  return (
    <group>
      <fog attach="fog" args={['#000', 5, 20]} />
      {renderLab()}
    </group>
  )
}

// --- MOTION LAB MODULE ---
const MotionLab = () => {
  const { grabbedObjectId, hand3DPosition } = useHoloStore();
  const [velocity, setVelocity] = React.useState(0);
  const lastPos = React.useRef(new THREE.Vector3());

  useFrame(() => {
    if (grabbedObjectId === 'physics-ball') {
      const v = hand3DPosition.distanceTo(lastPos.current) * 60; // Approx velocity
      setVelocity(v);
      lastPos.current.copy(hand3DPosition);
    }
  });

  return (
    <group>
      <Grabbable id="physics-ball" initialPosition={[0, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#7000ff" emissive="#7000ff" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Real-time Formula Overlay */}
        <group position={[0, 1, 0]}>
          <Text fontSize={0.15} color="white" position={[0, 0.2, 0]}>F = ma</Text>
          <Text fontSize={0.1} color="#7000ff">v = {velocity.toFixed(2)} m/s</Text>
        </group>
      </Grabbable>

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#222" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  )
}

// --- GRAVITY LAB MODULE ---
const GravityLab = () => {
  return (
    <group>
       <Text position={[0, 2, 0]} fontSize={0.2}>Gravity Simulation</Text>
       <Grabbable id="earth" initialPosition={[-2, 0, 0]}>
         <mesh><sphereGeometry args={[0.8, 32, 32]} /><meshStandardMaterial color="#4da6ff" /></mesh>
       </Grabbable>
       <Grabbable id="moon" initialPosition={[1, 0, 0]}>
         <mesh><sphereGeometry args={[0.3, 32, 32]} /><meshStandardMaterial color="#888" /></mesh>
       </Grabbable>
    </group>
  )
}

// --- WAVE LAB MODULE ---
const WaveLab = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { physicsParams } = useHoloStore()

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const positions = (meshRef.current.geometry as THREE.BufferGeometry).attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = physicsParams.amplitude * Math.sin(x * physicsParams.frequency + time * 3)
      positions.setY(i, y)
    }
    positions.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[10, 5, 64, 64]} />
      <meshStandardMaterial color="#7000ff" wireframe transparent opacity={0.8} emissive="#7000ff" emissiveIntensity={0.5} />
    </mesh>
  )
}
