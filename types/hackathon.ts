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
  projects?: Project[]; // Add projects field
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
  submittedBy: string; // Add submittedBy field
  technologies?: string[]; // Add optional fields
  challenges?: string;
  achievements?: string;
  futureWork?: string;
  files?: any[];
  teamInfo?: {
    members: TeamMember[];
  };
  scores?: Score[];
  totalScore?: number;
  rank?: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  hackathonId: string;
  leaderId: string;
  members: TeamMember[];
  inviteCode: string;
  maxMembers: number;
  isPublic: boolean;
  skills: string[];
  lookingFor: string[];
  ipfsHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  joinedAt: string;
  skills?: string[];
}

export interface Score {
  judgeId: string;
  criteria: string;
  score: number;
  feedback: string;
  submittedAt: string;
}
