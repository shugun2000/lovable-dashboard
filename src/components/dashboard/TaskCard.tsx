import { motion } from 'framer-motion';
import { Calendar, MoreVertical, User as UserIcon } from 'lucide-react';
import { Task, User, Priority } from '@/types/task';
import PriorityBadge from './PriorityBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onPriorityChange?: (priority: Priority) => void;
  isAdmin?: boolean;
}

const TaskCard = ({ task, onClick, onPriorityChange, isAdmin }: TaskCardProps) => {
  const handlePriorityChange = (e: React.MouseEvent, priority: Priority) => {
    e.stopPropagation();
    onPriorityChange?.(priority);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="task-card group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handlePriorityChange(e as any, 'urgent')}>
              <span className="w-2 h-2 rounded-full bg-urgent mr-2" />
              Đánh dấu KHẨN
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handlePriorityChange(e as any, 'later')}>
              <span className="w-2 h-2 rounded-full bg-later mr-2" />
              Đánh dấu SAU
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handlePriorityChange(e as any, 'done')}>
              <span className="w-2 h-2 rounded-full bg-done mr-2" />
              Đánh dấu XONG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
        {task.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{task.assignee}</span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="px-2 py-0.5 text-xs text-muted-foreground">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
