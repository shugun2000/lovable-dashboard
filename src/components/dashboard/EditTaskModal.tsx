import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { Task, Priority, PRIORITY_LABELS } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditTaskModal = ({ task, isOpen, onClose, onUpdated }: EditTaskModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('later');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [details, setDetails] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setAssignee(task.assignee || '');
      setDueDate(task.dueDate || '');
      setDetails(task.details || '');
      setTags(task.tags || []);
    }
  }, [task]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim() || !description.trim()) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('tasks')
      .update({
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee: assignee.trim() || null,
        due_date: dueDate || null,
        details: details.trim() || null,
        tags: tags.length > 0 ? tags : null,
      })
      .eq('id', task.id);
    setIsLoading(false);

    if (error) {
      toast.error('Lỗi cập nhật công việc');
      console.error(error);
    } else {
      toast.success('Đã cập nhật công việc');
      onUpdated();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa công việc</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Tiêu đề *</Label>
            <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Mô tả *</Label>
            <Textarea id="edit-desc" value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngày hết hạn</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Người được giao</Label>
            <Input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Nhập tên" />
          </div>
          <div className="space-y-2">
            <Label>Chi tiết bổ sung</Label>
            <Textarea value={details} onChange={e => setDetails(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Nhãn (Tags)</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Nhập tag"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} />
              <Button type="button" variant="outline" onClick={handleAddTag}><Plus className="w-4 h-4" /></Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
            <Button type="submit" disabled={isLoading || !title || !description} className="flex-1">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</> : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
