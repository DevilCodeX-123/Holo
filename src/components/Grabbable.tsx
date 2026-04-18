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
  const { hand3DPosition, isGrabbing, isHandActive, grabbedObjectId, setGrabbedObjectId } = useHoloStore();
  const [isHovered, setIsHovered] = useState(false);
  
  // Track if THIS object is currently grabbed
  const isCurrentlyGrabbedByMe = grabbedObjectId === id;

  useFrame(() => {
    if (!groupRef.current || !isHandActive) return;

    const distance = groupRef.current.position.distanceTo(hand3DPosition);
    
    // 1. Proximity Detection (Hover/Highlight)
    const proximityThreshold = 0.8;
    setIsHovered(distance < proximityThreshold);

    // 2. Grab Logic
    if (distance < 0.4 && isGrabbing && !grabbedObjectId) {
      setGrabbedObjectId(id);
    }

    // 3. Move Logic (if grabbed)
    if (isCurrentlyGrabbedByMe) {
      if (isGrabbing) {
        // Smoothly follow hand
        groupRef.current.position.lerp(hand3DPosition, 0.2);
      } else {
        // Release
        setGrabbedObjectId(null);
      }
    }
  });

  return (
    <group ref={groupRef} position={initialPosition}>
      {children}
      
      {/* Interaction Feedback: Glow/Highlight Outline */}
      {(isHovered || isCurrentlyGrabbedByMe) && (
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial 
            color={isCurrentlyGrabbedByMe ? "#ff00d9" : "#00f2ff"} 
            transparent 
            opacity={0.15} 
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};
