import { Task, Priority, PRIORITY_LABELS } from '@/types/task';
import PriorityBadge from './PriorityBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, User as UserIcon, Tag, Clock, FileText, Pencil } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onPriorityChange?: (taskId: string, priority: Priority) => void;
  onEdit?: (task: Task) => void;
  isAdmin?: boolean;
}

const TaskModal = ({ task, isOpen, onClose, onPriorityChange, onEdit, isAdmin }: TaskModalProps) => {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <div className="mb-2"><PriorityBadge priority={task.priority} /></div>
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <FileText className="w-4 h-4" /> Mô tả
            </div>
            <p className="text-foreground">{task.description}</p>
          </div>

          {task.details && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <FileText className="w-4 h-4" /> Chi tiết
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm">{task.details}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {task.assignee && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <UserIcon className="w-4 h-4" /> Người phụ trách
                </div>
                <p>{task.assignee}</p>
              </div>
            )}
            {task.dueDate && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" /> Hạn chót
                </div>
                <p>{new Date(task.dueDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Tag className="w-4 h-4" /> Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Tạo: {new Date(task.createdAt).toLocaleDateString('vi-VN')}</div>
            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Cập nhật: {new Date(task.updatedAt).toLocaleDateString('vi-VN')}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trạng thái:</span>
            <Select value={task.priority} onValueChange={v => onPriorityChange?.(task.id, v as Priority)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={() => { onClose(); onEdit(task); }}>
                <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
              </Button>
            )}
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
