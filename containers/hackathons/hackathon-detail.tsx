"use client";

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
import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { Hackathon } from "@/stores/hackathon-store";
import { format, isAfter, isBefore } from "date-fns";
import {
  Calendar,
  Users,
  Trophy,
  Code,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface HackathonDetailProps {
  hackathon: Hackathon;
}

export default function HackathonDetail({ hackathon }: HackathonDetailProps) {
  const { authenticated, user } = usePrivyAuth();

  const formatDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canRegister = () => {
    const now = new Date();
    const registrationDeadline = new Date(hackathon.registrationDeadline);
    return (
      isAfter(registrationDeadline, now) && hackathon.status === "upcoming"
    );
  };

  const canSubmit = () => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    return (
      isAfter(now, startDate) &&
      isBefore(now, endDate) &&
      hackathon.status === "active"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={hackathon.image}
          alt={hackathon.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex items-center gap-4 mb-4">
              {getStatusBadge(hackathon.status)}
              <div className="flex items-center gap-2 text-white/80">
                <Users className="size-4" />
                <span>{hackathon.participants} participants</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {hackathon.title}
            </h1>
            <p className="text-lg text-white/90 max-w-3xl">
              {hackathon.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Registration Deadline
                  </span>
                  <span className="font-medium">
                    {formatDateTime(hackathon.registrationDeadline)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {formatDateTime(hackathon.startDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">
                    {formatDateTime(hackathon.endDate)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tracks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="size-5" />
                  Tracks
                </CardTitle>
                <CardDescription>
                  Choose a track that aligns with your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hackathon.tracks.map((track) => (
                    <div key={track.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{track.name}</h4>
                      <p className="text-muted-foreground mb-3">
                        {track.description}
                      </p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Judging Criteria:
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {track.criteria.map((criterion, index) => (
                            <li key={index}>• {criterion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {hackathon.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rules</h4>
                  <ul className="space-y-1">
                    {hackathon.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                {!authenticated ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Connect your wallet to participate
                    </p>
                    <Button className="w-full" asChild>
                      <Link href="/">Connect Wallet</Link>
                    </Button>
                  </div>
                ) : canRegister() ? (
                  <Button className="w-full">Register Now</Button>
                ) : canSubmit() ? (
                  <Button className="w-full">Submit Project</Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Registration Closed
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Prizes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-5" />
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hackathon.prizes.map((prize) => (
                    <div
                      key={prize.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{prize.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {prize.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {prize.amount.toLocaleString()} {prize.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Judges */}
            {hackathon.judges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Judges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hackathon.judges.map((judge) => (
                      <div key={judge.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={judge.avatar} alt={judge.name} />
                          <AvatarFallback>
                            {judge.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{judge.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {judge.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {judge.company}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Event Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Max Participants
                  </span>
                  <span className="font-medium">
                    {hackathon.maxParticipants || "Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Current Participants
                  </span>
                  <span className="font-medium">{hackathon.participants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(hackathon.status)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
