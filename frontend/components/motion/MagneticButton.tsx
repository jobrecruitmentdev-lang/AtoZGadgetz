'use client';
import { useRef } from 'react';
import gsap from 'gsap';

// Cursor-attraction on hover + elastic scale-press on click. Desktop only —
// pointer:coarse (touch) gets a plain button, no magnetic tracking.
export function MagneticButton({
  children,
  className,
  onClick,
}: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia('(pointer: coarse)').matches) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * 0.35;
    const y = (e.clientY - top - height / 2) * 0.35;
    gsap.to(ref.current, { x, y, duration: 0.4, ease: 'power2.out' });
  };

  const handleLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  const handleDown = () => ref.current && gsap.to(ref.current, { scale: 0.94, duration: 0.15 });
  const handleUp = () => ref.current && gsap.to(ref.current, { scale: 1, duration: 0.3, ease: 'back.out(2)' });

  return (
    <button
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
