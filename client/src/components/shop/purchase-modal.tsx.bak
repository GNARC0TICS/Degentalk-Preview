import React, { useState, useEffect } from 'react';
import { usePurchaseModal } from '@/hooks/use-purchase-modal';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart,
  X, 
  CheckCircle,
  Coins, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import confetti from 'canvas-confetti';

export function PurchaseModal() {
  const { 
    isOpen, 
    selectedItem, 
    paymentMethod, 
    isPurchasing, // Use isPurchasing from context instead of local state
    setPaymentMethod, 
    closePurchaseModal, 
    completePurchase 
  } = usePurchaseModal();
  
  const { toast } = useToast();
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPurchaseSuccess(false);
      setError(null);
    }
  }, [isOpen]);
  
  // Function to handle purchase
  const handlePurchase = async () => {
    if (!selectedItem) return;
    
    setError(null);
    
    try {
      const success = await completePurchase();
      
      if (success) {
        setPurchaseSuccess(true);
        
        // Trigger confetti animation on success
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setError('Purchase failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  // Mobile responsiveness check - ensure menu is collapsed after purchase
  useEffect(() => {
    if (purchaseSuccess) {
      // Check if there's a mobile menu that needs collapsing
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      if (mobileMenu) {
        const closeButton = mobileMenu.querySelector('[data-close-menu]');
        if (closeButton && closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      }
    }
  }, [purchaseSuccess]);
  
  if (!isOpen || !selectedItem) return null;
  
  if (purchaseSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && closePurchaseModal()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-500/20 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-center">Purchase Successful!</h2>
            <p className="text-zinc-400 text-center mb-6">
              {selectedItem.name} has been added to your inventory.
            </p>
            
            <Button onClick={closePurchaseModal}>
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePurchaseModal()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-emerald-500" />
            Purchase Item
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            onClick={closePurchaseModal}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogDescription className="text-zinc-400">
            Review and confirm your purchase
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          {/* Item details */}
          <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
            <div className="flex gap-3">
              {selectedItem.imageUrl ? (
                <div className="w-20 h-20 rounded bg-black/50 overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded bg-black/50 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-8 w-8 text-zinc-700" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg leading-tight">{selectedItem.name}</h3>
                  
                  <Badge 
                    className={`
                      ${selectedItem.rarity === 'common' ? 'bg-zinc-800 hover:bg-zinc-700' : ''}
                      ${selectedItem.rarity === 'rare' ? 'bg-blue-900 hover:bg-blue-800' : ''}
                      ${selectedItem.rarity === 'legendary' ? 'bg-amber-900 hover:bg-amber-800' : ''}
                      uppercase text-[10px] 
                    `}
                  >
                    {selectedItem.rarity}
                  </Badge>
                </div>
                
                <p className="text-zinc-400 text-sm mb-2">
                  {selectedItem.description}
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-emerald-500 font-medium">
                    <Coins className="h-4 w-4 mr-1" />
                    <span>{selectedItem.priceDGT}</span>
                  </div>
                  {typeof selectedItem.priceUSDT === 'number' && (
                    <div className="text-blue-500 text-xs flex items-center">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {selectedItem.priceUSDT.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment method selection */}
          <div>
            <h3 className="font-medium mb-2">Select Payment Method</h3>
            <Tabs 
              defaultValue={paymentMethod} 
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'dgt' | 'usdt')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="dgt" className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4" />
                  DGT
                </TabsTrigger>
                <TabsTrigger value="usdt" className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  USDT
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dgt" className="pt-2">
                <div className="text-sm text-zinc-400">
                  <p>Purchase using your DGT balance.</p>
                  <div className="flex justify-between mt-2">
                    <span>Price:</span>
                    <span className="text-emerald-500 font-medium">{selectedItem.priceDGT} DGT</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="usdt" className="pt-2">
                <div className="text-sm text-zinc-400">
                  <p>Purchase using your USDT balance.</p>
                  <div className="flex justify-between mt-2">
                    <span>Price:</span>
                    <span className="text-blue-500 font-medium">
                      ${typeof selectedItem.priceUSDT === 'number' ? selectedItem.priceUSDT.toFixed(2) : '0.00'} USDT
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="bg-red-950/30 border-red-900/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={closePurchaseModal}
            disabled={isPurchasing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className={paymentMethod === 'dgt' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}
          >
            {isPurchasing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Buy with ${paymentMethod.toUpperCase()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}