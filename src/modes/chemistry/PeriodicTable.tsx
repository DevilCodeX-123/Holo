import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useHoloStore } from '../../store/useHoloStore';

const ELEMENTS = [
  { symbol: 'H',  name: 'Hydrogen',   mass: 1.008,   group: 'nonmetal' },
  { symbol: 'He', name: 'Helium',     mass: 4.003,   group: 'noble' },
  { symbol: 'Li', name: 'Lithium',    mass: 6.94,    group: 'alkali' },
  { symbol: 'Be', name: 'Beryllium',  mass: 9.012,   group: 'alkaline' },
  { symbol: 'B',  name: 'Boron',      mass: 10.81,   group: 'metalloid' },
  { symbol: 'C',  name: 'Carbon',     mass: 12.011,  group: 'nonmetal' },
  { symbol: 'N',  name: 'Nitrogen',   mass: 14.007,  group: 'nonmetal' },
  { symbol: 'O',  name: 'Oxygen',     mass: 15.999,  group: 'nonmetal' },
  { symbol: 'F',  name: 'Fluorine',   mass: 18.998,  group: 'halogen' },
  { symbol: 'Ne', name: 'Neon',       mass: 20.180,  group: 'noble' },
  { symbol: 'Na', name: 'Sodium',     mass: 22.990,  group: 'alkali' },
  { symbol: 'Mg', name: 'Magnesium',  mass: 24.305,  group: 'alkaline' },
  { symbol: 'Al', name: 'Aluminium',  mass: 26.982,  group: 'post-transition' },
  { symbol: 'Si', name: 'Silicon',    mass: 28.085,  group: 'metalloid' },
  { symbol: 'P',  name: 'Phosphorus', mass: 30.974,  group: 'nonmetal' },
  { symbol: 'S',  name: 'Sulfur',     mass: 32.06,   group: 'nonmetal' },
  { symbol: 'Cl', name: 'Chlorine',   mass: 35.45,   group: 'halogen' },
  { symbol: 'Ar', name: 'Argon',      mass: 39.948,  group: 'noble' },
  { symbol: 'K',  name: 'Potassium',  mass: 39.098,  group: 'alkali' },
  { symbol: 'Ca', name: 'Calcium',    mass: 40.078,  group: 'alkaline' },
  { symbol: 'Fe', name: 'Iron',       mass: 55.845,  group: 'transition' },
  { symbol: 'Cu', name: 'Copper',     mass: 63.546,  group: 'transition' },
  { symbol: 'Zn', name: 'Zinc',       mass: 65.38,   group: 'transition' },
  { symbol: 'Ag', name: 'Silver',     mass: 107.87,  group: 'transition' },
  { symbol: 'Au', name: 'Gold',       mass: 196.97,  group: 'transition' },
  { symbol: 'Hg', name: 'Mercury',    mass: 200.59,  group: 'transition' },
  { symbol: 'Pb', name: 'Lead',       mass: 207.2,   group: 'post-transition' },
  { symbol: 'I',  name: 'Iodine',     mass: 126.9,   group: 'halogen' },
  { symbol: 'Br', name: 'Bromine',    mass: 79.9,    group: 'halogen' },
  { symbol: 'Xe', name: 'Xenon',      mass: 131.29,  group: 'noble' },
  { symbol: 'Cr', name: 'Chromium',   mass: 51.996,  group: 'transition' },
  { symbol: 'Mn', name: 'Manganese',  mass: 54.938,  group: 'transition' },
  { symbol: 'Ni', name: 'Nickel',     mass: 58.693,  group: 'transition' },
  { symbol: 'Ti', name: 'Titanium',   mass: 47.867,  group: 'transition' },
  { symbol: 'Pt', name: 'Platinum',   mass: 195.08,  group: 'transition' },
  { symbol: 'U',  name: 'Uranium',    mass: 238.03,  group: 'actinide' },
];

const COLS = 6;
const PAGE_SIZE = COLS * 3; // 3 rows visible at a time

