import React, { useMemo } from 'react';
import type { XPTrackConfig } from './xpConfig';

export type XPBarTrackProps = {
  track: XPTrackConfig;
  xp: number;
  onLevelUp?: (trackId: string, newLevel: number) => void;
};

const XPBarTrack: React.FC<XPBarTrackProps> = ({ track, xp, onLevelUp }) => {
  const level = useMemo(() => track.getLevel(xp), [xp, track]);
  const xpForCurrent = useMemo(() => track.getXPForLevel(level), [level, track]);
  const xpForNext = useMemo(() => track.getXPForLevel(level + 1), [level, track]);
  const progress = Math.min(1, (xp - xpForCurrent) / (xpForNext - xpForCurrent));

  // Optionally call onLevelUp if xp crosses threshold (stub for now)

  return (
    <div
      className="xp-bar-track flex flex-col gap-1 p-4 rounded-xl shadow-lg bg-opacity-60 backdrop-blur-md"
      style={{ background: 'rgba(30, 30, 40, 0.7)' }}
      aria-label={`${track.label} Progress Bar`}
      role="progressbar"
      aria-valuenow={xp}
      aria-valuemin={track.minXP}
      aria-valuemax={track.maxXP}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-lg text-white drop-shadow">{track.label}</span>
        <span className="text-sm text-gray-300">Level {level}</span>
      </div>
      <div className="relative h-6 w-full rounded-full overflow-hidden" style={{ background: '#222' }}>
        <div
          className="absolute inset-0"
          style={{
            background: track.gradient,
            opacity: 0.25,
            zIndex: 0,
          }}
        />
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress * 100}%`,
            background: track.gradient,
            zIndex: 1,
          }}
        />
        <div className="relative z-10 flex items-center h-full px-3">
          <span className="text-xs text-white font-mono">
            {xp - xpForCurrent} / {xpForNext - xpForCurrent} XP to next level
          </span>
        </div>
      </div>
    </div>
  );
};

export default XPBarTrack; 