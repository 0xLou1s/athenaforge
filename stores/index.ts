// Export all stores from a single entry point
export { useUserStore } from './user-store';
export { useHackathonStore } from './hackathon-store';

// Export types
export type { User } from './user-store';
export type { 
  Hackathon, 
  Prize, 
  Judge, 
  Track, 
  Project, 
  TeamMember, 
  Score 
} from './hackathon-store';
