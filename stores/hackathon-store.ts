import { create } from 'zustand';
import type { 
  Hackathon, 
  Prize, 
  Judge, 
  Track, 
  Project, 
  TeamMember, 
  Score 
} from '@/types/hackathon';

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
  fetchHackathonsFromIPFS: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useHackathonStore = create<HackathonState>()((set, get) => ({
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
      fetchHackathonsFromIPFS: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/hackathons');
          if (!response.ok) {
            throw new Error('Failed to fetch hackathons');
          }
          const hackathons = await response.json();
          set({ hackathons, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hackathons';
          set({ error: errorMessage, isLoading: false });
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    })
);
