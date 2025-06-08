import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ArrowUpDown, PlusCircle, MinusCircle, RotateCcw, History, UserRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import AdminLayout from '../admin-layout';
import { apiRequest } from '@/lib/queryClient';

// Types
interface User {
  id: number;
  username: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  nextLevelXp: number;
  progressPercent: number;
}

interface XpAdjustment {
  id: number;
  userId: number;
  username: string;
  adjustmentType: 'add' | 'subtract' | 'set';
  amount: number;
  reason: string;
  oldXp: number;
  newXp: number;
  adminUsername: string;
  timestamp: string;
}

export default function UserXpAdjustmentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(100);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [sortField, setSortField] = useState<'username' | 'level' | 'xp'>('xp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Search users query
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['/api/admin/users/search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
        return { users: [] };
      }
      const response = await fetch(`/api/admin/users/search?term=${debouncedSearchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      return response.json();
    },
    enabled: debouncedSearchTerm.length >= 3
  });

  // Get user XP info
  const fetchUserXpInfo = async (userId: number) => {
    const response = await fetch(`/api/admin/users/${userId}/xp`);
    if (!response.ok) {
      throw new Error('Failed to fetch user XP info');
    }
    return response.json();
  };

  // Get XP adjustment logs for a user
  const fetchUserXpAdjustmentLogs = async (userId: number) => {
    const response = await fetch(`/api/admin/xp/adjustment-logs?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch XP adjustment logs');
    }
    return response.json();
  };

  // Mutations
  const adjustXpMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number; adjustmentType: 'add' | 'subtract' | 'set'; reason: string }) => {
      return apiRequest('POST', '/api/admin/xp/adjust', data);
    },
    onSuccess: (data) => {
      toast({
        title: 'XP adjusted successfully',
        description: `${data.user.username}'s XP has been updated`,
        variant: 'default',
      });
      setIsAdjustDialogOpen(false);
      // Update the local state with the new XP
      if (users?.users) {
        const updatedUsers = users.users.map(user =>
          user.id === data.user.id
            ? { ...user, xp: data.user.xp, level: data.user.level }
            : user
        );
        queryClient.setQueryData(['/api/admin/users/search', debouncedSearchTerm], { users: updatedUsers });
      }
      resetAdjustmentForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to adjust XP: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handlers
  const handleSort = (field: 'username' | 'level' | 'xp') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdjustXp = (user: User) => {
    setSelectedUser(user);
    setIsAdjustDialogOpen(true);
  };

  const handleViewHistory = async (user: User) => {
    setSelectedUser(user);
    try {
      const logs = await fetchUserXpAdjustmentLogs(user.id);
      // Store logs in state or via queryClient if needed
      queryClient.setQueryData(['/api/admin/xp/adjustment-logs', user.id], logs);
      setIsHistoryDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch adjustment history: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    adjustXpMutation.mutate({
      userId: selectedUser.id,
      amount: adjustmentAmount,
      adjustmentType,
      reason: adjustmentReason
    });
  };

  const resetAdjustmentForm = () => {
    setAdjustmentType('add');
    setAdjustmentAmount(100);
    setAdjustmentReason('');
    setSelectedUser(null);
  };

  // Sort users if available
  const sortedUsers = users?.users ? [...users.users].sort((a, b) => {
    if (sortField === 'username') {
      return sortDirection === 'asc'
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
    } else if (sortField === 'level') {
      return sortDirection === 'asc'
        ? a.level - b.level
        : b.level - a.level;
    } else {
      return sortDirection === 'asc'
        ? a.xp - b.xp
        : b.xp - a.xp;
    }
  }) : [];

  // Calculate adjusted XP
  const calculateAdjustedXp = () => {
    if (!selectedUser) return 0;

    switch (adjustmentType) {
      case 'add':
        return selectedUser.xp + adjustmentAmount;
      case 'subtract':
        return Math.max(0, selectedUser.xp - adjustmentAmount);
      case 'set':
        return Math.max(0, adjustmentAmount);
      default:
        return selectedUser.xp;
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">User XP Adjustment</h2>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search Users</TabsTrigger>
          <TabsTrigger value="recent">Recent Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Search Users</CardTitle>
              <CardDescription>
                Search for users by username or ID to adjust their XP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or ID (min 3 characters)..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {debouncedSearchTerm.length > 0 && debouncedSearchTerm.length < 3 && (
                  <p className="text-sm text-muted-foreground">Enter at least 3 characters to search</p>
                )}

                {isLoading && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                )}

                {isError && (
                  <div className="text-center py-4">
                    <p className="text-destructive">Error: {error.message}</p>
                  </div>
                )}

                {!isLoading && !isError && users?.users && users.users.length === 0 && debouncedSearchTerm.length >= 3 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}

                {users?.users && users.users.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => handleSort('level')}
                            >
                              Level
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => handleSort('xp')}
                            >
                              XP
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {user.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                                  ) : (
                                    <AvatarFallback>
                                      {user.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-zinc-800">
                                {user.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.xp.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-1">
                                <div
                                  className="bg-emerald-600 h-2.5 rounded-full"
                                  style={{ width: `${user.progressPercent}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.progressPercent}% to level {user.level + 1}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewHistory(user)}
                                >
                                  <History className="h-4 w-4 mr-1" />
                                  History
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAdjustXp(user)}
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  Adjust XP
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent XP Adjustments</CardTitle>
              <CardDescription>
                View the most recent XP adjustments made by administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAdjustmentsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* XP Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitAdjustment}>
            <DialogHeader>
              <DialogTitle>Adjust User XP</DialogTitle>
              <DialogDescription>
                Modify the XP of {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {selectedUser && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {selectedUser.avatarUrl ? (
                      <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.username} />
                    ) : (
                      <AvatarFallback>
                        {selectedUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Current XP: {selectedUser.xp.toLocaleString()} | Level {selectedUser.level}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="adjustmentType">Adjustment Type</Label>
                <RadioGroup
                  id="adjustmentType"
                  value={adjustmentType}
                  onValueChange={(value) => setAdjustmentType(value as 'add' | 'subtract' | 'set')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add" className="flex items-center">
                      <PlusCircle className="h-4 w-4 mr-1 text-emerald-500" />
                      Add
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subtract" id="subtract" />
                    <Label htmlFor="subtract" className="flex items-center">
                      <MinusCircle className="h-4 w-4 mr-1 text-red-500" />
                      Subtract
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="set" id="set" />
                    <Label htmlFor="set" className="flex items-center">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Set
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  XP Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  max="1000000"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Adjustment</Label>
                <Textarea
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Explain why this adjustment is being made"
                  required
                />
              </div>

              {selectedUser && (
                <div className="rounded-md bg-muted p-4">
                  <div className="text-sm font-medium">Adjustment Preview</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current XP</div>
                      <div className="font-medium">{selectedUser.xp.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {adjustmentType === 'add'
                          ? 'Adding'
                          : adjustmentType === 'subtract'
                            ? 'Subtracting'
                            : 'Setting to'
                        }
                      </div>
                      <div className="font-medium">{adjustmentAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">New XP</div>
                      <div className="font-medium">{calculateAdjustedXp().toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adjustXpMutation.isPending || !adjustmentReason.trim()}
              >
                {adjustXpMutation.isPending ? 'Applying...' : 'Apply Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* XP History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>XP Adjustment History</DialogTitle>
            <DialogDescription>
              {selectedUser && `XP adjustments for ${selectedUser.username}`}
            </DialogDescription>
          </DialogHeader>

          <XpHistoryTable userId={selectedUser?.id} />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Recent Adjustments Table Component
function RecentAdjustmentsTable() {
  const {
    data: adjustments,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/admin/xp/adjustment-logs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/xp/adjustment-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch adjustment logs');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading recent adjustments...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">Error loading adjustments: {error.message}</p>
      </div>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No recent XP adjustments found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Adjustment</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adjustment: XpAdjustment) => (
            <TableRow key={adjustment.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                  <span>{adjustment.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <Badge
                    className={
                      adjustment.adjustmentType === 'add'
                        ? 'bg-emerald-900 text-emerald-300'
                        : adjustment.adjustmentType === 'subtract'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-blue-900 text-blue-300'
                    }
                  >
                    {adjustment.adjustmentType === 'add'
                      ? `+${adjustment.amount}`
                      : adjustment.adjustmentType === 'subtract'
                        ? `-${adjustment.amount}`
                        : `Set to ${adjustment.amount}`}
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-1">
                    {adjustment.oldXp.toLocaleString()} → {adjustment.newXp.toLocaleString()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{adjustment.reason}</TableCell>
              <TableCell>{adjustment.adminUsername}</TableCell>
              <TableCell>{new Date(adjustment.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// XP History Table Component
function XpHistoryTable({ userId }: { userId?: number }) {
  const {
    data: adjustments,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/admin/xp/adjustment-logs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/admin/xp/adjustment-logs?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch adjustment logs');
      }
      return response.json();
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading adjustment history...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">Error loading history: {error.message}</p>
      </div>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No adjustment history found for this user</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Adjustment</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adjustment: XpAdjustment) => (
            <TableRow key={adjustment.id}>
              <TableCell>
                <div className="flex flex-col">
                  <Badge
                    className={
                      adjustment.adjustmentType === 'add'
                        ? 'bg-emerald-900 text-emerald-300'
                        : adjustment.adjustmentType === 'subtract'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-blue-900 text-blue-300'
                    }
                  >
                    {adjustment.adjustmentType === 'add'
                      ? `+${adjustment.amount}`
                      : adjustment.adjustmentType === 'subtract'
                        ? `-${adjustment.amount}`
                        : `Set to ${adjustment.amount}`}
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-1">
                    {adjustment.oldXp.toLocaleString()} → {adjustment.newXp.toLocaleString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>{adjustment.reason}</TableCell>
              <TableCell>{adjustment.adminUsername}</TableCell>
              <TableCell>{new Date(adjustment.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 