import { z } from "zod";

const PostStatus = z.enum(["published", "scheduled", "drafts"]);
const PostType = z.enum(["newsletter", "podcast", "restack"]);

const ExtensionPost = z.object({
  id: z.number().int(),
  uuid: z.string().optional(),
  type: PostType,
  is_published: z.boolean(),
  title: z.string().nullable(),
  draft_title: z.string().nullable(),
  post_date: z.string().nullable(),
  trigger_at: z.string().optional(),
  cover_image: z.string().nullable(),
  bylines: z.array(z.any()).optional(),
  stats: z.record(z.string(), z.any()).optional(),
  headlineTest: z.any().optional(),
});

export const PublicationPayload = z.object({
  substackId: z.number().int(),
  name: z.string(),
  subdomain: z.string(),
  customDomain: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  paymentsState: z.string().nullable().optional(),
  posts: z.object({
    published: z.array(ExtensionPost),
    scheduled: z.array(ExtensionPost),
    drafts: z.array(ExtensionPost),
  }),
});

export const SyncPayload = z.object({
  publications: z.array(PublicationPayload).min(1),
});

export const DeletePayload = z.object({
  publicationId: z.string().min(1),
  substackPostIds: z.array(z.number().int()).min(1),
});

export type SyncPayloadT = z.infer<typeof SyncPayload>;
export type PublicationPayloadT = z.infer<typeof PublicationPayload>;
export type ExtensionPostT = z.infer<typeof ExtensionPost>;
