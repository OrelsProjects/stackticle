import { z } from "zod";

// --- Posts (per-publication post sync) ---

const PostStatusEnum = z.enum(["published", "scheduled", "drafts"]);
const PostTypeEnum = z.enum(["newsletter", "podcast", "restack"]);

export const ExtensionPostSchema = z
  .object({
    id: z.number().int(),
    uuid: z.string().optional(),
    type: PostTypeEnum,
    is_published: z.boolean(),
    title: z.string().nullable(),
    draft_title: z.string().nullable(),
    post_date: z.string().nullable(),
    trigger_at: z.string().optional(),
    cover_image: z.string().nullable(),
    bylines: z.array(z.any()).optional(),
    stats: z.record(z.string(), z.any()).optional(),
    headlineTest: z.any().optional(),
  })
  // Allow the richer canonical fields through without complaining.
  .passthrough();

export const PostsSyncPayload = z.object({
  publicationId: z.string().min(1),
  posts: z.object({
    published: z.array(ExtensionPostSchema),
    scheduled: z.array(ExtensionPostSchema),
    drafts: z.array(ExtensionPostSchema),
  }),
});

// --- SyncUserResult (identity + publications, no posts) ---

const ExtensionPublication = z
  .object({
    id: z.number().int(),
    name: z.string(),
    subdomain: z.string(),
    custom_domain: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    payments_state: z.enum(["enabled", "disabled"]).nullable().optional(),
  })
  .passthrough();

export const SyncUserPayload = z.object({
  syncedAt: z.string().min(1),
  profile: z.object({
    id: z.number().int(),
    handle: z.string().min(1),
    name: z.string().min(1),
    photoUrl: z.string().nullable().optional(),
  }),
  publications: z
    .array(
      z.object({
        publication: ExtensionPublication,
        role: z.enum(["admin", "writer"]),
        isPrimary: z.boolean(),
      }),
    )
    .min(1),
});

// --- Delete payload (unchanged) ---

export const DeletePayload = z.object({
  publicationId: z.string().min(1),
  substackPostIds: z.array(z.number().int()).min(1),
});

export type ExtensionPostT = z.infer<typeof ExtensionPostSchema>;
export type PostsSyncPayloadT = z.infer<typeof PostsSyncPayload>;
export type SyncUserPayloadT = z.infer<typeof SyncUserPayload>;
