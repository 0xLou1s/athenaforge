"use client";

import { useState } from "react";
import { useHackathons } from "@/hooks/use-hackathons";
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
import { Search, Filter } from "lucide-react";
import Link from "next/link";
import HackathonCard from "@/components/hackathon-card";

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

  // Filter hackathons based on search and status
  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch =
      searchQuery === "" ||
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (hackathon.status || "upcoming") === statusFilter;

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
    <div className="container mx-auto py-8">
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
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || statusFilter !== "all"
                    ? "No hackathons found"
                    : "No hackathons yet"}
                </h3>
                <p className="text-sm mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Be the first to create a hackathon and start building the future of decentralized development."}
                </p>
                {searchQuery || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/create-hackathon">
                      Create Your First Hackathon
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
