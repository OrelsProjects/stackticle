"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE_SMOOTH } from "@/components/ui/animate-in";

export function SignInCard({ action }: { action: () => Promise<void> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_SMOOTH }}
      className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 space-y-6 shadow-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.12, ease: EASE_SMOOTH }}
        className="text-center space-y-1"
      >
        <div className="mx-auto h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary" />
        <h1 className="text-xl font-semibold tracking-tight">Sign in to StackTicle</h1>
        <p className="text-sm text-foreground-2">Google sign-in only.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.28 }}
      >
        <form action={action}>
          <Button
            clean
            type="submit"
            className="w-full gap-2 bg-primary px-4 py-2.5 text-primary-ink shadow-[0_8px_24px_-16px_var(--primary)] hover:brightness-110"
          >
            Continue with Google
          </Button>
        </form>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.38 }}
        className="text-xs text-muted-foreground text-center"
      >
        We only store the data your Substack archive needs to render this dashboard.
      </motion.p>
    </motion.div>
  );
}
