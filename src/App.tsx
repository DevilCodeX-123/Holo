import React, { Suspense, useEffect } from 'react'
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
import { InventoryAtom } from './modes/chemistry/InventoryAtom'
import { getSimulationExplanation } from './engine/ai/geminiService'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { solveReactions } from './engine/chemistry/ChemistryEngine'

const App: React.FC = () => {
  const mode = useHoloStore(state => state.mode);
  const setMode = useHoloStore(state => state.setMode);
  const isLanding = useHoloStore(state => state.isLanding);
  const setIsLanding = useHoloStore(state => state.setIsLanding);
  const aiExplanation = useHoloStore(state => state.aiExplanation);
  const setAiExplanation = useHoloStore(state => state.setAiExplanation);
  const isAiLoading = useHoloStore(state => state.isAiLoading);
  const setIsAiLoading = useHoloStore(state => state.setIsAiLoading);
  const selectedItems = useHoloStore(state => state.selectedItems);
  const zoom = useHoloStore(state => state.zoom);
  const draggedElement = useHoloStore(state => state.draggedElement);
  const dragPosition = useHoloStore(state => state.dragPosition);
  const isRealistic = useHoloStore(state => state.isRealistic);
  const engineStatus = useHoloStore(state => state.engineStatus);
  const temperature = useHoloStore(state => state.temperature);
  const setTemperature = useHoloStore(state => state.setTemperature);
  const pressure = useHoloStore(state => state.pressure);
  const setPressure = useHoloStore(state => state.setPressure);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [selectedAtom, setSelectedAtom] = React.useState<string | null>(null)
  const inventoryScrollRef = React.useRef<HTMLDivElement>(null)

  const scrollInventory = (direction: 'left' | 'right') => {
    if (inventoryScrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      inventoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  // Initialize Air Interactions (Gestures -> Click)
  useAirInteractions()

  // URL-based routing logic
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '');
      if (path === 'chemistry' || path === 'physics') {
        setMode(path as any);
        setIsLanding(false);
      } else {
        setIsLanding(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial check
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setMode, setIsLanding]);

  const navigateTo = (newMode: string | 'home') => {
    if (newMode === 'home') {
      setIsLanding(true);
      window.history.pushState({}, '', '/');
    } else {
      setMode(newMode as 'chemistry' | 'physics');
      setIsLanding(false);
      window.history.pushState({}, '', `/${newMode}`);
    }
  };

  // Trigger AI explanation when mode changes
  useEffect(() => {
    if (isLanding) return;
    const triggerAI = async () => {
      setIsAiLoading(true)
      const explanation = await getSimulationExplanation(mode, `User switched to ${mode} mode.`)
      setAiExplanation(explanation)
      setIsAiLoading(false)
    }
    triggerAI()
  }, [mode, isLanding, setAiExplanation, setIsAiLoading])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* 
          --- GLOBAL COORDINATION CANVAS ---
          This single canvas handles ALL 3D rendering in the app, 
          including the main scene, the hands, and the inventory items.
      */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <Canvas
          shadows
          camera={{ position: [0, 0, 6], fov: 60 }}
          gl={{ alpha: true, antialias: true }}
          eventSource={document.getElementById('root') || undefined}
        >
          <View.Port />
          <Preload all />
        </Canvas>
      </div>

      {/* --- BACKGROUND LAYER: Camera Feed --- */}
      <GestureEngine />

      {/* --- CURSOR LAYER --- */}
      <HandCursor />

      {/* --- LANDING / SELECTION LAYER --- */}
      <AnimatePresence>
        {isLanding && <LandingScreen />}
      </AnimatePresence>

      {/* --- SIDEBAR NAVIGATION (Refined Dock) --- */}
      {!isLanding && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute left-6 top-6 z-40 flex gap-3 pointer-events-auto"
        >
          <button 
            onClick={() => navigateTo('chemistry')}
            className={`w-12 h-12 rounded-xl glass holo-border flex items-center justify-center transition-all ${mode === 'chemistry' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 001.414 3.414h15.828a2 2 0 001.414-3.414l-2.387-2.387zM15 11V5a2 2 0 00-2-2H11a2 2 0 00-2 2v6m6 0a2 2 0 012 2v6H7v-6a2 2 0 012-2m6 0h-6" /></svg>
          </button>
          <button 
            onClick={() => navigateTo('physics')}
            className={`w-12 h-12 rounded-xl glass holo-border flex items-center justify-center transition-all ${mode === 'physics' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
          <button 
            onClick={() => navigateTo('home')}
            className="w-12 h-12 rounded-xl glass holo-border flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
        </motion.div>
      )}

      {/* --- ATOM DETAIL VIEW --- */}
      <AnimatePresence>
        {selectedAtom && (
          <AtomDetailView symbol={selectedAtom} onClose={() => setSelectedAtom(null)} />
        )}
      </AnimatePresence>

      {/* --- MODAL LAYER --- */}
      <AnimatePresence>
        {isMenuOpen && !selectedAtom && (
          mode === 'chemistry' ? (
            <PeriodicTable
              onClose={() => setIsMenuOpen(false)}
              onSelect={(sym) => { setSelectedAtom(sym); setIsMenuOpen(false); }}
            />
          ) : (
            <TopicSelector onClose={() => setIsMenuOpen(false)} />
          )
        )}
      </AnimatePresence>

      {/* --- MAIN AR CONTENT (Using View) --- */}
      {!isLanding && (
        <View className="absolute inset-0 pointer-events-none z-10">
          <ambientLight intensity={0.8} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#00f2ff" />
          <pointLight position={[-5, -5, 5]} intensity={1} color="#7000ff" />
          <HandOverlay />
          <Suspense fallback={null}>
            {!isLanding && (
              mode === 'chemistry' ? <ChemistryScene /> : <PhysicsScene />
            )}
            
            {/* Real-time Hand-Sync Drag Preview */}
            {draggedElement && dragPosition && (
              <QuantumAtom 
                atomicNumber={SYMBOL_TO_Z[draggedElement] || 1} 
                symbol={draggedElement} 
                position={dragPosition} 
                scale={0.4}
                isRealistic={isRealistic}
              />
            )}
          </Suspense>
        </View>
      )}

      {/* --- UI LAYER: HUD Overlays --- */}
      {!isLanding && (
        <div className="absolute inset-x-0 bottom-0 top-0 z-20 pointer-events-none flex flex-col justify-between p-6">
          {/* Top: AI Assistant */}
          <div className="flex justify-end items-start gap-4">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass holo-border w-80 rounded-2xl p-4 pointer-events-auto"
            >
              <div className="flex items-center gap-2 text-holo-primary mb-2">
                <div className="w-2 h-2 rounded-full bg-holo-primary animate-pulse" />
                <h2 className="font-bold tracking-widest uppercase text-[10px]">HoloAI Assistant</h2>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                {isAiLoading ? "Syncing AR coordinates..." : 
                  (engineStatus === 'scanning' ? "Raise your hand higher and keep it steady to begin interaction." :
                   engineStatus === 'error' ? "Lighting too low for tracking. Please brighten your environment." :
                   aiExplanation)
                }
              </p>
              
              {/* Hand Tracking Diagnostic */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Hand Sync Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    engineStatus === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                    engineStatus === 'scanning' ? 'bg-yellow-500 animate-pulse' :
                    engineStatus === 'error' ? 'bg-red-500' : 'bg-zinc-600'
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    engineStatus === 'active' ? 'text-green-400' :
                    engineStatus === 'scanning' ? 'text-yellow-400' :
                    engineStatus === 'error' ? 'text-red-400' : 'text-zinc-500'
                  }`}>
                    {engineStatus === 'active' ? 'Active' :
                     engineStatus === 'scanning' ? 'Scanning' :
                     engineStatus === 'error' ? 'Error' : 'Initializing'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Left Console: Environment Controls (Discrete Steppers) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-10 pointer-events-auto glass holo-border p-6 rounded-[3rem] bg-black/30 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.1)]">
            {/* TEMPERATURE UNIT */}
            <div className="flex flex-col items-center gap-4">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500/60 vertical-text mb-4">Thermodynamics</span>
               <div className="flex flex-col items-center gap-2">
                 <button 
                   onClick={() => setTemperature(Math.min(1000, temperature + 50))}
                   className="w-14 h-14 rounded-full glass holo-border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 active:scale-90 transition-all font-black text-xl"
                 > + </button>
                 <div className="h-20 w-14 glass holo-border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-cyan-950/20">
                   <div className="text-[12px] font-black text-cyan-400 font-mono z-10">{temperature}</div>
                   <div className="text-[8px] font-bold text-cyan-600/50 uppercase tracking-widest z-10">Kelvin</div>
                   <div className="absolute bottom-0 w-full bg-cyan-500/10" style={{ height: `${(temperature/1000)*100}%` }} />
                 </div>
                 <button 
                   onClick={() => setTemperature(Math.max(0, temperature - 50))}
                   className="w-14 h-14 rounded-full glass holo-border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 active:scale-90 transition-all font-black text-xl"
                 > - </button>
               </div>
            </div>
            
            {/* PRESSURE UNIT */}
            <div className="flex flex-col items-center gap-4">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-500/60 vertical-text mb-4">Atmospheric</span>
               <div className="flex flex-col items-center gap-2">
                 <button 
                   onClick={() => setPressure(Math.min(10, pressure + 1))}
                   className="w-14 h-14 rounded-full glass holo-border border-purple-500/40 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 active:scale-90 transition-all font-black text-xl"
                 > + </button>
                 <div className="h-20 w-14 glass holo-border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-purple-950/20">
                   <div className="text-[12px] font-black text-purple-400 font-mono z-10">{pressure}</div>
                   <div className="text-[8px] font-bold text-purple-600/50 uppercase tracking-widest z-10">Atm</div>
                   <div className="absolute bottom-0 w-full bg-purple-500/10" style={{ height: `${(pressure/10)*100}%` }} />
                 </div>
                 <button 
                   onClick={() => setPressure(Math.max(1, pressure - 1))}
                   className="w-14 h-14 rounded-full glass holo-border border-purple-500/40 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 active:scale-90 transition-all font-black text-xl"
                 > - </button>
               </div>
            </div>
          </div>

          {/* Right Sidebar: Execution Controller */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-auto">
            <button 
              onClick={() => {
                solveReactions();
              }}
              className="w-32 h-32 rounded-full glass border-4 border-cyan-500/30 flex items-center justify-center group relative overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(34,211,238,0.1)]"
            >
              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/20 transition-colors" />
              <div className="w-24 h-24 rounded-full border border-cyan-500/40 flex flex-col items-center justify-center gap-1 animate-pulse">
                <span className="text-[12px] font-black text-cyan-400 uppercase tracking-tighter leading-tight">Execute</span>
                <span className="text-[10px] font-bold text-cyan-300/60 uppercase tracking-[0.2em]">Reaction</span>
              </div>
            </button>
          </div>

          {/* Bottom: Unified Controller Row */}
          <div className="flex justify-center items-end gap-6 w-full max-w-5xl mx-auto mb-4">
            {/* PAGINATED ELEMENT TRAY */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-2 items-center flex-1 max-w-xl relative group"
            >
              {/* Left Arrow */}
              {selectedItems.length > 5 && (
                <button 
                  onClick={() => scrollInventory('left')}
                  className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass holo-border flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all pointer-events-auto z-30"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <div 
                ref={inventoryScrollRef}
                className="h-20 px-8 rounded-full flex items-center gap-6 flex-1 overflow-x-hidden pointer-events-auto scroll-smooth no-scrollbar"
              >
                {selectedItems.length === 0 ? (
                  <span className="w-full text-center text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-medium">Workspace Empty</span>
                ) : (
                  selectedItems.map((item, idx) => (
                    <motion.div
                      key={`${item}-${idx}`}
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      data-element={item}
                      data-virtual-interact="true"
                      onClick={() => {
                        // Spawn in the center of the view [0, 0, 0]
                        useHoloStore.getState().addActiveElement(item, [0, 0, 0]);
                        
                        // Visual ripple feedback specifically at the tray location
                        const trayRipple = document.createElement('div');
                        trayRipple.className = 'virtual-tap-ripple';
                        // Simplified center ripple for better UX
                        trayRipple.style.cssText = `left:50%;bottom:60px;width:100px;height:100px;border-width:2px;`;
                        document.body.appendChild(trayRipple);
                        setTimeout(() => trayRipple.remove(), 600);

                        // Dispatch custom event for Spawn Pulse in the 3D scene
                        window.dispatchEvent(new CustomEvent('atom_spawned', { detail: { symbol: item } }));
                      }}
                      className="flex-shrink-0 w-20 h-20 flex items-center justify-center relative cursor-pointer group transition-all"
                    >
                      <InventoryAtom symbol={item} />
                    </motion.div>
                  ))
                )}
              </div>

              {/* Right Arrow */}
              {selectedItems.length > 5 && (
                <button 
                  onClick={() => scrollInventory('right')}
                  className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass holo-border flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all pointer-events-auto z-30"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </motion.div>

            {/* ELEMENTS BUTTON */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="glass holo-border h-20 px-8 rounded-3xl flex flex-col justify-center items-center gap-1 group transition-all hover:bg-cyan-500/10 pointer-events-auto border-cyan-500/20 shadow-[0_0_30px_rgba(0,242,255,0.05)]"
            >
              <div className="w-7 h-7 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-[20px] font-black text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                +
              </div>
              <span className="text-[9px] text-holo-primary font-black uppercase tracking-[0.2em]">Elements</span>
            </button>

            {/* TRASH ZONE */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              data-trash-zone="true"
              className="h-20 w-24 rounded-3xl glass holo-border border-red-500/20 flex flex-col items-center justify-center gap-1.5 pointer-events-auto transition-all hover:bg-red-500/10 group shadow-[0_0_30px_rgba(239,68,68,0.05)]"
            >
              <Trash2 size={24} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
              <span className="text-[9px] font-black uppercase text-red-500/50 tracking-[0.2em]">Delete</span>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
