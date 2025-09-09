"use client";

import { useState } from "react";
import { useHackathons } from "@/hooks/use-hackathons";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Calendar, Users, Trophy, Search, Filter } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function HackathonsPage() {
  const {
    hackathons,
    isLoading,
    error,
    getHackathonsByStatus,
    searchHackathons,
  } = useHackathons();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
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

  // Filter hackathons based on search and status
  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch =
      searchQuery === "" ||
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || hackathon.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-20">
          <div className="text-center">
            <p className="text-destructive text-lg mb-4">
              Error loading hackathons: {error}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
          Discover <span className="text-primary">Hackathons</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join exciting hackathons, build innovative projects, and connect with
          the developer community.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search hackathons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hackathons</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredHackathons.length} of {hackathons.length} hackathons
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Spinner size={32} variant="bars" />
        </div>
      ) : (
        <>
          {/* Hackathons Grid */}
          {filteredHackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHackathons.map((hackathon) => (
                <Card
                  key={hackathon.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={hackathon.image}
                      alt={hackathon.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge
                      variant={getStatusBadgeVariant(hackathon.status)}
                      className="absolute top-4 right-4"
                    >
                      {hackathon.status.charAt(0).toUpperCase() +
                        hackathon.status.slice(1)}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {hackathon.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {hackathon.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDateRange(
                          hackathon.startDate,
                          hackathon.endDate
                        )}
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {hackathon.participants} participants
                        {hackathon.maxParticipants &&
                          ` / ${hackathon.maxParticipants}`}
                      </span>
                    </div>

                    {/* Prizes */}
                    {hackathon.prizes.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span>
                          {hackathon.prizes.length} prize
                          {hackathon.prizes.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Tracks */}
                    {hackathon.tracks.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {hackathon.tracks.slice(0, 2).map((track) => (
                          <Badge
                            key={track.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {track.name}
                          </Badge>
                        ))}
                        {hackathon.tracks.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{hackathon.tracks.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      asChild
                      className="w-full"
                      variant={getButtonVariant(hackathon.status)}
                    >
                      <Link href={`/hackathons/${hackathon.id}`}>
                        {getButtonText(hackathon.status)}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No hackathons found
                </h3>
                <p className="text-sm">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No hackathons are currently available."}
                </p>
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
