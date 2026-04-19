import { useEffect, useRef } from 'react';
import { useHoloStore } from '../store/useHoloStore';

export const useAirInteractions = () => {
  const allHands      = useHoloStore(state => state.allHands);
  const isHandActive  = useHoloStore(state => state.isHandActive);
  const setIsHovering = useHoloStore(state => state.setIsHovering);
  const setDraggedElement = useHoloStore(state => state.setDraggedElement);
  const draggedElement    = useHoloStore(state => state.draggedElement);
  const addActiveElement  = useHoloStore(state => state.addActiveElement);
  const handPosition      = useHoloStore(state => state.handPosition);

  // Track per-hand state
  const lastElementPerHand = useRef<Map<number, HTMLElement>>(new Map());
  const wasPinchingPerHand = useRef<Map<number, boolean>>(new Map());

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

    allHands.forEach(hand => {
      const { handIdx, indexTip, isPinching } = hand;

      const x = indexTip.x * window.innerWidth;
      const y = indexTip.y * window.innerHeight;
      if (isNaN(x) || isNaN(y)) return;

      // Find interactable element under this hand's index finger
      const elements = document.elementsFromPoint(x, y);
      const interactable = elements.find(el => {
        if (!(el instanceof HTMLElement)) return false;
        const tag = el.tagName;
        const cursor = window.getComputedStyle(el).cursor;
        return (
          tag === 'BUTTON' ||
          cursor === 'pointer' ||
          el.dataset.virtualInteract === 'true'
        ) && !el.classList.contains('pointer-events-none') && el.style.display !== 'none';
      }) as HTMLElement | undefined;

      const lastEl = lastElementPerHand.current.get(handIdx);

      // Update hover state for this hand
      if (interactable !== lastEl) {
        lastEl?.classList.remove('virtually-hovered');
        if (interactable) {
          interactable.classList.add('virtually-hovered');
          anyHovering = true;
        }
        if (interactable) {
          lastElementPerHand.current.set(handIdx, interactable);
        } else {
          lastElementPerHand.current.delete(handIdx);
        }
      } else if (interactable) {
        anyHovering = true;
      }

      const wasPinching = wasPinchingPerHand.current.get(handIdx) ?? false;

      // Pinch START — perform action
      if (isPinching && !wasPinching) {
        if (interactable) {
          const elementSymbol = interactable.dataset.element;
          if (elementSymbol) {
            setDraggedElement(elementSymbol);
          } else {
            interactable.click();
            // Tap ripple
            const ripple = document.createElement('div');
            ripple.className = 'virtual-tap-ripple';
            ripple.style.cssText = `left:${x}px;top:${y}px;`;
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
          }
        }
      }

      // Pinch END — drop element
      if (!isPinching && wasPinching && draggedElement) {
        const nx = (indexTip.x - 0.5) * 10;
        const ny = (0.5 - indexTip.y) * 6;
        addActiveElement(draggedElement, [nx, ny, 0]);
        setDraggedElement(null);
      }

      wasPinchingPerHand.current.set(handIdx, isPinching);
    });

    setIsHovering(anyHovering);

  }, [allHands, isHandActive]);
};
