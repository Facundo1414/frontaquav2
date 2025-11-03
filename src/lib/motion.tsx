/**
 * 🚀 OPTIMIZED FRAMER MOTION COMPONENTS
 * 
 * Lazy-loaded motion components to reduce initial bundle size.
 * Framer Motion es ~150KB - solo cargar cuando se necesita.
 * 
 * Usage:
 * ```tsx
 * import { motion, AnimatePresence } from '@/lib/motion'
 * 
 * <AnimatePresence>
 *   <motion.div animate={{ opacity: 1 }}>
 *     Content
 *   </motion.div>
 * </AnimatePresence>
 * ```
 */

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Placeholder sin animación para SSR
const StaticDiv = (props: any) => <div {...props} />;

/**
 * Motion components (lazy loaded)
 */
export const motion = {
  div: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.div),
    {
      ssr: false,
      loading: () => <StaticDiv />,
    }
  ),
  
  button: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.button),
    {
      ssr: false,
      loading: () => <button />,
    }
  ),
  
  span: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.span),
    {
      ssr: false,
      loading: () => <span />,
    }
  ),
  
  section: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.section),
    {
      ssr: false,
      loading: () => <section />,
    }
  ),
  
  h2: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.h2),
    {
      ssr: false,
      loading: () => <h2 />,
    }
  ),
  
  p: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.p),
    {
      ssr: false,
      loading: () => <p />,
    }
  ),
  
  img: dynamic(
    () => import('framer-motion').then((mod) => mod.motion.img),
    {
      ssr: false,
      loading: () => <img alt="" />,
    }
  ),
};

/**
 * AnimatePresence component (lazy loaded)
 */
export const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  {
    ssr: false,
  }
);

// Re-export types for convenience
export type { Variants, Transition, MotionProps } from 'framer-motion';
