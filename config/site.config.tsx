import { SiteConfig } from "@/types";
import Github from "./icons/github";
import X from "./icons/x";
import Telegram from "./icons/telegram";

export const siteConfig: SiteConfig = {
  name: "AthenaForge",
  title: "AthenaForge - Decentralized Hackathon Platform",
  description:
    "AthenaForge is an open-source, decentralized hackathon platform powered by IPFS. Built for builders, by builders — enabling permanent project submissions, transparent judging, and a global community of innovators.",
  origin: "https://athenaforge.vercel.app",
  keywords: [
    "AthenaForge",
    "Decentralized Hackathon",
    "Web3 Hackathon Platform",
    "IPFS Storage",
    "Open Source Hackathon",
    "Blockchain Builders",
    "Permanent Project Records",
    "Web3 Community",
    "Hackathon Infrastructure",
    "AthenaX",
  ],
  og: "https://athenaforge.vercel.app/og.png",
  creator: {
    name: "Xuan Vuong",
    url: "https://athenaforge.vercel.app",
  },
  socials: {
    github: {
      href: "https://github.com/0xLou1s/athenaforge",
      icon: Github,
    },
    x: {
      href: "https://x.com/0xLou1s",
      icon: X,
    },
    telegram: {
      href: "https://t.me/not0xLou1s",
      icon: Telegram,
    },
  },
};
