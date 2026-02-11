"use client";

import { ConnectButton } from "@/components/connect-button";
import { FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useBrand } from "@/contexts/brand-context";
import { useTheme } from "@/contexts/theme-context";
import { useActiveAccount } from "thirdweb/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CompanyPage() {
  const { brand, slug } = useBrand();
  const { theme } = useTheme();
  const account = useActiveAccount();
  const router = useRouter();

  // Redirect to dashboard after successful sign-in
  useEffect(() => {
    if (account?.address && slug) {
      router.replace(`/c/${slug}`);
    }
  }, [account?.address, slug, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {brand?.assets?.logo?.[theme] ? (
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">Zyra for</span>
                <Image
                  src={brand.assets.logo[theme]!}
                  alt={brand.name || "Company"}
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="size-6" />
                <h1 className="text-xl font-bold">Zyra</h1>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-md w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">Sign in</h2>
              <p className="text-muted-foreground">Connect your wallet to start creating invoices</p>
            </div>

            <div className="space-y-4">
              <ConnectButton id="email" isEmailSignIn variant="outline" className="flex items-center justify-center gap-2 h-10 px-3 w-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Sign in with Email
              </ConnectButton>
              
              <div className="grid grid-cols-2 gap-3">
                <ConnectButton id="io.metamask" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
                  MetaMask
                </ConnectButton>
                <ConnectButton id="com.coinbase.wallet" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                  <img src="https://avatars.githubusercontent.com/u/18060234?s=280&v=4" alt="Coinbase" className="w-5 h-5 rounded" />
                  Coinbase
                </ConnectButton>
                <ConnectButton id="io.rabby" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                  <img src="https://rabby.io/assets/images/logo-128.png" alt="Rabby" className="w-5 h-5 rounded" />
                  Rabby
                </ConnectButton>
                <ConnectButton id="me.rainbow" variant="outline" className="flex items-center justify-center gap-2 h-10 px-3">
                  <img src="https://rainbow.me/favicon.ico" alt="Rainbow" className="w-5 h-5 rounded" />
                  Rainbow
                </ConnectButton>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Secure connection through your wallet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
