import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import * as THREE from 'three';
import { useHoloStore } from '../../store/useHoloStore';

// One Euro Filter - adaptive: near-zero delay at fast movement, smooth at slow
class OneEuroFilter {
  prevX: number | null = null;
  prevDX = 0;

  constructor(
    public minCutoff = 2.0,  // Higher = less smoothing = faster response
    public beta = 0.08,       // Higher = more speed-adaptive
    public dcut = 1.0
  ) {}

  filter(val: number, freq = 60) {
    const te = 1 / freq;
    const dx = this.prevX === null ? 0 : (val - this.prevX) / te;
    const eTe = te / (te + 1 / (2 * Math.PI * this.dcut));
    const edx = this.prevDX + eTe * (dx - this.prevDX);
    this.prevDX = edx;
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const a = te / (te + 1 / (2 * Math.PI * cutoff));
    const result = this.prevX === null ? val : this.prevX + a * (val - this.prevX);
    this.prevX = result;
    return result;
  }
}

// Map a single hand's landmarks to precise screen coordinates
function mapLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  filters: OneEuroFilter[][],
  videoW: number,
  videoH: number,
  screenW: number,
  screenH: number
) {
  const videoRatio = videoW / videoH;
  const screenRatio = screenW / screenH;

  return landmarks.map((lm, i) => {
    if (!filters[i]) {
      filters[i] = [new OneEuroFilter(), new OneEuroFilter(), new OneEuroFilter()];
    }
    // Filter raw values for smooth output
    const fx = filters[i][0].filter(lm.x);
    const fy = filters[i][1].filter(lm.y);
    const fz = filters[i][2].filter(lm.z);

    let x = fx;
    let y = fy;

    // Compensate for object-cover cropping
    if (screenRatio > videoRatio) {
      const scale = screenW / videoW;
      const scaledH = videoH * scale;
      const offsetY = (scaledH - screenH) / 2;
      y = (fy * scaledH - offsetY) / screenH;
    } else {
      const scale = screenH / videoH;
      const scaledW = videoW * scale;
      const offsetX = (scaledW - screenW) / 2;
      x = (fx * scaledW - offsetX) / screenW;
    }

    // Mirror X (video is flipped with scale-x-[-1])
    x = 1 - x;

    // Clamp to [0, 1]
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    return { x, y, z: fz };
  });
}

const GestureEngine: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Per-hand, per-joint filters: filtersRef[handIndex][jointIndex][axis]
  const filtersRef = useRef<OneEuroFilter[][][]>([[], []]);
  const [isLoaded, setIsLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  // Store actions
  const setHandLandmarks   = useHoloStore(state => state.setHandLandmarks);
  const setPreciseLandmarks = useHoloStore(state => state.setPreciseLandmarks);
  const setIsHandActive    = useHoloStore(state => state.setIsHandActive);
  const setIsGrabbing      = useHoloStore(state => state.setIsGrabbing);
  const setHandPosition    = useHoloStore(state => state.setHandPosition);
  const setAllHands        = useHoloStore(state => state.setAllHands);
  const setEngineStatus    = useHoloStore(state => state.setEngineStatus);

  // Velocity tracking for flick detection
  const prevIndexTip = useRef<{x:number,y:number} | null>(null);
  const prevVelocity = useRef(0);
  const frameCounter = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,        // Support up to 2 hands
          minHandDetectionConfidence: 0.5, // Increased to avoid face/noise
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.oncanplay = () => {
            videoRef.current?.play();
            setIsLoaded(true);
            predict();
          };
        }
      } catch (err) {
        console.error('GestureEngine setup error:', err);
        setIsLoaded(true);
      }
    };

    const predict = () => {
      const video = videoRef.current;
      const landmarker = handLandmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) {
        try {
          const results = landmarker.detectForVideo(video, performance.now());
          const vW = video.videoWidth || 1280;
          const vH = video.videoHeight || 720;
          const sW = window.innerWidth;
          const sH = window.innerHeight;

          if (results.landmarks && results.landmarks.length > 0) {
            setIsHandActive(true);
            setEngineStatus('active');
            frameCounter.current = 0; // Reset dropout buffer
            setHandLandmarks(results.landmarks);

            // Process ALL detected hands
            const allHandsData = results.landmarks.map((rawLandmarks, handIdx) => {
              if (!filtersRef.current[handIdx]) filtersRef.current[handIdx] = [];
              const precise = mapLandmarks(
                rawLandmarks, filtersRef.current[handIdx], vW, vH, sW, sH
              );
              const indexTip  = precise[8];   // Index finger tip
              const thumbTip  = precise[4];   // Thumb tip
              const middleTip = precise[12];  // Middle finger tip

              // PRECISION MIDPOINT: The intersection of thumb and index for 100% accuracy
              const interactionPoint = {
                x: (indexTip.x + thumbTip.x) / 2,
                y: (indexTip.y + thumbTip.y) / 2,
                z: (indexTip.z + thumbTip.z) / 2
              };

              // Pinch distance (thumb ↔ index)
              const pinchDist = Math.hypot(
                thumbTip.x - indexTip.x,
                thumbTip.y - indexTip.y
              );
              
              // Fist detection
              const wrist = precise[0];
              const fistDist = Math.hypot(
                middleTip.x - wrist.x,
                middleTip.y - wrist.y
              );

              return {
                landmarks: precise,
                indexTip,
                thumbTip,
                interactionPoint,
                isPinching: pinchDist < 0.085, // Slightly more forgiving for midpoint interaction
                isFist: fistDist < 0.15,
                handIdx,
              };
            });

            // Store all hands state
            setAllHands(allHandsData);

            // Primary hand = first detected hand
            const primary = allHandsData[0];
            setPreciseLandmarks(primary.landmarks);
            
            // Set interaction point to the CENTER of the pinch for 100% precision
            setHandPosition(primary.interactionPoint);
            setIsGrabbing(primary.isPinching || primary.isFist);

            // CALCULATE 3D WORLD POSITION for element dragging
            // Map [0,1] normalized to [-5, 5] world space
            const worldX = (primary.interactionPoint.x - 0.5) * 10;
            const worldY = (0.5 - primary.interactionPoint.y) * 8;
            // Landmarks Z typically ranges from ~ -0.1 to 0.1, we'll map it to depth
            const worldZ = -primary.interactionPoint.z * 15; 
            
            useHoloStore.getState().setHand3DPosition(new THREE.Vector3(worldX, worldY, worldZ));

          } else {
            // Buffer to prevent flickering loss
            frameCounter.current++;
            if (frameCounter.current > 15) {
              setIsHandActive(false);
              setEngineStatus('scanning');
              setIsGrabbing(false);
              setHandLandmarks(null);
              setPreciseLandmarks(null);
              setAllHands([]);
            }
          }
        } catch (err) {
          console.error('Prediction error:', err);
          setEngineStatus('error');
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    setup();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
        style={{ filter: 'contrast(1.05) brightness(1.08) saturate(1.1)' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-holo-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-holo-primary font-black uppercase tracking-widest animate-pulse">
              Initializing Hand Tracking
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestureEngine;
