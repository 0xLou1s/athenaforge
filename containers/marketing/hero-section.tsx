import TextHighlight from "@/components/text-highlight";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <div className="lg:min-h-[80vh] w-full px-2 py-8 lg:p-20 flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-4xl lg:text-6xl tracking-tighter leading-12 lg:leading-20 font-bold lg:max-w-2xl">
        Build the Future on a <TextHighlight>Decentralized</TextHighlight>{" "}
        Platform
      </h1>
      <p className="text-sm lg:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto text-pretty">
        Join hackathons where everything lives on IPFS. No central authority, no
        single point of failure. Just pure innovation powered by the
        decentralized web.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button size="lg" className="px-8 w-fit " asChild>
          <Link href="/hackathons">Browse Hackathons</Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="px-8 bg-transparent hidden lg:block"
        >
          Create Your Project
        </Button>
      </div>
    </div>
  );
}
