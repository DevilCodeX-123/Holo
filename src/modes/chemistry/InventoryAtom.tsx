import React, { Suspense } from 'react'
import { View } from '@react-three/drei'
import { QuantumAtom, SYMBOL_TO_Z } from './QuantumAtom'

interface Props {
  symbol: string
}

/**
 * A lightweight 3D atom view for the inventory bar.
 * Refactored to use @react-three/drei View to share a single WebGL context.
 */
export const InventoryAtom: React.FC<Props> = ({ symbol }) => {
  const Z = SYMBOL_TO_Z[symbol] ?? 1
  
  return (
    <div className="w-full h-full relative pointer-events-none group">
      {/* 
          View component from drei renders this scene into this div 
          but uses the global Canvas in App.tsx for actual drawing.
      */}
      <View className="w-full h-full z-10">
        <ambientLight intensity={3} />
        <pointLight position={[2, 2, 2]} intensity={8} color="#00f2ff" />
        <pointLight position={[-2, -2, 2]} intensity={5} color="#7c3aed" />
        
        <Suspense fallback={null}>
          <QuantumAtom 
            atomicNumber={Z} 
            symbol={symbol} 
            position={[0, 0, 0]} 
            scale={5} 
            fixedUnitSize={true} 
            pointsCount={80}   
            isRealistic={true}
            hideLabel={true}
          />
        </Suspense>
      </View>
      
      {/* 2D Fallback Symbol - Always visible even if View fails */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-3xl font-black text-white/20 blur-[1px] uppercase tracking-tighter opacity-80">{symbol}</span>
      </div>

      {/* Glossy overlay for the tray button look */}
      <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 transition-all shadow-[0_0_15px_rgba(0,242,255,0.15)] overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
      </div>
    </div>
  )
}
