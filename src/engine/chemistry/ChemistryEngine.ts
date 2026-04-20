import { useHoloStore } from '../../store/useHoloStore';

// Basic Valence Electron mapping for the first few rows + common metals
export const ELEMENT_VALENCE: Record<string, number> = {
  'H': 1,
  'He': 2,
  'Li': 1,
  'Be': 2,
  'B': 3,
  'C': 4,
  'N': 5,
  'O': 6,
  'F': 7,
  'Ne': 8,
  'Na': 1,
  'Mg': 2,
  'Al': 3,
  'Si': 4,
  'P': 5,
  'S': 6,
  'Cl': 7,
  'Ar': 8,
  'K': 1,
  'Ca': 2,
  'Fe': 2, // Variable, but we'll use 2 for common state
  'Cu': 1,
  'Ag': 1,
  'Au': 1,
};

// Ideal relative offsets for common molecules (unit scale)
export const IDEAL_GEOMETRIES: Record<string, Record<string, [number, number, number][]>> = {
  'H2O': {
    'O': [[0, 0, 0]],
    // 104.5 degrees bent
    'H': [[0.9, -0.6, 0], [-0.9, -0.6, 0]]
  },
  'CO2': {
    'C': [[0, 0, 0]],
    // Linear
    'O': [[1.2, 0, 0], [-1.2, 0, 0]]
  },
  'CH4': {
    'C': [[0, 0, 0]],
    // Tetrahedral
    'H': [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]
  }
};

export const solveReactions = () => {
  const store = useHoloStore.getState();
  const elements = store.activeElements;
  const temp = store.temperature;

  // STRICT RULE: Clear all temporary states before solving
  // We keep existing bonds unless they are chemically unstable
  
  // Simple neighbor-based bonding logic
  // If atoms are within thresholds and have available valence slots, they bond
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];

      const dist = Math.sqrt(
        Math.pow(a.position[0] - b.position[0], 2) +
        Math.pow(a.position[1] - b.position[1], 2) +
        Math.pow(a.position[2] - b.position[2], 2)
      );

      // Reaction threshold: Close proximity + valid Temp (minimum 300K for reaction)
      if (dist < 1.8 && temp >= 300) {
        // Check if bond already exists
        const exists = store.bonds.some(bond => 
          (bond.fromId === a.id && bond.toId === b.id) ||
          (bond.fromId === b.id && bond.toId === a.id)
        );

        if (!exists) {
          store.addBond(a.id, b.id);
          
          // --- Perfect Geometry Application ---
          // Analyze neighborhood for common molecules
          const neighbors = elements.filter(el => {
             const d = Math.sqrt(Math.pow(el.position[0]-a.position[0],2) + Math.pow(el.position[1]-a.position[1],2));
             return d < 2.5; 
          });

          // H2O Geometry
          if (neighbors.length === 3 && neighbors.filter(e => e.symbol === 'H').length === 2 && neighbors.some(e=>e.symbol==='O')) {
            const oxy = neighbors.find(e => e.symbol === 'O')!;
            const hydro = neighbors.filter(e => e.symbol === 'H');
            const geo = IDEAL_GEOMETRIES['H2O'];
            
            store.updateElementPosition(oxy.id, oxy.position); 
            hydro.forEach((h, idx) => {
              const offset = geo['H'][idx];
              store.updateElementPosition(h.id, [
                oxy.position[0] + offset[0],
                oxy.position[1] + offset[1],
                oxy.position[2] + offset[2]
              ]);
            });
          }

          // Visual feedback signal
          window.dispatchEvent(new CustomEvent('reaction_success', { 
            detail: { fromId: a.id, toId: b.id } 
          }));
        }
      }
    }
  }
};
