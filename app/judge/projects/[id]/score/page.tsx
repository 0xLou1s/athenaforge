"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
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
  Star,
  Trophy,
  Users,
  Code,
  ExternalLink,
  Github,
  Video,
  ArrowLeft,
  Save,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// Scoring schema
const scoreSchema = z.object({
  scores: z.record(z.string(), z.number().min(0).max(10)),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  privateNotes: z.string().optional(),
});

type ScoreFormData = z.infer<typeof scoreSchema>;

// Mock project data - in real app this would come from API
const mockProject = {
  id: "1",
  title: "DeFi Portfolio Tracker",
  description: "A comprehensive DeFi portfolio tracking application with real-time analytics and yield farming optimization. The platform aggregates data from multiple DeFi protocols to provide users with a unified view of their investments, including yield farming opportunities, impermanent loss calculations, and portfolio rebalancing suggestions.",
  team: [
    { id: "1", name: "Alice Johnson", role: "Frontend Developer", avatar: "" },
    { id: "2", name: "Bob Smith", role: "Smart Contract Developer", avatar: "" },
    { id: "3", name: "Carol Davis", role: "UI/UX Designer", avatar: "" },
  ],
  hackathonId: "hack1",
  trackId: "web3",
  trackName: "Web3 & DeFi",
  repositoryUrl: "https://github.com/team/defi-tracker",
  demoUrl: "https://defi-tracker.vercel.app",
  videoUrl: "https://youtube.com/watch?v=demo",
  technologies: ["React", "Next.js", "Solidity", "Web3.js", "Tailwind CSS", "Ethers.js", "Hardhat"],
  submittedAt: "2024-01-15T10:30:00Z",
  challenges: "Integrating multiple DeFi protocols with different APIs and handling real-time price updates efficiently.",
  achievements: "Successfully implemented a unified dashboard that aggregates data from 15+ DeFi protocols with sub-second update times.",
  futureWork: "Planning to add automated portfolio rebalancing, mobile app, and support for Layer 2 solutions.",
  files: [
    { name: "Technical Documentation.pdf", url: "#", size: "2.5 MB" },
    { name: "Demo Screenshots.zip", url: "#", size: "15.8 MB" },
    { name: "Smart Contract Audit.pdf", url: "#", size: "1.2 MB" },
  ],
};

const mockCriteria = [
  {
    id: "innovation",
    name: "Innovation",
    description: "How innovative and creative is the solution?",
    weight: 25,
  },
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality of code, architecture, and technical execution",
    weight: 30,
  },
  {
    id: "ux",
    name: "User Experience",
    description: "How intuitive and user-friendly is the application?",
    weight: 20,
  },
  {
    id: "business",
    name: "Business Potential",
    description: "Market viability and potential for real-world adoption",
    weight: 25,
  },
];

