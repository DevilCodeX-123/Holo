import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHoloStore } from '../store/useHoloStore';

interface GrabbableProps {
  children: React.ReactNode;
  id: string;
  initialPosition?: [number, number, number];
}

export const Grabbable: React.FC<GrabbableProps> = ({ children, id, initialPosition = [0, 0, 0] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { handPosition, hand3DPosition, isHandActive, grabbedObjectId, setGrabbedObjectId, updateElementPosition } = useHoloStore();
  const [isHovered, setIsHovered] = useState(false);
  const dropoutCounter = useRef(0);
  
  // Track if THIS object is currently grabbed
  const isCurrentlyGrabbedByMe = grabbedObjectId === id;

  useFrame((state) => {
    const hands = useHoloStore.getState().allHands;
    const grabbingHand = hands.find(h => h.isPinching);

    if (isCurrentlyGrabbedByMe) {
      if (grabbingHand) {
        const targetPos = useHoloStore.getState().hand3DPosition;
        groupRef.current?.position.lerp(targetPos, 0.3); // Increased responsiveness
        
        // Update store in real-time for proximity bonding
        updateElementPosition(id, [
          groupRef.current!.position.x,
          groupRef.current!.position.y,
          groupRef.current!.position.z
        ]);
        
        dropoutCounter.current = 0; // Reset buffer
      } else {
        // Latch Memory: Ignore dropout for up to 10 frames to avoid accidental release
        dropoutCounter.current++;
        if (dropoutCounter.current > 10) {
          // Actual release
          updateElementPosition(id, [
            groupRef.current!.position.x, 
            groupRef.current!.position.y, 
            groupRef.current!.position.z
          ]);
          setGrabbedObjectId(null);
          dropoutCounter.current = 0;
        }
      }
    } else {
      if (!isHandActive || !groupRef.current) return;
      // 1. PROJECT OBJECT TO SCREEN SPACE for robust "visual touch"
      const vector = new THREE.Vector3();
      groupRef.current.getWorldPosition(vector);
      vector.project(state.camera);

      // Convert to 0-1 range to match handPosition
      const screenX = (vector.x + 1) / 2;
      const screenY = (1 - vector.y) / 2;

      // 2. Hybrid Proximity Check (Magnetic Catch)
      // Visual distance on screen (increased to 0.25 for easier catch)
      const dist2D = Math.hypot(screenX - handPosition.x, screenY - handPosition.y);
      // Actual 3D depth distance (increased to 0.8 for magnetism)
      const dist3D = groupRef.current.position.distanceTo(hand3DPosition);

      // Magnetic Catch logic
      const isPickable = dist2D < 0.25 || dist3D < 0.8;

      if (!grabbedObjectId) {
        setIsHovered(isPickable);

        const pinchingHand = useHoloStore.getState().allHands.find(h => h.isPinching);
        if (isPickable && pinchingHand) {
          setGrabbedObjectId(id);
        }
      } else {
        setIsHovered(false);
      }

      // Normal scale/hover feedback
      const targetScale = isHovered ? 1.3 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <group ref={groupRef} position={initialPosition}>
      {children}
      
      {/* Interaction Feedback: Holographic Pulse */}
      {(isHovered || isCurrentlyGrabbedByMe) && (
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial 
            color={isCurrentlyGrabbedByMe ? "#ff00d9" : "#00f2ff"} 
            transparent 
            opacity={0.1} 
            side={THREE.BackSide}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};
