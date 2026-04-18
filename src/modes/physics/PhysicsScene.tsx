import React, { useRef, useState, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Float, Html, ContactShadows, useTexture } from '@react-three/drei'
import { Grabbable } from '../../components/Grabbable'
import { useHoloStore } from '../../store/useHoloStore'

const TEXTURES = {
  earth: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  moon: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
  mars: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars_1k_color.jpg',
};

const Planet = ({ id, radius, textureUrl, position, scale = 1, rotationSpeed = 0.005 }: any) => {
  let texture;
  try {
    texture = useTexture(textureUrl) as THREE.Texture;
  } catch (e) {
    console.error("Texture load failed for", id);
  }
  
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += rotationSpeed;
  });

  return (
    <Grabbable id={id} initialPosition={position}>
      <mesh ref={ref} castShadow scale={scale}>
        <sphereGeometry args={[radius, 64, 64]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.3} />
        ) : (
          <meshStandardMaterial color="#555" roughness={1} />
        )}
      </mesh>
    </Grabbable>
  );
};

const ParameterControl = ({ label, value, onIncrease, onDecrease, unit = "" }: any) => {
  const intervalRef = useRef<any>(null);

  const startChange = (action: () => void) => {
    action();
    intervalRef.current = setInterval(action, 80);
  };

  const stopChange = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <Html transform distanceFactor={2.5} position={[4, 1.5, 0]} rotation={[0, -0.4, 0]}>
      <div className="glass holo-border p-4 rounded-3xl w-48 flex flex-col gap-3 pointer-events-auto backdrop-blur-xl">
        <span className="text-[8px] uppercase font-black text-holo-primary tracking-[0.2em]">{label}</span>
        <div className="flex justify-between items-center bg-white/10 p-2 rounded-2xl">
          <button 
            onPointerEnter={() => startChange(onDecrease)} 
            onPointerLeave={stopChange}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all text-xl flex items-center justify-center"
          >
            -
          </button>
          <span className="text-sm font-black font-mono text-white">{value.toFixed(1)}{unit}</span>
          <button 
            onPointerEnter={() => startChange(onIncrease)} 
            onPointerLeave={stopChange}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all text-xl flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </Html>
  );
};

