import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowUpRight, PlugZap } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import ThemeToggler from "../theme/toggler";
import ConnectWalletBtn from "../connect-wallet-btn";

export default function Header() {
  return (
    <div
      id="nav"
      className="w-full h-14 flex items-center justify-end border divide-x"
    >
      <div
        id="brand"
        className="font-mono text-sm flex-1 flex items-center h-full px-3 uppercase"
      >
        <Link href="/" className="hover:underline hidden md:inline-block">
          athena forge
        </Link>
        <Link href="/" className="hover:underline md:hidden">
          af
        </Link>
      </div>

      <Button className="h-full" size="lg" variant="ghost" asChild>
        <Link href="/about" className="flex items-center gap-2 group/nav">
          <span>Hackathons</span>
          <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
            <ArrowUpRight className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
            <ArrowUpRight className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
          </div>
        </Link>
      </Button>

      {Object.entries(siteConfig.socials).map(([key, value]) => {
        const Icon = value.icon;
        return (
          <Button
            key={key}
            variant="ghost"
            asChild
            className="h-full aspect-square hidden md:flex"
          >
            <Link href={value.href} target="_blank" className="gap-2">
              <Icon className="size-4" />
            </Link>
          </Button>
        );
      })}

      <ConnectWalletBtn />
      <ThemeToggler className="h-full" />
    </div>
  );
}
