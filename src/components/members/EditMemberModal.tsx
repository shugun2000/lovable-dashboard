import { useState, useEffect } from 'react';
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

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (member: Member) => void;
}

const EditMemberModal = ({ isOpen, onClose, member, onSave }: EditMemberModalProps) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [unit, setUnit] = useState('');
  const [team, setTeam] = useState<number>(1);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setDateOfBirth(member.dateOfBirth);
      setUnit(member.unit);
      setTeam(member.team);
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !name || !dateOfBirth || !unit) return;
    onSave({ ...member, name, dateOfBirth, unit, team });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Họ tên</Label>
            <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dob">Ngày tháng năm sinh</Label>
            <Input id="edit-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-unit">Đơn vị</Label>
            <Input id="edit-unit" value={unit} onChange={e => setUnit(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-team">Đội (số)</Label>
            <Input id="edit-team" type="number" min={1} value={team} onChange={e => setTeam(Number(e.target.value))} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberModal;
