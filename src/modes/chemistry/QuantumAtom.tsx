import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text as DreiText, Sparkles } from '@react-three/drei'
import { useHoloStore } from '../../store/useHoloStore'

// ─── Data ────────────────────────────────────────────────────────────────────

// Most common isotope neutron counts for Z 1-36; formula for the rest
const NEUTRONS: Record<number, number> = {
  1:0, 2:2, 3:4, 4:5, 5:6, 6:6, 7:7, 8:8, 9:10, 10:10,
  11:12, 12:12, 13:14, 14:14, 15:16, 16:16, 17:18, 18:22,
  19:20, 20:20, 21:24, 22:26, 23:28, 24:28, 25:30, 26:30,
  27:32, 28:30, 29:34, 30:35, 31:38, 32:40, 33:42, 34:45, 35:44, 36:48,
}
const getNeutrons = (Z: number) => NEUTRONS[Z] ?? Math.round(1.08 * Z)

// Aufbau fill order: [n, l, max electrons]
const FILL_ORDER: [number, number, number][] = [
  [1,0,2],[2,0,2],[2,1,6],[3,0,2],[3,1,6],[4,0,2],[3,2,10],[4,1,6],
  [5,0,2],[4,2,10],[5,1,6],[6,0,2],[4,3,14],[5,2,10],[6,1,6],
  [7,0,2],[5,3,14],[6,2,10],[7,1,6],
]

interface Sublevel { n: number; l: number; count: number }

function getElectronConfig(Z: number): Sublevel[] {
  const config: Sublevel[] = []
  let remaining = Z
  for (const [n, l, max] of FILL_ORDER) {
    if (remaining <= 0) break
    const fill = Math.min(remaining, max)
    config.push({ n, l, count: fill })
    remaining -= fill
  }
  return config
}

// Nucleus labels are handled in NucleusGroup below.

// ─── Electron Cloud Particles ─────────────────────────────────────────────────

