import React from 'react'
import { Atom } from './Atom'
import { Grabbable } from '../../components/Grabbable'
import { useHoloStore } from '../../store/useHoloStore'

const ELEMENT_DATA: Record<string, any> = {
  'H': { color: '#4da6ff', electrons: 1, shells: [1] },
  'He': { color: '#ffeb3b', electrons: 2, shells: [2] },
  'Li': { color: '#f44336', electrons: 3, shells: [2, 1] },
  'C': { color: '#9e9e9e', electrons: 6, shells: [2, 4] },
  'N': { color: '#3f51b5', electrons: 7, shells: [2, 5] },
  'O': { color: '#ff4d4d', electrons: 8, shells: [2, 6] },
  'Na': { color: '#ff9800', electrons: 11, shells: [2, 8, 1] },
  'Al': { color: '#607d8b', electrons: 13, shells: [2, 8, 3] },
}

export const ChemistryScene: React.FC = () => {
  const { selectedItems } = useHoloStore()

  return (
    <group>
      <fog attach="fog" args={['#000', 5, 20]} />
      
      {selectedItems.map((symbol, index) => {
        const data = ELEMENT_DATA[symbol] || ELEMENT_DATA['H'] // Fallback to H
        return (
          <Grabbable 
            key={`${symbol}-${index}`} 
            id={`${symbol}-${index}`} 
            initialPosition={[(index % 4) * 1.5 - 2, Math.floor(index / 4) * 1.5 - 1, 0]}
          >
            <Atom
              element={symbol}
              color={data.color}
              electrons={data.electrons}
              shells={data.shells}
              position={[0, 0, 0]} // Position reset because Grabbable handles it
            />
          </Grabbable>
        )
      })}

      {!selectedItems.length && (
         <group position={[0, -1, 0]}>
            {/* Holographic Instruction in 3D */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[10, 10]} />
               <meshBasicMaterial color="#00f2ff" transparent opacity={0.05} wireframe />
            </mesh>
         </group>
      )}
    </group>
  )
}
