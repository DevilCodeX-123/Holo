import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useHoloStore } from '../../store/useHoloStore';

// Full 118-element periodic table with correct grid positions (group, period)
const ELEMENTS = [
  // Period 1
  { n: 1,  sym: 'H',  name: 'Hydrogen',     mass: 1.008,   group: 1,  period: 1, cat: 'nonmetal' },
  { n: 2,  sym: 'He', name: 'Helium',       mass: 4.003,   group: 18, period: 1, cat: 'noble' },
  // Period 2
  { n: 3,  sym: 'Li', name: 'Lithium',      mass: 6.94,    group: 1,  period: 2, cat: 'alkali' },
  { n: 4,  sym: 'Be', name: 'Beryllium',    mass: 9.012,   group: 2,  period: 2, cat: 'alkaline' },
  { n: 5,  sym: 'B',  name: 'Boron',        mass: 10.81,   group: 13, period: 2, cat: 'metalloid' },
  { n: 6,  sym: 'C',  name: 'Carbon',       mass: 12.011,  group: 14, period: 2, cat: 'nonmetal' },
  { n: 7,  sym: 'N',  name: 'Nitrogen',     mass: 14.007,  group: 15, period: 2, cat: 'nonmetal' },
  { n: 8,  sym: 'O',  name: 'Oxygen',       mass: 15.999,  group: 16, period: 2, cat: 'nonmetal' },
  { n: 9,  sym: 'F',  name: 'Fluorine',     mass: 18.998,  group: 17, period: 2, cat: 'halogen' },
  { n: 10, sym: 'Ne', name: 'Neon',         mass: 20.180,  group: 18, period: 2, cat: 'noble' },
  // Period 3
  { n: 11, sym: 'Na', name: 'Sodium',       mass: 22.990,  group: 1,  period: 3, cat: 'alkali' },
  { n: 12, sym: 'Mg', name: 'Magnesium',    mass: 24.305,  group: 2,  period: 3, cat: 'alkaline' },
  { n: 13, sym: 'Al', name: 'Aluminium',    mass: 26.982,  group: 13, period: 3, cat: 'post-trans' },
  { n: 14, sym: 'Si', name: 'Silicon',      mass: 28.085,  group: 14, period: 3, cat: 'metalloid' },
  { n: 15, sym: 'P',  name: 'Phosphorus',   mass: 30.974,  group: 15, period: 3, cat: 'nonmetal' },
  { n: 16, sym: 'S',  name: 'Sulfur',       mass: 32.06,   group: 16, period: 3, cat: 'nonmetal' },
  { n: 17, sym: 'Cl', name: 'Chlorine',     mass: 35.45,   group: 17, period: 3, cat: 'halogen' },
  { n: 18, sym: 'Ar', name: 'Argon',        mass: 39.948,  group: 18, period: 3, cat: 'noble' },
  // Period 4
  { n: 19, sym: 'K',  name: 'Potassium',    mass: 39.098,  group: 1,  period: 4, cat: 'alkali' },
  { n: 20, sym: 'Ca', name: 'Calcium',      mass: 40.078,  group: 2,  period: 4, cat: 'alkaline' },
  { n: 21, sym: 'Sc', name: 'Scandium',     mass: 44.956,  group: 3,  period: 4, cat: 'transition' },
  { n: 22, sym: 'Ti', name: 'Titanium',     mass: 47.867,  group: 4,  period: 4, cat: 'transition' },
  { n: 23, sym: 'V',  name: 'Vanadium',     mass: 50.942,  group: 5,  period: 4, cat: 'transition' },
  { n: 24, sym: 'Cr', name: 'Chromium',     mass: 51.996,  group: 6,  period: 4, cat: 'transition' },
  { n: 25, sym: 'Mn', name: 'Manganese',    mass: 54.938,  group: 7,  period: 4, cat: 'transition' },
  { n: 26, sym: 'Fe', name: 'Iron',         mass: 55.845,  group: 8,  period: 4, cat: 'transition' },
  { n: 27, sym: 'Co', name: 'Cobalt',       mass: 58.933,  group: 9,  period: 4, cat: 'transition' },
  { n: 28, sym: 'Ni', name: 'Nickel',       mass: 58.693,  group: 10, period: 4, cat: 'transition' },
  { n: 29, sym: 'Cu', name: 'Copper',       mass: 63.546,  group: 11, period: 4, cat: 'transition' },
  { n: 30, sym: 'Zn', name: 'Zinc',         mass: 65.38,   group: 12, period: 4, cat: 'transition' },
  { n: 31, sym: 'Ga', name: 'Gallium',      mass: 69.723,  group: 13, period: 4, cat: 'post-trans' },
  { n: 32, sym: 'Ge', name: 'Germanium',    mass: 72.630,  group: 14, period: 4, cat: 'metalloid' },
  { n: 33, sym: 'As', name: 'Arsenic',      mass: 74.922,  group: 15, period: 4, cat: 'metalloid' },
  { n: 34, sym: 'Se', name: 'Selenium',     mass: 78.971,  group: 16, period: 4, cat: 'nonmetal' },
  { n: 35, sym: 'Br', name: 'Bromine',      mass: 79.904,  group: 17, period: 4, cat: 'halogen' },
  { n: 36, sym: 'Kr', name: 'Krypton',      mass: 83.798,  group: 18, period: 4, cat: 'noble' },
  // Period 5
  { n: 37, sym: 'Rb', name: 'Rubidium',     mass: 85.468,  group: 1,  period: 5, cat: 'alkali' },
  { n: 38, sym: 'Sr', name: 'Strontium',    mass: 87.62,   group: 2,  period: 5, cat: 'alkaline' },
  { n: 39, sym: 'Y',  name: 'Yttrium',      mass: 88.906,  group: 3,  period: 5, cat: 'transition' },
  { n: 40, sym: 'Zr', name: 'Zirconium',    mass: 91.224,  group: 4,  period: 5, cat: 'transition' },
  { n: 41, sym: 'Nb', name: 'Niobium',      mass: 92.906,  group: 5,  period: 5, cat: 'transition' },
  { n: 42, sym: 'Mo', name: 'Molybdenum',   mass: 95.95,   group: 6,  period: 5, cat: 'transition' },
  { n: 43, sym: 'Tc', name: 'Technetium',   mass: 98,      group: 7,  period: 5, cat: 'transition' },
  { n: 44, sym: 'Ru', name: 'Ruthenium',    mass: 101.07,  group: 8,  period: 5, cat: 'transition' },
  { n: 45, sym: 'Rh', name: 'Rhodium',      mass: 102.91,  group: 9,  period: 5, cat: 'transition' },
  { n: 46, sym: 'Pd', name: 'Palladium',    mass: 106.42,  group: 10, period: 5, cat: 'transition' },
  { n: 47, sym: 'Ag', name: 'Silver',       mass: 107.87,  group: 11, period: 5, cat: 'transition' },
  { n: 48, sym: 'Cd', name: 'Cadmium',      mass: 112.41,  group: 12, period: 5, cat: 'transition' },
  { n: 49, sym: 'In', name: 'Indium',       mass: 114.82,  group: 13, period: 5, cat: 'post-trans' },
  { n: 50, sym: 'Sn', name: 'Tin',          mass: 118.71,  group: 14, period: 5, cat: 'post-trans' },
  { n: 51, sym: 'Sb', name: 'Antimony',     mass: 121.76,  group: 15, period: 5, cat: 'metalloid' },
  { n: 52, sym: 'Te', name: 'Tellurium',    mass: 127.60,  group: 16, period: 5, cat: 'metalloid' },
  { n: 53, sym: 'I',  name: 'Iodine',       mass: 126.90,  group: 17, period: 5, cat: 'halogen' },
  { n: 54, sym: 'Xe', name: 'Xenon',        mass: 131.29,  group: 18, period: 5, cat: 'noble' },
  // Period 6
  { n: 55, sym: 'Cs', name: 'Cesium',       mass: 132.91,  group: 1,  period: 6, cat: 'alkali' },
  { n: 56, sym: 'Ba', name: 'Barium',       mass: 137.33,  group: 2,  period: 6, cat: 'alkaline' },
  { n: 71, sym: 'Lu', name: 'Lutetium',     mass: 174.97,  group: 3,  period: 6, cat: 'lanthanide' },
  { n: 72, sym: 'Hf', name: 'Hafnium',      mass: 178.49,  group: 4,  period: 6, cat: 'transition' },
  { n: 73, sym: 'Ta', name: 'Tantalum',     mass: 180.95,  group: 5,  period: 6, cat: 'transition' },
  { n: 74, sym: 'W',  name: 'Tungsten',     mass: 183.84,  group: 6,  period: 6, cat: 'transition' },
  { n: 75, sym: 'Re', name: 'Rhenium',      mass: 186.21,  group: 7,  period: 6, cat: 'transition' },
  { n: 76, sym: 'Os', name: 'Osmium',       mass: 190.23,  group: 8,  period: 6, cat: 'transition' },
  { n: 77, sym: 'Ir', name: 'Iridium',      mass: 192.22,  group: 9,  period: 6, cat: 'transition' },
  { n: 78, sym: 'Pt', name: 'Platinum',     mass: 195.08,  group: 10, period: 6, cat: 'transition' },
  { n: 79, sym: 'Au', name: 'Gold',         mass: 196.97,  group: 11, period: 6, cat: 'transition' },
  { n: 80, sym: 'Hg', name: 'Mercury',      mass: 200.59,  group: 12, period: 6, cat: 'transition' },
  { n: 82, sym: 'Pb', name: 'Lead',         mass: 207.2,   group: 14, period: 6, cat: 'post-trans' },
  { n: 83, sym: 'Bi', name: 'Bismuth',      mass: 208.98,  group: 15, period: 6, cat: 'post-trans' },
  { n: 84, sym: 'Po', name: 'Polonium',     mass: 209,     group: 16, period: 6, cat: 'metalloid' },
  { n: 85, sym: 'At', name: 'Astatine',     mass: 210,     group: 17, period: 6, cat: 'halogen' },
  { n: 86, sym: 'Rn', name: 'Radon',        mass: 222,     group: 18, period: 6, cat: 'noble' },
  // Period 7
  { n: 87, sym: 'Fr', name: 'Francium',     mass: 223,     group: 1,  period: 7, cat: 'alkali' },
  { n: 88, sym: 'Ra', name: 'Radium',       mass: 226,     group: 2,  period: 7, cat: 'alkaline' },
  { n: 103,sym: 'Lr', name: 'Lawrencium',   mass: 266,     group: 3,  period: 7, cat: 'actinide' },
  { n: 104,sym: 'Rf', name: 'Rutherfordium',mass: 267,     group: 4,  period: 7, cat: 'transition' },
  { n: 105,sym: 'Db', name: 'Dubnium',      mass: 268,     group: 5,  period: 7, cat: 'transition' },
  { n: 106,sym: 'Sg', name: 'Seaborgium',   mass: 271,     group: 6,  period: 7, cat: 'transition' },
  { n: 107,sym: 'Bh', name: 'Bohrium',      mass: 274,     group: 7,  period: 7, cat: 'transition' },
  { n: 108,sym: 'Hs', name: 'Hassium',      mass: 277,     group: 8,  period: 7, cat: 'transition' },
  { n: 109,sym: 'Mt', name: 'Meitnerium',   mass: 278,     group: 9,  period: 7, cat: 'transition' },
  { n: 110,sym: 'Ds', name: 'Darmstadtium', mass: 281,     group: 10, period: 7, cat: 'transition' },
  { n: 111,sym: 'Rg', name: 'Roentgenium',  mass: 282,     group: 11, period: 7, cat: 'transition' },
  { n: 112,sym: 'Cn', name: 'Copernicium',  mass: 285,     group: 12, period: 7, cat: 'transition' },
  { n: 113,sym: 'Nh', name: 'Nihonium',     mass: 286,     group: 13, period: 7, cat: 'post-trans' },
  { n: 114,sym: 'Fl', name: 'Flerovium',    mass: 289,     group: 14, period: 7, cat: 'post-trans' },
  { n: 115,sym: 'Mc', name: 'Moscovium',    mass: 290,     group: 15, period: 7, cat: 'post-trans' },
  { n: 116,sym: 'Lv', name: 'Livermorium',  mass: 293,     group: 16, period: 7, cat: 'post-trans' },
  { n: 117,sym: 'Ts', name: 'Tennessine',   mass: 294,     group: 17, period: 7, cat: 'halogen' },
  { n: 118,sym: 'Og', name: 'Oganesson',    mass: 294,     group: 18, period: 7, cat: 'noble' },
  // Lanthanides (period 8 row = row 9 visually)
  { n: 57, sym: 'La', name: 'Lanthanum',    mass: 138.91,  group: 3,  period: 8, cat: 'lanthanide' },
  { n: 58, sym: 'Ce', name: 'Cerium',       mass: 140.12,  group: 4,  period: 8, cat: 'lanthanide' },
  { n: 59, sym: 'Pr', name: 'Praseodymium', mass: 140.91,  group: 5,  period: 8, cat: 'lanthanide' },
  { n: 60, sym: 'Nd', name: 'Neodymium',    mass: 144.24,  group: 6,  period: 8, cat: 'lanthanide' },
  { n: 61, sym: 'Pm', name: 'Promethium',   mass: 145,     group: 7,  period: 8, cat: 'lanthanide' },
  { n: 62, sym: 'Sm', name: 'Samarium',     mass: 150.36,  group: 8,  period: 8, cat: 'lanthanide' },
  { n: 63, sym: 'Eu', name: 'Europium',     mass: 151.96,  group: 9,  period: 8, cat: 'lanthanide' },
  { n: 64, sym: 'Gd', name: 'Gadolinium',   mass: 157.25,  group: 10, period: 8, cat: 'lanthanide' },
  { n: 65, sym: 'Tb', name: 'Terbium',      mass: 158.93,  group: 11, period: 8, cat: 'lanthanide' },
  { n: 66, sym: 'Dy', name: 'Dysprosium',   mass: 162.50,  group: 12, period: 8, cat: 'lanthanide' },
  { n: 67, sym: 'Ho', name: 'Holmium',      mass: 164.93,  group: 13, period: 8, cat: 'lanthanide' },
  { n: 68, sym: 'Er', name: 'Erbium',       mass: 167.26,  group: 14, period: 8, cat: 'lanthanide' },
  { n: 69, sym: 'Tm', name: 'Thulium',      mass: 168.93,  group: 15, period: 8, cat: 'lanthanide' },
  { n: 70, sym: 'Yb', name: 'Ytterbium',    mass: 173.05,  group: 16, period: 8, cat: 'lanthanide' },
  // Actinides (period 9 row)
  { n: 89, sym: 'Ac', name: 'Actinium',     mass: 227,     group: 3,  period: 9, cat: 'actinide' },
  { n: 90, sym: 'Th', name: 'Thorium',      mass: 232.04,  group: 4,  period: 9, cat: 'actinide' },
  { n: 91, sym: 'Pa', name: 'Protactinium', mass: 231.04,  group: 5,  period: 9, cat: 'actinide' },
  { n: 92, sym: 'U',  name: 'Uranium',      mass: 238.03,  group: 6,  period: 9, cat: 'actinide' },
  { n: 93, sym: 'Np', name: 'Neptunium',    mass: 237,     group: 7,  period: 9, cat: 'actinide' },
  { n: 94, sym: 'Pu', name: 'Plutonium',    mass: 244,     group: 8,  period: 9, cat: 'actinide' },
  { n: 95, sym: 'Am', name: 'Americium',    mass: 243,     group: 9,  period: 9, cat: 'actinide' },
  { n: 96, sym: 'Cm', name: 'Curium',       mass: 247,     group: 10, period: 9, cat: 'actinide' },
  { n: 97, sym: 'Bk', name: 'Berkelium',    mass: 247,     group: 11, period: 9, cat: 'actinide' },
  { n: 98, sym: 'Cf', name: 'Californium',  mass: 251,     group: 12, period: 9, cat: 'actinide' },
  { n: 99, sym: 'Es', name: 'Einsteinium',  mass: 252,     group: 13, period: 9, cat: 'actinide' },
  { n: 100,sym: 'Fm', name: 'Fermium',      mass: 257,     group: 14, period: 9, cat: 'actinide' },
  { n: 101,sym: 'Md', name: 'Mendelevium',  mass: 258,     group: 15, period: 9, cat: 'actinide' },
  { n: 102,sym: 'No', name: 'Nobelium',     mass: 259,     group: 16, period: 9, cat: 'actinide' },
];

