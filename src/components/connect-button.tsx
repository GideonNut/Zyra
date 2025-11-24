"use client";

import { Button } from "@/components/ui/button";
import { useConnect, useActiveWallet } from "thirdweb/react";
import { createWallet, injectedProvider, WalletId } from "thirdweb/wallets";
import { inAppWallet, preAuthenticate } from "thirdweb/wallets";
import { cn } from "@/lib/utils";
import { client } from "@/lib/constants";
import { useState } from "react";

interface ConnectButtonProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  title?: string;
  isEmailSignIn?: boolean;
}

export function ConnectButton({
  id,
  children,
  className,
  variant = "default",
  size = "default",
  title,
  isEmailSignIn = false,
  ...props
}: ConnectButtonProps) {
  const { connect, isConnecting } = useConnect();
  const activeWallet = useActiveWallet();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleConnect = () => {
    if (isEmailSignIn) {
      setShowEmailForm(true);
      return;
    }

    connect(async () => {
      // Standard wallet connection
      const wallet = createWallet(id as WalletId);

      // if user has wallet installed, connect to it
      if (injectedProvider(id as WalletId)) {
        await wallet.connect({ client });
      }
      // open WalletConnect modal so user can scan the QR code and connect
      else {
        await wallet.connect({
          client,
          walletConnect: { showQrModal: true },
        });
      }

      // return the wallet to set it as active wallet
      return wallet;
    });
  };

  const handleSendCode = async () => {
    if (!email || sendingCode || codeSent) return;
    
    setSendingCode(true);
    try {
      await preAuthenticate({
        client,
        strategy: "email",
        email,
      });
      setCodeSent(true);
    } catch (error) {
      console.error("Failed to send verification code:", error);
    } finally {
      setSendingCode(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !verificationCode) return;

    connect(async () => {
      const wallet = inAppWallet();
      await wallet.connect({
        client,
        strategy: "email",
        email,
        verificationCode,
      });
      return wallet;
    });
  };

  const isConnected = isEmailSignIn ? activeWallet?.id === "inApp" : activeWallet?.id === id;

  if (showEmailForm) {
    return (
      <div className="space-y-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md"
          disabled={codeSent}
        />
        {!codeSent ? (
          <Button
            onClick={handleSendCode}
            disabled={!email || sendingCode}
            variant={variant}
            size={size}
            className={cn(className, "w-full")}
          >
            {sendingCode ? "Sending..." : "Send Verification Code"}
          </Button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleEmailSignIn}
                disabled={isConnecting || !verificationCode}
                variant={variant}
                size={size}
                className={cn(className, "flex-1")}
              >
                {isConnecting ? "Connecting..." : "Sign In"}
              </Button>
              <Button
                onClick={async () => {
                  setCodeSent(false);
                  setVerificationCode("");
                  // Wait a moment before allowing resend to prevent double sends
                  await new Promise(resolve => setTimeout(resolve, 100));
                  if (email) {
                    await handleSendCode();
                  }
                }}
                variant="outline"
                size={size}
                disabled={sendingCode}
              >
                {sendingCode ? "Sending..." : "Resend"}
              </Button>
            </div>
          </>
        )}
        <Button
          onClick={() => {
            setShowEmailForm(false);
            setCodeSent(false);
            setSendingCode(false);
            setEmail("");
            setVerificationCode("");
          }}
          variant="outline"
          size={size}
          className="w-full"
          disabled={sendingCode}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnected || isConnecting}
      variant={variant}
      size={size}
      className={cn(className)}
      title={title}
      {...props}
    >
      {isConnecting ? "Connecting..." : children || (isConnected ? "Connected" : "Connect Wallet")}
    </Button>
  );
}
