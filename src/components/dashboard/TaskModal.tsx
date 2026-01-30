import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User as UserIcon, Tag, Clock, FileText } from 'lucide-react';
import { Task, Priority, PRIORITY_LABELS } from '@/types/task';
import PriorityBadge from './PriorityBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onPriorityChange?: (taskId: string, priority: Priority) => void;
  isAdmin?: boolean;
}

const TaskModal = ({ task, isOpen, onClose, onPriorityChange, isAdmin }: TaskModalProps) => {
  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-2xl shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex-1 pr-4">
                <div className="mb-2">
                  <PriorityBadge priority={task.priority} />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <FileText className="w-4 h-4" />
                  Mô tả
                </div>
                <p className="text-card-foreground">{task.description}</p>
              </div>

              {/* Details */}
              {task.details && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <FileText className="w-4 h-4" />
                    Chi tiết
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-sm text-card-foreground">
                    {task.details}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                {task.assignee && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <UserIcon className="w-4 h-4" />
                      Người phụ trách
                    </div>
                    <p className="text-card-foreground">{task.assignee}</p>
                  </div>
                )}
                {task.dueDate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      Hạn chót
                    </div>
                    <p className="text-card-foreground">
                      {new Date(task.dueDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Tạo: {new Date(task.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cập nhật: {new Date(task.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 bg-muted/50 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Select
                  value={task.priority}
                  onValueChange={(value) =>
                    onPriorityChange?.(task.id, value as Priority)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-urgent" />
                        {PRIORITY_LABELS.urgent}
                      </div>
                    </SelectItem>
                    <SelectItem value="later">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-later" />
                        {PRIORITY_LABELS.later}
                      </div>
                    </SelectItem>
                    <SelectItem value="done">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-done" />
                        {PRIORITY_LABELS.done}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
