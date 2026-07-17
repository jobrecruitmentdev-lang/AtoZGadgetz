'use client';
import { useLayoutEffect, useRef } from 'react';
import React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

type Props = {
  children: string;
  as?: React.ElementType;
  split?: 'chars' | 'words' | 'lines';
  className?: string;
};

// Per-character for hero headlines, per-word for section titles, per-line for paragraphs.
export function RevealText({ children, as: Tag = 'h2', split = 'words', className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const splitter = new SplitType(ref.current, { types: split, tagName: 'span' });
    const targets = split === 'chars' ? splitter.chars : split === 'words' ? splitter.words : splitter.lines;
    if (!targets) return;

    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return () => splitter.revert();
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: '100%' });
      gsap.to(targets, {
        opacity: 1,
        y: '0%',
        duration: 0.8,
        stagger: split === 'chars' ? 0.02 : 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });
    });

    return () => {
      ctx.revert();
      splitter.revert();
    };
  }, [split]);

  return (
    <Tag ref={ref as any} className={className} style={{ overflow: 'hidden' }}>
      {children}
    </Tag>
  );
}
