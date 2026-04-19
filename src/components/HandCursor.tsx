import React from 'react';
import { motion } from 'framer-motion';
import { useHoloStore } from '../store/useHoloStore';

export const HandCursor: React.FC = () => {
  const { handPosition, isHandActive, isGrabbing, isHovering } = useHoloStore();

  if (!isHandActive) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] flex items-center justify-center"
      animate={{
        x: handPosition.x * window.innerWidth,
        y: handPosition.y * window.innerHeight,
        scale: isGrabbing ? 0.8 : (isHovering ? 1.2 : 1),
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
    >
      {/* Outer Glow Ring */}
      <div className={`absolute w-12 h-12 rounded-full border-2 transition-colors duration-200 ${
        isGrabbing ? 'border-holo-accent bg-holo-accent/20' : 
        (isHovering ? 'border-white bg-white/20' : 'border-holo-primary bg-holo-primary/10')
      } blur-[2px]`} />
      
      {/* Selection Progress / Inner Dot */}
      <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
        isGrabbing ? 'bg-holo-accent' : 'bg-holo-primary'
      } shadow-[0_0_15px_rgba(0,242,255,0.8)]`} />
      
      {/* Scanning Lines */}
      <div className="absolute w-20 h-[1px] bg-holo-primary/20 rotate-45" />
      <div className="absolute w-20 h-[1px] bg-holo-primary/20 -rotate-45" />
    </motion.div>
  );
};
