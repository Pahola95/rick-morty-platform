export interface Episode {
  id: number | string;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string | null;
  created: string;
  isLocal?: boolean;
}

export interface EpisodeStats {
  total: number;
  perSeason: { [key: string]: number };
}