import { useCloutAchievements } from '@/features/admin/services/cloutAchievementsService';
import { Table, TableHead, TableHeader, TableRow, TableBody } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToggleAchievement } from '@/features/admin/services/cloutAchievementsService';

export default function CloutAchievementsAdminPage() {
  const { data, isLoading, error } = useCloutAchievements();
  const toggle = useToggleAchievement();

  const achievements = data?.achievements ?? [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Clout Achievements</h2>
      <Card>
        <CardHeader>
          <CardTitle>Milestone Definition</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading…</p>}
          {error && <p className="text-red-500">Error loading achievements</p>}
          {achievements.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((a: any) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{a.achievementKey}</td>
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.cloutReward}</td>
                    <td className="p-2">
                      {a.criteriaType} {a.criteriaValue ? `≥ ${a.criteriaValue}` : ''}
                    </td>
                    <td className="p-2 text-center">
                      <Switch
                        checked={a.enabled}
                        onCheckedChange={() => toggle.mutate(a.id)}
                      />
                    </td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          )}
          {achievements.length === 0 && !isLoading && <p>No achievements found.</p>}
        </CardContent>
      </Card>
    </div>
  );
} 