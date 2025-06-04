import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Copy, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export interface DepositButtonProps {
  variant?: 'default' | 'small';
  className?: string;
  onClick?: () => void;
}

export function DepositButton({
  variant = 'default',
  className,
  onClick
}: DepositButtonProps) {
  const [depositAddress, setDepositAddress] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMemo, setDepositMemo] = useState('');
  const [showGlow, setShowGlow] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const depositMutation = useMutation({
    mutationFn: async () => {
      // This simulates fetching a deposit address - in a real implementation 
      // this would come from the server
      const response = await fetch('/api/wallet/deposit-address', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to get deposit address');
      return response.json();
    },
    onSuccess: (data) => {
      setDepositAddress(data.address || 'TUVx8ossL9LVgmKa5wFCrPbPyv1SYzCqjE');
      // Show success toast
      toast({
        title: "Deposit Address Generated",
        description: "Your deposit address has been generated. Send USDT (TRC-20) to this address.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate Address",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress)
        .then(() => {
          setCopiedAddress(true);
          setTimeout(() => setCopiedAddress(false), 3000);
          
          toast({
            title: "Address Copied",
            description: "Deposit address copied to clipboard",
            variant: "default",
          });
        })
        .catch(() => {
          toast({
            title: "Failed to Copy",
            description: "Could not copy address to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  const triggerDepositSuccess = (amount: number) => {
    // In a real implementation, you would check for deposit confirmation
    // from the blockchain. This is just a simulation for the UI.
    setShowGlow(true);
    
    toast({
      title: "Deposit Detected!",
      description: `Your deposit of $${amount.toFixed(2)} USDT has been detected and is being processed.`,
      variant: "default",
    });
    
    // Reset the glow effect after the animation completes
    setTimeout(() => {
      setShowGlow(false);
      
      // Reset the form
      setDepositAmount('');
      setDepositMemo('');
      
      // Invalidate the balance query to show the updated balance
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
    }, 1500);
  };

  const handleSubmitDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate deposit success - in a real implementation this would be handled
    // by blockchain transaction monitoring
    triggerDepositSuccess(amount);
  };

  // Small variant for compact displays
  if (variant === 'small') {
    return (
      <Button 
        variant="wallet" 
        size="sm"
        leftIcon={<ArrowDownToLine className="h-4 w-4" />}
        className={className}
        onClick={onClick}
      >
        Deposit USDT
      </Button>
    );
  }

  return (
    <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 shadow-lg space-y-4 ${className} ${showGlow ? 'deposit-glow' : ''}`}>
      <h3 className="text-lg font-medium text-white mb-2">Deposit USDT</h3>
      <p className="text-zinc-400 text-sm mb-4">
        Deposit USDT (TRC-20) to your DegenTalk wallet to start tipping, making it rain, or purchasing items.
      </p>
      
      <div>
        <h4 className="text-sm text-zinc-400 mb-2">Your Deposit Address (TRC-20)</h4>
        {!depositAddress ? (
          <Button
            variant="gradient"
            onClick={() => depositMutation.mutate()}
            isLoading={depositMutation.isPending}
            className="w-full"
          >
            Generate Deposit Address
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="bg-black rounded-lg border border-zinc-800 py-2 px-3 font-mono text-sm text-zinc-300 flex-1 truncate">
                {depositAddress}
              </div>
              <Button 
                variant="outline" 
                size="icon-sm"
                onClick={copyToClipboard}
                className={copiedAddress ? 'border-emerald-700 bg-emerald-950/30' : ''}
              >
                {copiedAddress ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              Only send USDT (TRC-20) to this address. Other tokens may be lost.
            </p>
            
            <div className="mt-6">
              <h4 className="text-sm text-zinc-400 mb-2">Expected Deposit Amount (Optional)</h4>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                variant="wallet"
                min={0}
                className="transition-all focus:border-emerald-800/70"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Minimum deposit: 10.00 USDT
              </p>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm text-zinc-400 mb-2">Memo / Notes (Optional)</h4>
              <Input
                placeholder="Deposit notes or reference"
                value={depositMemo}
                onChange={(e) => setDepositMemo(e.target.value)}
                variant="wallet"
                className="transition-all focus:border-emerald-800/70"
              />
              <p className="text-xs text-zinc-500 mt-1">
                For your reference only. Not sent with the transaction.
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                variant="gradient"
                onClick={handleSubmitDeposit}
                disabled={!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0}
                className="transition-all hover:shadow-[0_0_10px_rgba(5,150,105,0.5)] active:scale-95"
              >
                Track Deposit
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-black/50 rounded-lg p-4 text-xs border border-zinc-800 mt-4">
        <h4 className="text-zinc-400 font-medium mb-2">Deposit Information</h4>
        <ul className="list-disc pl-5 space-y-1 text-zinc-500">
          <li>Deposits are typically credited within 5-30 minutes after network confirmation.</li>
          <li>Minimum deposit amount is 10.00 USDT.</li>
          <li>Only send USDT on the Tron network (TRC-20) to this address.</li>
          <li>Do not send any other tokens or coins to this address.</li>
        </ul>
      </div>
    </div>
  );
}