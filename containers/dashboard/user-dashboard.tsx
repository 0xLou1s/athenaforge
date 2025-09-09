"use client";

import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { useHackathonStore } from "@/stores/hackathon-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Trophy,
  Code,
  Calendar,
  Settings,
  Plus,
  ExternalLink,
  Github,
  Twitter,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function UserDashboard() {
  const { authenticated, user, isLoading } = usePrivyAuth();
  const { userProjects } = useHackathonStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated || !user) {
    redirect("/");
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0) || <User className="size-8" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Reputation: {user.reputation}</Badge>
                  <Badge variant="secondary">
                    {userProjects.length} Projects
                  </Badge>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard/settings">
                <Settings className="size-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Projects
                  </CardTitle>
                  <Code className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProjects.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reputation
                  </CardTitle>
                  <Trophy className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.reputation}</div>
                  <p className="text-xs text-muted-foreground">
                    +10 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Member Since
                  </CardTitle>
                  <Calendar className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatDate(user.createdAt).split(" ")[0]}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your latest project submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No projects yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start building and submit your first project to a
                      hackathon
                    </p>
                    <Button asChild>
                      <Link href="/hackathons">
                        <Plus className="size-4 mr-2" />
                        Browse Hackathons
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProjects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted {formatDate(project.submittedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {project.totalScore && (
                            <Badge variant="outline">
                              Score: {project.totalScore}
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <Button asChild>
                <Link href="/projects/create">
                  <Plus className="size-4 mr-2" />
                  Create Project
                </Link>
              </Button>
            </div>

            {userProjects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Code className="size-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No projects yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first project and start participating in
                    hackathons
                  </p>
                  <Button asChild>
                    <Link href="/projects/create">
                      <Plus className="size-4 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Submitted
                          </span>
                          <span>{formatDate(project.submittedAt)}</span>
                        </div>
                        {project.totalScore && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Score</span>
                            <Badge variant="outline">
                              {project.totalScore}
                            </Badge>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <Link href={`/projects/${project.id}`}>View</Link>
                          </Button>
                          {project.repositoryUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={project.repositoryUrl}
                                target="_blank"
                              >
                                <Github className="size-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Hackathons Tab */}
          <TabsContent value="hackathons" className="space-y-6">
            <h2 className="text-2xl font-bold">My Hackathons</h2>
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No hackathons yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Join hackathons to start building and competing
                </p>
                <Button asChild>
                  <Link href="/hackathons">Browse Hackathons</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Wallet Address
                    </label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <p className="text-sm text-muted-foreground">
                      {user.bio || "No bio provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Github className="size-4" />
                    <span className="text-sm">
                      {user.github || "Not connected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="size-4" />
                    <span className="text-sm">
                      {user.twitter || "Not connected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="size-4" />
                    <span className="text-sm">
                      {user.telegram || "Not connected"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.skills.length === 0 ? (
                    <p className="text-muted-foreground">No skills added yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
