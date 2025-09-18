import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

// Optimized custom cursor: smaller footprint, activates ONLY over target elements.
// Shows rotating square when idle (not over a target) is removed for simplicity – we only display on targets.

const TargetCursor = ({
  targetSelector = '.cursor-target, button, .btn, .win-btn, .title-row, .pomo-mode-btn'
}) => {
  const cursorRef = useRef(null);
  const corners = useRef([]);
  const spinTl = useRef(null);
  const dotRef = useRef(null);
  const activeTargetRef = useRef(null);
  const constants = useMemo(() => ({ borderWidth: 2, cornerSize: 8, parallaxStrength: 0.00004 }), []);

  // Move cursor (batched, fast)
  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, { x, y, duration: 0.12, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;

  const cursorEl = cursorRef.current;
  gsap.set(cursorEl, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  corners.current = Array.from(cursorEl.querySelectorAll('.target-cursor-corner'));
  document.body.classList.add('cursor-hidden');

  let rafCorners = null;
  const updateCorners = (target, mx, my) => {
      if (!target || !cursorRef.current) return;
      const { borderWidth, cornerSize, parallaxStrength } = constants;
      const rect = target.getBoundingClientRect();
      const cursorRect = cursorRef.current.getBoundingClientRect();
      const cx = cursorRect.left + cursorRect.width / 2;
      const cy = cursorRect.top + cursorRect.height / 2;
      let offsets = [
        { x: rect.left - cx - borderWidth, y: rect.top - cy - borderWidth },
        { x: rect.right - cx + borderWidth - cornerSize, y: rect.top - cy - borderWidth },
        { x: rect.right - cx + borderWidth - cornerSize, y: rect.bottom - cy + borderWidth - cornerSize },
        { x: rect.left - cx - borderWidth, y: rect.bottom - cy + borderWidth - cornerSize }
      ];
      if (mx != null && my != null) {
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;
        const ox = (mx - tx) * parallaxStrength;
        const oy = (my - ty) * parallaxStrength;
        offsets = offsets.map(o => ({ x: o.x + ox, y: o.y + oy }));
      }
      corners.current.forEach((c, i) => {
        gsap.to(c, { x: offsets[i].x, y: offsets[i].y, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      });
    };

    const inwardReset = () => {
      const { cornerSize } = constants;
      corners.current.forEach((c, i) => {
        const inward = [
          { x: -cornerSize * 1.2, y: -cornerSize * 1.2 },
          { x: cornerSize * 0.2, y: -cornerSize * 1.2 },
          { x: cornerSize * 0.2, y: cornerSize * 0.2 },
          { x: -cornerSize * 1.2, y: cornerSize * 0.2 }
        ][i];
        gsap.set(c, { x: inward.x, y: inward.y });
      });
    };
    inwardReset();

    const mouseMove = e => {
      moveCursor(e.clientX, e.clientY);
      const hovered = e.target.closest(targetSelector);
      // Changed target
      if (hovered !== activeTargetRef.current) {
        if (!hovered && activeTargetRef.current) {
          // leaving old target
            inwardReset();
            cursorEl.classList.remove('on-target');
        }
        if (hovered) {
          activeTargetRef.current = hovered;
          cursorEl.classList.add('on-target');
          updateCorners(hovered, e.clientX, e.clientY);
        } else {
          activeTargetRef.current = null;
        }
      } else if (hovered && activeTargetRef.current) {
        if (!rafCorners) {
          rafCorners = requestAnimationFrame(() => {
            updateCorners(activeTargetRef.current, e.clientX, e.clientY);
            rafCorners = null;
          });
        }
      }
    };
    window.addEventListener('mousemove', mouseMove, { passive: true });

    const down = () => { if (dotRef.current) gsap.to(dotRef.current, { scale: 0.65, duration: 0.2 }); };
    const up = () => { if (dotRef.current) gsap.to(dotRef.current, { scale: 1, duration: 0.25 }); };
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.body.classList.remove('cursor-hidden');
    };
  }, [moveCursor, targetSelector, constants]);

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;