const CAT_COLOR: Record<string, string> = {
  'nonmetal':   'rgba(16,185,129,0.25)',
  'noble':      'rgba(139,92,246,0.25)',
  'alkali':     'rgba(239,68,68,0.25)',
  'alkaline':   'rgba(249,115,22,0.25)',
  'metalloid':  'rgba(234,179,8,0.25)',
  'halogen':    'rgba(59,130,246,0.25)',
  'transition': 'rgba(6,182,212,0.25)',
  'post-trans': 'rgba(20,184,166,0.25)',
  'lanthanide': 'rgba(168,85,247,0.25)',
  'actinide':   'rgba(236,72,153,0.25)',
};

const CAT_BORDER: Record<string, string> = {
  'nonmetal':   'rgba(16,185,129,0.5)',
  'noble':      'rgba(139,92,246,0.5)',
  'alkali':     'rgba(239,68,68,0.5)',
  'alkaline':   'rgba(249,115,22,0.5)',
  'metalloid':  'rgba(234,179,8,0.5)',
  'halogen':    'rgba(59,130,246,0.5)',
  'transition': 'rgba(6,182,212,0.4)',
  'post-trans': 'rgba(20,184,166,0.5)',
  'lanthanide': 'rgba(168,85,247,0.5)',
  'actinide':   'rgba(236,72,153,0.5)',
};

