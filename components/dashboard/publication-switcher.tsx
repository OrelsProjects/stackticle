"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { startNavigation, endNavigation } from "@/store/nav-slice";
import { EASE_SMOOTH } from "@/components/ui/animate-in";

export interface PubItem {
  id: string;
  name: string;
  subdomain: string;
  isPrimary: boolean;
}

export function PublicationSwitcher({
  publications,
  currentPublicationId,
}: {
  publications: PubItem[];
  currentPublicationId?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const current = publications.find((p) => p.id === currentPublicationId) ?? publications[0];

  useEffect(() => {
    if (isPending) dispatch(startNavigation());
    else dispatch(endNavigation());
  }, [isPending, dispatch]);

  function handleSelect(pubId: string) {
    if (pubId === currentPublicationId) return;
    setOpen(false);
    startTransition(() => {
      router.push(`/dashboard/${pubId}`);
    });
  }

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <Button
          clean
          className="gap-2 border border-border bg-card px-3 py-1.5 hover:border-border-2"
        >
          <span className="font-medium">{current?.name ?? "Pick publication"}</span>
          {current?.isPrimary && (
            <span className="font-mono text-[10px] tracking-wider uppercase text-primary">
              primary
            </span>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: EASE_SMOOTH }}
            className="inline-flex"
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.span>
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <AnimatePresence>
          {open && (
            <Dropdown.Content
              forceMount
              sideOffset={6}
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.18, ease: EASE_SMOOTH }}
                className="min-w-[240px] rounded-lg border border-border bg-background p-1 shadow-2xl z-50"
              >
                {publications.map((p) => (
                  <Dropdown.Item
                    key={p.id}
                    onSelect={() => handleSelect(p.id)}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none cursor-pointer data-[highlighted]:bg-card"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.subdomain}.substack.com</span>
                    </div>
                    {p.id === current?.id && <Check className="h-4 w-4 text-primary" />}
                  </Dropdown.Item>
                ))}
              </motion.div>
            </Dropdown.Content>
          )}
        </AnimatePresence>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
