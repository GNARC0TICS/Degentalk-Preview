import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loader";
import { ErrorDisplay } from "@/components/ui/error-display";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, CircleDollarSign, Diamond } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data structure - replace with actual API response type
interface LeaderboardUser {
  id: number;
  username: string;
  avatarUrl?: string | null;
  xp: number;
  clout: number; // Clout (formerly Reputation)
  dgtBalance: number;
}

export default function LeaderboardPage() {
  const { toast } = useToast();

  // TODO: Replace with actual API call
  const { data, isLoading, isError, error, refetch } = useQuery<LeaderboardUser[]>({ 
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      // Uncomment below to simulate error
      // if (Math.random() > 0.5) throw new Error("Failed to fetch leaderboard data!"); 
      return [
        { id: 1, username: 'CryptoKing', xp: 150000, clout: 2500, dgtBalance: 50000, avatarUrl: 'https://avatar.vercel.sh/cryptoking' },
        { id: 2, username: 'DiamondHands', xp: 125000, clout: 1800, dgtBalance: 25000, avatarUrl: 'https://avatar.vercel.sh/diamondhands' },
        { id: 3, username: 'WhaleWatcher', xp: 110000, clout: 1500, dgtBalance: 100000, avatarUrl: 'https://avatar.vercel.sh/whalewatcher' },
        { id: 4, username: 'NFTGuru', xp: 95000, clout: 1200, dgtBalance: 15000, avatarUrl: 'https://avatar.vercel.sh/nftguru' },
        { id: 5, username: 'ShillMaster', xp: 80000, clout: 900, dgtBalance: 5000, avatarUrl: 'https://avatar.vercel.sh/shillmaster' },
        { id: 6, username: 'PaperHands', xp: 5000, clout: 10, dgtBalance: 100, avatarUrl: 'https://avatar.vercel.sh/paperhands' },
        { id: 7, username: 'LaserEyes', xp: 75000, clout: 1100, dgtBalance: 12000 },
        { id: 8, username: 'ToTheMoon', xp: 68000, clout: 1050, dgtBalance: 9000 },
        { id: 9, username: 'RugPullSurvivor', xp: 60000, clout: 850, dgtBalance: 7500 },
        { id: 10, username: 'HODLer', xp: 55000, clout: 800, dgtBalance: 20000 },
      ].sort((a, b) => b.xp - a.xp); // Sort by XP descending
      
      /* Uncomment when API is ready
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
      */
    }
  });

  const renderLoadingState = () => (
    <div className="mt-12 flex flex-col items-center justify-center space-y-4">
      <LoadingSpinner size="xl" color="emerald" />
      <p className="text-zinc-400">Loading leaderboard...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="mt-12 flex justify-center">
      <ErrorDisplay 
        title="Leaderboard Unavailable" 
        message="Could not load leaderboard data at this time." 
        error={error}
        onRetry={refetch} 
        variant="card"
      />
    </div>
  );

  const renderLeaderboardTable = () => (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-emerald-400">
          <Trophy className="mr-2 h-5 w-5" />
          Top Degens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[50px] text-center text-zinc-400">#</TableHead>
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-right text-zinc-400">XP</TableHead>
                <TableHead className="text-right text-zinc-400">Clout</TableHead>
                <TableHead className="text-right text-zinc-400">DGT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((user, i) => (
                <TableRow 
                  key={user.id} 
                  className={cn(
                    "border-zinc-800",
                    i === 0 && 'bg-gradient-to-r from-amber-950/30 via-zinc-950/50 to-zinc-950/50 border-l-2 border-l-amber-500',
                    i === 1 && 'bg-gradient-to-r from-slate-800/30 via-zinc-950/50 to-zinc-950/50 border-l-2 border-l-slate-500',
                    i === 2 && 'bg-gradient-to-r from-orange-950/30 via-zinc-950/50 to-zinc-950/50 border-l-2 border-l-orange-700',
                  )}
                >
                  <TableCell className="text-center font-medium text-zinc-300">
                    {i === 0 && <Trophy className="h-4 w-4 inline-block text-amber-400" />}
                    {i === 1 && <Trophy className="h-4 w-4 inline-block text-slate-400" />}
                    {i === 2 && <Trophy className="h-4 w-4 inline-block text-orange-500" />}
                    {i > 2 && i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                        <AvatarFallback className="bg-zinc-700 text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-white hover:text-emerald-400 transition-colors cursor-pointer">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-400">
                    {user.xp.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-cyan-400">
                    {user.clout.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-purple-400">
                    {user.dgtBalance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data?.length === 0 && (
           <p className="text-center text-zinc-500 py-8">Leaderboard is currently empty.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">
        DegenTalk Leaderboards
      </h1>
      
      {/* Add Tabs for different leaderboards (XP, Clout, DGT) here later */}
      
      {isLoading
        ? renderLoadingState()
        : isError
        ? renderErrorState()
        : renderLeaderboardTable()}
    </div>
  );
}