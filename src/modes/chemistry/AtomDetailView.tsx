import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Layers, Atom } from 'lucide-react'
import { QuantumAtom, SYMBOL_TO_Z } from './QuantumAtom'

// Element data for the info panel
const ELEMENT_INFO: Record<string, { fullName: string; mass: number; group: string; state: string; discovered: string; fact: string }> = {
  H:  { fullName: 'Hydrogen',     mass: 1.008,   group: 'Nonmetal',        state: 'Gas',    discovered: '1766', fact: 'Most abundant element in the universe.' },
  He: { fullName: 'Helium',       mass: 4.003,   group: 'Noble Gas',       state: 'Gas',    discovered: '1868', fact: 'Second lightest element, used in balloons.' },
  Li: { fullName: 'Lithium',      mass: 6.94,    group: 'Alkali Metal',    state: 'Solid',  discovered: '1817', fact: 'Used in rechargeable batteries.' },
  Be: { fullName: 'Beryllium',    mass: 9.012,   group: 'Alkaline Metal',  state: 'Solid',  discovered: '1797', fact: 'Extremely lightweight structural metal.' },
  B:  { fullName: 'Boron',        mass: 10.81,   group: 'Metalloid',       state: 'Solid',  discovered: '1808', fact: 'Used in semiconductors and glass.' },
  C:  { fullName: 'Carbon',       mass: 12.011,  group: 'Nonmetal',        state: 'Solid',  discovered: 'Ancient', fact: 'Basis of all known life on Earth.' },
  N:  { fullName: 'Nitrogen',     mass: 14.007,  group: 'Nonmetal',        state: 'Gas',    discovered: '1772', fact: 'Makes up 78% of Earth\'s atmosphere.' },
  O:  { fullName: 'Oxygen',       mass: 15.999,  group: 'Nonmetal',        state: 'Gas',    discovered: '1774', fact: 'Essential for aerobic life and combustion.' },
  F:  { fullName: 'Fluorine',     mass: 18.998,  group: 'Halogen',         state: 'Gas',    discovered: '1886', fact: 'Most electronegative element.' },
  Ne: { fullName: 'Neon',         mass: 20.180,  group: 'Noble Gas',       state: 'Gas',    discovered: '1898', fact: 'Used in bright red-orange neon signs.' },
  Na: { fullName: 'Sodium',       mass: 22.990,  group: 'Alkali Metal',    state: 'Solid',  discovered: '1807', fact: 'Reacts violently with water.' },
  Mg: { fullName: 'Magnesium',    mass: 24.305,  group: 'Alkaline Metal',  state: 'Solid',  discovered: '1755', fact: 'Burns with brilliant white flame.' },
  Al: { fullName: 'Aluminium',    mass: 26.982,  group: 'Post-Transition', state: 'Solid',  discovered: '1825', fact: 'Most abundant metal in Earth\'s crust.' },
  Si: { fullName: 'Silicon',      mass: 28.085,  group: 'Metalloid',       state: 'Solid',  discovered: '1824', fact: 'Foundation of modern microelectronics.' },
  Fe: { fullName: 'Iron',         mass: 55.845,  group: 'Transition',      state: 'Solid',  discovered: 'Ancient', fact: 'Most used metal, forms Earth\'s core.' },
  Cu: { fullName: 'Copper',       mass: 63.546,  group: 'Transition',      state: 'Solid',  discovered: 'Ancient', fact: 'First metal used by humans ~10,000 years ago.' },
  Au: { fullName: 'Gold',         mass: 196.97,  group: 'Transition',      state: 'Solid',  discovered: 'Ancient', fact: 'Does not corrode or tarnish.' },
  Hg: { fullName: 'Mercury',      mass: 200.59,  group: 'Transition',      state: 'Liquid', discovered: 'Ancient', fact: 'Only metal liquid at room temperature.' },
  Pb: { fullName: 'Lead',         mass: 207.2,   group: 'Post-Transition', state: 'Solid',  discovered: 'Ancient', fact: 'Used in radiation shielding.' },
  U:  { fullName: 'Uranium',      mass: 238.03,  group: 'Actinide',        state: 'Solid',  discovered: '1789', fact: 'Powers nuclear reactors.' },
}

const DEFAULT_INFO = { fullName: '', mass: 0, group: 'Unknown', state: 'Unknown', discovered: '-', fact: 'A heavy element.' }

interface Props {
  symbol: string
  onClose: () => void
}

export const AtomDetailView: React.FC<Props> = ({ symbol, onClose }) => {
  const Z   = SYMBOL_TO_Z[symbol] ?? 1
  const info = ELEMENT_INFO[symbol] ?? { ...DEFAULT_INFO, fullName: symbol, mass: Z * 2 }

  // Electron config string for display
  const shellMap: Record<number, number> = {}
  let rem = Z
  const fillOrder = [[1,2],[2,8],[3,8],[4,18],[5,18],[6,32],[7,32]]
  for (const [shell, cap] of fillOrder) {
    if (rem <= 0) break
    shellMap[shell] = Math.min(rem, cap)
    rem -= cap
  }
  const configStr = Object.entries(shellMap).map(([s, e]) => `${s}(${e})`).join(' ')

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 bottom-0 w-[420px] z-50 flex flex-col bg-black/40 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
    >
      {/* Header with quick close */}
      <div className="p-8 flex items-center justify-between border-b border-white/5">
        <div>
          <h2 className="text-4xl font-black text-white tracking-widest leading-none">{symbol}</h2>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-1">{info.fullName}</p>
        </div>
        <button 
          onClick={onClose} 
          data-virtual-interact="true"
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all pointer-events-auto"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
        {/* Quantum Stage (Compact) */}
        <div className="h-64 relative rounded-3xl overflow-hidden glass border border-white/5 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_100%)]">
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 3, 3]} intensity={2} color="#00f2ff" />
            <Suspense fallback={null}>
              <QuantumAtom atomicNumber={Z} symbol={symbol} position={[0, 0, 0]} scale={1.8} />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
          <div className="absolute top-4 left-4 flex flex-col">
            <span className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest">Quantum Visualization</span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase">Interactive Model</span>
          </div>
        </div>

        {/* Essential Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Atomic Number</span>
            <span className="text-xl font-mono font-black text-white">{Z}</span>
          </div>
          <div className="glass border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Atomic Mass</span>
            <span className="text-xl font-mono font-black text-white">{info.mass}u</span>
          </div>
        </div>

        {/* Fact Card */}
        <div className="glass border border-white/5 p-6 rounded-3xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Atom size={48} className="text-cyan-400" />
          </div>
          <div className="flex items-center gap-3 text-cyan-400">
            <Zap size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scientific Insight</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">
            "{info.fact}"
          </p>
        </div>

        {/* Discovery Data */}
        <div className="space-y-4 pt-4 border-t border-white/5">
           <div className="flex justify-between items-center">
             <span className="text-[10px] uppercase tracking-widest text-zinc-500">Chemical Group</span>
             <span className="text-[10px] font-black text-white uppercase">{info.group}</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] uppercase tracking-widest text-zinc-500">Atomic State</span>
             <span className="text-[10px] font-black text-white uppercase">{info.state}</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] uppercase tracking-widest text-zinc-500">Initial Discovery</span>
             <span className="text-[10px] font-black text-white uppercase">{info.discovered}</span>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
