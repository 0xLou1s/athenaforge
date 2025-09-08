"use client";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, PlugZap } from "lucide-react";

export default function ConnectWalletBtn() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            className="h-full"
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} style={{ height: "100%" }}>
                    <div className="flex items-center gap-2 group/nav">
                      <span>Connect Wallet</span>
                      <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
                        <PlugZap className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
                        <PlugZap className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
                      </div>
                    </div>
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex h-full">
                  <Button onClick={openChainModal} className="h-full">
                    {/* {chain.name && chain.name.length > 10
                          ? `${chain.name.slice(0, 2)}..${chain.name.slice(-2)}`
                          : chain.name} */}
                    {chain.name && chain.name === "Klaytn Baobab"
                      ? "Kairos"
                      : chain.name}
                    <ChevronDown className="size-4" />
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="default"
                    className="h-full"
                  >
                    <img src={account.ensAvatar} alt="" />
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
