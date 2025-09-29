"use client";

import { useState, useCallback, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Video,
  Music,
  Archive,
  Code,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
  uploadError?: string;
}

interface DragDropUploadProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
  'video/*': ['.mp4', '.webm', '.mov', '.avi'],
  'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
  'application/pdf': ['.pdf'],
  'text/*': ['.txt', '.md', '.json', '.csv'],
  'application/zip': ['.zip', '.rar', '.7z', '.tar', '.gz'],
  'application/json': ['.json'],
  'text/plain': ['.txt', '.md'],
};

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'application/pdf', 
  'text/*',
  'application/zip',
  'video/*',
  'audio/*'
];

export function DragDropUpload({
  onFilesChange,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  showPreview = true,
  className,
  disabled = false,
}: DragDropUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: 'file-too-large' };
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return { valid: false, error: 'file-invalid-type' };
    }

    return { valid: true };
  };

  const processFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const remainingSlots = maxFiles - files.length;

    if (filesArray.length > remainingSlots) {
      toast.error(`Too many files. Maximum allowed: ${maxFiles}`);
      return;
    }

    const validFiles: FileWithPreview[] = [];
    const rejectedFiles: { file: File; error: string }[] = [];

    filesArray.forEach((file) => {
      const validation = validateFile(file);
      
      if (validation.valid) {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9),
          uploadProgress: 0,
          uploadStatus: 'pending' as const,
        });

        // Create preview for images
        if (file.type.startsWith('image/') && showPreview) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        validFiles.push(fileWithPreview);
      } else {
        rejectedFiles.push({ file, error: validation.error! });
      }
    });

    // Handle rejected files
    rejectedFiles.forEach(({ file, error }) => {
      if (error === 'file-too-large') {
        toast.error(`File ${file.name} is too large. Max size: ${formatFileSize(maxSize)}`);
      } else if (error === 'file-invalid-type') {
        toast.error(`File ${file.name} has invalid type`);
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragReject(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragReject(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => {
      if (file.id === fileId) {
        // Revoke preview URL to prevent memory leaks
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
        return false;
      }
      return true;
    });
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8" />;
    if (file.type.includes('zip') || file.type.includes('archive')) return <Archive className="h-8 w-8" />;
    if (file.type.includes('json') || file.type.includes('javascript') || file.type.includes('typescript')) return <Code className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-red-500 bg-red-50",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragActive && !isDragReject && "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          disabled={disabled}
          className="hidden"
          accept={acceptedTypes.join(',')}
        />
        
        <div className="flex flex-col items-center gap-4">
          <Upload className={cn(
            "h-12 w-12",
            isDragActive && !isDragReject && "text-primary",
            isDragReject && "text-red-500",
            !isDragActive && "text-muted-foreground"
          )} />
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive 
                ? isDragReject 
                  ? "Some files will be rejected"
                  : "Drop files here"
                : "Drag & drop files here"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each</p>
              <p>Supported: Images, PDFs, Documents, Archives, Videos, Audio</p>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-12 w-12 object-cover rounded"
                      onLoad={() => URL.revokeObjectURL(file.preview!)}
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    {getStatusIcon(file.uploadStatus)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.type || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Upload Progress */}
                  {file.uploadStatus === 'uploading' && file.uploadProgress !== undefined && (
                    <div className="space-y-1">
                      <Progress value={file.uploadProgress} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        Uploading... {file.uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload Error */}
                  {file.uploadStatus === 'error' && file.uploadError && (
                    <p className="text-xs text-red-500">{file.uploadError}</p>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Actions */}
      {files.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Total: {files.length} files</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              files.forEach(file => {
                if (file.preview) {
                  URL.revokeObjectURL(file.preview);
                }
              });
              setFiles([]);
              onFilesChange([]);
            }}
            disabled={disabled}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
