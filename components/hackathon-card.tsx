"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Hackathon } from "@/stores";

interface HackathonCardProps {
  hackathon: Hackathon;
  showFullDescription?: boolean;
  className?: string;
}

export default function HackathonCard({
  hackathon,
  showFullDescription = false,
  className = "",
}: HackathonCardProps) {
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return "Date TBD";
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "Date TBD";
      }

      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } catch (error) {
      return "Date TBD";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "secondary";
      case "active":
        return "default";
      case "ended":
        return "outline";
      default:
        return "outline";
    }
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Register Now";
      case "active":
        return "Join Now";
      case "ended":
        return "View Results";
      default:
        return "Learn More";
    }
  };

  const getButtonVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "active":
        return "default";
      case "ended":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="relative">
        <img
          src={
            hackathon.image
              ? hackathon.image.startsWith('http')
                ? hackathon.image
                : `https://${hackathon.image}`
              : "/placeholder-hackathon.jpg"
          }
          alt={hackathon.title || "hackathon"}
          className="w-full h-48 object-cover"
        />
        <Badge
          variant={getStatusBadgeVariant(hackathon.status || "upcoming")}
          className="absolute top-4 right-4"
        >
          {(hackathon.status || "upcoming").charAt(0).toUpperCase() +
            (hackathon.status || "upcoming").slice(1)}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2">
          {hackathon.title || "Untitled Hackathon"}
        </CardTitle>
        <CardDescription className={showFullDescription ? "" : "line-clamp-3"}>
          {hackathon.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateRange(hackathon.startDate, hackathon.endDate)}</span>
        </div>
        {/* Participants */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {Array.isArray(hackathon.participants) ? hackathon.participants.length : hackathon.participants || 0} participants
          </span>
        </div>

        {/* Tracks */}
        {(hackathon.tracks || []).length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>
              {(hackathon.tracks || []).length} track
              {(hackathon.tracks || []).length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Registration Deadline */}
        {hackathon.registrationDeadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Register by {formatDateRange(hackathon.registrationDeadline, hackathon.registrationDeadline)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="w-full"
          variant={getButtonVariant(hackathon.status || "upcoming")}
        >
          <Link href={`/hackathons/${hackathon.id}`}>
            {getButtonText(hackathon.status || "upcoming")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