/** Rejection-sample points from P ∝ r^2 |Ψnl|^2 dV for visualisation */
function sampleSCloud(n: number, count: number, a0: number): Float32Array {
  const pos = new Float32Array(count * 3)
  const peakR = n * n * a0
  const spread = peakR * 1.2
  let idx = 0, tries = 0
  while (idx < count && tries < count * 30) {
    tries++
    const r = Math.abs(THREE.MathUtils.randFloatSpread(1) * spread * 2) + spread * 0.1
    // 1s-like density: exp(-2r/n²a0)
    const psi = Math.exp(-r / (peakR * 0.7))
    if (Math.random() > psi * psi) continue
    const theta = Math.acos(1 - 2 * Math.random())
    const phi   = Math.random() * 2 * Math.PI
    pos[idx * 3]     = r * Math.sin(theta) * Math.cos(phi)
    pos[idx * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
    pos[idx * 3 + 2] = r * Math.cos(theta)
    idx++
  }
  return pos
}

/** p orbital: dumbbell along one axis, direction 0=x, 1=y, 2=z */
function samplePCloud(n: number, count: number, a0: number, axis: number): Float32Array {
  const pos = new Float32Array(count * 3)
  const peakR = n * n * a0 * 0.8
  const spread = peakR * 1.4
  let idx = 0, tries = 0
  while (idx < count && tries < count * 30) {
    tries++
    const r = Math.abs(THREE.MathUtils.randFloatSpread(spread * 2))
    const theta = Math.acos(1 - 2 * Math.random())
    const phi   = Math.random() * 2 * Math.PI
    // pz ∝ r*exp(-r/2)*cos(theta)  → dumbbell along Z
    const cosT = (axis === 2) ? Math.cos(theta)
               : (axis === 1) ? Math.sin(theta) * Math.sin(phi)
               :                Math.sin(theta) * Math.cos(phi)
    const psi = (r / peakR) * Math.exp(-r / (peakR * 0.9)) * cosT
    if (Math.random() > psi * psi * 8) continue
    pos[idx * 3]     = r * Math.sin(theta) * Math.cos(phi)
    pos[idx * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
    pos[idx * 3 + 2] = r * Math.cos(theta)
    idx++
  }
  return pos
}

/** d orbital: dxy-like 4 lobes */
function sampleDCloud(n: number, count: number, a0: number, variant: number): Float32Array {
  const pos = new Float32Array(count * 3)
  const peakR = n * n * a0 * 0.7
  const spread = peakR * 1.5
  let idx = 0, tries = 0
  while (idx < count && tries < count * 40) {
    tries++
    const r = Math.abs(THREE.MathUtils.randFloatSpread(spread * 2))
    const theta = Math.acos(1 - 2 * Math.random())
    const phi   = Math.random() * 2 * Math.PI
    // dxy ∝ r^2 * exp · sin²θ · sin(2φ)
    let angular = 0
    if (variant === 0)      angular = Math.pow(Math.sin(theta), 2) * Math.sin(2 * phi)
    else if (variant === 1) angular = Math.pow(Math.sin(theta), 2) * Math.cos(2 * phi)
    else if (variant === 2) angular = Math.sin(2 * theta) * Math.cos(phi)
    else if (variant === 3) angular = Math.sin(2 * theta) * Math.sin(phi)
    else                    angular = 3 * Math.pow(Math.cos(theta), 2) - 1
    const psi = Math.pow(r / peakR, 2) * Math.exp(-r / peakR) * angular
    if (Math.random() > psi * psi * 15) continue
    pos[idx * 3]     = r * Math.sin(theta) * Math.cos(phi)
    pos[idx * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
    pos[idx * 3 + 2] = r * Math.cos(theta)
    idx++
  }
  return pos
}

// Shell colors per principal quantum number
const SHELL_COLORS: Record<number, string> = {
  1: '#00f2ff', 2: '#7c3aed', 3: '#f59e0b', 4: '#10b981', 5: '#f43f5e', 6: '#0ea5e9', 7: '#a78bfa',
}

interface CloudProps { positions: Float32Array; color: string; opacity: number; size: number }

function ElectronCloud({ positions, color, opacity, size }: CloudProps) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size,
    transparent: true,
    opacity,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [color, opacity, size])

  const ref = useRef<THREE.Points>(null)
  
  // Bonding context
  const bonds = useHoloStore(state => state.bonds)
  const isBonded = bonds.some(b => b.fromId?.includes('atom') || b.toId?.includes('atom')) 

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.12
      // If bonded, expand slightly
      if (isBonded) {
        ref.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.05)
      } else {
        ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

// ─── Orbital Shape Meshes ─────────────────────────────────────────────────────

// Particle system for the nucleus
const NucleusParticle = ({ type, color, pos, size = 0.08 }: { type: 'proton' | 'neutron', color: string, pos: THREE.Vector3, size?: number }) => {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      {/* Precision Label on each particle - only visible when zooming */}
      <Billboard>
        <DreiText
          fontSize={0.02}
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, 0, size + 0.01]}
          font="/fonts/Inter-Bold.ttf"
          fillOpacity={0.8}
        >
          {type === 'proton' ? '+' : '0'}
        </DreiText>
      </Billboard>
    </group>
  );
};

const NucleusGroup = ({ protons, neutrons }: { protons: number; neutrons: number; }) => {
  const total = protons + neutrons;
  const particles = useMemo(() => {
    const temp = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      // Scaling radius based on total particles for a realistic volume
      const spread = 0.12 * Math.pow(total, 1/3);
      const dist = spread + (Math.random() * 0.05);
      
      temp.push({
        position: new THREE.Vector3(x * dist, y * dist, z * dist),
        type: i < protons ? 'proton' as const : 'neutron' as const
      });
    }
    return temp;
  }, [protons, neutrons]);

  return (
    <group>
      {particles.map((p, i) => (
        <NucleusParticle 
          key={i} 
          type={p.type} 
          pos={p.position} 
          color={p.type === 'proton' ? '#ff2a6d' : '#05d9e8'} 
        />
      ))}
      
      {/* Nuclear Forge: Central Energy Core */}
      <mesh>
        <sphereGeometry args={[0.15 * Math.pow(total, 1/3), 32, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.2} />
      </mesh>
      <pointLight intensity={2} distance={2} color="#00f2ff" />
      
      {/* Core Pulse Effect */}
      <CorePulse size={0.2 * Math.pow(total, 1/3)} />
    </group>
  );
};

