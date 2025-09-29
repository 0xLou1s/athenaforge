"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Github, 
  ExternalLink, 
  Video, 
  FileText,
  Image as ImageIcon,
  Users,
  Trophy,
  X,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIPFS } from "@/hooks/use-ipfs";
import { useTeams } from "@/hooks/use-teams";
import { useHackathonStore } from "@/stores/hackathon-store";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Project, Team } from "@/types/hackathon";

// Enhanced project schema
const projectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long"),
  hackathonId: z.string().min(1, "Please select a hackathon"),
  trackId: z.string().min(1, "Please select a track"),
  teamId: z.string().optional(),
  repositoryUrl: z.string().url("Valid repository URL is required").optional().or(z.literal("")),
  demoUrl: z.string().url("Valid demo URL is required").optional().or(z.literal("")),
  videoUrl: z.string().url("Valid video URL is required").optional().or(z.literal("")),
  technologies: z.array(z.string()).optional(),
  challenges: z.string().max(1000, "Challenges description too long").optional(),
  achievements: z.string().max(1000, "Achievements description too long").optional(),
  futureWork: z.string().max(1000, "Future work description too long").optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface EnhancedProjectFormProps {
  hackathonId?: string;
  teamId?: string;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
}

const COMMON_TECHNOLOGIES = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Solidity",
  "Web3", "Ethereum", "Polygon", "IPFS", "GraphQL", "MongoDB",
  "PostgreSQL", "Docker", "AWS", "Vercel", "Tailwind CSS", "Figma"
];

