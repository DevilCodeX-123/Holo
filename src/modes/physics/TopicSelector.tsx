import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Activity, Globe, RefreshCcw, Waves, Magnet, Sun, Thermometer, Layers, Box } from 'lucide-react';
import { useHoloStore } from '../../store/useHoloStore';

const TOPICS = [
  { id: 'motion', name: 'Force & Motion', icon: Activity, desc: 'Newton\'s laws, velocity, and momentum experiments.' },
  { id: 'gravity', name: 'Gravity Lab', icon: Globe, desc: 'Simulate Earth, Moon, and Zero-G environments.' },
  { id: 'waves', name: 'Wave Simulation', icon: Waves, desc: 'Explore amplitude, frequency, and interference.' },
  { id: 'magnetism', name: 'Magnetism', icon: Magnet, desc: 'Magnetic fields, attraction, and repulsion.' },
  { id: 'energy', name: 'Energy Lab', icon: Sun, desc: 'Potential vs Kinetic energy transformation.' },
  { id: 'optics', name: 'Optics & Light', icon: Zap, desc: 'Lenses, refraction, and ray tracing.' },
];

interface TopicSelectorProps {
  onClose: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onClose }) => {
  const { setSelectedTopic, isGrabbing, handPosition } = useHoloStore();
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  // Handle pinch-to-select logic
  useEffect(() => {
    if (isGrabbing && hoveredTopic) {
      setSelectedTopic(hoveredTopic);
      onClose();
    }
  }, [isGrabbing, hoveredTopic, setSelectedTopic, onClose]);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-12 bg-black/60 backdrop-blur-md"
    >
      <div className="glass holo-border w-full max-w-6xl rounded-3xl md:rounded-[3rem] p-4 md:p-10 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="flex justify-between items-center mb-6 md:mb-12 relative z-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">
              Physics <span className="text-holo-secondary text-purple-400">Modules</span>
            </h2>
            <p className="text-[8px] md:text-[10px] text-zinc-500 font-mono tracking-[0.3em] uppercase mt-1">
              Select a simulation core to initialize
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-auto"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {TOPICS.map((topic) => (
            <motion.div
              key={topic.id}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
              onClick={() => { setSelectedTopic(topic.id); onClose(); }} // Support click
              className={`relative rounded-2xl md:rounded-3xl border-2 p-4 md:p-6 flex flex-col gap-3 md:gap-4 transition-all duration-300 pointer-events-auto cursor-pointer md:cursor-none overflow-hidden ${
                hoveredTopic === topic.id 
                  ? 'border-white scale-[1.02] md:scale-105 z-20 shadow-[0_0_40px_rgba(168,85,247,0.2)] bg-white/5' 
                  : 'border-white/5 opacity-70'
              }`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${hoveredTopic === topic.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400'}`}>
                <topic.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{topic.name}</h3>
                <p className="text-[10px] md:text-xs text-zinc-400 leading-relaxed">
                  {topic.desc}
                </p>
              </div>

              <div className={`mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5 flex items-center justify-between text-[8px] md:text-[10px] uppercase font-bold tracking-widest ${hoveredTopic === topic.id ? 'text-white' : 'text-zinc-600'}`}>
                <span>{hoveredTopic === topic.id && isGrabbing ? 'Initializing...' : 'Select Lab'}</span>
                {hoveredTopic === topic.id && <RefreshCcw size={10} className="animate-spin" />}
              </div>

              {/* Selection Progress Ring */}
              {hoveredTopic === topic.id && (
                <div className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 opacity-20">
                   <motion.div 
                     className="w-full h-full rounded-full border-2 border-white"
                     initial={{ scale: 0 }}
                     animate={{ scale: isGrabbing ? 1 : 0.8 }}
                   />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 md:mt-12 p-3 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 md:gap-4 relative z-10">
          <Layers className="text-purple-400 w-4 h-4 md:w-5 md:h-5" />
          <div className="text-[8px] md:text-[10px] text-zinc-400 uppercase tracking-widest leading-tight">
            Advanced modules coming soon: Quantum Mechanics • Thermodynamics • Relativity
          </div>
        </div>
      </div>
    </motion.div>
  );
};