const CorePulse = ({ size }: { size: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
    </mesh>
  );
};

// ─── Orbital Shape Meshes ─────────────────────────────────────────────────────

function SOrbitalGlow({ radius, color }: { radius: number; color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3}
        transparent opacity={0.06} wireframe={false} depthWrite={false} />
    </mesh>
  )
}

function POrbitalShape({ radius, axis, color }: { radius: number; axis: number; color: string }) {
  const rotation: [number, number, number] = axis === 0 ? [0, 0, Math.PI / 2] : axis === 1 ? [0, 0, 0] : [Math.PI / 2, 0, 0]
  return (
    <group rotation={rotation}>
      {[-1, 1].map(sign => (
        <mesh key={sign} position={[0, sign * radius * 0.5, 0]}>
          <sphereGeometry args={[radius * 0.45, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4}
            transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── createOrbitals ───────────────────────────────────────────────────────────

function createOrbitals(config: Sublevel[], a0: number, pointsCount: number): React.ReactElement {
  const CLOUD_POINTS = pointsCount

  const clouds: React.ReactElement[] = []
  const shapes: React.ReactElement[] = []

  let pAxisCount = 0
  let dVarCount  = 0

  config.forEach(({ n, l, count }, i) => {
    const color = SHELL_COLORS[n] ?? '#ffffff'
    const radius = n * n * a0

    if (l === 0) {
      // s orbital
      const pts = useMemo(() => sampleSCloud(n, CLOUD_POINTS, a0), [n])
      clouds.push(<ElectronCloud key={`s${i}`} positions={pts} color={color} opacity={0.55} size={0.022} />)
      shapes.push(<SOrbitalGlow key={`sg${i}`} radius={radius * 0.9} color={color} />)

    } else if (l === 1) {
      // p orbitals: up to 3 sub-clouds along x/y/z
      const axes = Math.ceil(count / 2)
      for (let ax = 0; ax < Math.min(axes, 3); ax++) {
        const axis = (pAxisCount++) % 3
        const pts = useMemo(() => samplePCloud(n, CLOUD_POINTS, a0, axis), [n, axis])
        clouds.push(<ElectronCloud key={`p${i}${ax}`} positions={pts} color={color} opacity={0.45} size={0.02} />)
        shapes.push(<POrbitalShape key={`ps${i}${ax}`} radius={radius} axis={axis} color={color} />)
      }

    } else if (l === 2) {
      // d orbitals: up to 5 sub-clouds
      const lobes = Math.ceil(count / 2)
      for (let v = 0; v < Math.min(lobes, 5); v++) {
        const variant = (dVarCount++) % 5
        const pts = useMemo(() => sampleDCloud(n, CLOUD_POINTS, a0, variant), [n, variant])
        clouds.push(<ElectronCloud key={`d${i}${v}`} positions={pts} color={color} opacity={0.35} size={0.018} />)
      }

    } else if (l === 3) {
      // f orbital — treat as complex s-like cloud at large radius
      const pts = useMemo(() => sampleSCloud(n, CLOUD_POINTS, a0 * 1.3), [n])
      clouds.push(<ElectronCloud key={`f${i}`} positions={pts} color={color} opacity={0.25} size={0.016} />)
    }
  })

  return <group>{shapes}{clouds}</group>
}

// ─── Realistic Electrons ──────────────────────────────────────────────────────

function RealisticElectrons({ config, a0 }: { config: Sublevel[]; a0: number }): React.ReactElement {
  const electronRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (electronRef.current) {
      electronRef.current.children.forEach((group, i) => {
        // Each shell rotates at a different speed
        group.rotation.y = clock.elapsedTime * (0.8 + (i * 0.2))
        group.rotation.x = clock.elapsedTime * (0.1 * i)
      })
    }
  })

  return (
    <group ref={electronRef}>
      {config.map((shell, sIdx) => {
        const radius = (sIdx + 1) * 1.2 * a0 // Tighter orbits
        const electrons = []
        for (let i = 0; i < shell.count; i++) {
          const angle = (i / shell.count) * Math.PI * 2
          electrons.push(
            <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 0.5) * radius * 0.2, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color="#00f2ff" roughness={0.3} metalness={0.8} />
            </mesh>
          )
        }
        return (
          <group key={sIdx}>
            {/* Shell orbit line (very faint) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius - 0.005, radius + 0.005, 64]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
            </mesh>
            {electrons}
          </group>
        )
      })}
    </group>
  )
}

// ─── Main QuantumAtom ─────────────────────────────────────────────────────────

interface Props {
  atomicNumber: number
  symbol: string
  position?: [number, number, number]
  scale?: number
  fixedUnitSize?: boolean
  pointsCount?: number
  isRealistic?: boolean
  hideLabel?: boolean
}

export const QuantumAtom: React.FC<Props> = ({ 
  atomicNumber, 
  symbol, 
  position = [0, 0, 0], 
  scale = 1,
  fixedUnitSize = false,
  pointsCount = 600,
  isRealistic = true, // Default to true based on user request
  hideLabel = false
}) => {
  const Z = atomicNumber
  const N = getNeutrons(Z)
  const config = useMemo(() => getElectronConfig(Z), [Z])

  // a0 = visual Bohr radius unit. 
  // shrunk significantly to allow multiple atoms to be placed for reactions
  const a0 = fixedUnitSize ? 0.04 : (0.08 / Math.pow(Z, 0.35));

  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.08
    }
  })
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Nucleus - High Fidelity labels & forge */}
      <NucleusGroup protons={Z} neutrons={N} />

      {/* Main Symbol Label */}
      {!hideLabel && (
        <Billboard position={[0, 1.2, 0]}>
          <DreiText
            fontSize={0.3}
            color="#00f2ff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.ttf"
            outlineWidth={0.02}
            outlineColor="#000"
          >
            {symbol}
          </DreiText>
        </Billboard>
      )}

      {/* Electrons & Atmosphere */}
      {isRealistic ? (
        <RealisticElectrons config={config} a0={a0} />
      ) : (
        <>
          {createOrbitals(config, a0, pointsCount)}
          <pointLight color={SHELL_COLORS[1]} intensity={1.5} distance={a0 * 30} decay={2} />
        </>
      )}
    </group>
  )
}

// ─── Lookup table: symbol → atomic number ─────────────────────────────────────

export const SYMBOL_TO_Z: Record<string, number> = {
  H:1, He:2, Li:3, Be:4, B:5, C:6, N:7, O:8, F:9, Ne:10,
  Na:11, Mg:12, Al:13, Si:14, P:15, S:16, Cl:17, Ar:18,
  K:19, Ca:20, Sc:21, Ti:22, V:23, Cr:24, Mn:25, Fe:26,
  Co:27, Ni:28, Cu:29, Zn:30, Ga:31, Ge:32, As:33, Se:34, Br:35, Kr:36,
  Rb:37, Sr:38, Y:39, Zr:40, Nb:41, Mo:42, Tc:43, Ru:44, Rh:45,
  Pd:46, Ag:47, Cd:48, In:49, Sn:50, Sb:51, Te:52, I:53, Xe:54,
  Cs:55, Ba:56, La:57, Ce:58, Pr:59, Nd:60, Pm:61, Sm:62, Eu:63,
  Gd:64, Tb:65, Dy:66, Ho:67, Er:68, Tm:69, Yb:70, Lu:71,
  Hf:72, Ta:73, W:74, Re:75, Os:76, Ir:77, Pt:78, Au:79, Hg:80,
  Pb:82, Bi:83, Po:84, At:85, Rn:86, Fr:87, Ra:88, Ac:89,
  Th:90, Pa:91, U:92, Np:93, Pu:94, Am:95, Cm:96, Bk:97, Cf:98,
  Es:99, Fm:100, Md:101, No:102, Lr:103, Rf:104, Db:105, Sg:106,
  Bh:107, Hs:108, Mt:109, Ds:110, Rg:111, Cn:112, Nh:113, Fl:114,
  Mc:115, Lv:116, Ts:117, Og:118,
}