interface PeriodicTableProps { onClose: () => void; onSelect?: (sym: string) => void; }

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ onClose, onSelect }) => {
  const { addItem, allHands, addActiveElement } = useHoloStore();
  const [hovered, setHovered] = useState<string | null>(null);
  const [flash, setFlash]     = useState<string | null>(null);

  // Pinch to select hovered element
  useEffect(() => {
    if (!allHands?.length) return;
    const primary = allHands[0];
    if (primary.isPinching && hovered) select(hovered);
  }, [allHands]);

  const select = (sym: string) => {
    addItem(sym);
    // Instant spawn into 3D scene with slight random offset to prevent direct stacking
    const offset = (Math.random() - 0.5) * 2;
    addActiveElement(sym, [offset, 0, 0]);
    
    setFlash(sym);
    setTimeout(() => {
      setFlash(null);
    }, 350);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      // Fullscreen, no dark overlay — camera visible through it
      className="fixed inset-0 z-40 overflow-auto"
      style={{ background: 'transparent' }}
    >
      {/* Very subtle edge vignette so table edges are readable */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)' }} />

      {/* Close button - top right */}
      <button
        onClick={onClose}
        data-virtual-interact="true"
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <X size={16} className="text-white" />
      </button>

      {/* Title */}
      <div className="fixed top-3 left-4 z-50 pointer-events-none">
        <span className="text-white font-black text-sm uppercase tracking-widest"
          style={{ textShadow: '0 0 10px rgba(0,242,255,0.8)' }}>
          Periodic <span style={{ color: '#00f2ff' }}>Table</span>
        </span>
        {hovered && (
          <span className="ml-3 text-[10px] text-cyan-300 font-mono">
            {ELEMENTS.find(e => e.sym === hovered)?.name} — Pinch to select
          </span>
        )}
      </div>

      {/* The grid — uses CSS grid with 18 columns, 9 rows */}
      <div
        className="absolute inset-0 flex items-center justify-center p-2 pt-8"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(18, 1fr)',
            gridTemplateRows: 'repeat(9, 1fr)',
            width: '100%',
            height: 'calc(100% - 16px)',
            gap: '2px',
          }}
        >
          {ELEMENTS.map((el) => {
            const isHovered = hovered === el.sym;
            const isFlash   = flash   === el.sym;
            const row = el.period <= 7 ? el.period : el.period === 8 ? 9 : 10;

            return (
              <motion.button
                key={el.sym}
                data-virtual-interact="true"
                style={{
                  gridColumn: el.group,
                  gridRow: row,
                  background: isFlash
                    ? 'rgba(255,255,255,0.9)'
                    : isHovered
                      ? 'rgba(0,242,255,0.35)'
                      : CAT_COLOR[el.cat] ?? 'rgba(100,100,100,0.2)',
                  border: `1px solid ${isHovered ? '#00f2ff' : CAT_BORDER[el.cat] ?? 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                  zIndex: isHovered ? 10 : 1,
                  boxShadow: isHovered ? '0 0 16px rgba(0,242,255,0.7)' : 'none',
                  backdropFilter: 'blur(4px)',
                  // Make text visible but element transparent
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1px',
                  pointerEvents: 'auto',
                  overflow: 'hidden',
                }}
                onMouseEnter={() => setHovered(el.sym)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => select(el.sym)}
              >
                <span style={{
                  fontSize: 'clamp(4px, 0.9vw, 11px)',
                  fontWeight: 900,
                  color: isFlash ? '#000' : '#fff',
                  lineHeight: 1,
                  textShadow: isHovered ? '0 0 8px #00f2ff' : '0 1px 3px rgba(0,0,0,0.8)',
                  letterSpacing: '-0.02em',
                }}>
                  {el.sym}
                </span>
                <span style={{
                  fontSize: 'clamp(2px, 0.45vw, 5px)',
                  color: isFlash ? '#333' : 'rgba(255,255,255,0.55)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  marginTop: 1,
                  lineHeight: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}>
                  {el.n}
                </span>
              </motion.button>
            );
          })}

          {/* Lanthanide marker in main table */}
          <div style={{ gridColumn: 3, gridRow: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(4px, 0.6vw, 8px)', color: 'rgba(168,85,247,0.7)', textAlign: 'center', lineHeight: 1 }}>57–71</span>
          </div>
          {/* Actinide marker in main table */}
          <div style={{ gridColumn: 3, gridRow: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(4px, 0.6vw, 8px)', color: 'rgba(236,72,153,0.7)', textAlign: 'center', lineHeight: 1 }}>89–103</span>
          </div>
        </div>
      </div>

      {/* Selected flash notification */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full pointer-events-none"
            style={{ background: 'rgba(0,242,255,0.2)', border: '1px solid rgba(0,242,255,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-holo-primary font-black text-sm tracking-widest">
              ✓ {ELEMENTS.find(e => e.sym === flash)?.name} Added
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
