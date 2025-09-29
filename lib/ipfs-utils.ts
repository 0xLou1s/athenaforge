import envConfig from "@/config/env-config";

// Helper function to get file URL from CID
export function getIPFSFileURL(cid: string): string {
  const gateway = envConfig.NEXT_PUBLIC_PINATA_GATEWAY;
  // Ensure gateway has https:// prefix
  const fullGateway = gateway.startsWith('http') ? gateway : `https://${gateway}`;
  return `${fullGateway}/ipfs/${cid}`;
}

// Helper function to extract CID from IPFS URL
export function extractCIDFromURL(url: string): string | null {
  const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// Helper function to validate CID format
export function isValidCID(cid: string): boolean {
  // Basic CID validation - should start with Qm or b for CIDv0/v1
  const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|[A-Za-z2-7]{59})$/;
  return cidRegex.test(cid);
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type from filename
export function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    // Images
    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image',
    // Documents
    'pdf': 'document', 'doc': 'document', 'docx': 'document', 'txt': 'document', 'md': 'document',
    // Archives
    'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive', 'gz': 'archive',
    // Videos
    'mp4': 'video', 'webm': 'video', 'mov': 'video', 'avi': 'video', 'mkv': 'video',
    // Audio
    'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio', 'm4a': 'audio',
    // Code
    'js': 'code', 'ts': 'code', 'jsx': 'code', 'tsx': 'code', 'json': 'code', 'html': 'code', 'css': 'code',
  };
  
  return typeMap[extension || ''] || 'file';
}
