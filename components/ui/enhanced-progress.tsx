"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Upload, Loader2 } from "lucide-react";

interface EnhancedProgressProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function EnhancedProgress({
  value,
  max = 100,
  showPercentage = true,
  showLabel = false,
  label,
  size = "md",
  variant = "default",
  className,
}: EnhancedProgressProps) {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const variantClasses = {
    default: "",
    success: "[&>div]:bg-green-500",
    warning: "[&>div]:bg-yellow-500", 
    error: "[&>div]:bg-red-500",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {showLabel && label && (
            <span className="text-muted-foreground">{label}</span>
          )}
          {showPercentage && (
            <span className="font-medium">{percentage}%</span>
          )}
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
    </div>
  );
}

interface UploadProgressProps {
  files: Array<{
    name: string;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
    error?: string;
  }>;
  className?: string;
}

export function UploadProgress({ files, className }: UploadProgressProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <Circle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "error":
        return "error";
      case "uploading":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {files.map((file, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-3">
            {getStatusIcon(file.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              {file.error && (
                <p className="text-xs text-red-500">{file.error}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {file.progress}%
            </span>
          </div>
          <EnhancedProgress
            value={file.progress}
            variant={getStatusColor(file.status) as any}
            showPercentage={false}
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}

interface StepProgressProps {
  steps: Array<{
    title: string;
    description?: string;
    status: "pending" | "current" | "completed";
  }>;
  className?: string;
}

export function StepProgress({ steps, className }: StepProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step.status === "completed" && "bg-green-500 text-white",
                step.status === "current" && "bg-primary text-primary-foreground",
                step.status === "pending" && "bg-muted text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-px h-8 mt-2 transition-colors",
                  step.status === "completed" ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm font-medium",
                step.status === "current" && "text-primary",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.title}
            </h4>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.round((value / max) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300 ease-in-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
      )}
    </div>
  );
}
