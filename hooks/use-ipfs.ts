import { useIPFSStore } from '@/stores/ipfs-store';

export const useIPFS = () => {
  const {
    uploads,
    isLoading,
    error,
    uploadFile,
    uploadJSON,
    getFileURL,
    addUpload,
    setLoading,
    setError,
    clearError,
  } = useIPFSStore();

  return {
    // State
    uploads,
    isLoading,
    error,
    
    // Actions
    uploadFile,
    uploadJSON,
    getFileURL,
    addUpload,
    setLoading,
    setError,
    clearError,
  };
};
