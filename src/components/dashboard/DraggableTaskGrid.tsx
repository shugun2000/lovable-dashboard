import { useCallback, useEffect } from 'react';
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

  // Global monitor for cursor changes during drag
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      {tasks.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground">
          <p className="text-lg">Không tìm thấy công việc nào</p>
          <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
};

export default DraggableTaskGrid;
