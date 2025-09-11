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

export interface IPFSFileItem {
  id: string;
  name: string | null;
  cid: string | "pending";
  size: number;
  numberOfFiles: number;
  mimeType: string;
  groupId: string;
  updatedAt: string;
  createdAt: string;
}

export interface IPFSFileListResponse {
  files: IPFSFileItem[];
  next_page_token: string;
}

export interface IPFSMetadata {
  name: string;
  keyvalues?: Record<string, string>;
}

interface IPFSState {
  uploads: IPFSUploadResult[];
  files: IPFSFileItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  uploadFile: (file: File, metadata?: IPFSMetadata) => Promise<IPFSUploadResult>;
  uploadJSON: (data: any, metadata?: IPFSMetadata) => Promise<IPFSUploadResult>;
  listFiles: (options?: { type?: string; limit?: number; order?: 'ASC' | 'DESC' }) => Promise<IPFSFileListResponse>;
  getFileURL: (cid: string) => string;
  addUpload: (upload: IPFSUploadResult) => void;
  setFiles: (files: IPFSFileItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useIPFSStore = create<IPFSState>()((set, get) => ({
  uploads: [],
  files: [],
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

  listFiles: async (options?: { type?: string; limit?: number; order?: 'ASC' | 'DESC' }) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (options?.type) params.append('type', options.type);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.order) params.append('order', options.order);

      const response = await fetch(`/api/ipfs/list?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list files');
      }

      const result: IPFSFileListResponse = await response.json();

      set((state) => ({
        files: result.files,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list files';
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

  setFiles: (files: IPFSFileItem[]) => set({ files }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
