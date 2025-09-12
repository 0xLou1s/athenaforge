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
