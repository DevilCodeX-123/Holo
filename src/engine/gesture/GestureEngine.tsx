import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useHoloStore } from '../../store/useHoloStore';

const GestureEngine: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setHandLandmarks, setIsHandActive, setIsGrabbing, setHandPosition } = useHoloStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const constraints = {
          video: {
            width: isMobile ? { ideal: 720 } : { ideal: 1280 },
            height: isMobile ? { ideal: 1280 } : { ideal: 720 },
            facingMode: "user"
          }
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              predict();
              setIsLoaded(true);
            };
          }
        }
      } catch (err) {
        console.error("Gesture Engine Error:", err);
      }
    };

    const predict = () => {
      if (videoRef.current && handLandmarkerRef.current) {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          setHandLandmarks(results.landmarks);
          setIsHandActive(true);

          // Indices: 4 = Thumb Tip, 8 = Index Tip
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          
          if (thumbTip && indexTip) {
            // Calculate Euclidean distance for pinch detection
            const distance = Math.sqrt(
              Math.pow(thumbTip.x - indexTip.x, 2) +
              Math.pow(thumbTip.y - indexTip.y, 2) +
              Math.pow(thumbTip.z - indexTip.z, 2)
            );

            // Update interaction point (Index Tip)
            // Mirror X because video is mirrored
            setHandPosition({
              x: 1 - indexTip.x, 
              y: indexTip.y,
              z: indexTip.z
            });

            // Pinch detection threshold
            setIsGrabbing(distance < 0.05);
          }
        } else {
          setHandLandmarks(null);
          setIsHandActive(false);
          setIsGrabbing(false);
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    setupMediaPipe();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover opacity-60 scale-x-[-1]"
        style={{ filter: 'contrast(1.2) brightness(0.8)' }}
      />
      
      {/* Visual Indicator for Tracking State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-holo-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-holo-primary font-mono text-sm uppercase tracking-widest animate-pulse">
              Initializing Gesture Engine...
            </p>
          </div>
        </div>
      )}
      
      {/* Holographic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_4px,3px_100%]" />
    </div>
  );
};

export default GestureEngine;
