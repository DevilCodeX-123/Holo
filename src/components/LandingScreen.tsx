import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, Wind, Zap } from 'lucide-react';
import { useHoloStore } from '../store/useHoloStore';

export const LandingScreen: React.FC = () => {
  const { setMode, setIsLanding, handPosition, isGrabbing, isHandActive } = useHoloStore();
  const [hoveredMode, setHoveredMode] = useState<'chemistry' | 'physics' | null>(null);

  // Check for selection
  useEffect(() => {
    if (isGrabbing && hoveredMode) {
      setMode(hoveredMode);
      setIsLanding(false);
    }
  }, [isGrabbing, hoveredMode, setMode, setIsLanding]);

  const handleHover = (mode: 'chemistry' | 'physics' | null) => {
    setHoveredMode(mode);
  };

  const modes = [
    { id: 'chemistry', title: 'Chemistry Lab', icon: Beaker, color: 'from-cyan-500 to-blue-600', desc: 'Explore elements, reactions, and molecular structures.' },
    { id: 'physics', title: 'Physics Lab', icon: Zap, color: 'from-purple-500 to-pink-600', desc: 'Simulate forces, gravity, energy, and waves.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm px-4 md:px-6 overflow-y-auto py-10 md:py-0">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 md:mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase mb-2">
          Holo<span className="text-holo-primary">Lab</span>
        </h1>
        <p className="text-zinc-400 font-mono tracking-widest text-[8px] md:text-xs uppercase">
          Advanced AR Science Platform
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-12 max-w-5xl w-full">
        {modes.map((m) => (
          <motion.button
            key={m.id}
            onMouseEnter={() => handleHover(m.id as any)}
            onMouseLeave={() => handleHover(null)}
            onClick={() => { setMode(m.id as any); setIsLanding(false); }} // Support click
            className={`flex-1 relative group rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 overflow-hidden text-left ${
              hoveredMode === m.id 
                ? 'border-white scale-[1.02] md:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)] bg-white/5' 
                : 'border-white/10 opacity-60'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
            
            <m.icon className={`w-10 h-10 md:w-16 md:h-16 mb-4 md:mb-6 transition-transform duration-500 ${hoveredMode === m.id ? 'scale-110' : ''}`} />
            <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">{m.title}</h2>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">{m.desc}</p>
            
            <div className={`mt-auto inline-flex items-center gap-2 text-[8px] md:text-xs font-bold tracking-widest uppercase py-2 md:py-3 px-4 md:px-6 rounded-full border border-white/20 transition-colors ${hoveredMode === m.id ? 'bg-white text-black' : ''}`}>
              {isGrabbing && hoveredMode === m.id ? 'Initializing...' : 'Pinch or Click'}
            </div>

            {/* Selection Progress Ring (if hand active and hovering) */}
            {isHandActive && hoveredMode === m.id && (
              <div className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle
                    cx="20 md:24" cy="20 md:24" r="18 md:20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.2"
                  />
                  <motion.circle
                    cx="20 md:24" cy="20 md:24" r="18 md:20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="126"
                    initial={{ strokeDashoffset: 126 }}
                    animate={{ strokeDashoffset: isGrabbing ? 0 : 126 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 md:mt-20 text-zinc-500 font-mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-center"
      >
        Gesture Tracking Active • Ready for Interaction
      </motion.p>
    </div>
  );
};
