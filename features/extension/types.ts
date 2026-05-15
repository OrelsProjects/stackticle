// Mirrors the extension API documented in posts.handlers.ts.

export type PostStatus = "published" | "scheduled" | "drafts";
export type PostType = "newsletter" | "podcast" | "restack";
export type PostOrderBy = "post_date" | "draft_updated_at";
export type PostOrderDirection = "asc" | "desc";

export interface PostByline {
  id?: number;
  name?: string;
  handle?: string;
  photo_url?: string;
}

export interface PostStats {
  views?: number;
  opens?: number;
  clicks?: number;
  sent?: number;
  open_rate?: number;
  click_rate?: number;
  comments?: number;
  likes?: number;
  [k: string]: unknown;
}

export interface HeadlineTest {
  id?: number;
  variants?: unknown[];
  [k: string]: unknown;
}

export interface ExtensionPost {
  id: number;
  uuid?: string;
  type: PostType;
  is_published: boolean;
  title: string | null;
  draft_title: string | null;
  post_date: string | null;
  trigger_at?: string;
  cover_image: string | null;
  bylines?: PostByline[];
  stats?: PostStats;
  headlineTest?: HeadlineTest | null;
}

export interface PostsResponse {
  posts: ExtensionPost[];
  offset?: number;
  limit?: number;
  total?: number;
  isCapped?: boolean;
}

export interface Publication {
  id: number;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  payments_state: "enabled" | "disabled";
  is_primary: boolean;
  logo_url: string;
}

export interface PublicationUser {
  publication: Publication;
}

export interface UserPublicationsResponse {
  publicationUsers: PublicationUser[];
  id?: number;
  handle?: string;
  name?: string;
}

export interface DeleteArticleResult {
  postId: number;
  success: boolean;
  error?: string;
}

// Background message envelope.
export type ExtensionAction =
  | "fetchPublishedPosts"
  | "fetchScheduledPosts"
  | "fetchDraftPosts"
  | "fetchPosts"
  | "deleteArticleMany"
  | "getUserPublications";

export interface ExtensionRequest {
  type: "API_REQUEST";
  action: ExtensionAction;
  payload: Record<string, unknown>;
}

export interface ExtensionSuccess<T> {
  ok: true;
  data: T;
}
export interface ExtensionFailure {
  ok: false;
  error: string;
}
export type ExtensionResponse<T> = ExtensionSuccess<T> | ExtensionFailure;
