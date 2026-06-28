export interface User {
  id: string;
  auth0Id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Favorite {
  id: string;
  type: 'CHARACTER' | 'LOCATION' | 'EPISODE';
  externalId: number | string;
  name: string;
  image?: string;
  createdAt: string;
}