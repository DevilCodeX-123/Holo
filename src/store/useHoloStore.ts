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
  grabbedObjectId: string | null
  setGrabbedObjectId: (id: string | null) => void
  handPosition: { x: number, y: number, z: number }
  setHandPosition: (pos: { x: number, y: number, z: number }) => void
  hand3DPosition: THREE.Vector3
  setHand3DPosition: (pos: THREE.Vector3) => void

  // AI State
  aiExplanation: string
  setAiExplanation: (text: string) => void
  isAiLoading: boolean
  setIsAiLoading: (loading: boolean) => void

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
  grabbedObjectId: null,
  setGrabbedObjectId: (grabbedObjectId) => set({ grabbedObjectId }),
  handPosition: { x: 0, y: 0, z: 0 },
  setHandPosition: (handPosition) => set({ handPosition }),
  hand3DPosition: new THREE.Vector3(),
  setHand3DPosition: (hand3DPosition) => set({ hand3DPosition }),

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
}))
