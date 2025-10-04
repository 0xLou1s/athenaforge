"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Github,
  ExternalLink,
  Video,
  Edit,
  Users,
  Calendar,
  Trophy,
  Award,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useHackathonStore } from "@/stores/hackathon-store";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { format } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  hackathonId: string;
  trackId: string;
  repositoryUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  ipfsHash: string;
  submittedAt: string;
  submittedBy: string;
  team?: any[];
  technologies?: string[];
  challenges?: string;
  achievements?: string;
  futureWork?: string;
  files?: any[];
  teamInfo?: {
    members: any[];
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = usePrivy();
  const { hackathons, fetchHackathonsFromIPFS } = useHackathonStore();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        // First, fetch all hackathons to get project data
        if (hackathons.length === 0) {
          await fetchHackathonsFromIPFS();
        }

        // Find project from hackathons data
        let foundProject: Project | null = null;

        for (const hackathon of hackathons) {
          // Check if hackathon has projects
          if (hackathon.projects) {
            foundProject =
              hackathon.projects.find((p: Project) => p.id === projectId) ||
              null;
            if (foundProject) break;
          }
        }

        if (!foundProject) {
          // If not found in hackathons, try direct API call
          try {
            const response = await fetch(`/api/projects/${projectId}`);
            if (response.ok) {
              foundProject = await response.json();
            }
          } catch (error) {
            // Ignore fetch errors
          }
        }

        setProject(foundProject);

        // Check if current user is the owner
        if (foundProject && user) {
          setIsOwner(foundProject.submittedBy === user.id);
        }
      } catch (error) {
        // Ignore loading errors
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, hackathons, fetchHackathonsFromIPFS, user]);

  const getHackathonTitle = (hackathonId: string) => {
    const hackathon = hackathons.find((h) => h.id === hackathonId);
    return hackathon?.title || "Unknown Hackathon";
  };

  const getTrackName = (trackId: string, hackathonId: string) => {
    const hackathon = hackathons.find((h) => h.id === hackathonId);
    const track = hackathon?.tracks?.find((t) => t.id === trackId);
    return track?.name || "Unknown Track";
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
              <p className="text-gray-600 mb-4">
                The project you're looking for doesn't exist.
              </p>
              <Button asChild>
                <Link href="/hackathons">Back to Hackathons</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/hackathons">
            <ArrowLeft size={16} className="mr-2" />
            Back to Hackathons
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{project.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={16} />
                <span>{getHackathonTitle(project.hackathonId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>
                  {getTrackName(project.trackId, project.hackathonId)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Submitted{" "}
                  {format(new Date(project.submittedAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="mb-4">
                <Badge variant="secondary" className="mr-2">
                  You are the owner
                </Badge>
                <Button size="sm" className="mt-2">
                  <Edit size={16} className="mr-2" />
                  Edit Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(project.team || project.teamInfo?.members || []).map(
                  (member: any, index: number) => (
                    <div
                      key={member.id || index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {(member.name || "Unknown").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {member.name || "Unknown Member"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {member.role || "No role specified"}
                        </p>
                        {member.email && (
                          <p className="text-sm text-gray-500">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          {((project.technologies?.length ?? 0) > 0 ||
            project.challenges ||
            project.achievements ||
            project.futureWork) && (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.technologies && project.technologies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(
                        (tech: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tech}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {project.challenges && (
                  <div>
                    <h4 className="font-medium mb-2">Challenges Faced</h4>
                    <p className="text-gray-600">{project.challenges}</p>
                  </div>
                )}

                {project.achievements && (
                  <div>
                    <h4 className="font-medium mb-2">Key Achievements</h4>
                    <p className="text-gray-600">{project.achievements}</p>
                  </div>
                )}

                {project.futureWork && (
                  <div>
                    <h4 className="font-medium mb-2">Future Work</h4>
                    <p className="text-gray-600">{project.futureWork}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Links */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.repositoryUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={16} className="mr-2" />
                    View Code
                  </a>
                </Button>
              )}

              {project.demoUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Demo
                  </a>
                </Button>
              )}

              {project.videoUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video size={16} className="mr-2" />
                    Watch Video
                  </a>
                </Button>
              )}

              {!project.repositoryUrl &&
                !project.demoUrl &&
                !project.videoUrl && (
                  <p className="text-gray-500 text-sm">No links provided</p>
                )}
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">
                  {format(new Date(project.submittedAt), "MMM dd, yyyy")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Team Size:</span>
                <span className="font-medium">
                  {(project.team || project.teamInfo?.members || []).length}{" "}
                  members
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">IPFS Hash:</span>
                <span className="font-mono text-xs text-gray-500">
                  {project.ipfsHash?.slice(0, 10)}...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
