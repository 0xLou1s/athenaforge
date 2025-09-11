'use client'

import { useEffect } from 'react';
import { useHackathonStore } from '@/stores/hackathon-store';

export const useHackathons = () => {
  const {
    hackathons,
    isLoading,
    error,
    setError,
    fetchHackathonsFromIPFS,
  } = useHackathonStore();

  // Fetch hackathons from IPFS on mount
  useEffect(() => {
    fetchHackathonsFromIPFS();
  }, [fetchHackathonsFromIPFS]);

  const getHackathonById = (id: string) => {
    return hackathons.find(hackathon => hackathon.id === id);
  };

  const getHackathonsByStatus = (status: 'upcoming' | 'active' | 'ended') => {
    return hackathons.filter(hackathon => hackathon.status === status);
  };

  const searchHackathons = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return hackathons.filter(hackathon =>
      hackathon.title.toLowerCase().includes(lowercaseQuery) ||
      hackathon.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    hackathons,
    isLoading,
    error,
    getHackathonById,
    getHackathonsByStatus,
    searchHackathons,
    setError,
  };
};
