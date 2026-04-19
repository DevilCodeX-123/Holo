import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
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
import { getSimulationExplanation } from './engine/ai/geminiService'
import { useAirInteractions } from './hooks/useAirInteractions'

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

  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

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
      {/* --- BACKGROUND LAYER: Camera Feed --- */}
      <GestureEngine />

      {/* --- CURSOR LAYER --- */}
      <HandCursor />

      {/* --- LANDING / SELECTION LAYER --- */}
      <AnimatePresence>
        {isLanding && <LandingScreen />}
      </AnimatePresence>

      {/* --- SIDEBAR NAVIGATION --- */}
      {!isLanding && (
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4"
        >
          <button 
            onClick={() => navigateTo('chemistry')}
            className={`w-14 h-14 rounded-2xl glass holo-border flex items-center justify-center transition-all pointer-events-auto ${mode === 'chemistry' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
            title="Chemistry Lab"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 001.414 3.414h15.828a2 2 0 001.414-3.414l-2.387-2.387zM15 11V5a2 2 0 00-2-2H11a2 2 0 00-2 2v6m6 0a2 2 0 012 2v6H7v-6a2 2 0 012-2m6 0h-6" /></svg>
          </button>
          <button 
            onClick={() => navigateTo('physics')}
            className={`w-14 h-14 rounded-2xl glass holo-border flex items-center justify-center transition-all pointer-events-auto ${mode === 'physics' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-white'}`}
            title="Physics Lab"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
          <div className="h-px bg-white/10 mx-4 my-2" />
          <button 
            onClick={() => navigateTo('home')}
            className="w-14 h-14 rounded-2xl glass holo-border flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all pointer-events-auto"
            title="Home"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
        </motion.div>
      )}

      {/* --- MODAL LAYER: Periodic Table / Physics Menu --- */}
      <AnimatePresence>
        {isMenuOpen && (
          mode === 'chemistry' ? (
            <PeriodicTable onClose={() => setIsMenuOpen(false)} />
          ) : (
            <TopicSelector onClose={() => setIsMenuOpen(false)} />
          )
        )}
      </AnimatePresence>

      {/* --- 3D LAYER: Three.js Scene overlaid on camera --- */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas
          shadows
          camera={{ position: [0, 0, 6], fov: 60 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.8} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#00f2ff" />
          <pointLight position={[-5, -5, 5]} intensity={1} color="#7000ff" />
          <HandOverlay />
          <Suspense fallback={null}>
            {!isLanding && (
              mode === 'chemistry' ? <ChemistryScene /> : <PhysicsScene />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* --- UI LAYER: HUD Overlays --- */}
      {!isLanding && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
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
                {isAiLoading ? "Syncing AR coordinates..." : aiExplanation}
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 items-center pl-20">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-4 items-center w-full max-w-4xl"
            >
              <div className="glass holo-border h-16 px-6 rounded-2xl flex items-center gap-4 flex-1 overflow-x-auto custom-scrollbar">
                {selectedItems.length === 0 ? (
                  <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Workspace Empty</span>
                ) : (
                  selectedItems.map((item, idx) => (
                    <motion.div
                      key={`${item}-${idx}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      data-element={item}
                      data-virtual-interact="true"
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-holo-primary/40 flex items-center justify-center text-[10px] font-bold text-holo-primary cursor-pointer pointer-events-auto hover:bg-holo-primary/20 transition-all"
                      title={`Grab ${item} with pinch gesture`}
                    >
                      {item}
                    </motion.div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="glass holo-border h-16 px-8 rounded-2xl flex flex-col justify-center items-center gap-0.5 group transition-all hover:bg-white/10 pointer-events-auto"
              >
                <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-[0.2em]">Open Library</span>
                <span className="text-[10px] text-holo-primary font-bold uppercase tracking-widest">
                  {mode === 'chemistry' ? 'Elements' : 'Modules'}
                </span>
              </button>
            </motion.div>

            <div className="text-[8px] text-zinc-600 uppercase tracking-[0.4em] bg-black/20 px-6 py-1.5 rounded-full backdrop-blur-sm">
              AR Interface Active • Proximity Zoom Enabled
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
