import { Priority, PRIORITY_LABELS } from '@/types/task';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  return (
    <span
      className={cn(
        'priority-badge',
        {
          'priority-urgent': priority === 'urgent',
          'priority-later': priority === 'later',
          'priority-done': priority === 'done',
        },
        className
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
};

export default PriorityBadge;
