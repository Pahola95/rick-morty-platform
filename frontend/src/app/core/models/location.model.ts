export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
}

export interface LocationStats {
  total: number;
  types: { [key: string]: number };
  dimensions: { [key: string]: number };
}