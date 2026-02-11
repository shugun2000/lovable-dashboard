import { useState, useCallback, useMemo } from 'react';
import { Member } from '@/types/member';
import { mockUsers } from '@/data/mockData';
import Sidebar from '@/components/dashboard/Sidebar';
import MemberList from '@/components/members/MemberList';
import CreateMemberModal from '@/components/members/CreateMemberModal';
import EditMemberModal from '@/components/members/EditMemberModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';

const initialMembers: Member[] = [
  { id: '1', name: 'Nguyễn Văn A', dateOfBirth: '1995-03-15', unit: 'Phòng Kỹ thuật', team: 1, createdAt: '2024-01-01' },
  { id: '2', name: 'Trần Thị B', dateOfBirth: '1998-07-22', unit: 'Phòng Kỹ thuật', team: 2, createdAt: '2024-01-02' },
  { id: '3', name: 'Lê Văn C', dateOfBirth: '1997-11-08', unit: 'Phòng Marketing', team: 1, createdAt: '2024-01-03' },
  { id: '4', name: 'Phạm Thị D', dateOfBirth: '1996-05-20', unit: 'Phòng Marketing', team: 3, createdAt: '2024-01-04' },
  { id: '5', name: 'Hoàng Văn E', dateOfBirth: '1999-12-01', unit: 'Phòng Kỹ thuật', team: 3, createdAt: '2024-01-05' },
];

const Members = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const currentUser = mockUsers[0];
  const isAdmin = currentUser.role === 'admin';

  const units = useMemo(() => {
    const set = new Set(members.map(m => m.unit));
    return Array.from(set).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (filterUnit === 'all') return members;
    return members.filter(m => m.unit === filterUnit);
  }, [members, filterUnit]);

  const handleCreate = useCallback((member: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setMembers(prev => [newMember, ...prev]);
    setIsCreateOpen(false);
  }, []);

  const handleSave = useCallback((updated: Member) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  }, []);

  const handleReorder = useCallback((reordered: Member[]) => {
    setMembers(reordered);
  }, []);

  const handleMemberClick = useCallback((member: Member) => {
    if (isAdmin) {
      setEditingMember(member);
    }
  }, [isAdmin]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentUser={currentUser} onLogout={() => {}} onProfileClick={() => {}} activePath="/members" />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thành viên</h1>
              <p className="text-muted-foreground">Quản lý danh sách thành viên trong nhóm</p>
            </div>
            {isAdmin && (
              <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                Thêm thành viên
              </Button>
            )}
          </div>

          {/* Unit filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Lọc theo đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                {units.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MemberList members={filteredMembers} onReorder={handleReorder} onMemberClick={handleMemberClick} />
        </div>
      </main>

      <CreateMemberModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
      <EditMemberModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} member={editingMember} onSave={handleSave} />
    </div>
  );
};

export default Members;
