"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const current = publications.find((p) => p.id === currentPublicationId) ?? publications[0];

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:border-border-2">
          <span className="font-medium">{current?.name ?? "Pick publication"}</span>
          {current?.isPrimary && (
            <span className="font-mono text-[10px] tracking-wider uppercase text-accent">
              primary
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          sideOffset={6}
          className="min-w-[240px] rounded-lg border border-border bg-bg-2 p-1 shadow-2xl"
        >
          {publications.map((p) => (
            <Dropdown.Item
              key={p.id}
              onSelect={() => router.push(`/dashboard/${p.id}`)}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none cursor-pointer data-[highlighted]:bg-surface-2"
            >
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-muted">{p.subdomain}.substack.com</span>
              </div>
              {p.id === current?.id && <Check className="h-4 w-4 text-accent" />}
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
