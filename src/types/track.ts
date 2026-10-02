export interface Track {
  id: string;
  title: string;
  artist: string;
  source_url: string;
  thumbnail_url?: string;
  genre: string;
  created_at?: string;
}

export type SortOption = 'latest' | 'alphabetical' | 'artist';

export type NavCategory = 'all' | 'favorites' | 'study' | 'new' | string;
