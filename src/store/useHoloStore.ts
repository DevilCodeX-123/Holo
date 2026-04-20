import { create } from 'zustand'
import * as THREE from 'three'

export type AppMode = 'chemistry' | 'physics'

interface HoloState {
  mode: AppMode
  setMode: (mode: AppMode) => void
  
  isLanding: boolean
  setIsLanding: (isLanding: boolean) => void

  selectedTopic: string | null
  setSelectedTopic: (topic: string | null) => void

  selectedItems: string[]
  addItem: (item: string) => void
  removeItem: (item: string) => void
  clearItems: () => void

  // Hand tracking & interaction state
  handLandmarks: any[] | null
  setHandLandmarks: (landmarks: any[] | null) => void
  isHandActive: boolean
  setIsHandActive: (active: boolean) => void
  isGrabbing: boolean
  setIsGrabbing: (isGrabbing: boolean) => void
  isHovering: boolean
  setIsHovering: (isHovering: boolean) => void
  grabbedObjectId: string | null
  setGrabbedObjectId: (id: string | null) => void
  handPosition: { x: number, y: number, z: number }
  setHandPosition: (pos: { x: number, y: number, z: number }) => void
  preciseLandmarks: { x: number, y: number, z: number }[] | null
  setPreciseLandmarks: (landmarks: { x: number, y: number, z: number }[] | null) => void
  hand3DPosition: THREE.Vector3
  setHand3DPosition: (pos: THREE.Vector3) => void
  // Multi-hand tracking
  allHands: Array<{
    handIdx: number
    landmarks: { x: number, y: number, z: number }[]
    interactionPoint: { x: number, y: number, z: number }
    indexTip: { x: number, y: number, z: number }
    thumbTip: { x: number, y: number, z: number }
    isPinching: boolean
    isFist: boolean
  }>
  setAllHands: (hands: any[]) => void

  // AI State
  aiExplanation: string
  setAiExplanation: (text: string) => void
  isAiLoading: boolean
  setIsAiLoading: (loading: boolean) => void

  // Active elements in the scene
  activeElements: Array<{ id: string, symbol: string, position: [number, number, number] }>
  addActiveElement: (symbol: string, position: [number, number, number]) => void
  removeActiveElement: (id: string) => void
  updateElementPosition: (id: string, position: [number, number, number]) => void

  // Dragging state
  draggedElement: string | null
  setDraggedElement: (symbol: string | null) => void
  dragPosition: [number, number, number] | null
  setDragPosition: (pos: [number, number, number] | null) => void

  isRealistic: boolean
  setIsRealistic: (realistic: boolean) => void

  // Simulation parameters
  physicsParams: {
    amplitude: number
    frequency: number
    gravity: number
  }
  setPhysicsParam: (key: keyof HoloState['physicsParams'], value: number) => void

  chemistryParams: {
    bondSpeed: number
    temperature: number
  }
  setChemistryParam: (key: keyof HoloState['chemistryParams'], value: number) => void

  zoom: number
  setZoom: (zoom: number) => void

  // Environment & Molecules
  temperature: number // 0 to 1000 K
  setTemperature: (t: number) => void
  pressure: number     // 0 to 10 atm
  setPressure: (p: number) => void
  
  bonds: Array<{ id: string, fromId: string, toId: string, type: 'single' | 'double' | 'triple' }>
  addBond: (fromId: string, toId: string, type?: 'single' | 'double' | 'triple') => void
  removeBond: (id: string) => void

  engineStatus: 'loading' | 'scanning' | 'active' | 'error'
  setEngineStatus: (status: 'loading' | 'scanning' | 'active' | 'error') => void
}

export const useHoloStore = create<HoloState>((set) => ({
  mode: 'chemistry',
  setMode: (mode) => set({ mode }),
  
  isLanding: true,
  setIsLanding: (isLanding) => set({ isLanding }),

  selectedTopic: null,
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),

  selectedItems: [],
  addItem: (item) => set((state) => ({ 
    selectedItems: state.selectedItems.includes(item) ? state.selectedItems : [...state.selectedItems, item] 
  })),
  removeItem: (item) => set((state) => ({ 
    selectedItems: state.selectedItems.filter(i => i !== item) 
  })),
  clearItems: () => set({ selectedItems: [] }),

  handLandmarks: null,
  setHandLandmarks: (handLandmarks) => set({ handLandmarks }),
  isHandActive: false,
  setIsHandActive: (isHandActive) => set({ isHandActive }),
  isGrabbing: false,
  setIsGrabbing: (isGrabbing) => set({ isGrabbing }),
  isHovering: false,
  setIsHovering: (isHovering) => set({ isHovering }),
  grabbedObjectId: null,
  setGrabbedObjectId: (grabbedObjectId) => set({ grabbedObjectId }),
  handPosition: { x: 0, y: 0, z: 0 },
  setHandPosition: (handPosition) => set({ handPosition }),
  preciseLandmarks: null,
  setPreciseLandmarks: (preciseLandmarks) => set({ preciseLandmarks }),
  hand3DPosition: new THREE.Vector3(),
  setHand3DPosition: (hand3DPosition) => set({ hand3DPosition }),
  allHands: [],
  setAllHands: (allHands) => set({ allHands }),

  zoom: 5,
  setZoom: (zoom) => set({ zoom }),

  activeElements: [],
  addActiveElement: (symbol, position) => set((state) => ({
    activeElements: [...state.activeElements, { 
      id: `${symbol}-${Math.random().toString(36).substr(2, 5)}`, 
      symbol, 
      position 
    }]
  })),
  removeActiveElement: (id) => set((state) => ({
    activeElements: state.activeElements.filter(el => el.id !== id)
  })),
  updateElementPosition: (id, position) => set((state) => ({
    activeElements: state.activeElements.map(el => el.id === id ? { ...el, position } : el)
  })),

  draggedElement: null,
  setDraggedElement: (draggedElement) => set({ draggedElement }),
  dragPosition: null,
  setDragPosition: (dragPosition) => set({ dragPosition }),

  isRealistic: true,
  setIsRealistic: (isRealistic) => set({ isRealistic }),

  aiExplanation: "Welcome to HoloLab. Select a subject and topic to begin your AR discovery.",
  setAiExplanation: (aiExplanation) => set({ aiExplanation }),
  isAiLoading: false,
  setIsAiLoading: (isAiLoading) => set({ isAiLoading }),

  physicsParams: {
    amplitude: 0.5,
    frequency: 1,
    gravity: 9.81,
  },
  setPhysicsParam: (key, value) => set((state) => ({
    physicsParams: { ...state.physicsParams, [key]: value }
  })),

  chemistryParams: {
    bondSpeed: 1,
    temperature: 25,
  },
  setChemistryParam: (key, value) => set((state) => ({
    chemistryParams: { ...state.chemistryParams, [key]: value }
  })),

  engineStatus: 'loading',
  setEngineStatus: (status) => set({ engineStatus: status }),

  temperature: 293, // ~20 deg C
  setTemperature: (temperature) => set({ temperature }),
  pressure: 1, // 1 atm
  setPressure: (pressure) => set({ pressure }),

  bonds: [],
  addBond: (fromId, toId, type = 'single') => set((state) => ({
    bonds: [...state.bonds, { id: `bond-${Math.random().toString(36).substr(2, 5)}`, fromId, toId, type }]
  })),
  removeBond: (id) => set((state) => ({
    bonds: state.bonds.filter(b => b.id !== id)
  })),
}))
