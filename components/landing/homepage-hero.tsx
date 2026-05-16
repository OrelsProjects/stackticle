"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE_SMOOTH } from "@/components/ui/animate-in";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_SMOOTH },
  },
};

export function HomepageHero() {
  return (
    <motion.div
      className="max-w-md text-center space-y-6"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.div
        variants={item}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground-2"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
        For Substack writers with more than a handful of posts
      </motion.div>

      <motion.h1 variants={item} className="text-4xl font-semibold tracking-tight">
        The batch-actions toolbar
        <br />
        <span className="text-primary">Substack forgot.</span>
      </motion.h1>

      <motion.p variants={item} className="text-foreground-2">
        Sign in to sync your archive from the StackTicle Chrome extension.
      </motion.p>

      <motion.div variants={item}>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-ink shadow-[0_8px_24px_-16px_var(--primary)] hover:brightness-110 transition-[filter]"
        >
          Sign in with Google
        </Link>
      </motion.div>
    </motion.div>
  );
}
