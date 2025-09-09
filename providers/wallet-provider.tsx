"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { rootstock, rootstockTestnet } from "viem/chains";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { queryClient } from "./wagmi-provider-config";
import envConfig from "@/config/env-config";

export const wagmiConfig = createConfig({
  chains: [rootstock, rootstockTestnet],
  transports: {
    [rootstock.id]: http(),
    [rootstockTestnet.id]: http(),
  },
});

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
  loginMethods: ["wallet", "email"],
  appearance: {
    showWalletLoginFirst: false,
    accentColor: "#6A6FF5",
    loginMessage: "Please sign this message to confirm your identity",
    walletChainType: "ethereum-only",
  },
  defaultChain: rootstockTestnet,
  supportedChains: [rootstock, rootstockTestnet],
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={envConfig.NEXT_PUBLIC_PRIVY_APP_ID}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
