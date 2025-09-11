"use client";

import TitleSection from "@/components/title-section";
import { Button } from "@/components/ui/button";
import { CardHover } from "@/components/ui/hover-card";
import { Spinner } from "@/components/ui/spinner";
import { useHackathons } from "@/hooks/use-hackathons";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

export default function HackathonsSection() {
  const { hackathons, isLoading, error } = useHackathons();

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

  if (error) {
    return (
      <div className="border-y mb-2">
        <div className="flex items-center justify-center p-20">
          <p className="text-red-500">Error loading hackathons: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-y mb-2">
      <div className="flex items-center justify-end p-6 ">
        <h2 className="text-xs">/HACKATHONS</h2>
      </div>
      <div className="flex flex-col justify-center items-center pb-20 gap-2">
        <TitleSection text="ACTIVE HACKATHONS" />
        <h2 className="text-3xl lg:text-5xl tracking-tighter leading-12 lg:leading-20 font-semibold max-w-xl text-center">
          Discover & Join <span className="text-primary">Hackathons</span>
        </h2>
        <p className="text-center font-semibold text-sm max-w-[22rem]">
          Explore upcoming hackathons, see who's building, and join the
          movement.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Spinner size={24} variant="bars" />
        </div>
      ) : hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3">
          {hackathons
            .filter((hackathon) => hackathon.title && hackathon.description) // Filter out incomplete objects
            .slice(0, 3)
            .map((hackathon) => (
              <CardHover
                key={hackathon.id}
                className="flex h-full flex-col justify-center items-center text-center"
              >
                <img
                  src={
                    hackathon.image
                      ? `https://${hackathon.image}`
                      : "/placeholder-hackathon.jpg"
                  }
                  alt={hackathon.title || "hackathon"}
                  className="w-full h-50 object-cover"
                />
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-lg font-bold mb-2">
                    {hackathon.title || "Untitled Hackathon"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {hackathon.description || "No description available"}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                    <span className="mr-2">
                      {hackathon.participants || 0} participants
                    </span>
                    <span>
                      {formatDateRange(hackathon.startDate, hackathon.endDate)}
                    </span>
                  </div>
                  <Button asChild className="w-full mt-auto">
                    <Link href={`/hackathons/${hackathon.id}`}>
                      {getButtonText(hackathon.status || "upcoming")}
                    </Link>
                  </Button>
                </div>
              </CardHover>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <h3 className="text-xl font-semibold mb-4">No Hackathons Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Be the first to create a hackathon and start building the future of
            decentralized development.
          </p>
          <Button asChild>
            <Link href="/create-hackathon">Create Your First Hackathon</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
