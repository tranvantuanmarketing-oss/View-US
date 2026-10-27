export type Role = "admin" | "staff";
export type Gender = "nu" | "nam";
export type Mood = "tuoi-sang" | "nhe-nhang" | "tram";
export type CardStatus = "pending_write" | "ready" | "used" | "error";
export type BatchStatus = "running" | "partial_failed" | "interrupted" | "queued" | "rendering" | "done" | "failed" | "cancelled" | "requested" | "processing" | "completed";
export type BatchItemStatus = "cancelled" | "queued" | "rendering" | "done" | "failed" | "pending" | "completed" | "leased";
export type PostType = "anh" | "bai-viet" | "video";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: Role;
  web_domain: string;
  created_at: string;
}

export interface TemplateLayer {
  label?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  size?: number;
  scale?: number;
  fg?: string;
  bg?: string;
  an?: number | boolean;
}

export interface TemplatePalette {
  id: string;
  name?: string;
  html: string;
  bgTpl?: string;
  bgMac?: {
    c1?: string;
    c2?: string;
    c3?: string;
    ink?: string;
  };
}

export interface Template {
  id: string; // slug e.g. "the-vet-cam-dao"
  slug: string;
  name: string;
  label?: string;
  group: string; // "the-vet", "anh-kinh", etc.
  duration: number;
  kindLabel?: string;
  motion?: boolean;
  nhan?: string[];
  layers: Record<string, TemplateLayer>;
  colorCount?: number;
  hasInk?: boolean;
  hasHighlight?: boolean;
  hasBar?: boolean;
  pals: TemplatePalette[];
}

export interface Avatar {
  owner_page_id?: string | null;
  id: string;
  image_path: string;
  url?: string;
  name: string;
  gender: Gender;
  age_min: number;
  age_max: number;
  used_by_page_ids: string[];
  created_at?: string;
}

export interface MusicTrack {
  id: string;
  file_path: string;
  title: string;
  mood: Mood;
  duration_sec: number;
  created_at?: string;
}

export interface PageTemplateSelection {
  template_id: string;
  palette_ids: string[];
}

export interface PageSettings {
  templates: PageTemplateSelection[];
  overrides?: Record<string, any>; // layer coordinates, custom colors, layer visibility
  avatar_ids: string[];
  music_mood: Mood;
  selected_track_ids?: string[]; // empty = use all tracks of chosen mood
  background_categories?: string[];
  updated_at?: string;
}

export interface Page {
  id: string;
  name: string;
  display_name?: string | null;
  locale: string; // 'fr' | 'nl' | 'de' | 'en' | 'es' | 'pl' | 'it' | 'vi' ...
  owner_staff_id: string | null;
  settings: PageSettings;
  created_at: string;
}

export interface Card {
  id: string;
  locale: string;
  category: string;
  status: CardStatus;
  source_viral_id?: string | null;
  author_name: string;
  author?: string;
  page?: string;
  gender?: Gender | null;
  age_hint?: number | null;
  time_label: string;
  title: string;
  body: string; // 5 lines
  content?: string;
  highlights: string[];
  cta: string;
  caption: string;
  first_comment: string;
  comment1?: string;
  avatar_hint: {
    gender?: Gender;
    age_hint?: number;
    relation?: string;
  };
  error?: string | null;
  reserved_by_batch_id?: string | null;
  used_by_page_id?: string | null;
  created_at: string;
}

export interface BatchItem {
  progress?: number;
  id: string;
  batch_id: string;
  seq?: number;
  card_id?: string;
  template_id: string;
  palette_id: string;
  avatar_id?: string | null;
  track_id?: string | null;
  music_track_id?: string | null;
  background_video_url?: string;
  story_payload?: any;
  duration?: number;
  resolution?: string;
  status: BatchItemStatus;
  output_path?: string | null;
  output_video_url?: string | null;
  error?: string | null;
  created_at: string;
  finished_at?: string | null;
}

export interface Batch {
  id: string;
  name: string;
  page_id: string;
  staff_id?: string;
  owner_staff_id?: string;
  count?: number;
  total_items?: number;
  mode?: "system" | "json";
  status: BatchStatus;
  done_count?: number;
  completed_items?: number;
  failed_items?: number;
  settings_snapshot?: PageSettings;
  helper_id?: string | null;
  target_helper_id?: string | null;
  created_at: string;
  finished_at?: string | null;
  items?: BatchItem[];
}

export interface HelperMachine {
  id: string;
  staff_id: string;
  name: string;
  key_hash: string;
  os: string;
  version: string;
  concurrency: number;
  last_seen_at?: string | null;
  cache_mb: number;
  revoked: boolean;
  created_at: string;
}

export interface ViralPost {
  id: string;
  source: string;
  page_name: string;
  page_followers: number;
  locale: string;
  post_type: PostType;
  caption: string;
  image_url?: string;
  comments: number;
  reactions: number;
  shares: number;
  posted_at?: string;
  fb_url?: string;
  has_web_link: boolean;
  imported_by?: string;
  created_at: string;
}
