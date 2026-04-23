import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHoloStore } from '../../store/useHoloStore';
import { SYMBOL_TO_Z } from './QuantumAtom';

const ELEMENTS_DATA: Record<string, { n: number; mass: number; stability: number; temp: string; energy: string }> = {
  H:  { n: 1,  mass: 1.008,  stability: 99.9, temp: '1.25M', energy: '13.60' },
  He: { n: 2,  mass: 4.003,  stability: 99.9, temp: '2.10M', energy: '24.58' },
  Li: { n: 3,  mass: 6.94,   stability: 99.0, temp: '0.80M', energy: '5.39' },
  Ne: { n: 10, mass: 20.18,  stability: 99.9, temp: '1.25M', energy: '14.62' },
  // fallback
};

interface AtomDetailViewProps {
  symbol: string;
  onClose: () => void;
}

export const AtomDetailView: React.FC<AtomDetailViewProps> = ({ symbol, onClose }) => {
  const { isRealistic, setIsRealistic } = useHoloStore();
  const [scale, setScale] = useState(50); // 0 to 100

  const data = ELEMENTS_DATA[symbol] || { n: SYMBOL_TO_Z[symbol] || 0, mass: 0, stability: 95.0, temp: '1.0M', energy: '10.00' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0B1015] pointer-events-auto font-body-rt overflow-hidden"
    >
      {/* ── TOP NAV (Matches Holo 2.jpeg) ── */}
      <header className="absolute top-0 w-full flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.6)] font-display-lg uppercase tracking-widest">HOLOLAB</span>
          <div className="h-4 w-[1px] bg-[#00f3ff]/20"></div>
          <span className="font-mono-data text-xs text-[#00f3ff] uppercase tracking-widest">QUANTUM ATOM ENGINE</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="font-mono-data text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest mr-4">CLOSE</button>
          <span className="material-symbols-outlined text-[#00f3ff]">pan_tool</span>
          <span className="material-symbols-outlined text-[#00f3ff]">sensors</span>
          <span className="material-symbols-outlined text-[#00f3ff]">account_circle</span>
          <div className="w-3 h-3 rounded-full bg-[#fe00fe] shadow-[0_0_15px_#fe00fe] animate-pulse"></div>
        </div>
      </header>

      {/* ── CENTER HUD TELEMETRY ── */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="absolute top-32 left-1/3 -translate-x-12 flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-[1px] bg-[#00f3ff]"></div>
            <span className="font-mono-data text-[10px] text-[#00f3ff] font-bold tracking-widest">PROBABILITY_FIELD_01</span>
          </div>
          <span className="font-mono-data text-[10px] text-[#00f3ff]/70 ml-6 tracking-widest">Ψ(r, θ, φ) = R(r)Y(θ, φ)</span>
        </div>

        <div className="absolute bottom-32 flex flex-col items-center gap-2">
          <div className="w-12 h-10 border-2 border-[#36fd0f]/50 rounded-lg flex items-center justify-center">
            <div className="w-1 h-1 bg-[#36fd0f] rounded-full"></div>
          </div>
          <span className="font-mono-data text-[8px] text-[#36fd0f] tracking-widest">PINCH_TO_INTERACT</span>
        </div>

        <div className="absolute bottom-40 right-1/3 translate-x-12 flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[10px] text-[#ffabf3] font-bold tracking-widest">ENERGY_VALENCE</span>
            <div className="w-4 h-[1px] bg-[#ffabf3]"></div>
          </div>
          <span className="font-mono-data text-[10px] text-[#ffabf3]/70 mr-6 tracking-widest">ΔE = {data.energy} eV</span>
        </div>
      </div>

      {/* ── LEFT PANEL ── */}
      <aside className="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="w-64 bg-transparent border border-[#00f3ff]/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-sm bg-[#36fd0f]"></div>
            <span className="font-mono-data text-[10px] text-[#00f3ff] font-bold tracking-widest">ELEMENT_PROFILE</span>
          </div>
          
          <div className="mb-6">
            <span className="font-mono-data text-[8px] text-[#00f3ff]/50 tracking-widest">SYMBOL</span>
            <h1 className="font-display-lg text-4xl text-[#00f3ff]">{symbol}</h1>
          </div>

          <div className="flex justify-between mb-8 pr-4">
            <div>
              <span className="font-mono-data text-[8px] text-[#00f3ff]/50 tracking-widest">AT. NO</span>
              <p className="font-display-lg text-lg text-[#00f3ff]">{data.n}</p>
            </div>
            <div>
              <span className="font-mono-data text-[8px] text-[#00f3ff]/50 tracking-widest">MASS</span>
              <p className="font-display-lg text-lg text-[#00f3ff]">{data.mass}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-data text-[8px] text-[#00f3ff]/50 tracking-widest">STABILITY</span>
              <span className="font-mono-data text-[10px] text-[#36fd0f]">{data.stability}%</span>
            </div>
            <div className="h-[3px] w-full bg-[#00f3ff]/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]" style={{ width: `${data.stability}%` }}></div>
            </div>
          </div>
        </div>

        {/* Forge Temp */}
        <div className="w-64 bg-transparent border border-[#00f3ff]/10 rounded-lg p-5">
          <span className="font-mono-data text-[8px] text-[#00f3ff]/50 tracking-widest">ACTIVE_FORGE_TEMP</span>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-display-lg text-2xl text-[#ffabf3]">{data.temp}</span>
            <span className="font-mono-data text-[10px] text-[#00f3ff]/50 mb-1">K</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <aside className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-6">
        
        {/* Scale Slider */}
        <div className="w-12 h-96 border border-[#00f3ff]/20 rounded-full bg-transparent flex flex-col items-center justify-between py-4">
          <button onClick={() => setScale(Math.min(100, scale + 10))} className="text-[#00f3ff]/50 hover:text-[#00f3ff]">
            <span className="material-symbols-outlined text-sm">zoom_in</span>
          </button>
          
          <div className="w-1.5 flex-1 bg-[#00f3ff]/10 my-4 rounded-full relative flex items-center justify-center">
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={scale} 
               onChange={(e) => setScale(parseInt(e.target.value))}
               className="absolute w-full h-full opacity-0 cursor-pointer z-10 [writing-mode:bt-lr] appearance-none"
               style={{ WebkitAppearance: 'slider-vertical' } as any}
             />
             {/* Slider Track fill */}
             <div className="absolute bottom-0 w-full bg-[#00f3ff]/30 rounded-full" style={{ height: `${scale}%`}}></div>
             {/* Slider Thumb */}
             <div className="absolute w-6 h-6 bg-[#00f3ff] rounded-full flex items-center justify-center shadow-[0_0_15px_#00f3ff]" style={{ bottom: `${scale}%`, transform: 'translateY(50%)' }}>
               <div className="w-3 h-[2px] bg-[#0A161C]"></div>
             </div>
          </div>

          <button onClick={() => setScale(Math.max(0, scale - 10))} className="text-[#00f3ff]/50 hover:text-[#00f3ff]">
            <span className="material-symbols-outlined text-sm">zoom_out</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button onClick={() => setIsRealistic(!isRealistic)} className={`w-12 h-12 rounded border transition-all flex items-center justify-center ${isRealistic ? 'bg-[#00f3ff]/10 border-[#00f3ff]' : 'border-[#00f3ff]/20 hover:border-[#00f3ff]/50'}`}>
            <span className="material-symbols-outlined text-[#00f3ff] text-lg">view_in_ar</span>
          </button>
          <button className="w-12 h-12 rounded border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[#00f3ff] text-lg">bar_chart</span>
          </button>
          <button className="w-12 h-12 rounded border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[#00f3ff] text-lg">save</span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav matches others but is dimmed */}
      <nav className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#050B10] to-transparent flex justify-center items-end pb-6 pointer-events-none opacity-50">
        <div className="flex gap-16">
          {[
            { id: 'workspace', icon: 'science', label: 'WORKSPACE' },
            { id: 'synthesis', icon: 'cyclone', label: 'SYNTHESIS' },
            { id: 'physics', icon: 'bolt', label: 'PHYSICS' },
            { id: 'elements', icon: 'grid_view', label: 'ELEMENTS' }
          ].map(tab => (
            <div key={tab.id} className="flex flex-col items-center gap-2">
              <div className="w-14 h-12 flex items-center justify-center rounded-lg border border-transparent">
                <span className="material-symbols-outlined text-[#00f3ff]/50">{tab.icon}</span>
              </div>
              <span className="font-mono-data text-[8px] text-[#00f3ff]/50 uppercase tracking-widest">{tab.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute right-8 bottom-6">
           <span className="font-mono-data text-[7px] text-[#00f3ff]/20 uppercase tracking-[0.2em]">ENGINE SYSTEM V4.0.2 // MADE BY DEVILL KK</span>
        </div>
      </nav>
    </motion.div>
  );
};
