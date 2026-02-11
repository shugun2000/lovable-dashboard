import { useState, useRef } from 'react';
import { Member } from '@/types/member';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (member: Omit<Member, 'id' | 'createdAt'>) => void;
}

const CreateMemberModal = ({ isOpen, onClose, onCreate }: CreateMemberModalProps) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [unit, setUnit] = useState('');
  const [team, setTeam] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName('');
    setDateOfBirth('');
    setUnit('');
    setTeam('');
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dateOfBirth || !unit || !team) return;

    onCreate({
      name,
      dateOfBirth,
      unit,
      team,
      fileName: file?.name,
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập họ tên..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Ngày tháng năm sinh</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Đơn vị</Label>
            <Input
              id="unit"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="Nhập đơn vị..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Đội</Label>
            <Input
              id="team"
              value={team}
              onChange={e => setTeam(e.target.value)}
              placeholder="Nhập tên đội..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tài liệu đính kèm</Label>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={!name || !dateOfBirth || !unit || !team}>
              Tạo thành viên
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberModal;
