"use client";

import { useState } from "react";
import { useActiveWallet, useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  Copy, 
  Check, 
  Mail, 
  ExternalLink,
  Key,
  Download,
  Shield,
  AlertTriangle,
  Eye,
  FileText
} from "lucide-react";

export function WalletManagement() {
  const activeWallet = useActiveWallet();
  const account = useActiveAccount();
  const { data: balance } = useWalletBalance({ 
    client,
    address: account?.address, 
    chain: undefined 
  });
  
  const [copied, setCopied] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [seedPhrase] = useState<string | null>(null);
  const [privateKey] = useState<string | null>(null);
  const [revealSeedPhrase, setRevealSeedPhrase] = useState(false);
  const [revealPrivateKey, setRevealPrivateKey] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExportWallet() {
    if (!activeWallet || !account) return;
    
    setIsExporting(true);
    try {
      // For inApp wallets, create a backup file with wallet information
      if (activeWallet.id === "inApp") {
        // Create a backup JSON with wallet information
        const backupData = {
          walletType: "inApp",
          address: account.address,
          exportedAt: new Date().toISOString(),
          note: "This is a backup of your wallet address. For email wallets, recovery is done through email authentication.",
          instructions: "To recover this wallet, sign in with the same email address used to create it."
        };
        setExportedData(JSON.stringify(backupData, null, 2));
      } else {
        // For other wallets, create a basic backup
        const backupData = {
          walletType: activeWallet.id,
          address: account.address,
          exportedAt: new Date().toISOString(),
          note: "This backup contains your wallet address. For full recovery, use your wallet extension's export feature.",
          instructions: "Use your wallet extension to export seed phrase or private key for full recovery."
        };
        setExportedData(JSON.stringify(backupData, null, 2));
      }
    } catch (error) {
      console.error("Failed to export wallet:", error);
      alert("Failed to export wallet. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleGetSeedPhrase() {
    if (!activeWallet) return;
    
    setIsExporting(true);
    try {
      // For inApp wallets, seed phrases are typically not available
      // as they use email-based authentication
      if (activeWallet.id === "inApp") {
        alert("Email wallets (inApp) don't use seed phrases. Your wallet is secured by your email authentication. Use the export feature to backup your wallet.");
        return;
      }
      
      // For other wallet types, try to get seed phrase
      // Note: Most wallet extensions don't expose seed phrases via API for security
      alert("Seed phrase access is restricted for security. Please use your wallet extension's settings to view your recovery phrase.");
    } catch (error) {
      console.error("Failed to get seed phrase:", error);
      alert("Unable to retrieve seed phrase. Please use your wallet extension to view it.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleGetPrivateKey() {
    if (!activeWallet || !account) return;
    
    setIsExporting(true);
    try {
      // For inApp wallets, try to export private key
      if (activeWallet.id === "inApp") {
        // Note: This requires the wallet to support private key export
        // Most inApp wallets don't expose private keys directly
        alert("Private key export is not available for email wallets. Your wallet is secured by your email authentication. Use the export feature to backup your wallet.");
        return;
      }
      
      // For other wallets, private keys are typically not exposed
      alert("Private key access is restricted for security. Please use your wallet extension's export feature if available.");
    } catch (error) {
      console.error("Failed to get private key:", error);
      alert("Unable to retrieve private key. Please use your wallet extension to export it if needed.");
    } finally {
      setIsExporting(false);
    }
  }

  function downloadBackup(data: string, filename: string) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!activeWallet || !account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No wallet connected</p>
            <p className="text-sm text-muted-foreground">
              Connect a wallet to manage it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isInAppWallet = activeWallet.id === "inApp";
  const walletAddress = account.address;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Management
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Type */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Wallet Type</span>
            <Badge variant={isInAppWallet ? "default" : "secondary"}>
              {isInAppWallet ? "Email Wallet (inApp)" : activeWallet.id}
            </Badge>
          </div>
        </div>

        {/* Email Info (for inApp wallets) */}
        {isInAppWallet && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Authentication
              </span>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Signed in with email. View full wallet details to see email and linked profiles.
              </p>
            </div>
          </div>
        )}

        {/* Wallet Address */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Wallet Address
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <span className="text-sm font-mono flex-1 break-all">
              {walletAddress}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletAddress)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const explorerUrl = `https://etherscan.io/address/${walletAddress}`;
                window.open(explorerUrl, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Etherscan
            </Button>
          </div>
        </div>

        {/* Balance */}
        {balance !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Balance</span>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <span className="text-lg font-semibold">
                {balance?.displayValue || "0"} {balance?.symbol || "ETH"}
              </span>
              {balance?.value && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${(parseFloat(balance.displayValue || "0") * 2000).toFixed(2)} USD
                </p>
              )}
            </div>
          </div>
        )}


        {/* Backup & Recovery */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Backup & Recovery
            </h4>
          </div>
          
          <div className="space-y-3">
            {/* Security Warning */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Security Warning</p>
                  <p>Never share your seed phrase, private key, or wallet export with anyone. Store backups in a secure location. Anyone with access to these can control your wallet.</p>
                </div>
              </div>
            </div>

            {/* Export Wallet */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Wallet</DialogTitle>
                  <DialogDescription>
                    Export your wallet data for backup. Keep this information secure and never share it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {!exportedData ? (
                    <>
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                          <strong>Warning:</strong> Exporting your wallet gives access to your funds. Only export if you understand the risks.
                        </p>
                      </div>
                      {isInAppWallet && (
                        <div>
                          <Label>Export Format</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Email wallets can be exported for backup. This will create a recovery file.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>Exported Data</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs font-mono break-all">{exportedData}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const backupData = JSON.stringify({
                            address: walletAddress,
                            type: activeWallet.id,
                            exportData: exportedData,
                            exportedAt: new Date().toISOString()
                          }, null, 2);
                          downloadBackup(backupData, `wallet-backup-${walletAddress.slice(0, 8)}.json`);
                        }}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Backup File
                      </Button>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  {!exportedData ? (
                    <>
                      <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleExportWallet} disabled={isExporting}>
                        {isExporting ? "Exporting..." : "Export Wallet"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => {
                      setExportedData(null);
                      setShowExportDialog(false);
                    }}>
                      Close
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Seed Phrase */}
            <Dialog open={showSeedPhrase} onOpenChange={setShowSeedPhrase}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Seed Phrase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recovery Seed Phrase</DialogTitle>
                  <DialogDescription>
                    Your seed phrase is used to recover your wallet. Keep it secret and secure.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Never share your seed phrase with anyone!
                    </p>
                  </div>
                  
                  {isInAppWallet ? (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Email wallets (inApp) don&apos;t use traditional seed phrases. Your wallet is secured by your email authentication. 
                        If you need to backup your wallet, use the Export Wallet feature above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Seed Phrase</Label>
                      <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                        {revealSeedPhrase ? (
                          <div className="grid grid-cols-3 gap-2">
                            {seedPhrase ? (
                              seedPhrase.split(' ').map((word, i) => (
                                <div key={i} className="text-sm font-mono p-2 bg-background rounded">
                                  {i + 1}. {word}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground col-span-3">
                                Seed phrase not available. Please use your wallet extension to view it.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                handleGetSeedPhrase();
                                setRevealSeedPhrase(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Reveal Seed Phrase
                            </Button>
                          </div>
                        )}
                      </div>
                      {revealSeedPhrase && seedPhrase && (
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(seedPhrase)}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Seed Phrase
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setShowSeedPhrase(false);
                    setRevealSeedPhrase(false);
                  }}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Private Key */}
            <Dialog open={showPrivateKey} onOpenChange={setShowPrivateKey}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  View Private Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Private Key</DialogTitle>
                  <DialogDescription>
                    Your private key gives full control of your wallet. Never share it with anyone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Never share your private key with anyone!
                    </p>
                  </div>
                  
                  {isInAppWallet ? (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Email wallets (inApp) don&apos;t expose private keys directly. Your wallet is secured by your email authentication. 
                        If you need to backup your wallet, use the Export Wallet feature.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Private Key</Label>
                      <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                        {revealPrivateKey ? (
                          <div>
                            {privateKey ? (
                              <p className="text-xs font-mono break-all p-2 bg-background rounded">
                                {privateKey}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Private key not available. Please use your wallet extension to export it.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                handleGetPrivateKey();
                                setRevealPrivateKey(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Reveal Private Key
                            </Button>
                          </div>
                        )}
                      </div>
                      {revealPrivateKey && privateKey && (
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(privateKey)}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Private Key
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setShowPrivateKey(false);
                    setRevealPrivateKey(false);
                  }}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Wallet Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const explorerUrl = `https://etherscan.io/address/${walletAddress}`;
                window.open(explorerUrl, '_blank');
              }}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Etherscan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const explorerUrl = `https://etherscan.io/address/${walletAddress}`;
                window.open(explorerUrl, '_blank');
              }}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Transactions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
