import React, { useState } from "react";
import { useXP } from "@/hooks/useXP";
import { XPProgressBar } from "@/components/economy/xp/XPProgressBar";
import { XPHistoryLog } from "@/components/economy/xp/XPHistoryLog";
import { BadgeShowcase } from "@/components/economy/badges/BadgeShowcase";
import { TitleSelector } from "@/components/economy/xp/TitleSelector";
import { LevelUpNotification } from "@/components/economy/xp/LevelUpNotification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

type XPProfileSectionProps = {
  userId?: string;
  className?: string;
};

/**
 * Component that combines XP-related components for a user profile page
 */
export function XPProfileSection({ userId, className }: XPProfileSectionProps) {
  const { xpData, xpHistory, isLoading, equipTitle } = useXP(userId);
  
  // Demo state for level up notification
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Function to trigger level up notification for demo purposes
  const triggerLevelUpDemo = () => {
    setShowLevelUp(true);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-zinc-800 rounded-lg"></div>
          <div className="h-64 bg-zinc-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Level progress section */}
      <div className="mb-6">
        <XPProgressBar
          level={xpData.level}
          currentXP={xpData.currentLevelXP}
          nextLevelXP={xpData.nextLevelXP}
          progressPercent={xpData.progressToNextLevel}
          showProBadge={xpData.level >= 25}
        />

        {/* Debug button for demo purposes - remove in production */}
        <div className="mt-2 text-right">
          <button
            onClick={triggerLevelUpDemo}
            className="text-xs text-zinc-500 hover:text-zinc-400"
          >
            (Demo: Trigger level-up notification)
          </button>
        </div>
      </div>

      {/* Tabs for XP history, badges, and titles */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="history">Activity</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="titles">Titles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-0">
          <XPHistoryLog xpHistory={xpHistory} />
        </TabsContent>
        
        <TabsContent value="badges" className="mt-0">
          <BadgeShowcase badges={xpData.badges} />
        </TabsContent>
        
        <TabsContent value="titles" className="mt-0">
          <TitleSelector
            titles={xpData.titles}
            equippedTitle={xpData.equippedTitle}
            onEquipTitle={equipTitle}
          />
        </TabsContent>
      </Tabs>

      {/* Level up notification */}
      <LevelUpNotification
        level={xpData.level}
        isVisible={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        rewards={{
          title: "Forum Explorer",
          badge: {
            name: "Level 5 Achieved",
            imageUrl: "/images/badges/level-5.png",
          },
          dgt: 50,
        }}
      />
    </div>
  );
} 