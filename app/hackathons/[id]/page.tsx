import { notFound } from "next/navigation";
import { useHackathons } from "@/hooks/use-hackathons";
import HackathonDetail from "@/containers/hackathons/hackathon-detail";

interface HackathonPageProps {
  params: {
    id: string;
  };
}

export default function HackathonPage({ params }: HackathonPageProps) {
  const { getHackathonById } = useHackathons();
  const hackathon = getHackathonById(params.id);

  if (!hackathon) {
    notFound();
  }

  return <HackathonDetail hackathon={hackathon} />;
}
