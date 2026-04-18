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

        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.oncanplay = () => {
              videoRef.current?.play();
              setIsLoaded(true);
              predict();
            };
          }
        }
      } catch (err) {
        console.error("Gesture Engine Error:", err);
        setIsLoaded(true);
      }
    };

    const predict = () => {
      if (videoRef.current && handLandmarkerRef.current && videoRef.current.readyState >= 2) {
        try {
          const startTimeMs = performance.now();
          const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            setHandLandmarks(results.landmarks);
            setIsHandActive(true);

            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            
            if (thumbTip && indexTip) {
              const distance = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) +
                Math.pow(thumbTip.y - indexTip.y, 2)
              );

              setHandPosition({
                x: 1 - indexTip.x, 
                y: indexTip.y,
                z: indexTip.z
              });

              // Zoom logic based on hand Z
              const targetZoom = 2 + (indexTip.z * 15);
              const currentZoom = useHoloStore.getState().zoom;
              useHoloStore.getState().setZoom(currentZoom + (targetZoom - currentZoom) * 0.1);

              setIsGrabbing(distance < 0.1);
            }
          } else {
            setHandLandmarks(null);
            setIsHandActive(false);
            setIsGrabbing(false);
          }
        } catch (err) {
          console.error("Prediction Error:", err);
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
    <div className="absolute inset-0 z-0 bg-transparent overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
        style={{ filter: 'contrast(1.1) brightness(1.1)' }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 border-4 border-holo-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-holo-primary font-black uppercase tracking-widest animate-pulse">Initializing AR Lab</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestureEngine;
