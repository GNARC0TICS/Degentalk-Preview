import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function DevRoleSwitcher() {
  const { isDevMode, currentMockRole, setMockRole } = useAuth();

  // Only render in development mode
  if (!isDevMode || !currentMockRole) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-3 flex items-center space-x-2"
    >
      <Badge variant="outline" className="border-yellow-500 text-yellow-500">DEV</Badge>
      <Select 
        value={currentMockRole} 
        onValueChange={(value) => setMockRole(value as 'user' | 'mod' | 'admin')}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="mod">Moderator</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 