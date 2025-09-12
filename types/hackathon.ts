export interface Hackathon {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: 'upcoming' | 'active' | 'ended';
  participants: number;
  maxParticipants?: number;
  prizes: Prize[];
  judges: Judge[];
  tracks: Track[];
  requirements: string[];
  rules: string[];
  ipfsHash: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prize {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  position: number;
}

export interface Judge {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Track {
  id: string;
  name: string;
  description: string;
  criteria: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  team: TeamMember[];
  hackathonId: string;
  trackId: string;
  repositoryUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  ipfsHash: string;
  submittedAt: string;
  scores?: Score[];
  totalScore?: number;
  rank?: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
}

export interface Score {
  judgeId: string;
  criteria: string;
  score: number;
  feedback: string;
  submittedAt: string;
}
