import { create } from 'zustand';
import envConfig from '@/config/env-config';

export interface IPFSUploadResult {
  id: string;
  cid: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  url: string;
}

export interface IPFSMetadata {
  name: string;
  keyvalues?: Record<string, string>;
}

interface IPFSState {
  uploads: IPFSUploadResult[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  uploadFile: (file: File, metadata?: IPFSMetadata) => Promise<IPFSUploadResult>;
  uploadJSON: (data: any, metadata?: IPFSMetadata) => Promise<IPFSUploadResult>;
  getFileURL: (cid: string) => string;
  addUpload: (upload: IPFSUploadResult) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useIPFSStore = create<IPFSState>()((set, get) => ({
  uploads: [],
  isLoading: false,
  error: null,

  uploadFile: async (file: File, metadata?: IPFSMetadata) => {
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: IPFSUploadResult = await response.json();

      set((state) => ({
        uploads: [...state.uploads, result],
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  uploadJSON: async (data: any, metadata?: IPFSMetadata) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/ipfs/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, metadata }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'JSON upload failed');
      }

      const result: IPFSUploadResult = await response.json();

      set((state) => ({
        uploads: [...state.uploads, result],
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getFileURL: (cid: string) => {
    return `${envConfig.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`;
  },

  addUpload: (upload: IPFSUploadResult) => {
    set((state) => ({
      uploads: [...state.uploads, upload],
    }));
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
