import TitleSection from "@/components/title-section";
import { Button } from "@/components/ui/button";
import { CardHover } from "@/components/ui/hover-card";
import { Spinner } from "@/components/ui/spinner";
import { useHackathons } from "@/hooks/use-hackathons";
import Link from "next/link";
import { format } from "date-fns";

export default function HackathonsSection() {
  const { hackathons, isLoading, error } = useHackathons();

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3">
          {hackathons.map((hackathon) => (
            <CardHover
              key={hackathon.id}
              className="flex h-full flex-col justify-center items-center text-center"
            >
              <img
                src={hackathon.image}
                alt={hackathon.title}
                className="w-full h-40 object-cover"
              />
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-lg font-bold mb-2">{hackathon.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {hackathon.description}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                  <span>{hackathon.participants} participants</span>
                  <span>
                    {formatDateRange(hackathon.startDate, hackathon.endDate)}
                  </span>
                </div>
                <Button asChild className="w-full mt-auto">
                  <Link href={`/hackathons/${hackathon.id}`}>
                    {getButtonText(hackathon.status)}
                  </Link>
                </Button>
              </div>
            </CardHover>
          ))}
        </div>
      )}
    </div>
  );
}
