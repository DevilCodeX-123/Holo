import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Html, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useHoloStore } from '../../store/useHoloStore'
import { Grabbable } from '../../components/Grabbable'

const ATOM_PROPERTIES: Record<string, { color: string, metalness: number, roughness: number, opacity: number, emissiveIntensity: number }> = {
  'H': { color: '#ffffff', metalness: 0.1, roughness: 1, opacity: 0.3, emissiveIntensity: 0.2 },
  'O': { color: '#ff4d4d', metalness: 0.1, roughness: 1, opacity: 0.4, emissiveIntensity: 0.4 },
  'Na': { color: '#e0e0e0', metalness: 1.0, roughness: 0.2, opacity: 1.0, emissiveIntensity: 0.1 },
  'Cl': { color: '#baffba', metalness: 0.1, roughness: 1, opacity: 0.5, emissiveIntensity: 0.3 },
  'C': { color: '#222222', metalness: 0.2, roughness: 0.8, opacity: 1.0, emissiveIntensity: 0.05 },
  'Fe': { color: '#8d9194', metalness: 0.9, roughness: 0.5, opacity: 1.0, emissiveIntensity: 0.1 },
};

const ParameterControl = ({ label, value, onIncrease, onDecrease, unit = "°C" }: any) => {
  const intervalRef = useRef<any>(null);
  const startChange = (action: () => void) => { action(); intervalRef.current = setInterval(action, 80); };
  const stopChange = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  return (
    <Html transform distanceFactor={2.5} position={[-4, 1.5, 0]} rotation={[0, 0.4, 0]}>
      <div className="glass holo-border p-4 rounded-3xl w-48 flex flex-col gap-3 pointer-events-auto backdrop-blur-xl">
        <span className="text-[8px] uppercase font-black text-holo-primary tracking-[0.2em]">{label}</span>
        <div className="flex justify-between items-center bg-white/10 p-2 rounded-2xl">
          <button onPointerEnter={() => startChange(onDecrease)} onPointerLeave={stopChange} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all text-xl flex items-center justify-center">-</button>
          <span className="text-sm font-black font-mono text-white">{value}{unit}</span>
          <button onPointerEnter={() => startChange(onIncrease)} onPointerLeave={stopChange} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all text-xl flex items-center justify-center">+</button>
        </div>
      </div>
    </Html>
  );
};

const Atom = ({ symbol, position }: { symbol: string, position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const props = ATOM_PROPERTIES[symbol] || ATOM_PROPERTIES['H'];
  
  useFrame((state) => {
    if (meshRef.current && coreRef.current) {
      meshRef.current.rotation.y += 0.01;
      coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Grabbable id={`atom-${symbol}-${Math.random()}`} initialPosition={position}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial 
          color={props.color} 
          transparent={props.opacity < 1} 
          opacity={props.opacity} 
          roughness={props.roughness} 
          metalness={props.metalness}
          emissive={props.color}
          emissiveIntensity={props.emissiveIntensity}
        />
        <Text position={[0, 0, 0.6]} fontSize={0.25} color="white" font="/fonts/Inter-Bold.woff">
          {symbol}
        </Text>
      </mesh>
      
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {props.opacity < 1 && (
        <group rotation={[Math.PI / 4, 0, 0]}>
          <mesh><torusGeometry args={[0.8, 0.01, 16, 100]} /><meshBasicMaterial color={props.color} transparent opacity={0.3} /></mesh>
        </group>
      )}
    </Grabbable>
  );
};

export const ChemistryScene: React.FC = () => {
  const { selectedItems, chemistryParams, setChemistryParam } = useHoloStore();
  const [reaction, setReaction] = useState<string | null>(null);

  useFrame(() => {
    if (selectedItems.includes('Na') && selectedItems.includes('Cl')) setReaction('IONIC BOND: NaCl (Salt)');
    else if (selectedItems.includes('H') && selectedItems.includes('O')) setReaction('COVALENT BOND: H2O (Water)');
    else setReaction(null);
  });

  return (
    <group>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />

      <Text position={[0, 4, -5]} fontSize={0.7} color="#00f2ff" font="/fonts/Inter-Bold.woff">MOLECULAR SYNTHESIS</Text>
      
      {selectedItems.map((symbol, idx) => (
        <Atom key={`${symbol}-${idx}`} symbol={symbol} position={[(idx - (selectedItems.length - 1) / 2) * 2.5, 0, 0]} />
      ))}

      {selectedItems.length === 0 && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text position={[0, 0, 0]} fontSize={0.3} color="#7000ff">INITIALIZE ELEMENTS VIA TABLE</Text>
        </Float>
      )}

      {reaction && (
        <Html position={[0, 2.5, 0]} center>
          <div className="glass holo-border px-10 py-4 rounded-full animate-pulse shadow-[0_0_50px_rgba(0,242,255,0.4)]">
            <span className="text-holo-primary font-black uppercase tracking-[0.4em] text-[14px]">{reaction}</span>
          </div>
        </Html>
      )}

      <ParameterControl label="Reaction Energy" value={chemistryParams.temperature} onIncrease={() => setChemistryParam('temperature', chemistryParams.temperature + 5)} onDecrease={() => setChemistryParam('temperature', chemistryParams.temperature - 5)} />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} />
    </group>
  );
};
