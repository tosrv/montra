import { useCallback, useEffect, useRef } from 'react';

const MOBILE_QUERY = '(max-width: 639px)';

/** True when the touch started inside a scrolled child, so the gesture should scroll it. */
function isInsideScrolledChild(target: EventTarget | null, sheet: HTMLElement): boolean {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== sheet) {
    if (node.scrollTop > 0) return true;
    node = node.parentElement;
  }
  return false;
}

/**
 * Swipe-down-to-close for bottom sheets (phones only).
 * Returns a callback ref to put on the sheet panel element.
 */
export function useSheetDrag(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((el: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    let startY = 0;
    let startTime = 0;
    let dy = 0;
    let tracking = false;
    let dragging = false;

    const onStart = (e: TouchEvent) => {
      if (!window.matchMedia(MOBILE_QUERY).matches || e.touches.length !== 1) return;
      if (el.scrollTop > 0 || isInsideScrolledChild(e.target, el)) return;
      tracking = true;
      dragging = false;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      dy = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      dy = e.touches[0].clientY - startY;
      if (!dragging) {
        if (dy < 6) {
          if (dy < 0) tracking = false; // scrolling up: let content scroll
          return;
        }
        dragging = true;
        el.style.transition = 'none';
      }
      e.preventDefault();
      el.style.transform = `translateY(${Math.max(0, dy)}px)`;
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;

      const velocity = dy / Math.max(1, Date.now() - startTime);
      const shouldClose = dy > Math.min(140, el.offsetHeight * 0.3) || velocity > 0.6;

      el.style.transition = 'transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)';
      if (shouldClose) {
        el.style.transform = 'translateY(100%)';
        window.setTimeout(() => onCloseRef.current(), 180);
      } else {
        el.style.transform = '';
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);

    cleanupRef.current = () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, []);
}
