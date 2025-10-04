'use client'

import { useTeamStore } from '@/stores/team-store';

export const useTeams = () => {
  const {
    teams,
    currentTeam,
    userTeams,
    isLoading,
    error,
    setTeams,
    addTeam,
    updateTeam,
    setCurrentTeam,
    setUserTeams,
    joinTeam,
    leaveTeam,
    fetchTeamsByHackathon,
    fetchUserTeams,
    createTeam,
    setLoading,
    setError,
    clearError,
  } = useTeamStore();

  const getTeamById = (id: string) => {
    return teams.find(team => team.id === id);
  };

  const getUserTeamForHackathon = (hackathonId: string) => {
    return userTeams.find(team => team.hackathonId === hackathonId);
  };

  const isUserInTeam = (teamId: string, userId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.members.some(member => member.userId === userId) || false;
  };

  const canJoinTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return false;
    return team.members.length < team.maxMembers;
  };

  const getAvailableTeams = (hackathonId: string) => {
    return teams.filter(team => 
      team.hackathonId === hackathonId && 
      team.isPublic && 
      team.members.length < team.maxMembers
    );
  };

  return {
    // State
    teams,
    currentTeam,
    userTeams,
    isLoading,
    error,
    
    // Actions
    setTeams,
    addTeam,
    updateTeam,
    setCurrentTeam,
    setUserTeams,
    joinTeam,
    leaveTeam,
    fetchTeamsByHackathon,
    fetchUserTeams,
    createTeam,
    setLoading,
    setError,
    clearError,
    
    // Computed
    getTeamById,
    getUserTeamForHackathon,
    isUserInTeam,
    canJoinTeam,
    getAvailableTeams,
  };
};
