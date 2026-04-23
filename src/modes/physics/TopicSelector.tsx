import React from 'react';
import { motion } from 'framer-motion';

interface TopicSelectorProps {
  onSelectTopic: (topicId: string) => void;
}

const LABS = [
  {
    id: 'force',
    labNo: 'LAB_01',
    icon: 'rocket_launch',
    title: 'Force & Motion',
    desc: 'Vector analysis of Newtonian mechanics, kinetic energy transfer, and friction coefficients in vacuum environments.'
  },
  {
    id: 'gravity',
    labNo: 'LAB_02',
    icon: 'public',
    title: 'Gravity Lab',
    desc: 'Multi-body orbital simulations and general relativity modeling for stellar mass distribution.'
  },
  {
    id: 'waves',
    labNo: 'LAB_03',
    icon: 'water',
    title: 'Wave Simulation',
    desc: 'Acoustic, seismic, and quantum wave interference patterns with high-resolution frequency modulation.'
  },
  {
    id: 'magnetism',
    labNo: 'LAB_04',
    icon: 'developer_board',
    title: 'Magnetism',
    desc: 'Electromagnetic field mapping and particle pathing through non-linear flux density gradients.'
  },
  {
    id: 'energy',
    labNo: 'LAB_05',
    icon: 'bolt',
    title: 'Energy Lab',
    desc: 'Thermodynamic cycle analysis and conversion efficiency metrics for sustainable fusion models.'
  },
  {
    id: 'optics',
    labNo: 'LAB_06',
    icon: 'light_mode',
    title: 'Optics & Light',
    desc: 'Photon emission tracking, refraction index calculation, and chromatic aberration simulation.'
  }
];

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 pointer-events-auto bg-[#0A1014] text-white flex flex-col font-body-rt overflow-hidden"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── TOP NAV (Matches Holo 5.jpeg) ── */}
      <header className="w-full flex justify-between items-center px-10 py-6 border-b border-[#00f3ff]/10 bg-[#0A1014]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.6)] font-display-lg uppercase tracking-widest">HOLOLAB</span>
          <div className="h-5 w-[1px] bg-[#00f3ff]/20"></div>
          <span className="font-mono-data text-xs text-[#00f3ff]/50 uppercase tracking-widest">PHYSICS HUB</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-[#00f3ff]/50">pan_tool</span>
          <span className="material-symbols-outlined text-[#00f3ff]/50">sensors</span>
          <span className="material-symbols-outlined text-[#00f3ff]/50">account_circle</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#fe00fe]/10 border border-[#fe00fe]/30 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fe00fe] shadow-[0_0_10px_#fe00fe] animate-pulse"></div>
            <span className="font-mono-data text-[9px] text-[#fe00fe] uppercase tracking-widest">AI_STATE_PULSE</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex px-16 py-12 gap-12 overflow-y-auto">
        {/* Left Area (Header + Grid) */}
        <div className="flex-1 flex flex-col">
          <div className="mb-10">
            <h1 className="font-display-lg text-5xl text-[#00f3ff] drop-shadow-[0_0_15px_rgba(0,243,255,0.4)] tracking-wide mb-4">PHYSICS & SIMULATION</h1>
            <p className="font-mono-data text-[12px] text-white/60 max-w-2xl leading-relaxed">
              Access high-fidelity computational environments for deep-space and quantum field simulations. Made by DEVILL KK.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {LABS.map((lab) => (
              <div key={lab.id} className="bg-[#0D151A]/80 border border-[#00f3ff]/20 rounded-xl p-6 flex flex-col hover:border-[#00f3ff]/50 hover:bg-[#00f3ff]/5 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <span className="material-symbols-outlined text-4xl text-[#00f3ff] group-hover:drop-shadow-[0_0_10px_#00f3ff]">{lab.icon}</span>
                  <span className="px-2 py-1 bg-[#00f3ff]/10 rounded text-[9px] font-mono-data text-[#00f3ff]/50">{lab.labNo}</span>
                </div>
                
                <h3 className="font-display-lg text-xl text-white mb-3">{lab.title}</h3>
                <p className="font-mono-data text-[11px] text-white/50 leading-relaxed flex-1 mb-6">
                  {lab.desc}
                </p>

                <button 
                  onClick={() => onSelectTopic(lab.id)}
                  className="w-full py-3 border border-[#00f3ff]/20 rounded text-[#00f3ff]/80 font-mono-data text-[10px] tracking-widest uppercase hover:bg-[#00f3ff]/10 hover:border-[#00f3ff]/50 transition-all"
                >
                  INITIALIZE_LAB
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area (AI Panel) */}
        <aside className="w-80 flex flex-col gap-6">
          <div className="bg-[#0D151A]/80 border border-[#00f3ff]/20 rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#fe00fe]/20 border border-[#fe00fe]/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#fe00fe]">robot_2</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display-lg text-[#e3e1e9]">HoloAI Assistant</span>
                <span className="font-mono-data text-[9px] text-[#00f3ff]/50 tracking-widest">SYSTEM_ACTIVE</span>
              </div>
            </div>

            <div className="bg-[#00f3ff]/5 border-l-2 border-[#00f3ff] p-4 mb-6">
              <p className="font-mono-data text-[11px] text-[#00f3ff]/80 leading-relaxed">
                "Observation: Gravity Lab (LAB_02) simulation requires 4.2TB additional cache for multi-body resolution."
              </p>
            </div>

            <p className="font-mono-data text-[11px] text-[#e3e1e9]/50 leading-relaxed mb-8">
              Ready to execute Wave Simulation interference protocol on your gesture command.
            </p>

            <div className="flex flex-col gap-2 mt-auto">
              <div className="flex justify-between items-end">
                <span className="font-mono-data text-[9px] text-[#00f3ff]/50 tracking-widest">PROCESSING LOAD</span>
                <span className="font-mono-data text-[14px] text-[#00f3ff]">42.8%</span>
              </div>
              <div className="h-1.5 w-full bg-[#00f3ff]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]" style={{ width: '42.8%' }}></div>
              </div>
            </div>
          </div>

          {/* Starburst Graphic Box */}
          <div className="h-40 border border-[#00f3ff]/20 rounded-xl overflow-hidden relative bg-[#050B10]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
            {/* Creates a subtle starburst effect */}
            {Array.from({ length: 12 }).map((_, i) => (
               <div key={i} className="absolute top-1/2 left-1/2 w-full h-[1px] bg-white/5 -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(-50%, -50%) rotate(${i * 15}deg)` }}></div>
            ))}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_30px_#fff] -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </aside>
      </main>
      
      {/* ── BOTTOM DOCK (Match Holo 5) ── */}
      <nav className="w-full h-24 bg-gradient-to-t from-black via-[#0A0D14]/90 to-transparent flex justify-center items-end pb-6">
        <div className="flex gap-16">
          {[
            { id: 'workspace', icon: 'science', label: 'WORKSPACE' },
            { id: 'synthesis', icon: 'cyclone', label: 'SYNTHESIS' },
            { id: 'physics', icon: 'bolt', label: 'PHYSICS', active: true },
            { id: 'elements', icon: 'grid_view', label: 'ELEMENTS' }
          ].map(tab => (
            <div key={tab.id} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-12 flex items-center justify-center rounded-lg transition-all ${tab.active ? 'border border-[#00f3ff]/50 bg-[#00f3ff]/10 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-transparent'}`}>
                <span className={`material-symbols-outlined ${tab.active ? 'text-[#00f3ff]' : 'text-[#00f3ff]/30'}`}>{tab.icon}</span>
              </div>
              <span className={`font-mono-data text-[8px] uppercase tracking-widest ${tab.active ? 'text-[#00f3ff]' : 'text-[#00f3ff]/30'}`}>{tab.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </motion.div>
  );
};
