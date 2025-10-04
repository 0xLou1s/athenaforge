
// Site configuration types
export interface SocialLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  origin: string;
  keywords: string[];
  og: string;
  creator: {
    name: string;
    url: string;
  };
  socials: {
    [key: string]: SocialLink;
  };
}

// Re-export all types from individual type files
export type { 
  Hackathon, 
  Prize, 
  Judge, 
  Track, 
  Project, 
  Team,
  TeamMember, 
  Score 
} from './hackathon';

export type { 
  IPFSUploadResult, 
  IPFSFileItem, 
  IPFSFileListResponse, 
  IPFSMetadata 
} from './ipfs';

export type { User } from './user';