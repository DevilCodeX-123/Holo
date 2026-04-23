import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHoloStore } from '../../store/useHoloStore';

// We'll use a subset to perfectly match the Holo 1 image layout, or keep the full one with matching styles.
// The image shows exactly:
// Row 1: H (1) ........................................ He (2)
// Row 2: Li(3), Be(4) ........................ B(5), C(6), N(7)
// Row 3: ........O(8), F(9), Ne(10), Na(11), Mg(12) ... Al(13), Si(14), P(15)
// Row 4: S(16), Cl(17), Ar(18)
// This is a very custom compact grid. I will recreate it exactly as shown for the exact match.

const HOLO1_ELEMENTS = [
  { n: 1,  sym: 'H',  group: 1,  row: 1, color: '#00f3ff' }, // cyan
  { n: 2,  sym: 'He', group: 8,  row: 1, color: '#fe00fe' }, // purple
  
  { n: 3,  sym: 'Li', group: 9,  row: 1, color: '#00f3ff' }, // cyan
  { n: 4,  sym: 'Be', group: 10, row: 1, color: '#00f3ff' }, // cyan

  { n: 8,  sym: 'O',  group: 1,  row: 2, color: '#36fd0f' }, // green
  { n: 9,  sym: 'F',  group: 2,  row: 2, color: '#36fd0f' }, // green
  { n: 10, sym: 'Ne', group: 8,  row: 2, color: '#fe00fe' }, // purple
  { n: 11, sym: 'Na', group: 9,  row: 2, color: '#00f3ff' }, // cyan
  { n: 12, sym: 'Mg', group: 10, row: 2, color: '#00f3ff' }, // cyan

  { n: 16, sym: 'S',  group: 1,  row: 3, color: '#36fd0f' }, // green
  { n: 17, sym: 'Cl', group: 2,  row: 3, color: '#36fd0f' }, // green
  { n: 18, sym: 'Ar', group: 8,  row: 3, color: '#fe00fe' }, // purple

  // Right side block
  { n: 5,  sym: 'B',  group: 20, row: 1, color: '#36fd0f' }, // green
  { n: 6,  sym: 'C',  group: 21, row: 1, color: '#36fd0f' }, // green
  { n: 7,  sym: 'N',  group: 22, row: 1, color: '#36fd0f' }, // green

  { n: 13, sym: 'Al', group: 20, row: 2, color: '#36fd0f' }, // green
  { n: 14, sym: 'Si', group: 21, row: 2, color: '#36fd0f' }, // green
  { n: 15, sym: 'P',  group: 22, row: 2, color: '#36fd0f' }, // green
];