const StatsPanel = ({ planetId }: { planetId: string }) => {
  const data: any = {
    earth: { name: 'Earth', mass: '5.97e24', gravity: '9.8', temp: '15' },
    moon: { name: 'Moon', mass: '7.34e22', gravity: '1.6', temp: '-20' },
    mars: { name: 'Mars', mass: '6.39e23', gravity: '3.7', temp: '-65' },
  }[planetId] || { name: 'Sun', mass: '1.98e30', gravity: '274', temp: '5500' };

  return (
    <Html transform distanceFactor={2.5} position={[-4.5, 1.5, 0]} rotation={[0, 0.4, 0]}>
      <div className="glass holo-border p-5 rounded-3xl w-52 flex flex-col gap-3 pointer-events-auto backdrop-blur-2xl">
        <h3 className="text-holo-primary font-black uppercase tracking-widest text-xs border-b border-white/10 pb-2">{data.name}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500 uppercase font-bold">Mass</span>
            <span className="text-white font-mono">{data.mass} kg</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500 uppercase font-bold">Gravity</span>
            <span className="text-white font-mono">{data.gravity} m/s²</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500 uppercase font-bold">Surface Temp</span>
            <span className="text-white font-mono">{data.temp}°C</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

export const PhysicsScene: React.FC = () => {
  const { selectedTopic, physicsParams, setPhysicsParam } = useHoloStore()

  return (
    <group>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#fff5d0" />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      <Suspense fallback={<Text color="white" fontSize={0.2}>Initializing Orbital Mechanics...</Text>}>
        {selectedTopic === 'motion' && <MotionLab params={physicsParams} setParam={setPhysicsParam} />}
        {selectedTopic === 'gravity' && <GravityLab params={physicsParams} setParam={setPhysicsParam} />}
        {selectedTopic === 'waves' && <WaveLab params={physicsParams} setParam={setPhysicsParam} />}
      </Suspense>
      
      {!selectedTopic && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text position={[0, 0, 0]} fontSize={0.3} color="#7000ff" font="/fonts/Inter-Bold.woff">SELECT MODULE</Text>
        </Float>
      )}
    </group>
  )
}

const MotionLab = ({ params, setParam }: any) => {
  return (
    <group>
      <Text position={[0, 3, -4]} fontSize={0.5} color="#00f2ff">FORCE & KINEMATICS</Text>
      <Grabbable id="physics-ball" initialPosition={[0, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.7, 64, 64]} />
          <meshStandardMaterial color="#7000ff" roughness={0} metalness={1} emissive="#7000ff" emissiveIntensity={0.2} />
        </mesh>
      </Grabbable>
      <ParameterControl 
        label="Applied Force" 
        value={params.amplitude} 
        unit="N"
        onIncrease={() => setParam('amplitude', params.amplitude + 0.1)}
        onDecrease={() => setParam('amplitude', params.amplitude - 0.1)}
      />
    </group>
  )
}

const GravityLab = ({ params, setParam }: any) => {
  const moonOrbitRef = useRef<THREE.Group>(null);
  const marsOrbitRef = useRef<THREE.Group>(null);
  const { grabbedObjectId } = useHoloStore();

  useFrame((state) => {
    if (moonOrbitRef.current && grabbedObjectId !== 'moon') {
      moonOrbitRef.current.rotation.y += 0.01 * params.gravity;
    }
    if (marsOrbitRef.current && grabbedObjectId !== 'mars') {
      marsOrbitRef.current.rotation.y += 0.005 * params.gravity;
    }
  });

  return (
    <group>
      <Text position={[0, 4, -7]} fontSize={0.8} color="#ff00d9" font="/fonts/Inter-Bold.woff">SOLAR SYSTEM LAB</Text>
      <StatsPanel planetId={grabbedObjectId || 'sun'} />

      {/* The Sun (Center) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff6600" emissiveIntensity={2} />
      </mesh>

      {/* Earth (Orbiting) */}
      <group>
        <Planet 
          id="earth" 
          radius={1.2} 
          textureUrl={TEXTURES.earth} 
          position={[0, 0, 0]} 
          rotationSpeed={0.002}
        />

        {/* Moon Orbiting Earth */}
        <group ref={moonOrbitRef}>
          <Planet 
            id="moon" 
            radius={0.3} 
            textureUrl={TEXTURES.moon} 
            position={[3.5, 0, 0]} 
            rotationSpeed={0.01}
          />
        </group>
      </group>

      {/* Mars Orbiting */}
      <group ref={marsOrbitRef}>
        <Planet 
          id="mars" 
          radius={0.6} 
          textureUrl={TEXTURES.mars} 
          position={[6, 0, -3]} 
          rotationSpeed={0.003}
        />
      </group>

      <ParameterControl 
        label="Simulation Speed" 
        value={params.gravity} 
        unit="x"
        onIncrease={() => setParam('gravity', params.gravity + 0.1)}
        onDecrease={() => setParam('gravity', params.gravity - 0.1)}
      />
    </group>
  )
}

const WaveLab = ({ params, setParam }: any) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const positions = (meshRef.current.geometry as THREE.BufferGeometry).attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = params.amplitude * Math.sin(x * params.frequency + time * 3)
      positions.setY(i, y)
    }
    positions.needsUpdate = true
  })

  return (
    <group>
      <Text position={[0, 3.5, -5]} fontSize={0.7} color="#00ff99">WAVE HARMONICS</Text>
      <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[14, 7, 128, 128]} />
        <meshStandardMaterial color="#00ff99" wireframe transparent opacity={0.6} />
      </mesh>
      <ParameterControl 
        label="Amplitude" 
        value={params.amplitude} 
        onIncrease={() => setParam('amplitude', params.amplitude + 0.1)}
        onDecrease={() => setParam('amplitude', params.amplitude - 0.1)}
      />
    </group>
  )
}
