export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
  fromCache?: boolean;
}

export interface CharacterStats {
  total: number;
  alive: number;
  dead: number;
  unknown: number;
  species: { [key: string]: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: {
    info: { count: number; pages: number; next: string; prev: string };
    results: T[];
  };
}