export default function EnhancedProjectForm({
  hackathonId,
  teamId,
  onSuccess,
  onCancel,
}: EnhancedProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTechnology, setNewTechnology] = useState("");
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { hackathons, isLoading: hackathonsLoading } = useHackathonStore();
  const { userTeams, fetchUserTeams } = useTeams();
  const { uploadFile, uploadJSON, isLoading: ipfsLoading, uploadProgress: ipfsProgress } = useIPFS();
  const { user } = usePrivy();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      hackathonId: hackathonId || "",
      teamId: teamId || "",
    },
  });

  const selectedHackathon = hackathons.find(h => h.id === watch("hackathonId"));
  const watchedTeamId = watch("teamId");

  // Fetch user teams on mount
  useEffect(() => {
    if (user) {
      fetchUserTeams(user.id);
    }
  }, [user, fetchUserTeams]);

  // Set selected team when teamId changes
  useEffect(() => {
    if (watchedTeamId) {
      const team = userTeams.find(t => t.id === watchedTeamId);
      setSelectedTeam(team || null);
    } else {
      setSelectedTeam(null);
    }
  }, [watchedTeamId, userTeams]);

  const addTechnology = (tech: string) => {
    if (tech && !technologies.includes(tech)) {
      const updatedTech = [...technologies, tech];
      setTechnologies(updatedTech);
      setValue("technologies", updatedTech);
    }
    setNewTechnology("");
  };

  const removeTechnology = (techToRemove: string) => {
    const updatedTech = technologies.filter(tech => tech !== techToRemove);
    setTechnologies(updatedTech);
    setValue("technologies", updatedTech);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProjectFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setProjectFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setUploadProgress(10);
      
      // Upload project files to IPFS
      const uploadedFiles = [];
      for (let i = 0; i < projectFiles.length; i++) {
        const file = projectFiles[i];
        const uploadResult = await uploadFile(file, {
          name: `project-file-${Date.now()}-${i}`,
          keyvalues: {
            type: "project-file",
            projectTitle: data.title,
          },
        });
        uploadedFiles.push({
          name: file.name,
          url: uploadResult.url,
          cid: uploadResult.cid,
          size: uploadResult.size,
        });
        setUploadProgress(10 + (i + 1) * 30 / projectFiles.length);
      }

      setUploadProgress(50);

      // Prepare project data
      const projectData = {
        ...data,
        technologies,
        files: uploadedFiles,
        submittedBy: user.id,
        team: selectedTeam,
      };

      setUploadProgress(70);

      // Call API to create project
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const result = await response.json();
      const project = result.project;

      setUploadProgress(100);

      toast.success("Project submitted successfully!");
      
      if (onSuccess) {
        onSuccess(project);
      } else {
        router.push(`/hackathons/${data.hackathonId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit project";
      toast.error(errorMessage);
    } finally {
      setUploadProgress(0);
    }
  };

  const steps = [
    { title: "Project Info", description: "Basic project details" },
    { title: "Technical Details", description: "Technologies and files" },
    { title: "Review & Submit", description: "Final review" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Progress */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Project</h1>
        <p className="text-muted-foreground mb-6">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-2 text-center">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Project Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Project Information
              </CardTitle>
              <CardDescription>
                Tell us about your project and select your hackathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title *</label>
                <Input
                  {...register("title")}
                  placeholder="Enter your project title"
                  className={cn(errors.title && "border-red-500")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  {...register("description")}
                  placeholder="Describe your project, what it does, and how it works..."
                  rows={4}
                  className={cn(errors.description && "border-red-500")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Hackathon and Track Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hackathon *</label>
                  <Select
                    value={watch("hackathonId")}
                    onValueChange={(value) => setValue("hackathonId", value)}
                  >
                    <SelectTrigger className={cn(errors.hackathonId && "border-red-500")}>
                      <SelectValue placeholder="Select hackathon" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathons.map((hackathon) => (
                        <SelectItem key={hackathon.id} value={hackathon.id}>
                          {hackathon.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hackathonId && (
                    <p className="text-sm text-red-500">{errors.hackathonId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Track *</label>
                  <Select
                    value={watch("trackId")}
                    onValueChange={(value) => setValue("trackId", value)}
                    disabled={!selectedHackathon}
                  >
                    <SelectTrigger className={cn(errors.trackId && "border-red-500")}>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedHackathon?.tracks.map((track) => (
                        <SelectItem key={track.id} value={track.id}>
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.trackId && (
                    <p className="text-sm text-red-500">{errors.trackId.message}</p>
                  )}
                </div>
              </div>

              {/* Team Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team (Optional)
                </label>
                <Select
                  value={watch("teamId") || ""}
                  onValueChange={(value) => setValue("teamId", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team or submit individually" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Submit individually</SelectItem>
                    {userTeams
                      .filter(team => team.hackathonId === watch("hackathonId"))
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.members.length} members)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedTeam && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{selectedTeam.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTeam.members.length} members
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Technical Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>
                Add technical information and project files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Links */}
              <div className="space-y-4">
                <h4 className="font-medium">Project Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      Repository URL
                    </label>
                    <Input
                      {...register("repositoryUrl")}
                      placeholder="https://github.com/..."
                      className={cn(errors.repositoryUrl && "border-red-500")}
                    />
                    {errors.repositoryUrl && (
                      <p className="text-sm text-red-500">{errors.repositoryUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Demo URL
                    </label>
                    <Input
                      {...register("demoUrl")}
                      placeholder="https://demo.example.com"
                      className={cn(errors.demoUrl && "border-red-500")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video URL
                    </label>
                    <Input
                      {...register("videoUrl")}
                      placeholder="https://youtube.com/watch?v=..."
                      className={cn(errors.videoUrl && "border-red-500")}
                    />
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Technologies Used</label>
                
                {/* Current Technologies */}
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Technologies */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology(newTechnology))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTechnology(newTechnology)}
                      disabled={!newTechnology}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {/* Common Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {COMMON_TECHNOLOGIES.filter(tech => !technologies.includes(tech)).slice(0, 8).map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => addTechnology(tech)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        + {tech}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Project Files
                </label>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.tar,.gz"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="text-sm text-muted-foreground mb-2">
                      Click to upload project files
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PDF, DOC, Images, Archives up to 100MB each
                    </div>
                  </label>
                </div>

                {/* Uploaded Files */}
                {projectFiles.length > 0 && (
                  <div className="space-y-2">
                    {projectFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Challenges Faced</label>
                  <Textarea
                    {...register("challenges")}
                    placeholder="What challenges did you overcome?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Achievements</label>
                  <Textarea
                    {...register("achievements")}
                    placeholder="What are you most proud of?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Future Work</label>
                  <Textarea
                    {...register("futureWork")}
                    placeholder="What would you do next?"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Review your project details before submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{watch("title")}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{watch("description")}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Hackathon:</span> {selectedHackathon?.title}
                  </div>
                  <div>
                    <span className="font-medium">Track:</span> {selectedHackathon?.tracks.find(t => t.id === watch("trackId"))?.name}
                  </div>
                  {selectedTeam && (
                    <div className="col-span-2">
                      <span className="font-medium">Team:</span> {selectedTeam.name} ({selectedTeam.members.length} members)
                    </div>
                  )}
                </div>

                {technologies.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Technologies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {projectFiles.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Files:</span>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {projectFiles.length} file(s) ready for upload
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading project...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={ipfsLoading || uploadProgress > 0}
              >
                {ipfsLoading || uploadProgress > 0 ? "Submitting..." : "Submit Project"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
