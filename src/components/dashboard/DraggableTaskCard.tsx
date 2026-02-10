import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, MoreVertical, User as UserIcon, GripVertical } from 'lucide-react';
import { Task, Priority } from '@/types/task';
import PriorityBadge from './PriorityBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { cn } from '@/lib/utils';

interface DraggableTaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
  onPriorityChange?: (priority: Priority) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  isAdmin?: boolean;
}

type DragState = 
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'dragging' }
  | { type: 'over' };

const DraggableTaskCard = ({ 
  task, 
  index, 
  onClick, 
  onPriorityChange, 
  onReorder,
}: DraggableTaskCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({ type: 'idle' });

  useEffect(() => {
    const element = cardRef.current;
    const handle = handleRef.current;
    if (!element || !handle) return;

    const cleanup = combine(
      draggable({
        element,
        dragHandle: handle,
        getInitialData: () => ({ taskId: task.id, index }),
        onGenerateDragPreview: ({ nativeSetDragImage, source, location }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: source.element,
              input: location.current.input,
            }),
            render: ({ container }) => {
              setDragState({ type: 'preview', container });
              return () => setDragState({ type: 'dragging' });
            },
          });
        },
        onDrop: () => {
          setDragState({ type: 'idle' });
        },
      }),
      dropTargetForElements({
        element,
        getData: () => ({ taskId: task.id, index }),
        canDrop: ({ source }) => source.data.taskId !== task.id,
        onDragEnter: () => {
          setDragState({ type: 'over' });
        },
        onDragLeave: () => setDragState({ type: 'idle' }),
        onDrop: ({ source }) => {
          setDragState({ type: 'idle' });
          const sourceIndex = source.data.index as number;
          onReorder(sourceIndex, index);
        },
      })
    );

    return cleanup;
  }, [task.id, index, onReorder]);

  const handlePriorityChange = (e: React.MouseEvent, priority: Priority) => {
    e.stopPropagation();
    onPriorityChange?.(priority);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "task-card group relative cursor-pointer",
        dragState.type === 'dragging' && 'opacity-50 scale-[1.02] shadow-xl z-50 ring-2 ring-primary/20',
        dragState.type === 'over' && 'ring-2 ring-primary/40 bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        ref={handleRef}
        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="pl-5">
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
      </div>
      {dragState.type === 'preview' && createPortal(
        <div className="task-card p-4 w-[280px] rotate-[4deg] shadow-xl opacity-90">
          <div className="flex items-start justify-between mb-3">
            <PriorityBadge priority={task.priority} />
          </div>
          <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        </div>,
        dragState.container
      )}
    </div>
  );
};

export default DraggableTaskCard;
