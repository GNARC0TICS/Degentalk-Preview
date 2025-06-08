import React, { useEffect, useState } from 'react';
import { useDgtPurchase } from '@/hooks/useDgtPurchase';
import { StripeElementsWrapper } from '@/components/payment/StripeElementsWrapper';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Coins, ChevronLeft, Loader2, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { economyConfig, DgtPackage } from '@/config/economy.config';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { SiteFooter } from '@/components/layout/site-footer';

interface Package {
  id: string;
  name: string;
  description: string;
  dgt_amount: number;
  usd_price: string;
  discount_percentage?: number;
  is_featured?: boolean;
  image_url?: string;
}

export default function DgtPurchasePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ccpayment");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  // Get the DGT purchase hook
  const {
    createPaymentIntent,
    devModePurchase,
    clientSecret,
    isLoading: isProcessing
  } = useDgtPurchase();

  // Load packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Check for dev mode in localStorage
        const isDev = localStorage.getItem('degentalk-dev-mode') === 'true';
        setDevMode(isDev);

        // Mock data for development
        if (isDev) {
          const mockPackages = [
            {
              id: 'dev-package-1',
              name: 'Mini Pack',
              description: 'Perfect for casual users',
              dgt_amount: 100,
              usd_price: '5.99',
              is_featured: false
            },
            {
              id: 'dev-package-2',
              name: 'Standard Pack',
              description: 'Most popular option for active forum users',
              dgt_amount: 500,
              usd_price: '24.99',
              is_featured: true,
              discount_percentage: 10
            },
            {
              id: 'dev-package-3',
              name: 'Premium Pack',
              description: 'For power users and DGT collectors',
              dgt_amount: 1500,
              usd_price: '59.99',
              discount_percentage: 20
            },
            {
              id: 'dev-package-4',
              name: 'Whale Pack',
              description: 'VIP package with maximum DGT tokens',
              dgt_amount: 5000,
              usd_price: '149.99',
              discount_percentage: 30
            },
          ];

          setPackages(mockPackages);
          setIsLoadingPackages(false);
          return;
        }

        // Make API request to fetch packages
        const response = await fetch('/api/dgt-purchase/packages');

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch DGT packages`);
        }

        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error('Error fetching DGT packages:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load DGT packages. Please try again later.',
        });
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, [toast]);

  // Handler for selecting a package
  const handleSelectPackage = async (pkg: Package) => {
    setSelectedPackage(pkg);

    try {
      // Based on mode, either create a payment intent or use dev mode purchase
      if (devMode) {
        await devModePurchase({
          packageId: pkg.id,
          onSuccess: () => {
            setLocation('/shop/purchase-success');
          }
        });
      } else {
        await createPaymentIntent({
          packageId: pkg.id,
          onError: () => {
            setSelectedPackage(null);
          }
        });
      }
    } catch (error) {
      console.error('Failed to process package selection:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedPackage) {
      toast({
        title: "No package selected",
        description: "Please select a DGT package to purchase.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCheckout(true);
    try {
      const response = await apiRequest("POST", "/api/ccpayment/create-order", {
        amount: selectedPackage.usd_price,
        currency: "USD",
        productId: selectedPackage.id,
        productName: selectedPackage.name,
        // userId: 'current_user_id', // TODO: Get actual user ID from auth context
      });

      if (response.payment_url) {
        setCheckoutUrl(response.payment_url);
      } else {
        throw new Error(response.error || "Failed to create payment order.");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unknown error occurred during payment initiation.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  // Determine which view to show
  const renderContent = () => {
    // Loading state
    if (isLoadingPackages) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading DGT packages...</p>
        </div>
      );
    }

    // Payment form view (when a package is selected and clientSecret is available)
    if (selectedPackage && clientSecret) {
      return (
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setSelectedPackage(null)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to packages
          </Button>

          <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>

          <StripeElementsWrapper clientSecret={clientSecret}>
            <PaymentForm
              packageDetail={selectedPackage}
              returnUrl={`${window.location.origin}/shop/purchase-success`}
            />
          </StripeElementsWrapper>
        </div>
      );
    }

    // Package selection view
    return (
      <>
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-3xl font-bold">DGT Token Packages</h1>
            <p className="text-muted-foreground">
              Purchase DGT tokens to unlock exclusive items and features on Degentalk™
            </p>
          </div>

          {devMode && (
            <div className="bg-yellow-900/30 border border-yellow-900/50 rounded-md p-4 mb-8">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-300">
                  Development mode is active. Purchases will be simulated without real payment processing.
                </p>
              </div>
            </div>
          )}

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid grid-cols-3 md:w-[400px] mx-auto">
              <TabsTrigger value="all">All Packages</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="best-value">Best Value</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onSelect={handleSelectPackage}
                    isLoading={isProcessing}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages
                  .filter(pkg => pkg.is_featured)
                  .map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onSelect={handleSelectPackage}
                      isLoading={isProcessing}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="best-value" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages
                  .filter(pkg => pkg.discount_percentage && pkg.discount_percentage > 0)
                  .sort((a, b) =>
                    (b.discount_percentage || 0) - (a.discount_percentage || 0)
                  )
                  .map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onSelect={handleSelectPackage}
                      isLoading={isProcessing}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-primary/10 border border-primary/20 rounded-md p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Why buy DGT tokens?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Unlock exclusive profile customizations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Reward quality content from other users
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Access special forum features and privileges
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Support the Degentalk™ community
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {selectedPackage && (
          <div className="mt-10 pt-8 border-t border-zinc-800">
            <h3 className="text-xl font-semibold text-white mb-2">Selected Package: {selectedPackage.name}</h3>
            <p className="text-zinc-400 mb-1">DGT Amount: <span className="text-amber-400 font-medium">{selectedPackage.dgt_amount.toLocaleString()}</span></p>
            <p className="text-zinc-400 mb-4">Price: <span className="text-primary font-medium">${(selectedPackage.discount_percentage ? selectedPackage.usd_price * (1 - selectedPackage.discount_percentage / 100) : selectedPackage.usd_price).toFixed(2)}</span></p>

            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="max-w-md">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger value="ccpayment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">CCPayment</TabsTrigger>
                <TabsTrigger value="crypto" disabled>Crypto (Soon)</TabsTrigger>
              </TabsList>
              <TabsContent value="ccpayment">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-md p-6 mt-4">
                  <p className="text-sm text-zinc-400 mb-4">
                    You will be redirected to CCPayment to complete your purchase securely.
                  </p>
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoadingCheckout || !!checkoutUrl}
                  >
                    {isLoadingCheckout ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : checkoutUrl ? (
                      'Proceed to CCPayment'
                    ) : (
                      'Pay with CCPayment'
                    )}
                  </Button>
                  {checkoutUrl && (
                    <Button
                      onClick={() => window.open(checkoutUrl, '_blank')}
                      className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white"
                    >
                      Open CCPayment Page
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!selectedPackage && (
          <div className="text-center text-zinc-500 pt-10 mb-12">
            Please select a DGT package above to proceed with your purchase.
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/shop">
          <Button variant="ghost" className="flex items-center text-zinc-400 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Shop
          </Button>
        </Link>
      </div>

      {renderContent()}
      <SiteFooter />
    </div>
  );
}

// Component for displaying a package card
function PackageCard({
  pkg,
  onSelect,
  isLoading
}: {
  pkg: Package;
  onSelect: (pkg: Package) => void;
  isLoading: boolean;
}) {
  // Function to calculate savings amount
  const calculateSavings = () => {
    if (!pkg.discount_percentage) return null;

    const basePrice = parseFloat(pkg.usd_price) / (1 - pkg.discount_percentage / 100);
    const savingsAmount = basePrice - parseFloat(pkg.usd_price);

    return savingsAmount.toFixed(2);
  };

  const savingsAmount = calculateSavings();

  return (
    <Card className={`overflow-hidden border ${pkg.is_featured ? 'border-primary' : 'border-zinc-800'}`}>
      <div className={`px-4 py-2 text-sm font-medium ${pkg.is_featured ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-200'}`}>
        <div className="flex justify-between items-center">
          <span>{pkg.name}</span>
          {pkg.is_featured && <Badge className="bg-white/20 hover:bg-white/30">Most Popular</Badge>}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>

          <div className="flex items-baseline mb-1">
            <span className="text-3xl font-bold">${parseFloat(pkg.usd_price).toFixed(2)}</span>
            {savingsAmount && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ${(parseFloat(pkg.usd_price) + parseFloat(savingsAmount)).toFixed(2)}
              </span>
            )}
          </div>

          {pkg.discount_percentage && (
            <p className="text-xs text-green-500 mb-3">
              Save {pkg.discount_percentage}% (${savingsAmount})
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm border-t border-zinc-800 pt-4 mb-6">
          <span className="text-muted-foreground">You receive:</span>
          <div className="flex items-center font-medium">
            <Coins className="h-4 w-4 mr-1.5 text-amber-500" />
            {pkg.dgt_amount.toLocaleString()} DGT
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onSelect(pkg)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Buy Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}