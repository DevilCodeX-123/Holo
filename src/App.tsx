import React, { Suspense } from 'react'
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

const App: React.FC = () => {
  const { 
    mode, isLanding,
    aiExplanation, setAiExplanation,
    isAiLoading, setIsAiLoading,
    selectedItems
  } = useHoloStore()

  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  // Trigger AI explanation when mode changes
  React.useEffect(() => {
    if (isLanding) return;
    
    const triggerAI = async () => {
      setIsAiLoading(true)
      const explanation = await getSimulationExplanation(mode, `User switched to ${mode} mode.`)
      setAiExplanation(explanation)
      setIsAiLoading(false)
    }
    triggerAI()
  }, [mode, isLanding])

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

      {/* --- 3D LAYER: Three.js Scene --- */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
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
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 md:p-6">
          
          {/* Top HUD: AI Intelligence */}
          <div className="flex justify-between items-start gap-4">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass holo-border w-full max-w-[280px] md:max-w-80 rounded-xl md:rounded-2xl p-3 md:p-4 pointer-events-auto"
            >
              <div className="flex items-center gap-2 text-holo-primary mb-1 md:mb-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-holo-primary animate-pulse" />
                <h2 className="font-bold tracking-widest uppercase text-[8px] md:text-[10px]">HoloAI</h2>
              </div>
              <p className="text-[9px] md:text-xs text-zinc-300 leading-relaxed italic line-clamp-3 md:line-clamp-none">
                {isAiLoading ? "Analyzing..." : aiExplanation}
              </p>
            </motion.div>

            {/* Mode Indicator */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass holo-border px-3 md:px-6 py-1.5 md:py-2 rounded-full flex items-center gap-2 md:gap-3"
            >
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${mode === 'chemistry' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
              <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest">{mode}</span>
            </motion.div>
          </div>

          {/* Bottom HUD: Selection & Tray */}
          <div className="flex flex-col gap-2 md:gap-4 items-center">
            {/* Selection Tray */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col md:flex-row gap-2 md:gap-4 items-center w-full max-w-4xl px-4"
            >
              <div className="glass holo-border h-12 md:h-16 px-4 md:px-6 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 flex-1 min-w-0 w-full overflow-x-auto custom-scrollbar">
                {selectedItems.length === 0 ? (
                  <span className="text-zinc-500 text-[8px] md:text-[10px] uppercase tracking-widest whitespace-nowrap">Empty Tray</span>
                ) : (
                  selectedItems.map((item, idx) => (
                    <motion.div
                      key={`${item}-${idx}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-holo-primary"
                    >
                      {item}
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Trigger Button (Holographic) */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="glass holo-border h-12 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl flex flex-col justify-center items-center gap-0.5 group transition-all hover:bg-white/10 pointer-events-auto whitespace-nowrap"
              >
                <span className="text-[6px] md:text-[8px] text-zinc-500 uppercase font-bold tracking-[0.2em]">Open</span>
                <span className="text-[8px] md:text-[10px] text-holo-primary font-bold uppercase tracking-widest">
                  {mode === 'chemistry' ? 'Periodic Table' : 'Physics Topics'}
                </span>
              </button>
            </motion.div>

            {/* Instruction Overlay */}
            <div className="text-[6px] md:text-[8px] text-zinc-600 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-1 md:mb-2 bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
              Pinch to Select • Grab to Manipulate
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
