import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'
import { useHoloStore } from './store/useHoloStore'
import { motion, AnimatePresence } from 'framer-motion'

import GestureEngine from './engine/gesture/GestureEngine'
import { HandOverlay } from './components/HandOverlay'
import { HandCursor } from './components/HandCursor'
import { LandingScreen } from './components/LandingScreen'
import { ChemistryScene } from './modes/chemistry/ChemistryScene'
import { PhysicsScene } from './modes/physics/PhysicsScene'
import { PeriodicTable } from './modes/chemistry/PeriodicTable'
import { TopicSelector } from './modes/physics/TopicSelector'
import { AtomDetailView } from './modes/chemistry/AtomDetailView'
import { useAirInteractions } from './hooks/useAirInteractions'
import { SYMBOL_TO_Z, QuantumAtom } from './modes/chemistry/QuantumAtom'
import { solveReactions } from './engine/chemistry/ChemistryEngine'

const App: React.FC = () => {
  const mode = useHoloStore(state => state.mode);
  const setMode = useHoloStore(state => state.setMode);
  const isLanding = useHoloStore(state => state.isLanding);
  const setIsLanding = useHoloStore(state => state.setIsLanding);
  const engineStatus = useHoloStore(state => state.engineStatus);
  const selectedItems = useHoloStore(state => state.selectedItems);
  const draggedElement = useHoloStore(state => state.draggedElement);
  const dragPosition = useHoloStore(state => state.dragPosition);
  const isRealistic = useHoloStore(state => state.isRealistic);
  const temperature = useHoloStore(state => state.temperature);
  const setTemperature = useHoloStore(state => state.setTemperature);
  const pressure = useHoloStore(state => state.pressure);
  const setPressure = useHoloStore(state => state.setPressure);

  const [activeTab, setActiveTab] = useState<'workspace' | 'synthesis' | 'physics' | 'elements'>('workspace')
  const [isElementsOpen, setIsElementsOpen] = useState(false)
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null)

  useAirInteractions()

  useEffect(() => {
    if (isLanding) return;
    if (activeTab === 'physics') setMode('physics');
    else setMode('chemistry');
  }, [activeTab, isLanding, setMode]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0D14] text-on-surface select-none font-body-rt">

      {/* --- GLOBAL COORDINATION CANVAS --- */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <Canvas shadows camera={{ position: [0, 0, 6], fov: 60 }} gl={{ alpha: true, antialias: true }} eventSource={document.getElementById('root') || undefined}>
          <View.Port />
          <Preload all />
        </Canvas>
      </div>

      <GestureEngine />
      <HandCursor />

      <AnimatePresence>{isLanding && <LandingScreen />}</AnimatePresence>
      <AnimatePresence>{selectedAtom && <AtomDetailView symbol={selectedAtom} onClose={() => setSelectedAtom(null)} />}</AnimatePresence>
      <AnimatePresence>
        {isElementsOpen && !selectedAtom && (
          <PeriodicTable onClose={() => setIsElementsOpen(false)} onSelect={(sym) => { setSelectedAtom(sym); setIsElementsOpen(false); }} />
        )}
      </AnimatePresence>

      {!isLanding && (
        <View className="absolute inset-0 pointer-events-none z-10">
          <ambientLight intensity={0.8} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#00f2ff" />
          <pointLight position={[-5, -5, 5]} intensity={1} color="#7000ff" />
          <HandOverlay />
          <Suspense fallback={null}>
            {mode === 'chemistry' ? <ChemistryScene /> : <PhysicsScene />}
            {draggedElement && dragPosition && (
              <QuantumAtom atomicNumber={SYMBOL_TO_Z[draggedElement] || 1} symbol={draggedElement} position={dragPosition} scale={0.4} isRealistic={isRealistic} />
            )}
          </Suspense>
        </View>
      )}

      {/* ============================================================
          UNIFIED HUD OVERLAY LAYER (z-20)
          ============================================================ */}
      {!isLanding && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          
          {/* Subtle vignette/grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

          {/* ── TOP BAR ── */}
          <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 pointer-events-auto">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(0,243,255,0.6)] font-display-lg uppercase tracking-widest">HOLOLAB</span>
              <div className="h-5 w-[1px] bg-cyan-400/20"></div>
              <span className="font-mono-data text-xs text-cyan-400/50 uppercase tracking-widest">
                {activeTab === 'workspace' ? 'WORKSPACE / ALPHA-01' : 
                 activeTab === 'synthesis' ? 'SYSTEM LIVE // CORE_STABLE' : 
                 'PHYSICS HUB'}
              </span>
              {activeTab === 'synthesis' && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#2ae500] animate-pulse ml-2"></div>}
            </div>
            <div className="flex items-center gap-6">
              <span className="material-symbols-outlined text-cyan-400/50">pan_tool</span>
              <span className="material-symbols-outlined text-cyan-400/50">sensors</span>
              <span className="material-symbols-outlined text-cyan-400/50">account_circle</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_purple] animate-pulse"></div>
                <span className="font-mono-data text-[9px] text-purple-300 uppercase tracking-widest">AI LINK ACTIVE</span>
              </div>
            </div>
          </header>

          {/* ── CONDITIONAL VIEWS ── */}
          {activeTab === 'workspace' && (
            <>
              {/* Left Panel: DIAGNOSTIC HUD */}
              <aside className="absolute left-10 top-24 flex flex-col gap-6 pointer-events-auto w-72">
                <div className="bg-[#0A0D14]/80 backdrop-blur-md border-l-4 border-l-cyan-400 border border-cyan-400/20 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-label-caps text-[10px] text-white uppercase tracking-[0.2em]">DIAGNOSTIC HUD</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#2ae500]"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between font-mono-data text-[9px] mb-1">
                        <span className="text-cyan-100/60">HAND TRACKING</span>
                        <span className="text-green-400">ACTIVE (98%)</span>
                      </div>
                      <div className="h-[2px] w-full bg-cyan-900/30"><div className="h-full bg-green-400 shadow-[0_0_5px_green]" style={{width:'98%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between font-mono-data text-[9px] mb-1">
                        <span className="text-cyan-100/60">DEPTH MAPPING</span>
                        <span className="text-cyan-400">CALIBRATED</span>
                      </div>
                      <div className="h-[2px] w-full bg-cyan-900/30"><div className="h-full bg-cyan-400 shadow-[0_0_5px_cyan]" style={{width:'100%'}}></div></div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <div className="flex-1 border border-cyan-400/20 p-2 rounded">
                      <p className="font-mono-data text-[8px] text-cyan-400/40 uppercase">LATENCY</p>
                      <p className="font-mono-data text-sm text-cyan-100 mt-1">4.2ms</p>
                    </div>
                    <div className="flex-1 border border-cyan-400/20 p-2 rounded">
                      <p className="font-mono-data text-[8px] text-cyan-400/40 uppercase">REFRESH</p>
                      <p className="font-mono-data text-sm text-cyan-100 mt-1">120Hz</p>
                    </div>
                  </div>
                </div>

                {/* Gesture Lock */}
                <div className="bg-[#0A0D14]/60 backdrop-blur-md border border-cyan-400/10 rounded-lg p-6 flex flex-col items-center justify-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border border-cyan-400/20 rounded-lg rotate-12"></div>
                    <div className="absolute inset-0 border border-cyan-400/20 rounded-lg -rotate-12"></div>
                    <span className="material-symbols-outlined text-green-400 text-3xl shadow-[0_0_15px_green] rounded-full">pinch</span>
                  </div>
                  <span className="font-mono-data text-[9px] text-cyan-400/40 uppercase tracking-[0.2em]">GESTURE LOCK</span>
                </div>
              </aside>

              {/* Right Panel: HOLOAI ASSISTANT */}
              <aside className="absolute right-10 top-24 flex flex-col gap-6 w-80 pointer-events-auto">
                <div className="bg-[#1A0B1A]/80 backdrop-blur-md border border-purple-500/20 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center gap-3 border-b border-purple-500/10">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_purple]"></div>
                    <h3 className="font-label-caps text-[10px] text-purple-200 uppercase tracking-[0.2em]">HOLOAI ASSISTANT</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400/60 text-sm animate-spin" style={{ animationDuration: '3s' }}>radar</span>
                      <span className="font-mono-data text-[9px] text-purple-400/80 uppercase tracking-widest">SCANNING ENVIRONMENT...</span>
                    </div>
                    
                    {selectedItems.length > 0 ? (
                       <div className="border-l-2 border-cyan-400 bg-cyan-400/5 p-4 italic text-xs text-cyan-100/70 font-body-rt leading-relaxed">
                        "Fact: {selectedItems[0]} is present in the workspace. Combining elements may yield synthesis results."
                       </div>
                    ) : (
                      <div className="border-l-2 border-cyan-400 bg-cyan-400/5 p-4 italic text-xs text-cyan-100/70 font-body-rt leading-relaxed">
                        "Workspace is currently empty. Add elements from the 3D Inventory Tray to begin synthesis operations."
                      </div>
                    )}

                    <div className="pt-2 space-y-2">
                      <span className="font-mono-data text-[8px] text-cyan-400/40 uppercase tracking-widest">SYSTEM COMMANDS</span>
                      <button onClick={() => setIsElementsOpen(true)} className="w-full flex justify-between items-center p-3 border border-purple-500/20 rounded text-purple-200 hover:bg-purple-500/10 transition-colors">
                        <span className="font-mono-data text-[10px] uppercase">OPEN ELEMENTS HUB</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                      <button onClick={() => { setActiveTab('synthesis'); solveReactions(); }} className="w-full flex justify-between items-center p-3 border border-purple-500/20 rounded text-purple-200 hover:bg-purple-500/10 transition-colors">
                        <span className="font-mono-data text-[10px] uppercase">SIMULATE REACTION</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Deletion Zone */}
                <div data-trash-zone="true" className="h-24 bg-red-900/10 border border-red-500/20 rounded-lg p-2 group hover:bg-red-900/20 transition-all">
                  <div className="w-full h-full border border-dashed border-red-500/30 rounded flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-red-500/50 group-hover:text-red-400 text-sm">delete</span>
                    <span className="font-mono-data text-[8px] text-red-500/50 group-hover:text-red-400 uppercase tracking-widest">DRAG TO DISCARD</span>
                  </div>
                </div>
              </aside>

              {/* Bottom Inventory Tray */}
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
                <span className="font-mono-data text-[9px] text-cyan-400/30 uppercase tracking-[0.4em] mb-4">3D INVENTORY TRAY</span>
                <div className="flex items-center gap-4 bg-[#0A0D14]/80 backdrop-blur-md p-4 rounded-xl border border-cyan-400/10">
                  {['ISOTOPES', 'SOLVENTS', 'THERMAL', 'ANODES'].map((cat, i) => (
                    <button key={i} className="w-20 h-24 bg-cyan-900/20 rounded-lg border border-cyan-400/10 flex flex-col items-center justify-center gap-3 hover:bg-cyan-400/10 hover:border-cyan-400/40 transition-all group">
                      <span className="material-symbols-outlined text-cyan-400 text-2xl group-hover:shadow-[0_0_15px_cyan] rounded-full transition-all">{
                        cat === 'ISOTOPES' ? 'science' : cat === 'SOLVENTS' ? 'water_drop' : cat === 'THERMAL' ? 'thermostat' : 'bolt'
                      }</span>
                      <span className="font-mono-data text-[8px] text-cyan-400/60 uppercase">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'synthesis' && (
            <>
              {/* Left Panel: Environment Controls */}
              <aside className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto">
                {/* Temperature */}
                <div className="w-64 bg-[#0A0D14]/80 backdrop-blur-md border border-cyan-400/20 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-cyan-400 text-sm">thermostat</span>
                    <span className="font-mono-data text-[9px] text-cyan-400 uppercase tracking-[0.2em]">TEMPERATURE</span>
                  </div>
                  <div className="bg-black/60 rounded flex items-center justify-between p-3 border border-cyan-400/10">
                    <button onClick={() => setTemperature(Math.max(0, temperature - 10))} className="text-cyan-700 hover:text-cyan-400 w-8 h-8 flex items-center justify-center">-</button>
                    <div className="flex flex-col items-center">
                      <span className="font-display-lg text-2xl text-cyan-400">{temperature.toFixed(2)}</span>
                      <span className="font-mono-data text-[8px] text-cyan-700 uppercase">KELVIN</span>
                    </div>
                    <button onClick={() => setTemperature(Math.min(1000, temperature + 10))} className="text-cyan-700 hover:text-cyan-400 w-8 h-8 flex items-center justify-center">+</button>
                  </div>
                </div>
                {/* Pressure */}
                <div className="w-64 bg-[#0A0D14]/80 backdrop-blur-md border border-cyan-400/20 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-cyan-400 text-sm">speed</span>
                    <span className="font-mono-data text-[9px] text-cyan-400 uppercase tracking-[0.2em]">PRESSURE</span>
                  </div>
                  <div className="bg-black/60 rounded flex items-center justify-between p-3 border border-cyan-400/10">
                    <button onClick={() => setPressure(Math.max(0, pressure - 0.1))} className="text-cyan-700 hover:text-cyan-400 w-8 h-8 flex items-center justify-center">-</button>
                    <div className="flex flex-col items-center">
                      <span className="font-display-lg text-2xl text-cyan-400">{pressure.toFixed(3)}</span>
                      <span className="font-mono-data text-[8px] text-cyan-700 uppercase">ATM</span>
                    </div>
                    <button onClick={() => setPressure(Math.min(10, pressure + 0.1))} className="text-cyan-700 hover:text-cyan-400 w-8 h-8 flex items-center justify-center">+</button>
                  </div>
                </div>
                <p className="text-[7px] text-cyan-400/40 font-mono-data uppercase tracking-widest leading-relaxed mt-2">
                  ENVIRONMENTAL PARAMETERS SYNCHRONIZED<br/>WITH ORBITAL STABILITY. LATTICE ENERGY<br/>PROJECTION: 787 KJ/MOL.
                </p>
              </aside>

              {/* Center: Reaction Target */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
                <div className="flex items-center gap-8 mb-48">
                  <div className="w-16 h-[1px] bg-cyan-900/50"></div>
                  <div className="px-8 py-4 border border-red-500/40 bg-red-900/10 rounded backdrop-blur-md text-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <h2 className="font-display-lg text-lg text-red-200 tracking-[0.4em] uppercase mb-1">IONIC SYNTHESIS</h2>
                    <p className="font-mono-data text-[8px] text-red-500/60 uppercase tracking-widest">SODIUM CHLORIDE // DETECTED</p>
                  </div>
                  <div className="w-16 h-[1px] bg-cyan-900/50"></div>
                </div>

                <button 
                  onClick={() => solveReactions()}
                  className="px-10 py-4 bg-cyan-950/40 border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,243,255,0.2)] rounded backdrop-blur-xl hover:bg-cyan-900/60 hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] active:scale-95 transition-all flex items-center gap-4 group"
                >
                  <span className="material-symbols-outlined text-cyan-400 text-xl group-hover:animate-pulse">bolt</span>
                  <span className="font-display-lg text-lg text-cyan-400 tracking-[0.3em] uppercase">EXECUTE REACTION</span>
                </button>
              </div>

              {/* Right: Selected Element Focus */}
              <aside className="absolute right-32 top-1/2 -translate-y-1/2 flex items-center gap-10 pointer-events-auto">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-64 h-64 border border-cyan-400/30 rounded-2xl bg-[#0A0D14]/80 backdrop-blur-md relative flex items-center justify-center">
                    <div className="absolute inset-4 border border-cyan-400/10 rounded-xl rotate-3"></div>
                    <div className="text-center">
                      <h1 className="font-display-lg text-3xl text-cyan-400 leading-none mb-1">Cl</h1>
                      <p className="font-mono-data text-[10px] text-cyan-400/60">Chlorine</p>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full border border-cyan-400/40 bg-[#0A0D14]"></div>
                  </div>
                  <div className="px-4 py-1.5 border border-cyan-400/20 bg-cyan-950/30 rounded">
                    <span className="font-mono-data text-[9px] text-cyan-400/60 tracking-widest">POS: 88.12 | 12.04</span>
                  </div>
                </div>
                
                {/* STAB slider */}
                <div className="h-64 w-12 border border-cyan-400/20 rounded-full bg-[#0A0D14]/80 backdrop-blur-md flex flex-col items-center justify-between py-4">
                  <span className="font-mono-data text-[7px] text-cyan-400/50 uppercase">STAB</span>
                  <div className="w-1 flex-1 bg-cyan-950 my-2 rounded-full flex flex-col-reverse overflow-hidden">
                    <div className="w-full h-3/4 bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
                  </div>
                  <span className="material-symbols-outlined text-cyan-400 text-sm">ac_unit</span>
                </div>
              </aside>
            </>
          )}

          {/* ── BOTTOM DOCK ── */}
          <nav className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black via-[#0A0D14]/90 to-transparent flex justify-center items-end pb-6 pointer-events-auto">
            <div className="flex gap-16">
              {[
                { id: 'workspace', icon: 'science', label: 'WORKSPACE' },
                { id: 'synthesis', icon: 'cyclone', label: 'SYNTHESIS' },
                { id: 'physics', icon: 'bolt', label: 'PHYSICS' },
                { id: 'elements', icon: 'grid_view', label: 'ELEMENTS' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'elements') setIsElementsOpen(true);
                    else setActiveTab(tab.id as any);
                  }}
                  className={`flex flex-col items-center gap-2 group transition-all`}
                >
                  <div className={`w-14 h-12 flex items-center justify-center rounded-lg transition-all ${
                    activeTab === tab.id && tab.id !== 'elements' ? 'border border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-transparent group-hover:border-cyan-400/20 group-hover:bg-cyan-400/5'
                  }`}>
                    <span className={`material-symbols-outlined ${activeTab === tab.id && tab.id !== 'elements' ? 'text-cyan-400' : 'text-cyan-700 group-hover:text-cyan-400'}`}>{tab.icon}</span>
                  </div>
                  <span className={`font-mono-data text-[8px] uppercase tracking-widest ${activeTab === tab.id && tab.id !== 'elements' ? 'text-cyan-400' : 'text-cyan-700'}`}>{tab.label}</span>
                </button>
              ))}
            </div>
            {/* Signature */}
            <div className="absolute right-8 bottom-6">
               <span className="font-mono-data text-[7px] text-cyan-400/20 uppercase tracking-[0.2em]">HOLOLAB SPATIAL OS V4.2.0 | MADE BY DEVILL KK</span>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}

export default App
