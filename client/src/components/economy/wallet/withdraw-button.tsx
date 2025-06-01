import React, { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface WithdrawButtonProps {
  walletBalanceUSDT: number;
  dgtPoints: number;
  variant?: 'default' | 'small';
  className?: string;
  onClick?: () => void;
}

export function WithdrawButton({
  walletBalanceUSDT,
  dgtPoints,
  variant = 'default',
  className = '',
  onClick
}: WithdrawButtonProps) {
  const [activeTab, setActiveTab] = useState('usdt');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      currency: 'USDT' | 'DGT';
      address?: string;
    }) => {
      // This would be a real API call in production
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to process withdrawal');
      return response.json();
    },
    onMutate: () => {
      setIsWithdrawing(true);
    },
    onSuccess: (_, variables) => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setWithdrawAddress('');
      
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      
      // Success toast
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal of ${variables.amount} ${variables.currency} has been submitted and is being processed.`,
        variant: "success",
      });
      
      // Reset success state after a delay
      setTimeout(() => {
        setWithdrawSuccess(false);
      }, 3000);
    },
    onError: (error) => {
      setIsWithdrawing(false);
      
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "error",
      });
    }
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "error",
      });
      return;
    }

    if (activeTab === 'usdt') {
      // Check USDT balance
      if (amount > walletBalanceUSDT) {
        toast({
          title: "Insufficient Balance",
          description: "Your USDT balance is too low for this withdrawal",
          variant: "error",
        });
        return;
      }

      // Check USDT withdrawal address
      if (!withdrawAddress || withdrawAddress.trim().length < 10) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid TRC-20 wallet address",
          variant: "error",
        });
        return;
      }

      // Check minimum withdrawal
      if (amount < 20) {
        toast({
          title: "Amount Too Low",
          description: "Minimum USDT withdrawal is 20 USDT",
          variant: "error",
        });
        return;
      }
    } else {
      // Check DGT balance
      if (amount > dgtPoints) {
        toast({
          title: "Insufficient Balance",
          description: "Your DGT points balance is too low for this withdrawal",
          variant: "error",
        });
        return;
      }

      // Check minimum withdrawal
      if (amount < 1000) {
        toast({
          title: "Amount Too Low",
          description: "Minimum DGT withdrawal is 1,000 DGT",
          variant: "error",
        });
        return;
      }
    }

    // Process withdrawal
    withdrawMutation.mutate({
      amount,
      currency: activeTab === 'usdt' ? 'USDT' : 'DGT',
      address: activeTab === 'usdt' ? withdrawAddress : undefined
    });
  };

  const validateAddress = () => {
    if (withdrawAddress && withdrawAddress.trim().length >= 30) {
      // This would be a real validation in production
      const isValid = withdrawAddress.startsWith('T') && withdrawAddress.length >= 30;
      
      setAddressValidated(isValid);
      
      if (isValid) {
        toast({
          title: "Address Validated",
          description: "Your withdrawal address appears to be valid",
          variant: "success",
        });
      } else {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Tron (TRC-20) address",
          variant: "error",
        });
      }
    } else {
      setAddressValidated(false);
      toast({
        title: "Invalid Address",
        description: "Please enter a complete wallet address",
        variant: "error",
      });
    }
  };

  const setMaxAmount = () => {
    if (activeTab === 'usdt') {
      setWithdrawAmount(walletBalanceUSDT.toString());
    } else {
      setWithdrawAmount(dgtPoints.toString());
    }
  };

  // Small variant for compact displays
  if (variant === 'small') {
    return (
      <Button 
        variant="secondary" 
        size="sm"
        leftIcon={<ArrowUpRight className="h-4 w-4" />}
        className={className}
        onClick={onClick}
      >
        Withdraw
      </Button>
    );
  }

  return (
    <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 shadow-lg space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-white mb-2">Withdraw Funds</h3>
      <p className="text-zinc-400 text-sm">
        Withdraw your USDT or convert DGT points to exclusive items in our shop.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-zinc-900">
          <TabsTrigger 
            value="usdt" 
            className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-white"
          >
            USDT
            <Badge variant="outline" className="ml-2 bg-zinc-900 text-emerald-500">${walletBalanceUSDT?.toFixed(2) || '0.00'}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="dgt"
            className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-white"
          >
            DGT Points
            <Badge variant="outline" className="ml-2 bg-zinc-900 text-amber-500">{dgtPoints?.toLocaleString() || '0'}</Badge>
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="usdt" className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm text-zinc-400 mb-2">Withdrawal Amount (USDT)</h4>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                variant="wallet"
                min={20}
                max={walletBalanceUSDT}
                className="flex-1 focus:border-emerald-800/70"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={setMaxAmount}
                className="whitespace-nowrap"
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Minimum withdrawal: 20 USDT
            </p>
          </div>
          
          <div>
            <h4 className="text-sm text-zinc-400 mb-2">Withdrawal Address (TRC-20)</h4>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter your TRC-20 wallet address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                variant="wallet"
                className="flex-1 focus:border-emerald-800/70"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={validateAddress}
                className="whitespace-nowrap"
              >
                Validate
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {addressValidated ? 
                <span className="text-emerald-500 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Address validated
                </span> : 
                "Enter the TRC-20 address where you want to receive your USDT"
              }
            </p>
          </div>
        </TabsContent>

        <TabsContent value="dgt" className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm text-zinc-400 mb-2">Convert DGT Points</h4>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                variant="wallet"
                min={1000}
                max={dgtPoints}
                className="flex-1 focus:border-amber-800/70"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={setMaxAmount}
                className="whitespace-nowrap"
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Minimum conversion: 1,000 DGT Points
            </p>
          </div>
          
          <div className="bg-zinc-900/50 p-3 rounded-lg">
            <h4 className="text-sm text-zinc-300 mb-2">Convert DGT Points to Shop Credits</h4>
            <p className="text-xs text-zinc-500">
              DGT Points can be converted to shop credits for purchasing exclusive items, badges, 
              frames, and other special perks in our marketplace.
            </p>
          </div>
        </TabsContent>
      </Tabs>
          
      <div className="flex justify-end pt-2">
        <Button
          variant={activeTab === 'dgt' ? 'xp' : 'secondary'}
          leftIcon={<ArrowUpRight className="h-4 w-4" />}
          onClick={handleWithdraw}
          isLoading={isWithdrawing}
          disabled={
            withdrawSuccess || 
            !withdrawAmount || 
            isNaN(parseFloat(withdrawAmount)) || 
            parseFloat(withdrawAmount) <= 0 ||
            (activeTab === 'usdt' && (
              parseFloat(withdrawAmount) > walletBalanceUSDT || 
              parseFloat(withdrawAmount) < 20 ||
              !withdrawAddress ||
              withdrawAddress.trim().length < 30
            )) ||
            (activeTab === 'dgt' && (
              parseFloat(withdrawAmount) > dgtPoints ||
              parseFloat(withdrawAmount) < 1000
            ))
          }
          className="transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] active:scale-95"
        >
          {withdrawSuccess ? 'Withdrawal Submitted' : `Withdraw ${activeTab.toUpperCase()}`}
        </Button>
      </div>
      
      <div className="bg-black/50 rounded-lg p-3 text-xs border border-zinc-800">
        <h4 className="text-zinc-400 font-medium mb-1">Withdrawal Information</h4>
        {activeTab === 'usdt' ? (
          <ul className="list-disc pl-5 space-y-1 text-zinc-500">
            <li>USDT withdrawals are processed within 24 hours.</li>
            <li>Minimum withdrawal amount is 20 USDT.</li>
            <li>Only USDT on the Tron network (TRC-20) is supported.</li>
            <li>Ensure the receiving address is correct - wrong addresses cannot be recovered.</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 space-y-1 text-zinc-500">
            <li>DGT points can be converted to shop credits at a 1:1 ratio.</li>
            <li>Shop credits can be used to purchase exclusive items and perks.</li>
            <li>Minimum conversion amount is 1,000 DGT points.</li>
            <li>DGT point conversions are instant and non-reversible.</li>
          </ul>
        )}
      </div>
    </div>
  );
}