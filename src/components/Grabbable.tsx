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
        // High-responsiveness follow for mobile
        groupRef.current.position.lerp(hand3DPosition, 0.4);
        groupRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        // Release
        setGrabbedObjectId(null);
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
      }
    } else {
      // Normal scale
      const targetScale = isHovered ? 1.05 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
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
