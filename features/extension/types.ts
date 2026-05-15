// Canonical Substack types — mirrors the extension's own types
// (src/types/post.type.ts in the extension). Keep these in sync with the
// extension; downstream consumers depend on the exact field names.

export type PostStatus = "published" | "scheduled" | "drafts";
export type PostType = "newsletter" | "podcast" | "restack";
export type PostOrderBy = "post_date" | "draft_updated_at";
export type PostOrderDirection = "asc" | "desc";

export interface PostByline {
  id: number;
  name: string;
  handle: string;
  previous_name: string | null;
  photo_url: string;
  bio: string;
  profile_set_up_at: string;
  reader_installed_at: string;
}

export interface PostStats {
  views: number;
  opens: number;
  opened: number;
  open_rate: number;
  clicked: number;
  clicks: number;
  sent: number;
  delivered: number;
  downloads: number;
  downloads_day7: number;
  downloads_day30: number;
  downloads_day90: number;
  podcast_preview_downloads: number;
  podcast_preview_downloads_day30: number;
  video_views: number;
  video_minutes_watched: number;
  signups_within_1_day: number;
  disables_within_1_day: number;
  subscriptions_within_1_day: number;
  unsubscribes_within_1_day: number;
  signups: number;
  subscribes: number;
  shares: number;
  estimated_value: number;
  click_through_rate?: number;
  engagement_rate?: number;
}

export interface HeadlineTestOption {
  id: number;
  headline_test_id: number;
  headline: string;
  subtitle: string | null;
  created_at: string;
  updated_at: string;
  emails_opened: number;
  emails_sent: number;
  is_winner: boolean | null;
  is_default: boolean;
}

export interface HeadlineTest {
  post_id: number;
  starts_at: string | null;
  ended_at: string | null;
  planned_duration_ms: number;
  test_cohort_percent: number;
  created_at: string;
  updated_at: string;
  test_cohort_emailed: boolean;
  main_cohort_emailed: boolean;
  creator_id: number;
  ended_early: boolean | null;
  winner_overridden: boolean | null;
  options: HeadlineTestOption[];
}

export interface Post {
  id: number;
  uuid: string;
  editor_v2: boolean;
  publication_id: number;
  type: PostType;
  post_date: string | null;
  draft_created_at: string | null;
  email_sent_at: string | null;
  is_published: boolean;
  title: string | null;
  draft_title: string | null;
  draft_updated_at: string | null;
  draft_video_upload_id: string | null;
  audience: string;
  slug: string | null;
  should_send_email: boolean | null;
  write_comment_permissions: string;
  default_comment_sort: string | null;
  section_id: number | null;
  cover_image: string | null;
  should_send_free_preview: boolean;
  video_upload_id: string | null;
  meter_type: string;
  section_slug: string | null;
  section_name: string | null;
  draft_section_name: string | null;
  is_section_pinned: boolean;
  reactions: Record<string, number>;
  reaction: string | null;
  top_exclusions: unknown[];
  pins: number[];
  trigger_at?: string;
  publishedBylines: PostByline[];
  draftBylines: PostByline[];
  reaction_count: number;
  comment_count: number;
  child_comment_count: number;
  bylines: PostByline[];
  stats: PostStats;
  republishedPosts: unknown | null;
  headlineTest: HeadlineTest | null;
}

export interface PostsResponse {
  posts: Post[];
  offset?: number;
  limit?: number;
  total?: number;
  isCapped?: boolean;
}

export interface FetchPostsParams {
  newsletterUrl: string;
  status: PostStatus;
  offset?: number;
  limit?: number;
  orderBy?: PostOrderBy;
  orderDirection?: PostOrderDirection;
}

export interface PublicationAuthor {
  id: number;
  name: string;
  handle: string;
  previous_name: string | null;
  photo_url: string;
  bio: string;
  profile_set_up_at: string;
  reader_installed_at: string;
}

export interface Publication {
  id: number;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  custom_domain_optional: boolean;
  hero_text: string;
  logo_url: string;
  logo_url_wide: string | null;
  author_id: number;
  primary_user_id: number | null;
  theme_var_background_pop: string;
  created_at: string;
  email_from_name: string | null;
  copyright: string;
  founding_plan_name: string | null;
  community_enabled: boolean;
  invite_only: boolean;
  payments_state: "disabled" | "enabled";
  language: string | null;
  explicit: boolean;
  homepage_type: string;
  is_personal_mode: boolean;
  author: PublicationAuthor;
}

export interface PublicationUser {
  id: number;
  user_id: number;
  publication_id: number;
  role: "admin" | "writer";
  public: boolean;
  is_primary: boolean;
  publication: Publication;
}

export interface UserLink {
  id: number;
  value: string;
  url: string;
  type: string | null;
  label: string;
}

export interface UserPublicationsResponse {
  id: number;
  name: string;
  handle: string;
  previous_name: string | null;
  photo_url: string;
  bio: string;
  profile_set_up_at: string;
  reader_installed_at: string;
  tos_accepted_at: string | null;
  profile_disabled: boolean;
  userLinks: UserLink[];
  publicationUsers: PublicationUser[];
}

export interface DeleteArticleResult {
  postId: number;
  success: boolean;
  error?: string;
}

// --- syncUser bundle: identity + publication memberships, no posts.

export interface SyncUserProfile {
  id: number;
  handle: string;
  name: string;
  photoUrl: string | null;
}

export interface SyncUserPublication {
  publication: Publication;
  role: "admin" | "writer";
  isPrimary: boolean;
}

export interface SyncUserResult {
  syncedAt: string; // ISO timestamp from the extension
  profile: SyncUserProfile;
  publications: SyncUserPublication[];
}

// Background message envelope (extension API_REQUEST).
export type ExtensionAction =
  | "syncUser"
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
  success: true;
  data: T;
}
export interface ExtensionFailure {
  success: false;
  error: string;
}
export type ExtensionResponse<T> = ExtensionSuccess<T> | ExtensionFailure;

// Back-compat aliases — earlier code imports `ExtensionPost`. Both names
// resolve to the canonical Substack `Post` interface above.
export type ExtensionPost = Post;