interface PeriodicTableProps {
  onClose: () => void;
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ onClose }) => {
  const { addItem, allHands } = useHoloStore();
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [flashSymbol, setFlashSymbol] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(ELEMENTS.length / PAGE_SIZE);
  const visibleElements = ELEMENTS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Hand-gesture scroll: listen to WheelEvent dispatched by GestureEngine wrist scroll
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) setPage(p => Math.min(p + 1, totalPages - 1));
      else setPage(p => Math.max(p - 1, 0));
    };
    containerRef.current?.addEventListener('wheel', onWheel, { passive: true });
    return () => containerRef.current?.removeEventListener('wheel', onWheel);
  }, [totalPages]);

  // Gesture: detect hand hover over element and auto-select on pinch or flick
  useEffect(() => {
    if (!allHands || allHands.length === 0) return;
    const primary = allHands[0];
    if (primary.isPinching && hoveredSymbol) {
      selectElement(hoveredSymbol);
    }
  }, [allHands]);

  const selectElement = (symbol: string) => {
    addItem(symbol);
    setFlashSymbol(symbol);
    setTimeout(() => setFlashSymbol(null), 400);
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'nonmetal':       return 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300';
      case 'noble':          return 'bg-purple-500/20 border-purple-500/60 text-purple-300';
      case 'alkali':         return 'bg-red-500/20 border-red-500/60 text-red-300';
      case 'alkaline':       return 'bg-orange-500/20 border-orange-500/60 text-orange-300';
      case 'metalloid':      return 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300';
      case 'halogen':        return 'bg-blue-500/20 border-blue-500/60 text-blue-300';
      case 'transition':     return 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300';
      case 'post-transition':return 'bg-teal-500/20 border-teal-500/60 text-teal-300';
      case 'actinide':       return 'bg-pink-500/20 border-pink-500/60 text-pink-300';
      default:               return 'bg-zinc-500/20 border-zinc-500/60 text-zinc-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      /* ===  AR GLASS PANEL: fixed over camera, semi-transparent  === */
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'transparent' }}
    >
      {/* Dim overlay — subtle so camera is still visible */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-3xl mx-6 rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(0,10,20,0.72)',
          border: '1px solid rgba(0,242,255,0.25)',
          boxShadow: '0 0 60px rgba(0,242,255,0.12), inset 0 0 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Scanlines texture */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,242,255,0.1) 3px, rgba(0,242,255,0.1) 4px)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Periodic <span className="text-holo-primary">Table</span>
            </h2>
            <p className="text-[9px] text-cyan-400/60 font-mono tracking-[0.3em] uppercase mt-0.5">
              Gesture Select Active • Page {page + 1}/{totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Up/Down buttons for scroll */}
            <button
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
              data-virtual-interact="true"
              className="w-10 h-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 pointer-events-auto"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
              disabled={page === totalPages - 1}
              data-virtual-interact="true"
              className="w-10 h-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 pointer-events-auto"
            >
              <ChevronDown size={18} />
            </button>
            <button
              onClick={onClose}
              data-virtual-interact="true"
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/15 transition-all pointer-events-auto ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Element Grid */}
        <div className="grid grid-cols-6 gap-2 px-4 pb-4 relative z-10">
          <AnimatePresence mode="wait">
            {visibleElements.map((el, idx) => {
              const isHovered = hoveredSymbol === el.symbol;
              const isFlashing = flashSymbol === el.symbol;
              return (
                <motion.button
                  key={`${el.symbol}-${page}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.02, type: 'spring', damping: 15 }}
                  onMouseEnter={() => setHoveredSymbol(el.symbol)}
                  onMouseLeave={() => setHoveredSymbol(null)}
                  onClick={() => selectElement(el.symbol)}
                  data-virtual-interact="true"
                  className={`
                    relative aspect-square rounded-xl border-2 p-2 flex flex-col justify-between
                    transition-all duration-150 pointer-events-auto cursor-pointer
                    ${isHovered
                      ? 'border-white bg-white/20 scale-110 z-20 shadow-[0_0_25px_rgba(255,255,255,0.3)]'
                      : getGroupColor(el.group)
                    }
                    ${isFlashing ? 'bg-white border-white' : ''}
                  `}
                >
                  <span className="text-[7px] font-mono opacity-60 text-left">{el.mass.toFixed(2)}</span>
                  <div className="text-center">
                    <span className="text-xl font-black block leading-none">{el.symbol}</span>
                    <span className="text-[6px] font-bold uppercase tracking-wider opacity-60 block mt-0.5 truncate">{el.name}</span>
                  </div>
                  {/* Glow ring on hover */}
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      animate={{ boxShadow: ['0 0 0px rgba(0,242,255,0)', '0 0 20px rgba(0,242,255,0.6)', '0 0 0px rgba(0,242,255,0)'] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Hover info bar */}
        <div className="px-6 pb-4 h-10 flex items-center relative z-10">
          {hoveredSymbol ? (
            <motion.div
              key={hoveredSymbol}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <span className="text-holo-primary font-black text-lg">{hoveredSymbol}</span>
              <span className="text-white/60 text-xs">
                {ELEMENTS.find(e => e.symbol === hoveredSymbol)?.name} •{' '}
                Pinch or tap to add
              </span>
            </motion.div>
          ) : (
            <span className="text-[9px] text-zinc-600 uppercase tracking-[0.4em]">
              Point hand at element • Pinch to select
            </span>
          )}
        </div>

        {/* Page dots */}
        <div className="flex justify-center gap-2 pb-4 relative z-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all pointer-events-auto ${i === page ? 'bg-holo-primary w-4' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
