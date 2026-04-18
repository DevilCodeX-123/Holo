import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useHoloStore } from '../../store/useHoloStore';

const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', mass: 1.008, group: 'nonmetal' },
  { symbol: 'He', name: 'Helium', mass: 4.0026, group: 'noble' },
  { symbol: 'Li', name: 'Lithium', mass: 6.94, group: 'alkali' },
  { symbol: 'Be', name: 'Beryllium', mass: 9.0122, group: 'alkaline' },
  { symbol: 'B', name: 'Boron', mass: 10.81, group: 'metalloid' },
  { symbol: 'C', name: 'Carbon', mass: 12.011, group: 'nonmetal' },
  { symbol: 'N', name: 'Nitrogen', mass: 14.007, group: 'nonmetal' },
  { symbol: 'O', name: 'Oxygen', mass: 15.999, group: 'nonmetal' },
  { symbol: 'F', name: 'Fluorine', mass: 18.998, group: 'halogen' },
  { symbol: 'Ne', name: 'Neon', mass: 20.180, group: 'noble' },
  { symbol: 'Na', name: 'Sodium', mass: 22.990, group: 'alkali' },
  { symbol: 'Mg', name: 'Magnesium', mass: 24.305, group: 'alkaline' },
  { symbol: 'Al', name: 'Aluminium', mass: 26.982, group: 'post-transition' },
  { symbol: 'Si', name: 'Silicon', mass: 28.085, group: 'metalloid' },
  { symbol: 'P', name: 'Phosphorus', mass: 30.974, group: 'nonmetal' },
  { symbol: 'S', name: 'Sulfur', mass: 32.06, group: 'nonmetal' },
  { symbol: 'Cl', name: 'Chlorine', mass: 35.45, group: 'halogen' },
  { symbol: 'Ar', name: 'Argon', mass: 39.948, group: 'noble' },
];

interface PeriodicTableProps {
  onClose: () => void;
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ onClose }) => {
  const { addItem, isGrabbing, handPosition } = useHoloStore();
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  // Handle pinch-to-select logic
  useEffect(() => {
    if (isGrabbing && hoveredSymbol) {
      addItem(hoveredSymbol);
      // Optional: Add a sound or visual feedback here
    }
  }, [isGrabbing, hoveredSymbol, addItem]);

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'nonmetal': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'noble': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      case 'alkali': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'alkaline': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'metalloid': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'halogen': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default: return 'bg-zinc-500/20 border-zinc-500/50 text-zinc-400';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-12 bg-black/60 backdrop-blur-md"
    >
      <div className="glass holo-border w-full max-w-5xl rounded-3xl md:rounded-[3rem] p-4 md:p-10 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Background Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
        
        <div className="flex justify-between items-center mb-6 md:mb-10 relative z-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">
              Periodic <span className="text-holo-primary">Table</span>
            </h2>
            <p className="text-[8px] md:text-[10px] text-zinc-500 font-mono tracking-[0.3em] uppercase mt-1">
              Elemental Matrix v2.0 • Gesture Synthesis Active
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-auto"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {ELEMENTS.map((el) => (
            <motion.div
              key={el.symbol}
              onMouseEnter={() => setHoveredSymbol(el.symbol)}
              onMouseLeave={() => setHoveredSymbol(null)}
              onClick={() => addItem(el.symbol)} // Support click for non-AR testing
              className={`relative aspect-square rounded-xl md:rounded-2xl border-2 p-2 md:p-3 flex flex-col justify-between transition-all duration-300 pointer-events-auto cursor-pointer md:cursor-none ${
                hoveredSymbol === el.symbol 
                  ? 'border-white scale-105 md:scale-110 z-20 shadow-[0_0_30px_rgba(255,255,255,0.15)] bg-white/10' 
                  : `opacity-80 ${getGroupColor(el.group)}`
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[6px] md:text-[8px] font-bold opacity-60 font-mono tracking-tighter">
                  {el.mass.toFixed(2)}
                </span>
              </div>
              <div className="text-center">
                <span className="text-lg md:text-2xl font-black block leading-none">{el.symbol}</span>
                <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-widest opacity-60 block mt-1 truncate">
                  {el.name}
                </span>
              </div>
              
              {/* Selection Feedback */}
              {hoveredSymbol === el.symbol && isGrabbing && (
                <motion.div 
                  layoutId="selection-flash"
                  className="absolute inset-0 bg-white rounded-2xl z-30"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Info Panel for Hovered Element */}
        <div className="mt-6 md:mt-12 flex gap-4 md:gap-8 items-end relative z-10 min-h-[40px] md:min-h-[60px]">
          {hoveredSymbol ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={hoveredSymbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-4 md:gap-6 items-center"
              >
                <div className="text-4xl md:text-6xl font-black italic text-white/10 absolute -top-6 md:-top-10 -left-2 md:-left-4 pointer-events-none">
                  {hoveredSymbol}
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest mb-1">Status</span>
                  <span className="text-sm md:text-lg font-bold text-holo-primary uppercase tracking-widest leading-none">
                    Ready
                  </span>
                </div>
                <div className="h-6 md:h-8 w-[1px] bg-white/10" />
                <div className="text-[8px] md:text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Pinch or Click to add <span className="text-white font-bold">{ELEMENTS.find(e => e.symbol === hoveredSymbol)?.name}</span>.
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-[8px] md:text-[10px] text-zinc-600 uppercase tracking-[0.4em]">
              Hover or touch to view properties
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
