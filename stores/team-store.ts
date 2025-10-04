import { create } from 'zustand';
import type { Team, TeamMember } from '@/types/hackathon';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  userTeams: Team[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  setCurrentTeam: (team: Team | null) => void;
  setUserTeams: (teams: Team[]) => void;
  joinTeam: (teamId: string, member: TeamMember) => void;
  leaveTeam: (teamId: string, memberId: string) => void;
  fetchTeamsByHackathon: (hackathonId: string) => Promise<void>;
  fetchUserTeams: (userId: string) => Promise<void>;
  createTeam: (teamData: Omit<Team, 'id' | 'ipfsHash' | 'createdAt' | 'updatedAt'>) => Promise<Team>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>()((set, get) => ({
  teams: [],
  currentTeam: null,
  userTeams: [],
  isLoading: false,
  error: null,

  setTeams: (teams) => set({ teams }),
  
  addTeam: (team) => {
    const currentTeams = get().teams;
    set({ teams: [...currentTeams, team] });
  },
  
  updateTeam: (id, updates) => {
    const currentTeams = get().teams;
    const updatedTeams = currentTeams.map(team =>
      team.id === id
        ? { ...team, ...updates, updatedAt: new Date().toISOString() }
        : team
    );
    set({ teams: updatedTeams });
    
    // Update userTeams if needed
    const currentUserTeams = get().userTeams;
    const updatedUserTeams = currentUserTeams.map(team =>
      team.id === id
        ? { ...team, ...updates, updatedAt: new Date().toISOString() }
        : team
    );
    set({ userTeams: updatedUserTeams });
  },
  
  setCurrentTeam: (team) => set({ currentTeam: team }),
  
  setUserTeams: (teams) => set({ userTeams: teams }),
  
  joinTeam: (teamId, member) => {
    const currentTeams = get().teams;
    const updatedTeams = currentTeams.map(team => {
      if (team.id === teamId) {
        const updatedMembers = [...team.members, member];
        return {
          ...team,
          members: updatedMembers,
          updatedAt: new Date().toISOString(),
        };
      }
      return team;
    });
    set({ teams: updatedTeams });
  },
  
  leaveTeam: (teamId, memberId) => {
    const currentTeams = get().teams;
    const updatedTeams = currentTeams.map(team => {
      if (team.id === teamId) {
        const updatedMembers = team.members.filter(member => member.id !== memberId);
        return {
          ...team,
          members: updatedMembers,
          updatedAt: new Date().toISOString(),
        };
      }
      return team;
    });
    set({ teams: updatedTeams });
  },
  
  fetchTeamsByHackathon: async (hackathonId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/teams?hackathonId=${hackathonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const teams = await response.json();
      set({ teams, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  fetchUserTeams: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/teams/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user teams');
      }
      const userTeams = await response.json();
      set({ userTeams, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user teams';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }
      
      const result = await response.json();
      const newTeam = result.team;
      
      // Add to teams list
      get().addTeam(newTeam);
      
      set({ isLoading: false });
      return newTeam;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
