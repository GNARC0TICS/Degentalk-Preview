import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "../admin-layout";
import { MockWebhookTrigger } from "@/components/admin/wallet/mock-webhook-trigger";

// Type definitions for API responses
interface WalletStats {
  totalDgtCirculation: number;
  activeWalletCount: number;
  transactionsLast24h: number;
  dgtPrice?: number;
  dgtTradingVolume24h?: number;
}

interface TopUser {
  id: number;
  username: string;
  dgtBalance: number;
  lastActive: string;
}

interface TopUsersResponse {
  users: TopUser[];
  total: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  userId: number;
  username: string;
  timestamp: string;
  status: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

interface CCPaymentStatus {
  apiStatus: 'connected' | 'disconnected';
  lastWebhookReceived: string | null;
  pendingTransactionCount: number;
  lastCheck: string;
}

interface DgtAdjustmentResponse {
  success: boolean;
  transactionId: string;
  newBalance: number;
}

/**
 * Admin Wallet Management Page
 * 
 * Provides administrative tools for wallet management including:
 * - User DGT balance management
 * - Bulk DGT grants/deductions
 * - Transaction reporting
 * - CCPayment status monitoring
 * - Mock webhook testing
 * 
 * // [REFAC-DGT] [REFAC-CCPAYMENT]
 */
export default function AdminWalletsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [userId, setUserId] = useState("");
  const [dgtAmount, setDgtAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"grant" | "deduct">("grant");
  
  // Get wallet statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/wallet/stats"],
    queryFn: () => apiRequest<WalletStats>({
      url: "/api/admin/wallet/stats",
      method: "GET"
    }),
  });
  
  // Get top wallet users
  const { data: topUsers, isLoading: isLoadingTopUsers } = useQuery({
    queryKey: ["/api/admin/wallet/top-users"],
    queryFn: () => apiRequest<TopUsersResponse>({
      url: "/api/admin/wallet/top-users",
      method: "GET"
    }),
  });
  
  // Get recent transactions
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/admin/wallet/recent-transactions"],
    queryFn: () => apiRequest<TransactionsResponse>({
      url: "/api/admin/wallet/recent-transactions",
      method: "GET"
    }),
  });
  
  // Get CCPayment status
  const { data: ccpaymentStatus, isLoading: isLoadingCCPayment } = useQuery({
    queryKey: ["/api/admin/wallet/ccpayment-status"],
    queryFn: () => apiRequest<CCPaymentStatus>({
      url: "/api/admin/wallet/ccpayment-status",
      method: "GET"
    }),
  });
  
  // Manually adjust user DGT balance
  const manualAdjustMutation = useMutation({
    mutationFn: async (params: { userId: number, amount: number, reason: string, type: "grant" | "deduct" }) => {
      try {
        const endpoint = params.type === "grant" 
          ? "/api/admin/wallet/grant-dgt" 
          : "/api/admin/wallet/deduct-dgt";
          
        return await apiRequest<DgtAdjustmentResponse>({
          url: endpoint,
          method: "POST",
          data: {
            userId: params.userId,
            amount: params.amount,
            reason: params.reason
          }
        });
      } catch (error) {
        console.error("Error adjusting DGT balance:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet/top-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet/recent-transactions"] });
      
      toast({
        variant: "success",
        title: "Balance Updated",
        description: `User DGT balance ${transactionType === "grant" ? "increased" : "decreased"} successfully.`,
      });
      
      // Reset form
      setUserId("");
      setDgtAmount("");
      setReason("");
      setIsManualDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Updating Balance",
        description: error?.message || "Failed to update DGT balance. Please try again.",
      });
    }
  });
  
  // Handle form submission
  const handleManualAdjust = () => {
    if (!userId || !dgtAmount) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both a User ID and an amount.",
      });
      return;
    }
    
    const parsedUserId = parseInt(userId);
    const parsedAmount = parseFloat(dgtAmount);
    
    if (isNaN(parsedUserId) || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid numeric values.",
      });
      return;
    }
    
    manualAdjustMutation.mutate({
      userId: parsedUserId,
      amount: parsedAmount,
      reason: reason || `Admin ${transactionType}`,
      type: transactionType
    });
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          
          <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
            <DialogTrigger asChild>
              <Button>Manual DGT Adjustment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust User DGT Balance</DialogTitle>
                <DialogDescription>
                  Manually grant or deduct DGT from a user account.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Transaction Type</label>
                  <Select 
                    value={transactionType} 
                    onValueChange={(value) => setTransactionType(value as "grant" | "deduct")}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant DGT</SelectItem>
                      <SelectItem value="deduct">Deduct DGT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">User ID</label>
                  <Input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Amount (DGT)</label>
                  <Input
                    type="number"
                    value={dgtAmount}
                    onChange={(e) => setDgtAmount(e.target.value)}
                    className="col-span-3"
                    min="1"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Reason</label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="col-span-3"
                    placeholder="Optional reason"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleManualAdjust}
                  disabled={manualAdjustMutation.isPending}
                >
                  {manualAdjustMutation.isPending ? "Processing..." : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total DGT In Circulation</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalDgtCirculation || 0, 'DGT')}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.activeWalletCount?.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">DGT Transactions (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.transactionsLast24h?.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Balances</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="ccpayment">CCPayment Status</TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Top User Balances</CardTitle>
                <CardDescription>
                  Users with the highest DGT balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTopUsers ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>DGT Balance</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topUsers?.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{formatCurrency(user.dgtBalance, 'DGT')}</TableCell>
                          <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setUserId(user.id.toString());
                                setTransactionType("grant");
                                setIsManualDialogOpen(true);
                              }}
                            >
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Last 20 DGT transactions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions?.transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.id}</TableCell>
                          <TableCell>
                            <Badge variant={tx.type === 'grant' ? 'default' : 'secondary'}>
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(tx.amount, tx.currency)}</TableCell>
                          <TableCell>{tx.username} (ID: {tx.userId})</TableCell>
                          <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'destructive' : 'outline'}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline">Export Transactions</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* CCPayment Tab */}
          <TabsContent value="ccpayment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CCPayment Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>CCPayment Integration Status</CardTitle>
                  <CardDescription>
                    Monitor the status of the CCPayment integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCCPayment ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div>
                          <h3 className="font-medium">API Connection</h3>
                          <p className="text-sm text-muted-foreground">Status of the CCPayment API connection</p>
                        </div>
                        <Badge variant={ccpaymentStatus?.apiStatus === 'connected' ? 'success' : 'destructive'}>
                          {ccpaymentStatus?.apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div>
                          <h3 className="font-medium">Webhook Status</h3>
                          <p className="text-sm text-muted-foreground">Last webhook received</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={ccpaymentStatus?.lastWebhookReceived ? 'success' : 'destructive'}>
                            {ccpaymentStatus?.lastWebhookReceived ? 'Active' : 'Not Received'}
                          </Badge>
                          {ccpaymentStatus?.lastWebhookReceived && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(ccpaymentStatus.lastWebhookReceived).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div>
                          <h3 className="font-medium">Pending Transactions</h3>
                          <p className="text-sm text-muted-foreground">CCPayment transactions awaiting confirmation</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{ccpaymentStatus?.pendingTransactionCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between">
                  <div className="text-sm text-muted-foreground">
                    Last API check: {ccpaymentStatus?.lastCheck ? new Date(ccpaymentStatus.lastCheck).toLocaleString() : 'Never'}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/wallet/ccpayment-status"] })}
                  >
                    Refresh Status
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Mock Webhook Trigger Card */}
              <MockWebhookTrigger />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
