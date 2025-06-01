import React from 'react';
import { useRouter } from 'wouter';
import { motion } from 'framer-motion';
import { Activity as XPIcon, TrendingUp, Award, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import XpLogView from '@/components/profile/XpLogView';
import { useUserXP } from '@/hooks/useUserXP';

const ProfileXpPage: React.FC = () => {
  const [, params] = useRouter();
  const username = params.username;
  
  // Fetch user XP info using the new hook
  const { data: xpInfo, isLoading } = useUserXP(username ? parseInt(username, 10) : undefined);
  
  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <XPIcon className="mr-2 h-7 w-7 text-green-400" />
        XP Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* XP Level Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-white/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold text-gradient-blue mb-1"
                >
                  {xpInfo?.currentLevel}
                </motion.div>
                <p className="text-sm opacity-80">
                  {xpInfo?.currentLevelData?.name || 'Forum User'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Total XP Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-white/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-400" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl font-bold text-gradient-gold mb-1"
                >
                  {xpInfo?.currentXp.toLocaleString()}
                </motion.div>
                <p className="text-sm opacity-80">
                  {xpInfo?.nextLevel 
                    ? `${xpInfo.xpForNextLevel.toLocaleString()} XP until level ${xpInfo.nextLevel}` 
                    : 'Max level reached'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Level Progress Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-white/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Timer className="mr-2 h-5 w-5 text-green-400" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full mb-2">
                  <Progress
                    value={xpInfo?.progress ? xpInfo.progress * 100 : 0}
                    className="h-4"
                  />
                </div>
                <p className="text-center font-bold">
                  {xpInfo?.progress 
                    ? `${Math.round(xpInfo.progress * 100)}%` 
                    : '0%'}
                </p>
                {xpInfo?.nextLevelData && (
                  <p className="text-xs opacity-70 mt-1">
                    Next: {xpInfo.nextLevelData.name || `Level ${xpInfo.nextLevel}`}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* XP Log Section */}
      <div className="mb-8">
        <XpLogView userId={username ? parseInt(username, 10) : undefined} />
      </div>
    </div>
  );
};

export default ProfileXpPage; 