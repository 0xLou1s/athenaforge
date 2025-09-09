import HackathonsSection from "@/containers/marketing/hackathons-section";
import HeroSection from "@/containers/marketing/hero-section";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex w-full flex-col my-4 items-center">
        <div className="w-full mx-auto flex flex-col gap-2">
          <HeroSection />
          <HackathonsSection />
        </div>
      </div>
    </div>
  );
}
