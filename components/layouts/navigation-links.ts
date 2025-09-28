import { ArrowUpRight, PlugZap } from "lucide-react";

export interface NavLink {
  name: string;
  path: string;
  cta?: boolean;
  isBlank?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const NAV_LINKS: NavLink[] = [
  {
    name: "Hackathons",
    path: "/hackathons",
    icon: ArrowUpRight,
  },
  {
    name: "Create",
    path: "/create-hackathon",
    icon: PlugZap,
  },
  {
    name: "Submit",
    path: "/submit-project",
    icon: ArrowUpRight,
  },
];
