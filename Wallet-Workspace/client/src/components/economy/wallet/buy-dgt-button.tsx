import React, { useState } from 'react';
import { DollarSign, Wallet, QrCode, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BuyDgtButtonProps {
  dgtPoints?: number;
  walletBalanceUSDT?: number;
  variant?: 'small' | 'full';
  onClick?: () => void;
}

// Define the treasury info interface
interface TreasuryInfo {
  address: string;
  exchangeRate: {
    dgt: number;
    usdt: number;
  }
}

export function BuyDgtButton({ dgtPoints, walletBalanceUSDT, variant = 'full', onClick }: BuyDgtButtonProps) {
  const [usdtAmount, setUsdtAmount] = useState('10');
  const [copiedTreasuryAddress, setCopiedTreasuryAddress] = useState(false);
  const { toast } = useToast();
  
  // Fetch treasury wallet info
  const { data: treasuryInfo, isLoading: treasuryLoading } = useQuery({
    queryKey: ['/api/wallet/treasury-address'],
    queryFn: () => apiRequest<TreasuryInfo>({
      url: '/api/wallet/treasury-address',
      method: 'GET'
    })
  });
  
  const dgtAmount = treasuryInfo && treasuryInfo.exchangeRate
    ? Number(usdtAmount) * treasuryInfo.exchangeRate.dgt / treasuryInfo.exchangeRate.usdt 
    : 0;
  
  const handleCopyAddress = (address: string) => {
    if (!address) return;
    
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedTreasuryAddress(true);
        
        // Reset copy state after 2 seconds
        setTimeout(() => {
          setCopiedTreasuryAddress(false);
        }, 2000);
        
        // Show toast
        toast({
          title: "Address Copied",
          description: "Treasury wallet address copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Failed to copy address:', err);
        
        toast({
          title: "Copy Failed",
          description: "Could not copy wallet address",
          variant: "destructive",
        });
      });
  };
  
  // If small variant, render a simple button
  if (variant === 'small') {
    return (
      <Button 
        variant="outline" 
        className="w-full bg-zinc-900/50 border-zinc-800 hover:border-emerald-700 hover:bg-emerald-950/10"
        onClick={onClick}
      >
        <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
        Buy DGT with USDT
      </Button>
    );
  }
  
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg">Buy DGT with USDT</CardTitle>
        <CardDescription className="text-zinc-400">
          Purchase DGT tokens using USDT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Current Exchange Rate</div>
            {treasuryInfo && treasuryInfo.exchangeRate ? (
              <div className="text-emerald-400 font-medium">
                1 USDT = {treasuryInfo.exchangeRate.dgt} DGT
              </div>
            ) : (
              <div className="text-zinc-500">Loading exchange rate...</div>
            )}
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-md p-3 mb-6">
            <div className="text-sm text-emerald-400 font-medium mb-2">
              DGT Calculator
            </div>
            <div className="flex flex-col space-y-3">
              <div>
                <Label htmlFor="usdt-amount" className="text-xs text-zinc-400">
                  USDT Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="usdt-amount"
                    type="number"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="pl-8 bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dgt-amount" className="text-xs text-zinc-400">
                  DGT You'll Receive
                </Label>
                <div className="relative">
                  <Wallet className="absolute left-2 top-2.5 h-4 w-4 text-emerald-500" />
                  <Input
                    id="dgt-amount"
                    type="text"
                    value={isNaN(dgtAmount) ? '-' : dgtAmount.toLocaleString()}
                    readOnly
                    className="pl-8 bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4 bg-zinc-800" />
          
          <div className="my-4">
            <h3 className="text-sm font-medium mb-2">Treasury Wallet Address (USDT-TRC20)</h3>
            <div className="flex flex-col items-center mb-6 space-y-4">
              <div className="w-40 h-40 bg-white p-2 rounded-md">
                {/* Placeholder for QR code - in a real app, generate dynamically */}
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-900">
                  <QrCode className="h-20 w-20" />
                </div>
              </div>
              {treasuryInfo && treasuryInfo.address ? (
                <div className="flex items-center w-full">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-l-md py-2 px-3 flex-grow truncate font-mono text-xs">
                    {treasuryInfo.address}
                  </div>
                  <Button
                    variant="default"
                    className="rounded-l-none"
                    size="sm"
                    onClick={() => handleCopyAddress(treasuryInfo.address || '')}
                  >
                    {copiedTreasuryAddress ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedTreasuryAddress ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              ) : (
                <div className="w-full h-10 bg-zinc-800/50 animate-pulse rounded-md"></div>
              )}
            </div>
            
            <Alert variant="destructive" className="bg-red-950/30 border-red-900/40 mb-4 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Important: Only send USDT-TRC20 (Tron Network) to this address. Other tokens will be lost.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm space-y-2 text-zinc-400">
              <p>1. Send the USDT amount from above to the Treasury wallet address</p>
              <p>2. Your DGT balance will be credited automatically after confirmation (usually within 10-30 minutes)</p>
              <p>3. Transaction ID and status will appear in your transaction history</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-900/50 border-t border-zinc-800 flex flex-col items-start">
        <p className="text-xs text-zinc-500 mb-1">
          Need help? Contact support@degentalk.com with your transaction details
        </p>
        <p className="text-xs text-zinc-500">
          DGT token upgrades to on-chain coming soon - your balance will transfer automatically
        </p>
      </CardFooter>
    </Card>
  );
}