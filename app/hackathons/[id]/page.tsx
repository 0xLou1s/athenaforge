"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Award,
  Clock,
  ExternalLink,
  Github,
  Video,
} from "lucide-react";
import { useHackathonStore } from "@/stores/hackathon-store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HackathonDetailPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  const { hackathons } = useHackathonStore();

  const hackathon = hackathons.find((h) => h.id === hackathonId);

  if (!hackathon) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Hackathon Not Found</h2>
              <p className="text-gray-600 mb-4">
                The hackathon you're looking for doesn't exist.
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "Active";
      case "ended":
        return "Ended";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">
                {hackathon.title || "Untitled Hackathon"}
              </h1>
              <Badge
                className={cn(
                  "px-3 py-1",
                  getStatusColor(hackathon.status || "upcoming")
                )}
              >
                {getStatusText(hackathon.status || "upcoming")}
              </Badge>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              {hackathon.description || "No description available"}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {(() => {
                    try {
                      if (!hackathon.startDate || !hackathon.endDate) {
                        return "Date TBD";
                      }
                      const start = new Date(hackathon.startDate);
                      const end = new Date(hackathon.endDate);
                      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                        return "Date TBD";
                      }
                      return `${format(start, "MMM dd, yyyy")} - ${format(
                        end,
                        "MMM dd, yyyy"
                      )}`;
                    } catch (error) {
                      return "Date TBD";
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{hackathon.participants || 0} participants</span>
                {hackathon.maxParticipants && (
                  <span>/ {hackathon.maxParticipants} max</span>
                )}
              </div>
              {hackathon.registrationDeadline && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    Registration until{" "}
                    {format(
                      new Date(hackathon.registrationDeadline),
                      "MMM dd, yyyy"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {hackathon.image && (
            <div className="ml-6">
              <img
                src={
                  hackathon.image.startsWith("http")
                    ? hackathon.image
                    : `https://${hackathon.image}`
                }
                alt={hackathon.title || "hackathon"}
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button size="lg">Register for Hackathon</Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={`/submit-project?hackathon=${hackathon.id}`}>
              Submit Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prizes">Prizes & Judges</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {(hackathon.requirements || []).length > 0 ? (
                  <ul className="space-y-2">
                    {(hackathon.requirements || []).map(
                      (requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{requirement}</span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No specific requirements
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {(hackathon.rules || []).length > 0 ? (
                  <ul className="space-y-2">
                    {(hackathon.rules || []).map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No specific rules</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tracks */}
          <Card>
            <CardHeader>
              <CardTitle>Tracks</CardTitle>
              <CardDescription>
                Available tracks for this hackathon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(hackathon.tracks || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(hackathon.tracks || []).map((track) => (
                    <div key={track.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{track.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {track.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">
                          Criteria:
                        </p>
                        {(track.criteria || []).map((criteria, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            • {criteria}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No tracks defined</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prizes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} />
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(hackathon.prizes || [])
                    .sort((a, b) => a.position - b.position)
                    .map((prize) => (
                      <div key={prize.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{prize.title}</h4>
                          <Badge variant="secondary">#{prize.position}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {prize.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-yellow-500" />
                          <span className="font-medium">
                            {prize.amount} {prize.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Judges */}
            <Card>
              <CardHeader>
                <CardTitle>Judges</CardTitle>
                <CardDescription>
                  Meet the judges for this hackathon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(hackathon.judges || []).length > 0 ? (
                  <div className="space-y-4">
                    {(hackathon.judges || []).map((judge) => (
                      <div
                        key={judge.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Avatar>
                          <AvatarImage src={judge.avatar} alt={judge.name} />
                          <AvatarFallback>
                            {judge.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{judge.name}</h4>
                          <p className="text-sm text-gray-600">
                            {judge.title} at {judge.company}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {judge.bio}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {judge.socialLinks?.twitter && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={judge.socialLinks.twitter}
                                  target="_blank"
                                >
                                  <ExternalLink size={12} />
                                </Link>
                              </Button>
                            )}
                            {judge.socialLinks?.linkedin && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={judge.socialLinks.linkedin}
                                  target="_blank"
                                >
                                  <ExternalLink size={12} />
                                </Link>
                              </Button>
                            )}
                            {judge.socialLinks?.github && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={judge.socialLinks.github}
                                  target="_blank"
                                >
                                  <Github size={12} />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No judges assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Schedule</CardTitle>
              <CardDescription>Important dates and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Registration Opens</h4>
                    <p className="text-sm text-gray-600">
                      Start registering for the hackathon
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(() => {
                        try {
                          const date = new Date(hackathon.createdAt);
                          if (isNaN(date.getTime())) return "Unknown date";
                          return format(date, "MMM dd, yyyy");
                        } catch (error) {
                          return "Unknown date";
                        }
                      })()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Registration Deadline</h4>
                    <p className="text-sm text-gray-600">
                      Last day to register for the hackathon
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {hackathon.registrationDeadline
                        ? format(
                            new Date(hackathon.registrationDeadline),
                            "MMM dd, yyyy"
                          )
                        : "TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Hackathon Starts</h4>
                    <p className="text-sm text-gray-600">
                      Official start of the hackathon
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {hackathon.startDate
                        ? format(new Date(hackathon.startDate), "MMM dd, yyyy")
                        : "TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trophy size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Hackathon Ends</h4>
                    <p className="text-sm text-gray-600">
                      Final submission deadline
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {hackathon.endDate
                        ? format(new Date(hackathon.endDate), "MMM dd, yyyy")
                        : "TBD"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Projects</CardTitle>
              <CardDescription>
                Projects submitted to this hackathon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No projects submitted yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Be the first to submit a project!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