interface ProjectScorePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectScorePage({ params }: ProjectScorePageProps) {
  const { id } = await params;
  const [project] = useState(mockProject);
  const [criteria] = useState(mockCriteria);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = usePrivy();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      scores: {},
      feedback: "",
      privateNotes: "",
    },
  });

  // Initialize scores
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    criteria.forEach(criterion => {
      initialScores[criterion.id] = 5; // Default to middle score
    });
    setScores(initialScores);
    setValue("scores", initialScores);
  }, [criteria, setValue]);

  const updateScore = (criterionId: string, value: number) => {
    const newScores = { ...scores, [criterionId]: value };
    setScores(newScores);
    setValue("scores", newScores);
  };

  const calculateTotalScore = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteria.forEach(criterion => {
      const score = scores[criterion.id] || 0;
      totalWeightedScore += score * (criterion.weight / 100);
      totalWeight += criterion.weight / 100;
    });

    return totalWeight > 0 ? totalWeightedScore : 0;
  };

  const onSubmit = async (data: ScoreFormData) => {
    if (!user) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    try {
      const scoreData = {
        projectId: id,
        judgeId: user.id,
        scores: data.scores,
        feedback: data.feedback,
        privateNotes: data.privateNotes,
        totalScore: calculateTotalScore(),
        criteriaScores: criteria.map(c => ({
          criterionId: c.id,
          criterionName: c.name,
          score: (data.scores as Record<string, number>)[c.id] || 0,
          weight: c.weight,
        })),
        isDraft: false,
      };

      // Call API to submit score
      const response = await fetch("/api/scores/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit score");
      }

      const result = await response.json();
      
      toast.success("Score submitted successfully!");
      router.push("/judge");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit score";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (!user) return;

    try {
      const draftData = {
        projectId: id,
        judgeId: user.id,
        scores,
        feedback: watch("feedback"),
        privateNotes: watch("privateNotes"),
        isDraft: true,
        savedAt: new Date().toISOString(),
      };

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Draft save error:", error);
      toast.error("Failed to save draft");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Please connect your wallet to score projects
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const totalScore = calculateTotalScore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/judge">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Star className="h-8 w-8 text-primary" />
          Score Project
        </h1>
        <p className="text-muted-foreground">
          Evaluate and provide feedback for this hackathon project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Info - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <Badge variant="outline">{project.trackName}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>

              {/* Team */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team
                </h4>
                <div className="space-y-1">
                  {project.team.map((member) => (
                    <div key={member.id} className="text-sm">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground"> - {member.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Project Links */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Project Links</h4>
                <div className="flex flex-col gap-2">
                  {project.repositoryUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={project.repositoryUrl} target="_blank">
                        <Github className="h-4 w-4 mr-2" />
                        Repository
                      </Link>
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={project.demoUrl} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </Link>
                    </Button>
                  )}
                  {project.videoUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={project.videoUrl} target="_blank">
                        <Video className="h-4 w-4 mr-2" />
                        Demo Video
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {project.challenges && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Challenges Faced</h4>
                  <p className="text-sm text-muted-foreground">{project.challenges}</p>
                </div>
              )}

              {project.achievements && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Achievements</h4>
                  <p className="text-sm text-muted-foreground">{project.achievements}</p>
                </div>
              )}

              {project.futureWork && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Future Work</h4>
                  <p className="text-sm text-muted-foreground">{project.futureWork}</p>
                </div>
              )}

              {/* Files */}
              {project.files && project.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Project Files</h4>
                  <div className="space-y-2">
                    {project.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                        <span>{file.name}</span>
                        <span className="text-muted-foreground">{file.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scoring Form - Right Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Score Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Score</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{totalScore.toFixed(1)}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Scoring Criteria */}
            <Card>
              <CardHeader>
                <CardTitle>Scoring Criteria</CardTitle>
                <CardDescription>
                  Rate each criterion on a scale of 0-10
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{criterion.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {criterion.description} (Weight: {criterion.weight}%)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold w-8 text-center">
                          {scores[criterion.id] || 0}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      value={scores[criterion.id] || 0}
                      onChange={(e) => updateScore(criterion.id, parseFloat(e.target.value))}
                      max={10}
                      min={0}
                      step={0.5}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor (0)</span>
                      <span>Average (5)</span>
                      <span>Excellent (10)</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>
                  Provide constructive feedback for the team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Public Feedback *</label>
                  <Textarea
                    {...register("feedback")}
                    placeholder="Provide detailed feedback on the project's strengths, areas for improvement, and overall impression..."
                    rows={6}
                    className={cn(errors.feedback && "border-red-500")}
                  />
                  {errors.feedback && (
                    <p className="text-sm text-red-500">{errors.feedback.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This feedback will be visible to the team and other judges
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Private Notes (Optional)</label>
                  <Textarea
                    {...register("privateNotes")}
                    placeholder="Add any private notes for your reference..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes are only visible to you and other judges
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Score
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
