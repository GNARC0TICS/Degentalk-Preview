import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  transaction_id: number;
  uuid: string;
  user_id: number;
  from_user_id?: number;
  to_user_id?: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  confirmed_at?: string;
  is_treasury_transaction: boolean;
  currency_type: string;
}

export default function TransactionsPage() {
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    retry: false,
  });

  // Format amount for display (convert from storage format)
  const formatAmount = (amount: number, currencyType: string): string => {
    const value = amount / 1000000; // Assuming 6 decimal places for storage
    if (currencyType === 'DGT') {
      return `${value.toLocaleString()} DGT`;
    } else if (currencyType === 'USDT') {
      return `$${value.toLocaleString()}`;
    }
    return `${value.toLocaleString()} ${currencyType}`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string, isTreasury: boolean): string => {
    if (isTreasury) {
      return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
    }

    switch (type.toLowerCase()) {
      case 'deposit':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'withdraw':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'tip':
      case 'rain':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'purchase':
        return 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">
          View and manage all transactions across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A list of all transactions on the platform, including deposits, withdrawals, and internal transfers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500">Failed to load transactions</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.transaction_id}>
                        <TableCell className="font-medium">#{tx.transaction_id}</TableCell>
                        <TableCell>{tx.user_id}</TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(tx.type, tx.is_treasury_transaction)}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatAmount(tx.amount, tx.currency_type)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(tx.status)}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={tx.description}>
                          {tx.description || 'N/A'}
                        </TableCell>
                        <TableCell>{format(new Date(tx.created_at), 'PPp')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}