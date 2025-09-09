import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface HackathonState {
  hackathons: Hackathon[];
  currentHackathon: Hackathon | null;
  userProjects: Project[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setHackathons: (hackathons: Hackathon[]) => void;
  addHackathon: (hackathon: Hackathon) => void;
  updateHackathon: (id: string, updates: Partial<Hackathon>) => void;
  setCurrentHackathon: (hackathon: Hackathon | null) => void;
  setUserProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useHackathonStore = create<HackathonState>()(
  persist(
    (set, get) => ({
      hackathons: [],
      currentHackathon: null,
      userProjects: [],
      isLoading: false,
      error: null,

      setHackathons: (hackathons) => set({ hackathons }),
      addHackathon: (hackathon) => {
        const currentHackathons = get().hackathons;
        set({ hackathons: [...currentHackathons, hackathon] });
      },
      updateHackathon: (id, updates) => {
        const currentHackathons = get().hackathons;
        const updatedHackathons = currentHackathons.map(hackathon =>
          hackathon.id === id
            ? { ...hackathon, ...updates, updatedAt: new Date().toISOString() }
            : hackathon
        );
        set({ hackathons: updatedHackathons });
      },
      setCurrentHackathon: (hackathon) => set({ currentHackathon: hackathon }),
      setUserProjects: (projects) => set({ userProjects: projects }),
      addProject: (project) => {
        const currentProjects = get().userProjects;
        set({ userProjects: [...currentProjects, project] });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'athenaforge-hackathon-storage',
      partialize: (state) => ({
        hackathons: state.hackathons,
        userProjects: state.userProjects,
      }),
    }
  )
);
