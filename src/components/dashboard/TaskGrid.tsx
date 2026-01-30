import { motion, AnimatePresence } from 'framer-motion';
import { Task, Priority } from '@/types/task';
import TaskCard from './TaskCard';

interface TaskGridProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
  isAdmin?: boolean;
}

const TaskGrid = ({ tasks, onTaskClick, onPriorityChange, isAdmin }: TaskGridProps) => {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onPriorityChange={(priority) => onPriorityChange(task.id, priority)}
            isAdmin={isAdmin}
          />
        ))}
      </AnimatePresence>
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full py-12 text-center text-muted-foreground"
        >
          <p className="text-lg">Không tìm thấy công việc nào</p>
          <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskGrid;
