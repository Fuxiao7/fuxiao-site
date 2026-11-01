export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  statusKey: string;
  sortOrder: number;
  visible: boolean;
  articleCount?: number;
  createdAt?: string;
}

export type BlockType = "p" | "h2" | "q" | "code" | "img";

export interface Block {
  t: BlockType;
  text?: string | null;
  src?: string | null;
  alt?: string | null;
  cap?: string | null;
}

export type ArticleStatus = "draft" | "published" | "offline";

export interface Article {
  id?: number;
  slug: string;
  title: string;
  cover?: string | null;
  coverAlt?: string | null;
  excerpt?: string | null;
  deck?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  statusKey: string;
  publishedAt?: string | null;
  author?: string | null;
  location?: string | null;
  featured?: boolean;
  status: ArticleStatus;
  views?: number;
  wordCount?: number;
  readingMinutes?: number;
  tags: string[];
  blocks: Block[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleOption {
  id: number;
  title: string;
  slug: string;
}

export interface TagStat {
  name: string;
  count: number;
}

export interface SpecItem {
  k: string;
  v: string;
}

export interface Shot {
  img: string;
  alt?: string | null;
  cap?: string | null;
}

export interface Album {
  id?: number;
  slug: string;
  title: string;
  cover?: string | null;
  coverAlt?: string | null;
  albumYear?: number | null;
  lead?: string | null;
  meta: string[];
  specs: SpecItem[];
  why: string[];
  quote: string[];
  story: string[];
  storyQuote: string[];
  process: SpecItem[];
  run1: Shot[];
  run2: Shot[];
  sortOrder: number;
  published: boolean;
  shots?: number;
  nextAlbumId?: number | null;
  nextAlbumTitle?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Moment {
  id?: number;
  occurredAt: string;
  tagKey: string;
  tagLabel: string;
  body: string[];
  images: string[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: number;
  title: string;
  status: string;
  progress: number;
  summary?: string | null;
  period?: string | null;
  spec: string[];
  images: string[];
  tags: string[];
  sortOrder: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpcomingProject {
  id?: number;
  title: string;
  note?: string | null;
  sortOrder: number;
  visible: boolean;
  createdAt?: string;
}

export interface Photo {
  id?: number;
  title: string;
  exif?: string | null;
  image: string;
  alt?: string | null;
  collection: "wall" | "scatter";
  shotOn?: string | null;
  sortOrder: number;
  visible: boolean;
  createdAt?: string;
}

export interface Friend {
  id?: number;
  name: string;
  site?: string | null;
  url?: string | null;
  description?: string | null;
  avatar?: string | null;
  sortOrder: number;
  visible: boolean;
  createdAt?: string;
}

export interface ArchiveEntry {
  id?: number;
  entryDate: string;
  title: string;
  categoryName?: string | null;
  articleId?: number | null;
  createdAt?: string;
}

export interface SyncResult {
  created: number;
  updated: number;
  removed: number;
  total: number;
}

export interface AboutColumn {
  title: string;
  items: string[];
}

export interface AboutProfile {
  id?: number;
  displayName?: string | null;
  subtitle?: string | null;
  meta?: string | null;
  portrait?: string | null;
  portraitAlt?: string | null;
  portraitCaption?: string | null;
  bio: string[];
  cols: AboutColumn[];
  credits: string[];
  email?: string | null;
  github?: string | null;
  twitter?: string | null;
  updatedAt?: string;
}

export interface SiteSetting {
  id: number;
  settingKey: string;
  groupKey: string;
  label: string;
  value: string | null;
  inputType: "text" | "textarea";
  sortOrder: number;
  updatedAt?: string;
}

export interface NowItem {
  id?: number;
  label: string;
  value: string;
  note?: string | null;
  sortOrder?: number;
}

export type SubmissionStatus = "pending" | "accepted" | "rejected";

export interface Submission {
  id: number;
  title: string;
  authorName: string;
  authorEmail?: string | null;
  authorSite?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  cover?: string | null;
  excerpt?: string | null;
  content: string;
  status: SubmissionStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  articleId?: number | null;
}

export interface MediaAsset {
  id: number;
  name: string;
  path: string;
  source: "BLOG" | "UPLOAD";
  mime?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt?: string;
}

export interface User {
  id: number;
  username: string;
  nickname?: string | null;
  role: string;
  email?: string | null;
  avatar?: string | null;
  enabled: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface OperationLog {
  id: number;
  username?: string | null;
  module?: string | null;
  action?: string | null;
  target?: string | null;
  detail?: string | null;
  ip?: string | null;
  createdAt: string;
}

export interface DashboardHealth {
  key: string;
  label: string;
  count: number;
  level: "ok" | "warn";
  hint: string;
}

export interface DashboardData {
  counts: Record<string, number>;
  trend: { month: string; count: number }[];
  categories: { name: string; count: number; color: string }[];
  recentSubmissions: Submission[];
  recentLogs: OperationLog[];
  health: DashboardHealth[];
  submissionCounts: Record<string, number>;
}

export interface ArticleQuery {
  keyword?: string;
  categoryId?: number | null;
  status?: string;
  featured?: boolean | null;
  page?: number;
  size?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SitePublic {
  copy: Record<string, string>;
  categories: Category[];
  now: NowItem[];
}

export interface ExportPreview {
  content: Record<string, unknown>;
  articleCount: number;
}

export interface UploadResult {
  id: number;
  name: string;
  path: string;
  source: string;
  mime?: string;
  size?: number;
  width?: number;
  height?: number;
}

export type PublishState = "idle" | "running" | "success" | "failed";

export interface PublishStatus {
  enabled: boolean;
  state: PublishState;
  message: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  log: string;
}
