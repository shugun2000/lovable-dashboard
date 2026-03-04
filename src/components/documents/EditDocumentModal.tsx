import { useState, useEffect } from 'react';
import { Document } from '@/types/document';
import { Priority, PRIORITY_LABELS } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditDocumentModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditDocumentModal = ({ document: doc, isOpen, onClose, onUpdated }: EditDocumentModalProps) => {
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<Priority>('later');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setNote(doc.note || '');
      setPriority(doc.priority);
    }
  }, [doc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc || !note.trim()) return;

    setSaving(true);
    const { error } = await supabase.from('documents')
      .update({ note: note.trim(), priority })
      .eq('id', doc.id);
    setSaving(false);

    if (error) {
      toast.error('Lỗi cập nhật tài liệu');
    } else {
      toast.success('Đã cập nhật tài liệu');
      onUpdated();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Chỉnh sửa tài liệu</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên file</Label>
            <p className="text-sm text-muted-foreground truncate">{doc?.fileName}</p>
          </div>
          <div className="space-y-2">
            <Label>Ghi chú *</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Nhập ghi chú..." required rows={3} />
          </div>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={!note.trim() || saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</> : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentModal;
