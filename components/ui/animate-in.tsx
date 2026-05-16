"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_SMOOTH },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerFastContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

/** Fade + slide-up wrapper that runs once on mount. */
export function AnimateIn({
  children,
  className,
  delay = 0,
  y = 16,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
} & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_SMOOTH, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its `<StaggerItem>` children in on mount. */
export function StaggerIn({
  children,
  className,
  fast = false,
}: {
  children: React.ReactNode;
  className?: string;
  fast?: boolean;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={fast ? staggerFastContainerVariants : staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

/** An item inside `<StaggerIn>` that fades + slides up. */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={cn(className)} variants={fadeUpVariants}>
      {children}
    </motion.div>
  );
}
