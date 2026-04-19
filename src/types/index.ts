export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Item {
  id: string;
  category_id: string;
  title: string;
  creator: string | null;
  release_date: string | null;
  image_url: string | null;
  rating: number | null;
  review: string | null;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GeminiCandidate {
  category: string;
  title: string;
  creator: string;
  release_date: string;
  image_search_query: string;
}

export type SortMode = "rating" | "reviewed_at" | "release_date";

export const DEFAULT_CATEGORIES = ["음악", "영화", "애니", "책"];
