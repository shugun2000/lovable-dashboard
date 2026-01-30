import { Shield, User as UserIcon } from 'lucide-react';
import { User } from '@/types/task';
import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  user: User;
  className?: string;
}

const UserRoleBadge = ({ user, className }: UserRoleBadgeProps) => {
  const isAdmin = user.role === 'admin';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        isAdmin
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {isAdmin ? (
        <>
          <Shield className="w-3.5 h-3.5" />
          Quản trị viên
        </>
      ) : (
        <>
          <UserIcon className="w-3.5 h-3.5" />
          Thành viên
        </>
      )}
    </div>
  );
};

export default UserRoleBadge;
