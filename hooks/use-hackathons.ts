import { useEffect } from 'react';
import { useHackathonStore } from '@/stores/hackathon-store';

// Mock data for now - will be replaced with IPFS data later
const mockHackathons = [
  {
    id: '1',
    title: 'AthenaForge Buildathon',
    description: 'Co-create the first open-source decentralized hackathon platform. All data stored on IPFS.',
    image: 'https://pbs.twimg.com/profile_banners/1889977435346608128/1740382792/1500x500',
    startDate: '2025-09-21T00:00:00Z',
    endDate: '2025-10-05T23:59:59Z',
    registrationDeadline: '2025-09-20T23:59:59Z',
    status: 'upcoming' as const,
    participants: 320,
    maxParticipants: 500,
    prizes: [
      {
        id: '1',
        title: 'First Place',
        description: 'Grand Prize',
        amount: 10000,
        currency: 'USD',
        position: 1,
      },
    ],
    judges: [],
    tracks: [
      {
        id: '1',
        name: 'Platform Development',
        description: 'Build core platform features',
        criteria: ['Innovation', 'Technical Excellence', 'User Experience'],
      },
    ],
    requirements: ['Open source', 'IPFS integration', 'Web3 authentication'],
    rules: ['No plagiarism', 'Original work only'],
    ipfsHash: '',
    organizerId: 'athenaforge',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'DeFi Innovation Sprint',
    description: 'Push the boundaries of decentralized finance with new protocols, tools, and integrations.',
    image: 'https://pbs.twimg.com/profile_banners/1889977435346608128/1740382792/1500x500',
    startDate: '2025-10-12T00:00:00Z',
    endDate: '2025-10-20T23:59:59Z',
    registrationDeadline: '2025-10-11T23:59:59Z',
    status: 'upcoming' as const,
    participants: 210,
    maxParticipants: 300,
    prizes: [
      {
        id: '2',
        title: 'Best DeFi Protocol',
        description: 'Most innovative DeFi protocol',
        amount: 5000,
        currency: 'USD',
        position: 1,
      },
    ],
    judges: [],
    tracks: [
      {
        id: '2',
        name: 'DeFi Protocols',
        description: 'Build new DeFi protocols',
        criteria: ['Innovation', 'Security', 'Usability'],
      },
    ],
    requirements: ['DeFi focus', 'Smart contracts', 'Security audit'],
    rules: ['No existing protocols', 'Original work only'],
    ipfsHash: '',
    organizerId: 'defi-org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'AI x Web3 Challenge',
    description: 'Build AI-powered dApps leveraging decentralized compute and IPFS permanence.',
    image: 'https://pbs.twimg.com/profile_banners/1889977435346608128/1740382792/1500x500',
    startDate: '2025-11-02T00:00:00Z',
    endDate: '2025-11-16T23:59:59Z',
    registrationDeadline: '2025-11-01T23:59:59Z',
    status: 'upcoming' as const,
    participants: 450,
    maxParticipants: 600,
    prizes: [
      {
        id: '3',
        title: 'AI Innovation Award',
        description: 'Best AI x Web3 integration',
        amount: 8000,
        currency: 'USD',
        position: 1,
      },
    ],
    judges: [],
    tracks: [
      {
        id: '3',
        name: 'AI Integration',
        description: 'Integrate AI with Web3',
        criteria: ['AI Innovation', 'Web3 Integration', 'Practical Use Case'],
      },
    ],
    requirements: ['AI integration', 'Web3 components', 'IPFS storage'],
    rules: ['Original AI models', 'Open source code'],
    ipfsHash: '',
    organizerId: 'ai-web3-org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useHackathons = () => {
  const {
    hackathons,
    isLoading,
    error,
    setHackathons,
    setLoading,
    setError,
  } = useHackathonStore();

  // Load mock data on mount
  useEffect(() => {
    if (hackathons.length === 0) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setHackathons(mockHackathons);
        setLoading(false);
      }, 1000);
    }
  }, [hackathons.length, setHackathons, setLoading]);

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
