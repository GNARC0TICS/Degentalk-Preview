export type XPTrackConfig = {
  id: string;
  label: string;
  color: string;
  gradient: string;
  icon?: string;
  minXP: number;
  maxXP: number;
  getLevel: (xp: number) => number;
  getXPForLevel: (level: number) => number;
};

export type XPConfig = {
  tracks: XPTrackConfig[];
};

// Example progression curve (exponential)
const exponentialCurve = (base: number) => ({
  getLevel: (xp: number) => Math.floor(Math.log(xp / 100 + 1) / Math.log(base)),
  getXPForLevel: (level: number) => 100 * (Math.pow(base, level) - 1),
});

export const xpConfig: XPConfig = {
  tracks: [
    {
      id: 'degen',
      label: 'Degen XP',
      color: '#7f5af0',
      gradient: 'conic-gradient(from 90deg, #7f5af0, #2cb67d, #7f5af0)',
      minXP: 0,
      maxXP: 100000,
      ...exponentialCurve(1.25),
    },
    {
      id: 'clout',
      label: 'Clout',
      color: '#ff8906',
      gradient: 'conic-gradient(from 90deg, #ff8906, #f25f4c, #ff8906)',
      minXP: 0,
      maxXP: 100000,
      ...exponentialCurve(1.18),
    },
  ],
}; 