"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useHackathonStore } from "@/stores/hackathon-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  Star, 
  Trophy,
  Users,
  Code,
  ExternalLink,
  Github,
  Video,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock data for demonstration - in real app this would come from API
const mockProjects = [
  {
    id: "1",
    title: "DeFi Portfolio Tracker",
    description: "A comprehensive DeFi portfolio tracking application with real-time analytics and yield farming optimization.",
    team: [
      { id: "1", name: "Alice Johnson", role: "Frontend Developer" },
      { id: "2", name: "Bob Smith", role: "Smart Contract Developer" },
      { id: "3", name: "Carol Davis", role: "UI/UX Designer" },
    ],
    hackathonId: "hack1",
    trackId: "web3",
    trackName: "Web3 & DeFi",
    repositoryUrl: "https://github.com/team/defi-tracker",
    demoUrl: "https://defi-tracker.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo",
    technologies: ["React", "Next.js", "Solidity", "Web3.js", "Tailwind CSS"],
    submittedAt: "2024-01-15T10:30:00Z",
    scores: [],
    totalScore: 0,
    judgedBy: [],
  },
  {
    id: "2", 
    title: "AI-Powered Code Review",
    description: "An intelligent code review system that uses machine learning to identify bugs, security vulnerabilities, and suggest improvements.",
    team: [
      { id: "4", name: "David Wilson", role: "AI Engineer" },
      { id: "5", name: "Eva Brown", role: "Backend Developer" },
    ],
    hackathonId: "hack1",
    trackId: "ai",
    trackName: "AI & Machine Learning",
    repositoryUrl: "https://github.com/team/ai-code-review",
    demoUrl: "https://ai-review.demo.com",
    technologies: ["Python", "TensorFlow", "FastAPI", "React", "Docker"],
    submittedAt: "2024-01-15T14:20:00Z",
    scores: [],
    totalScore: 0,
    judgedBy: [],
  },
];

const mockHackathons = [
  {
    id: "hack1",
    title: "Web3 Innovation Hackathon 2024",
    tracks: [
      { id: "web3", name: "Web3 & DeFi", criteria: ["Innovation", "Technical Implementation", "User Experience", "Business Potential"] },
      { id: "ai", name: "AI & Machine Learning", criteria: ["Innovation", "Technical Complexity", "Real-world Impact", "Code Quality"] },
      { id: "mobile", name: "Mobile Development", criteria: ["User Experience", "Performance", "Innovation", "Market Fit"] },
    ],
    status: "active",
  },
];

export default function JudgeDashboard() {
  const [selectedHackathon, setSelectedHackathon] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState(mockProjects);
  const [hackathons] = useState(mockHackathons);

  const { user } = usePrivy();
  const { fetchHackathonsFromIPFS } = useHackathonStore();

  useEffect(() => {
    fetchHackathonsFromIPFS();
  }, [fetchHackathonsFromIPFS]);

  // Filter projects based on selected filters
  const filteredProjects = projects.filter((project) => {
    const matchesHackathon = !selectedHackathon || project.hackathonId === selectedHackathon;
    const matchesTrack = !selectedTrack || project.trackId === selectedTrack;
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesHackathon && matchesTrack && matchesSearch;
  });

  const selectedHackathonData = hackathons.find(h => h.id === selectedHackathon);
  const availableTracks = selectedHackathonData?.tracks || [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Judge Dashboard</CardTitle>
              <CardDescription>
                Please connect your wallet to access the judge dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Only authorized judges can access this area
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Judge Dashboard
        </h1>
        <p className="text-muted-foreground">
          Review and score hackathon projects
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hackathon Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hackathon</label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hackathon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Hackathons</SelectItem>
                  {hackathons.map((hackathon) => (
                    <SelectItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Track Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Track</label>
              <Select 
                value={selectedTrack} 
                onValueChange={setSelectedTrack}
                disabled={!selectedHackathon}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tracks</SelectItem>
                  {availableTracks.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {selectedHackathonData && ` in ${selectedHackathonData.title}`}
          {selectedTrack && availableTracks.find(t => t.id === selectedTrack) && 
            ` - ${availableTracks.find(t => t.id === selectedTrack)?.name}`}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                  <Badge variant="outline" className="mb-2">
                    {project.trackName}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {project.totalScore > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {project.totalScore.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Team */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team ({project.team.length} members)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.team.map((member) => (
                    <Badge key={member.id} variant="outline" className="text-xs">
                      {member.name} - {member.role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Project Links */}
              <div className="flex flex-wrap gap-2">
                {project.repositoryUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={project.repositoryUrl} target="_blank">
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </Link>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={project.demoUrl} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </Link>
                  </Button>
                )}
                {project.videoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={project.videoUrl} target="_blank">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Link>
                  </Button>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Submitted {new Date(project.submittedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/judge/projects/${project.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/judge/projects/${project.id}/score`}>
                      <Star className="h-4 w-4 mr-2" />
                      Score
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedHackathon || selectedTrack
                ? "Try adjusting your filters to see more projects."
                : "No projects have been submitted yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
