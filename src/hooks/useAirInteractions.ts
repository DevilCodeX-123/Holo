import { useEffect, useRef } from 'react';
import { useHoloStore } from '../store/useHoloStore';

export const useAirInteractions = () => {
  const allHands      = useHoloStore(state => state.allHands);
  const isHandActive  = useHoloStore(state => state.isHandActive);
  const setIsHovering = useHoloStore(state => state.setIsHovering);
  const setDraggedElement = useHoloStore(state => state.setDraggedElement);
  const draggedElement    = useHoloStore(state => state.draggedElement);
  const addActiveElement  = useHoloStore(state => state.addActiveElement);
  const removeItem        = useHoloStore(state => state.removeItem);
  const setDragPosition   = useHoloStore(state => state.setDragPosition);
  const handPosition      = useHoloStore(state => state.handPosition);
  const zoom              = useHoloStore(state => state.zoom);
  const setZoom           = useHoloStore(state => state.setZoom);
  const grabbedObjectId   = useHoloStore(state => state.grabbedObjectId);
  const setGrabbedObjectId = useHoloStore(state => state.setGrabbedObjectId);
  const removeActiveElement = useHoloStore(state => state.removeActiveElement);

  // Track per-hand state
  const lastElementPerHand = useRef<Map<number, HTMLElement>>(new Map());
  const wasPinchingPerHand = useRef<Map<number, boolean>>(new Map());

  // Pinch zoom state
  const initialZoomDist = useRef<number | null>(null);
  const initialZoomVal = useRef<number>(zoom);

  // Flick gesture: sudden fast movement that stops = click at landing position
  useEffect(() => {
    const onFlick = (e: Event) => {
      const { x, y } = (e as CustomEvent).detail as { x: number; y: number };
      const elements = document.elementsFromPoint(x, y);
      const target = elements.find(el => {
        if (!(el instanceof HTMLElement)) return false;
        return el.tagName === 'BUTTON' || el.dataset.virtualInteract === 'true' ||
               window.getComputedStyle(el).cursor === 'pointer';
      }) as HTMLElement | undefined;
      if (target) {
        target.click();
        // Visual ripple at flick point
        const ripple = document.createElement('div');
        ripple.className = 'virtual-tap-ripple';
        ripple.style.cssText = `left:${x}px;top:${y}px;`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
    };
    window.addEventListener('gestureFlick', onFlick);
    return () => window.removeEventListener('gestureFlick', onFlick);
  }, []);

  useEffect(() => {
    if (!isHandActive || allHands.length === 0) {
      // Clear all hover states when no hands
      lastElementPerHand.current.forEach(el => el.classList.remove('virtually-hovered'));
      lastElementPerHand.current.clear();
      setIsHovering(false);
      return;
    }

    let anyHovering = false;

    // --- TWO-HAND PINCH ZOOM LOGIC ---
    if (allHands.length >= 2) {
      const h1 = allHands[0];
      const h2 = allHands[1];
      
      if (h1.isPinching && h2.isPinching) {
        const dist = Math.hypot(h1.indexTip.x - h2.indexTip.x, h1.indexTip.y - h2.indexTip.y);
        
        if (initialZoomDist.current === null) {
          initialZoomDist.current = dist;
          initialZoomVal.current = zoom;
        } else {
          const ratio = dist / initialZoomDist.current;
          // Expert range: 0.5 to 20x scale
          const newZoom = Math.max(0.5, Math.min(20, initialZoomVal.current * ratio));
          setZoom(newZoom);
        }
        // Skip individual hand interaction focus when zooming
        setIsHovering(false);
        return; 
      } else {
        initialZoomDist.current = null;
      }
    } else {
      initialZoomDist.current = null;
    }

    allHands.forEach(hand => {
      const { handIdx, interactionPoint, isPinching } = hand;

      // interactionPoint is the midpoint between thumb and index, normalized [0, 1]
      const x = interactionPoint.x * window.innerWidth;
      const y = interactionPoint.y * window.innerHeight;
      if (isNaN(x) || isNaN(y)) return;

      // 1. MAGNETIC SNAPPING LOGIC
      // Find all interactable elements on screen
      const interactables = Array.from(document.querySelectorAll('[data-virtual-interact="true"], button'));
      let snappedTarget: HTMLElement | null = null;
      let minSnapDist = 60; // Snap radius in px

      interactables.forEach(el => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(x - centerX, y - centerY);
        if (dist < minSnapDist) {
          minSnapDist = dist;
          snappedTarget = el as HTMLElement;
        }
      });

      const finalX = snappedTarget ? (snappedTarget as HTMLElement).getBoundingClientRect().left + (snappedTarget as HTMLElement).getBoundingClientRect().width / 2 : x;
      const finalY = snappedTarget ? (snappedTarget as HTMLElement).getBoundingClientRect().top + (snappedTarget as HTMLElement).getBoundingClientRect().height / 2 : y;

      const lastEl = lastElementPerHand.current.get(handIdx);
      const currentTarget = snappedTarget || (document.elementFromPoint(x, y) as HTMLElement | null);

      // 2. HOVER FEEDBACK
      if (currentTarget !== lastEl) {
        lastEl?.classList.remove('virtually-hovered');
        if (currentTarget && (currentTarget.tagName === 'BUTTON' || currentTarget.dataset.virtualInteract === 'true')) {
          currentTarget.classList.add('virtually-hovered');
          lastElementPerHand.current.set(handIdx, currentTarget);
        } else {
          lastElementPerHand.current.delete(handIdx);
        }
      }
      if (currentTarget) anyHovering = true;

      const wasPinching = wasPinchingPerHand.current.get(handIdx) ?? false;

      // 3. PINCH / TAP ACTION
      if (isPinching && !wasPinching) {
        if (currentTarget) {
          const elementSymbol = currentTarget.dataset.element;
          if (elementSymbol) {
            setDraggedElement(elementSymbol);
          } else {
            currentTarget.click();
            // Haptic/Visual feedback
            currentTarget.style.transform = 'scale(0.92)';
            setTimeout(() => { if (currentTarget) currentTarget.style.transform = ''; }, 100);
          }
        }

        // Tap ripple at the SNAPPED or raw position
        const ripple = document.createElement('div');
        ripple.className = 'virtual-tap-ripple';
        ripple.style.cssText = `left:${finalX}px;top:${finalY}px;`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }

      // 4. DRAG POSITION (Store-based)
      if (isPinching && draggedElement) {
        // Map normalized screen to world-ish plane for preview
        const nx = (interactionPoint.x - 0.5) * 10;
        const ny = (0.5 - interactionPoint.y) * 8;
        setDragPosition([nx, ny, 0]);
      }

      // 5. RELEASE / DROP
      if (!isPinching && wasPinching) {
        if (draggedElement) {
          const elementsAtDrop = document.elementsFromPoint(x, y);
          const onTrash = elementsAtDrop.some(el => (el as HTMLElement).dataset?.trashZone === 'true');

          if (onTrash) {
            removeItem(draggedElement);
            // Delete flash
            const flash = document.createElement('div');
            flash.className = 'fixed inset-0 bg-red-500/10 pointer-events-none z-[9999] animate-pulse';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 400);
          } else if (y < window.innerHeight - 150) {
            // Drop in scene (if far enough from bottom tray)
            const nx = (interactionPoint.x - 0.5) * 8;
            const ny = (0.5 - interactionPoint.y) * 6;
            // Spawn at discoveries height
            addActiveElement(draggedElement, [nx, ny + 1.5, 0]);
            window.dispatchEvent(new CustomEvent('atom_spawned'));
          }
          setDraggedElement(null);
          setDragPosition(null);
        }
      }

      wasPinchingPerHand.current.set(handIdx, isPinching);
    });

    setIsHovering(anyHovering);

  }, [allHands, isHandActive]);
};
