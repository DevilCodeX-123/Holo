import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHoloStore } from '../../store/useHoloStore';

const CATEGORIES = [
  { id: 'ALL', label: '00. ALL_ELEMENTS', color: '#ffffff' },
  { id: 'ALKALI_METALS', label: '01. ALKALI_METALS', color: '#ff3366' },
  { id: 'ALKALINE_EARTH', label: '02. ALKALINE_EARTH', color: '#ff9933' },
  { id: 'TRANSITION_METALS', label: '03. TRANSITION_METALS', color: '#ffcc00' },
  { id: 'POST_TRANSITION', label: '04. POST_TRANSITION', color: '#33cc33' },
  { id: 'METALLOIDS', label: '05. METALLOIDS', color: '#3399ff' },
  { id: 'NON_METALS', label: '06. NON_METALS', color: '#00f3ff' },
  { id: 'HALOGENS', label: '07. HALOGENS', color: '#9933ff' },
  { id: 'NOBLE_GASES', label: '08. NOBLE_GASES', color: '#fe00fe' },
];

const ELEMENTS_DATA = [
  { n: 1,  sym: 'H',  group: 1,  row: 1, cat: 'NON_METALS' },
  { n: 2,  sym: 'He', group: 18, row: 1, cat: 'NOBLE_GASES' },
  { n: 3,  sym: 'Li', group: 1,  row: 2, cat: 'ALKALI_METALS' },
  { n: 4,  sym: 'Be', group: 2,  row: 2, cat: 'ALKALINE_EARTH' },
  { n: 5,  sym: 'B',  group: 13, row: 2, cat: 'METALLOIDS' },
  { n: 6,  sym: 'C',  group: 14, row: 2, cat: 'NON_METALS' },
  { n: 7,  sym: 'N',  group: 15, row: 2, cat: 'NON_METALS' },
  { n: 8,  sym: 'O',  group: 16, row: 2, cat: 'NON_METALS' },
  { n: 9,  sym: 'F',  group: 17, row: 2, cat: 'HALOGENS' },
  { n: 10, sym: 'Ne', group: 18, row: 2, cat: 'NOBLE_GASES' },
  { n: 11, sym: 'Na', group: 1,  row: 3, cat: 'ALKALI_METALS' },
  { n: 12, sym: 'Mg', group: 2,  row: 3, cat: 'ALKALINE_EARTH' },
  { n: 13, sym: 'Al', group: 13, row: 3, cat: 'POST_TRANSITION' },
  { n: 14, sym: 'Si', group: 14, row: 3, cat: 'METALLOIDS' },
  { n: 15, sym: 'P',  group: 15, row: 3, cat: 'NON_METALS' },
  { n: 16, sym: 'S',  group: 16, row: 3, cat: 'NON_METALS' },
  { n: 17, sym: 'Cl', group: 17, row: 3, cat: 'HALOGENS' },
  { n: 18, sym: 'Ar', group: 18, row: 3, cat: 'NOBLE_GASES' },
  { n: 19, sym: 'K',  group: 1,  row: 4, cat: 'ALKALI_METALS' },
  { n: 20, sym: 'Ca', group: 2,  row: 4, cat: 'ALKALINE_EARTH' },
  { n: 21, sym: 'Sc', group: 3,  row: 4, cat: 'TRANSITION_METALS' },
  { n: 22, sym: 'Ti', group: 4,  row: 4, cat: 'TRANSITION_METALS' },
  { n: 26, sym: 'Fe', group: 8,  row: 4, cat: 'TRANSITION_METALS' },
  { n: 29, sym: 'Cu', group: 11, row: 4, cat: 'TRANSITION_METALS' },
  { n: 30, sym: 'Zn', group: 12, row: 4, cat: 'TRANSITION_METALS' },
  { n: 31, sym: 'Ga', group: 13, row: 4, cat: 'POST_TRANSITION' },
  { n: 35, sym: 'Br', group: 17, row: 4, cat: 'HALOGENS' },
  { n: 36, sym: 'Kr', group: 18, row: 4, cat: 'NOBLE_GASES' },
];

interface PeriodicTableProps { 
  onClose: () => void; 
  onSelect?: (sym: string) => void; 
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ onClose, onSelect }) => {
  const { addItem, allHands, addActiveElement } = useHoloStore();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

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

  const getCategoryColor = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.color || '#ffffff';
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
          <div className="mt-8 px-6 overflow-y-auto pb-6">
            <span className="font-mono-data text-[8px] text-[#00f3ff]/40 uppercase tracking-widest mb-4 block">CLASSIFICATION_FILTERS</span>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`w-full text-left p-3 border transition-all ${
                    selectedCat === cat.id 
                      ? 'bg-opacity-20 text-white' 
                      : 'border-transparent text-white/60 hover:text-white hover:border-white/10'
                  }`}
                  style={{
                    borderColor: selectedCat === cat.id ? cat.color : 'transparent',
                    backgroundColor: selectedCat === cat.id ? `${cat.color}20` : 'transparent',
                  }}
                >
                  <span className="font-mono-data text-[10px] uppercase tracking-widest" style={{ color: selectedCat === cat.id ? cat.color : 'inherit' }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN GRID ── */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[#0E151A]">
          {/* AI Scanner Top Right */}
          <div className="absolute top-10 right-10 flex flex-col items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#fe00fe] shadow-[0_0_15px_#fe00fe] animate-pulse"></div>
            <span className="font-mono-data text-[7px] text-[#fe00fe] tracking-widest">AI_ACTIVE_SCAN</span>
          </div>

          <div className="relative w-full max-w-5xl">
            {/* Standard 18-column grid */}
            <div className="grid grid-cols-18 gap-2 relative">
              {ELEMENTS_DATA.map((el) => {
                const isSelected = selectedCat === 'ALL' || selectedCat === el.cat;
                const elColor = getCategoryColor(el.cat);
                
                return (
                  <motion.button
                    key={el.sym}
                    onClick={() => isSelected && handleSelect(el.sym)}
                    onMouseEnter={() => setHovered(el.sym)}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-12 h-14 flex flex-col items-center justify-center relative bg-[#0D181D]/80 border transition-all group ${!isSelected ? 'opacity-20 grayscale pointer-events-none' : 'hover:scale-110 z-10'}`}
                    style={{ 
                      gridColumnStart: el.group, 
                      gridRowStart: el.row,
                      borderColor: isSelected ? `${elColor}50` : '#333',
                      boxShadow: hovered === el.sym && isSelected ? `0 0 15px ${elColor}60, inset 0 0 10px ${elColor}40` : 'none',
                      backgroundColor: hovered === el.sym && isSelected ? `${elColor}20` : '#0D181D80'
                    }}
                  >
                    <span className="absolute top-1 left-1.5 font-mono-data text-[7px] text-white/50">{el.n}</span>
                    <span className="font-display-lg text-lg text-white" style={{ color: isSelected ? '#fff' : '#888' }}>{el.sym}</span>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Background Text Overlay */}
            <div className="absolute left-[20%] -bottom-16 font-mono-data text-[7px] text-white/10 tracking-[0.3em] uppercase">
              SYSTEM_RENDERING_LOWER_ORBITALS<br/>
              DYNAMIC_FILTERING_ACTIVE
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
