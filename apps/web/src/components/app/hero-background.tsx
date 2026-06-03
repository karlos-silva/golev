'use client';

import { motion } from 'framer-motion';

function Triangle({
  size,
  delay,
  duration,
  x,
  y,
}: {
  size: number;
  delay: number;
  duration: number;
  x: string;
  y: string;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{
        opacity: [0, 0.4, 0.25, 0.4, 0],
        rotate: [0, 60, 120, 180, 240],
        scale: [0.8, 1, 1.15, 1, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="50,5 95,90 5,90"
          stroke="#059669"
          strokeWidth="1.5"
          fill="rgba(38,78,155,0.04)"
        />
      </svg>
    </motion.div>
  );
}

function GlowOrb({
  x,
  y,
  size,
  color,
  delay,
  duration,
}: {
  x: string;
  y: string;
  size: number;
  color: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        filter: 'blur(80px)',
      }}
      animate={{
        opacity: [0.25, 0.45, 0.25],
        scale: [1, 1.15, 1],
        x: [0, 40, -30, 0],
        y: [0, -30, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function FloatingLine({
  x,
  y,
  width,
  angle,
  delay,
  duration,
}: {
  x: string;
  y: string;
  width: number;
  angle: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute h-px"
      style={{
        left: x,
        top: y,
        width,
        transform: `rotate(${angle}deg)`,
        background: 'linear-gradient(90deg, transparent, rgba(38,78,155,0.35), transparent)',
      }}
      animate={{
        opacity: [0, 0.5, 0],
        scaleX: [0.5, 1, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,36,74,0.22),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(38,78,155,0.25),transparent)]" />

      {/* Secondary gradient bottom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_90%,rgba(38,78,155,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_70%_90%,rgba(38,78,155,0.15),transparent)]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #059669 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Animated glow orbs */}
      <GlowOrb x="10%" y="15%" size={450} color="rgba(38,78,155,0.18)" delay={0} duration={12} />
      <GlowOrb x="60%" y="5%" size={400} color="rgba(16,36,74,0.15)" delay={2} duration={14} />
      <GlowOrb x="35%" y="55%" size={350} color="rgba(38,78,155,0.12)" delay={4} duration={16} />

      {/* Floating triangles */}
      <Triangle x="8%" y="12%" size={70} delay={0} duration={20} />
      <Triangle x="82%" y="18%" size={50} delay={3} duration={18} />
      <Triangle x="20%" y="68%" size={55} delay={6} duration={22} />
      <Triangle x="72%" y="60%" size={40} delay={9} duration={19} />
      <Triangle x="48%" y="8%" size={45} delay={5} duration={21} />
      <Triangle x="92%" y="45%" size={35} delay={7} duration={17} />

      {/* Floating accent lines */}
      <FloatingLine x="5%" y="30%" width={200} angle={-15} delay={0} duration={8} />
      <FloatingLine x="70%" y="70%" width={180} angle={20} delay={3} duration={10} />
      <FloatingLine x="40%" y="85%" width={150} angle={-8} delay={5} duration={9} />

      {/* Top edge glow */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 10%, rgba(38,78,155,0.5) 50%, transparent 90%)',
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
