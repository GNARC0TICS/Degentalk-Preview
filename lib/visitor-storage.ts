// Stub implementations for visitor storage used in edge functions
interface VisitorStats {
  pageVisits: number;
  waitlistSignups: number;
}

let stats: VisitorStats = {
  pageVisits: 0,
  waitlistSignups: 0,
};

export async function getVisitorStats(): Promise<VisitorStats> {
  return stats;
}

export async function incrementPageVisits() {
  stats.pageVisits += 1;
  return stats.pageVisits;
}

export async function incrementWaitlistSignups() {
  stats.waitlistSignups += 1;
  return stats.waitlistSignups;
}