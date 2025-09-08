import TitleSection from "@/components/title-section";
import { Button } from "@/components/ui/button";
import { CardHover } from "@/components/ui/hover-card";
import Link from "next/link";

const hackathonCards = [
  {
    id: 1,
    title: "AthenaForge Buildathon",
    description:
      "Co-create the first open-source decentralized hackathon platform. All data stored on IPFS.",
    image:
      "https://pbs.twimg.com/profile_banners/1889977435346608128/1740382792/1500x500",
    participants: 320,
    date: "Sep 21 - Oct 5, 2025",
    link: "#",
    buttonText: "Join Now",
  },
  {
    id: 2,
    title: "DeFi Innovation Sprint",
    description:
      "Push the boundaries of decentralized finance with new protocols, tools, and integrations.",
    image:
      "https://pbs.twimg.com/profile_banners/1889977435346608128/1740382792/1500x500",
    participants: 210,
    date: "Oct 12 - Oct 20, 2025",
    link: "#",
    buttonText: "Join Now",
  },
  {
    id: 3,
    title: "AI x Web3 Challenge",
    description:
      "Build AI-powered dApps leveraging decentralized compute and IPFS permanence.",
    image:
      "https://pbs.twimg.com/profile_banners/1889977435346608128/1740382792/1500x500",
    participants: 450,
    date: "Nov 2 - Nov 16, 2025",
    link: "#",
    buttonText: "Join Now",
  },
];

export default function HackathonsSection() {
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
          Explore upcoming hackathons, see who’s building, and join the
          movement.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {hackathonCards.map((card) => (
          <CardHover
            key={card.id}
            className="flex h-full flex-col justify-center items-center text-center"
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-40 object-cover"
            />
            <div className="flex flex-col flex-1 p-6">
              <h3 className="text-lg font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {card.description}
              </p>
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                <span>{card.participants} participants</span>
                <span>{card.date}</span>
              </div>
              <Button asChild className="w-full mt-auto">
                <Link href={card.link}>{card.buttonText}</Link>
              </Button>
            </div>
          </CardHover>
        ))}
      </div>
    </div>
  );
}
