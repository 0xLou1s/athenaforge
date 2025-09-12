// Export all stores from a single entry point
export { useUserStore } from './user-store';
export { useHackathonStore } from './hackathon-store';
export { useIPFSStore } from './ipfs-store';

// Export types from the types directory
export type { User } from '@/types/user';
export type { 
  Hackathon, 
  Prize, 
  Judge, 
  Track, 
  Project, 
  TeamMember, 
  Score 
} from '@/types/hackathon';
export type { 
  IPFSUploadResult, 
  IPFSFileItem, 
  IPFSFileListResponse, 
  IPFSMetadata 
} from '@/types/ipfs';
