import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Html, ContactShadows, Ring } from '@react-three/drei'
import * as THREE from 'three'
import { useHoloStore } from '../../store/useHoloStore'
import { Grabbable } from '../../components/Grabbable'
import { QuantumAtom, SYMBOL_TO_Z } from './QuantumAtom'
import { MolecularBond } from '../../components/MolecularBond'

const ATOM_PROPERTIES: Record<string, { color: string, metalness: number, roughness: number, opacity: number, emissiveIntensity: number }> = {
  'H': { color: '#ffffff', metalness: 0.1, roughness: 1, opacity: 0.3, emissiveIntensity: 0.2 },
  'O': { color: '#ff4d4d', metalness: 0.1, roughness: 1, opacity: 0.4, emissiveIntensity: 0.4 },
  'Na': { color: '#e0e0e0', metalness: 1.0, roughness: 0.2, opacity: 1.0, emissiveIntensity: 0.1 },
  'Cl': { color: '#baffba', metalness: 0.1, roughness: 1, opacity: 0.5, emissiveIntensity: 0.3 },
  'C': { color: '#222222', metalness: 0.2, roughness: 0.8, opacity: 1.0, emissiveIntensity: 0.05 },
  'Fe': { color: '#8d9194', metalness: 0.9, roughness: 0.5, opacity: 1.0, emissiveIntensity: 0.1 },
};


const Atom = ({ id, symbol, position }: { id: string, symbol: string, position: [number, number, number] }) => {
  const Z = SYMBOL_TO_Z[symbol] ?? 1;
  
  return (
    <Grabbable id={id} initialPosition={position}>
      <QuantumAtom atomicNumber={Z} symbol={symbol} scale={0.6} />
      <Text position={[0, -0.15, 0]} fontSize={0.03} color="#00f2ff" font="/fonts/Inter-Bold.woff" fillOpacity={0.6}>
        {symbol}
      </Text>
    </Grabbable>
  );
};

export const ChemistryScene: React.FC = () => {
  const { selectedItems, activeElements, bonds, chemistryParams, setChemistryParam, zoom } = useHoloStore();
  const [reaction, setReaction] = useState<string | null>(null);

  const addBond = useHoloStore(state => state.addBond);
  const removeBond = useHoloStore(state => state.removeBond);

  useFrame(() => {
    // 1. DYNAMIC BONDING LOGIC: Check distances between all pairs of active atoms
    for (let i = 0; i < activeElements.length; i++) {
      for (let j = i + 1; j < activeElements.length; j++) {
        const atomA = activeElements[i];
        const atomB = activeElements[j];
        const dist = new THREE.Vector3(...atomA.position).distanceTo(new THREE.Vector3(...atomB.position));

        // Proximity threshold for bonding (e.g., 1.5 units)
        const isBonded = bonds.some(b => 
          (b.fromId === atomA.id && b.toId === atomB.id) || 
          (b.fromId === atomB.id && b.toId === atomA.id)
        );

        if (dist < 1.5 && !isBonded) {
          addBond(atomA.id, atomB.id);
        } else if (dist > 2.5 && isBonded) {
          // Break bond if pulled too far apart
          const bondId = bonds.find(b => 
            (b.fromId === atomA.id && b.toId === atomB.id) || 
            (b.fromId === atomB.id && b.toId === atomA.id)
          )?.id;
          if (bondId) removeBond(bondId);
        }
      }
    }

    // 2. SYNTHESIS HUD LOGIC: Identify molecules based on active bonds
    const activeSymbols = activeElements.map(el => el.symbol);
    if (activeSymbols.includes('Na') && activeSymbols.includes('Cl') && bonds.length > 0) {
      setReaction('IONIC SYNTHESIS: SODIUM CHLORIDE');
    } else if (activeSymbols.includes('H') && activeSymbols.includes('O') && bonds.length >= 2) {
      setReaction('COVALENT SYNTHESIS: DIHYDROGEN MONOXIDE');
    } else if (activeSymbols.length >= 2 && bonds.length > 0) {
      setReaction('MOLECULAR BOND ACTIVE');
    } else {
      setReaction(null);
    }
  });

  const sceneScale = zoom / 5; // Base zoom is 5

  const [spawnPulse, setSpawnPulse] = useState<boolean>(false);

  useEffect(() => {
    const handleSpawn = () => {
      setSpawnPulse(true);
      const timer = setTimeout(() => setSpawnPulse(false), 1200);
      return () => clearTimeout(timer);
    };
    window.addEventListener('atom_spawned', handleSpawn);
    return () => window.removeEventListener('atom_spawned', handleSpawn);
  }, []);

  return (
    <group scale={sceneScale}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />

      {/* Arrival Pulse Beacon */}
      {spawnPulse && (
        <group position={[0, 0, 0]}>
          <Ring args={[0.01, 2, 64]}>
            <meshBasicMaterial color="#00f2ff" transparent opacity={0.3} depthWrite={false} />
          </Ring>
          <Ring args={[1.8, 2, 64]}>
            <meshBasicMaterial color="#00f2ff" transparent opacity={0.1} depthWrite={false} />
          </Ring>
        </group>
      )}

      <Text position={[0, 2.5, -5]} fontSize={0.3} color="#00f2ff" font="/fonts/Inter-Bold.woff" fillOpacity={0.4}>MOLECULAR SYNTHESIS</Text>
      
      {/* Render dynamically placed elements */}
      {activeElements?.map((el) => (
        <Atom key={el.id} id={el.id} symbol={el.symbol} position={el.position} />
      ))}

      {/* Render holographic bonds */}
      {bonds?.map((bond) => (
        <MolecularBond key={bond.id} fromId={bond.fromId} toId={bond.toId} />
      ))}

      {selectedItems.length === 0 && activeElements?.length === 0 && (
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

      <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} />
    </group>
  );
};
