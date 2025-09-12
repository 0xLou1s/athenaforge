export interface User {
  id: string;
  address: string;
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  github?: string;
  twitter?: string;
  telegram?: string;
  skills: string[];
  reputation: number;
  createdAt: string;
  updatedAt: string;
}
