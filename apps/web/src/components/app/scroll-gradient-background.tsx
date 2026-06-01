'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ScrollGradientBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const bg1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.3, 0]);
  const bg2Opacity = useTransform(scrollYProgress, [0.15, 0.4, 0.7], [0, 1, 0.2]);
  const bg3Opacity = useTransform(scrollYProgress, [0.5, 0.75, 1], [0, 0.8, 1]);

  const orbY1 = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);
  const orbY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const orbY3 = useTransform(scrollYProgress, [0, 1], ['0%', '-80%']);
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 0.9]);

  const meshRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1: Hero gradient — navy to deep blue */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: bg1Opacity,
          background:
            'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(16,36,74,0.28) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 80% 90%, rgba(38,78,155,0.12) 0%, transparent 50%)',
        }}
      />

      {/* Layer 2: Mid-section gradient — blue spread */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: bg2Opacity,
          background:
            'radial-gradient(ellipse 100% 70% at 30% 50%, rgba(38,78,155,0.18) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 80% 30%, rgba(16,36,74,0.14) 0%, transparent 50%)',
        }}
      />

      {/* Layer 3: Bottom CTA gradient — deep immersion */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: bg3Opacity,
          background:
            'radial-gradient(ellipse 90% 60% at 50% 80%, rgba(16,36,74,0.3) 0%, transparent 55%), radial-gradient(circle at 20% 60%, rgba(38,78,155,0.15) 0%, transparent 40%)',
        }}
      />

      {/* Dark mode layers */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        style={{
          opacity: bg1Opacity,
          background:
            'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(38,78,155,0.35) 0%, transparent 60%)',
        }}
      />
      <motion.div
        className="absolute inset-0 hidden dark:block"
        style={{
          opacity: bg3Opacity,
          background:
            'radial-gradient(ellipse 90% 60% at 50% 80%, rgba(38,78,155,0.25) 0%, transparent 55%)',
        }}
      />

      {/* Floating orbs with parallax */}
      <motion.div
        className="absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full"
        style={{
          y: orbY1,
          scale: orbScale,
          background: 'radial-gradient(circle, rgba(38,78,155,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        className="absolute right-[5%] top-[30%] h-[400px] w-[400px] rounded-full"
        style={{
          y: orbY2,
          background: 'radial-gradient(circle, rgba(16,36,74,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        className="absolute left-[40%] top-[60%] h-[600px] w-[600px] rounded-full"
        style={{
          y: orbY3,
          scale: orbScale,
          background: 'radial-gradient(circle, rgba(38,78,155,0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Rotating mesh grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          rotate: meshRotate,
          backgroundImage:
            'linear-gradient(rgba(38,78,155,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(38,78,155,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transformOrigin: 'center center',
        }}
      />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, #264E9B 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
