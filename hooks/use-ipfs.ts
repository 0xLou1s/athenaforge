import { useIPFSStore } from '@/stores/ipfs-store';

export const useIPFS = () => {
  const {
    uploads,
    files,
    isLoading,
    error,
    uploadFile,
    uploadJSON,
    listFiles,
    getFileURL,
    addUpload,
    setFiles,
    setLoading,
    setError,
    clearError,
  } = useIPFSStore();

  return {
    // State
    uploads,
    files,
    isLoading,
    error,
    
    // Actions
    uploadFile,
    uploadJSON,
    listFiles,
    getFileURL,
    addUpload,
    setFiles,
    setLoading,
    setError,
    clearError,
  };
};
