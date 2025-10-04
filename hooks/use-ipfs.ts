import { useIPFSStore } from '@/stores/ipfs-store';

export const useIPFS = () => {
  const {
    uploads,
    files,
    isLoading,
    error,
    uploadProgress,
    uploadFile,
    uploadFileWithSignedURL,
    uploadJSON,
    listFiles,
    getFileURL,
    addUpload,
    setFiles,
    setLoading,
    setError,
    setUploadProgress,
    clearError,
  } = useIPFSStore();

  return {
    // State
    uploads,
    files,
    isLoading,
    error,
    uploadProgress,
    
    // Actions
    uploadFile,
    uploadFileWithSignedURL,
    uploadJSON,
    listFiles,
    getFileURL,
    addUpload,
    setFiles,
    setLoading,
    setError,
    setUploadProgress,
    clearError,
  };
};
