import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import WalletProviders from "./wallet-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProviders>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="top-center" />
        {children}
      </ThemeProvider>
    </WalletProviders>
  );
}
