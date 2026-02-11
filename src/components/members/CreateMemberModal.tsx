import { useState } from 'react';
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

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (member: Omit<Member, 'id' | 'createdAt'>) => void;
}

const CreateMemberModal = ({ isOpen, onClose, onCreate }: CreateMemberModalProps) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [unit, setUnit] = useState('');
  const [team, setTeam] = useState<number>(1);

  const reset = () => {
    setName('');
    setDateOfBirth('');
    setUnit('');
    setTeam(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dateOfBirth || !unit) return;
    onCreate({ name, dateOfBirth, unit, team });
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
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nhập họ tên..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Ngày tháng năm sinh</Label>
            <Input id="dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Đơn vị</Label>
            <Input id="unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Nhập đơn vị..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">Đội (số)</Label>
            <Input id="team" type="number" min={1} value={team} onChange={e => setTeam(Number(e.target.value))} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
            <Button type="submit" disabled={!name || !dateOfBirth || !unit}>Tạo thành viên</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberModal;
