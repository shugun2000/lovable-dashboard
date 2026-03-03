import { useState, useRef } from 'react';
import { Document } from '@/types/document';
import { Priority, PRIORITY_LABELS } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadDocumentModal = ({ isOpen, onClose, onUploaded }: UploadDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [priority, setPriority] = useState<Priority>('later');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPriority('later');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to storage
      const filePath = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileType = ext === 'pdf' ? 'pdf' : 'word';

      const { error: dbError } = await supabase.from('documents').insert({
        file_name: file.name,
        file_type: fileType,
        uploaded_by: 'Người dùng',
        priority,
        file_url: publicUrl,
      });

      if (dbError) throw dbError;

      toast.success('Đã đăng tài liệu');
      reset();
      onUploaded();
      onClose();
    } catch (err: any) {
      toast.error('Lỗi đăng tài liệu');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng tài liệu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Chọn file (Word hoặc PDF)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Tải lên file Word hoặc PDF</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : 'Đăng tài liệu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;