interface PeriodicTableProps { 
  onClose: () => void; 
  onSelect?: (sym: string) => void; 
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ onClose, onSelect }) => {
  const { addItem, allHands, addActiveElement } = useHoloStore();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('01. ALKALI_METALS');

  // Pinch to select hovered element
  useEffect(() => {
    if (!allHands?.length) return;
    const primary = allHands[0];
    if (primary.isPinching && hovered) {
      handleSelect(hovered);
    }
  }, [allHands, hovered]);

  const handleSelect = (sym: string) => {
    addItem(sym);
    addActiveElement(sym, [0, 0, 0]);
    if (onSelect) onSelect(sym);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#121318] text-white flex flex-col font-body-rt"
    >
      {/* ── TOP NAV (Specific to Holo 1) ── */}
      <header className="w-full flex justify-between items-center px-8 py-4 border-b border-[#1A2C34]">
        <div className="flex items-center gap-10">
          <span className="text-2xl font-black text-[#00f3ff] font-display-lg uppercase tracking-widest">HOLOLAB</span>
          <nav className="flex gap-8">
            <span className="font-mono-data text-[10px] text-[#00f3ff]/40 uppercase tracking-widest">LABS</span>
            <span className="font-mono-data text-[10px] text-[#00f3ff] border-b-2 border-[#00f3ff] pb-1 uppercase tracking-widest">ELEMENTS</span>
            <span className="font-mono-data text-[10px] text-[#00f3ff]/40 uppercase tracking-widest">ANALYTICS</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="font-mono-data text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest mr-4">EXIT</button>
          <span className="material-symbols-outlined text-[#00f3ff]">pan_tool</span>
          <span className="material-symbols-outlined text-[#00f3ff]">sensors</span>
          <span className="material-symbols-outlined text-[#00f3ff]">account_circle</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ── */}
        <aside className="w-80 h-full border-r border-[#1A2C34] flex flex-col pt-8">
          
          {/* Top Box */}
          <div className="mx-6 p-6 border border-[#00f3ff]/30 rounded-md bg-[#0A161C]/50 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#36fd0f] shadow-[0_0_8px_#36fd0f]"></div>
              <span className="font-mono-data text-[11px] text-[#00f3ff] uppercase tracking-widest">SYSTEM_READY</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-display-lg text-lg text-white tracking-widest">SYNTHESIS_HUB</span>
              <p className="font-mono-data text-[10px] text-[#849495] uppercase leading-relaxed tracking-widest">
                ENVIRONMENTAL MAPPING<br/>ACTIVE: 98.4% CONFIDENCE
              </p>
            </div>

            <div className="flex justify-between items-center border-t border-[#1A2C34] pt-4">
              <span className="font-mono-data text-[9px] text-[#00f3ff]/40 uppercase tracking-widest">SCAN_DEPTH</span>
              <span className="font-mono-data text-[11px] text-[#00f3ff]">14.2nm</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#1A2C34] pt-4">
              <span className="font-mono-data text-[9px] text-[#00f3ff]/40 uppercase tracking-widest">STABILITY</span>
              <span className="font-mono-data text-[11px] text-[#36fd0f] tracking-widest">OPTIMAL</span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 px-6">
            <span className="font-mono-data text-[8px] text-[#00f3ff]/40 uppercase tracking-widest mb-4 block">CLASSIFICATION_FILTERS</span>
            <div className="flex flex-col gap-2">
              {[
                '01. ALKALI_METALS',
                '02. NOBLE_GASES',
                '03. LANTHANIDES',
                '04. HALOGENS'
              ].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setSelectedCat(filter)}
                  className={`w-full text-left p-3 border transition-all ${
                    selectedCat === filter 
                      ? 'border-[#00f3ff]/50 bg-[#00f3ff]/10 text-[#00f3ff]' 
                      : 'border-transparent text-white/60 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span className="font-mono-data text-[10px] uppercase tracking-widest">{filter}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN GRID (Perfect Recreation of Holo 1.jpeg layout) ── */}
        <main className="flex-1 relative flex items-center justify-center p-12 bg-[#0E151A]">
          {/* AI Scanner Top Right */}
          <div className="absolute top-10 right-10 flex flex-col items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#fe00fe] shadow-[0_0_15px_#fe00fe] animate-pulse"></div>
            <span className="font-mono-data text-[7px] text-[#fe00fe] tracking-widest">AI_ACTIVE_SCAN</span>
          </div>

          <div className="relative w-full max-w-4xl h-96 border-t border-[#1A2C34] pt-12">
            <div className="grid grid-cols-24 gap-1 relative">
              {HOLO1_ELEMENTS.map((el) => (
                <motion.button
                  key={el.sym}
                  onClick={() => handleSelect(el.sym)}
                  onMouseEnter={() => setHovered(el.sym)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-14 h-16 flex flex-col items-center justify-center relative bg-[#0D181D]/80 border hover:bg-[#00f3ff]/10 transition-all group"
                  style={{ 
                    gridColumnStart: el.group, 
                    gridRowStart: el.row,
                    borderColor: el.color + '50', // 50% opacity border
                    boxShadow: hovered === el.sym ? `inset 0 0 10px ${el.color}40` : 'none'
                  }}
                >
                  <span className="absolute top-1 left-1.5 font-mono-data text-[8px] text-white/40">{el.n}</span>
                  <span className="font-display-lg text-xl text-white group-hover:scale-110 transition-transform">{el.sym}</span>
                </motion.button>
              ))}
            </div>
            
            {/* Background Text Overlay */}
            <div className="absolute left-[30%] bottom-10 font-mono-data text-[7px] text-white/10 tracking-[0.3em] uppercase">
              SYSTEM_RENDERING_LOWER_ORBITALS<br/>
              TRANSITION_METALS_EXPANDED
            </div>
          </div>
        </main>
      </div>

      {/* ── BOTTOM DOCK (Match Holo 1) ── */}
      <nav className="w-full h-20 border-t border-[#1A2C34] flex justify-around items-center px-24 bg-[#0D1519]">
        <div className="flex flex-col items-center gap-2 opacity-30">
          <span className="material-symbols-outlined text-[#00f3ff]">science</span>
          <span className="font-mono-data text-[8px] text-[#00f3ff] uppercase tracking-widest">WORKSPACE</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 border border-[#00f3ff]/40 bg-[#00f3ff]/10 rounded shadow-[0_0_15px_rgba(0,243,255,0.1)]">
          <span className="material-symbols-outlined text-[#00f3ff]">cyclone</span>
          <span className="font-mono-data text-[8px] text-[#00f3ff] uppercase tracking-widest">SYNTHESIS</span>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-30">
          <span className="material-symbols-outlined text-[#00f3ff]">bolt</span>
          <span className="font-mono-data text-[8px] text-[#00f3ff] uppercase tracking-widest">PHYSICS</span>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-30">
          <span className="material-symbols-outlined text-[#00f3ff]">grid_view</span>
          <span className="font-mono-data text-[8px] text-[#00f3ff] uppercase tracking-widest">ELEMENTS</span>
        </div>
      </nav>
    </motion.div>
  );
};
