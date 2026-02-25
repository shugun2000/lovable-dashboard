import { Task } from '@/types/task';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface UrgentTasksListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const UrgentTasksList = ({ tasks, onTaskClick }: UrgentTasksListProps) => {
  return (
    <div className="bg-urgent-bg border border-urgent/20 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-urgent" />
        <h3 className="text-sm font-semibold text-foreground">
          Công việc KHẨN ({tasks.length})
        </h3>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-card hover:bg-accent transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {task.assignee} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa có deadline'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default UrgentTasksList;
