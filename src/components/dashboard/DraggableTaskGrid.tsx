import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Priority } from '@/types/task';
import DraggableTaskCard from './DraggableTaskCard';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface DraggableTaskGridProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
  onReorder: (tasks: Task[]) => void;
  isAdmin?: boolean;
}

const DraggableTaskGrid = ({ 
  tasks, 
  onTaskClick, 
  onPriorityChange, 
  onReorder,
  isAdmin 
}: DraggableTaskGridProps) => {
  
  const handleReorder = useCallback((sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(destinationIndex, 0, movedTask);
    onReorder(newTasks);
  }, [tasks, onReorder]);

  // Global monitor for debugging and potential enhancements
  useEffect(() => {
    return monitorForElements({
      onDragStart: () => {
        document.body.style.cursor = 'grabbing';
      },
      onDrop: () => {
        document.body.style.cursor = '';
      },
    });
  }, []);

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            index={index}
            onClick={() => onTaskClick(task)}
            onPriorityChange={(priority) => onPriorityChange(task.id, priority)}
            onReorder={handleReorder}
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

export default DraggableTaskGrid;
