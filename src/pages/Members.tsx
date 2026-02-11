import { useState, useCallback } from 'react';
import { Member } from '@/types/member';
import { mockUsers } from '@/data/mockData';
import Sidebar from '@/components/dashboard/Sidebar';
import MemberList from '@/components/members/MemberList';
import CreateMemberModal from '@/components/members/CreateMemberModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const initialMembers: Member[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    dateOfBirth: '1995-03-15',
    unit: 'Phòng Kỹ thuật',
    team: 'Frontend',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    dateOfBirth: '1998-07-22',
    unit: 'Phòng Kỹ thuật',
    team: 'Backend',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    dateOfBirth: '1997-11-08',
    unit: 'Phòng Marketing',
    team: 'Content',
    createdAt: '2024-01-03',
  },
];

const Members = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const currentUser = mockUsers[0];

  const handleCreate = useCallback((member: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setMembers(prev => [newMember, ...prev]);
    setIsCreateOpen(false);
  }, []);

  const handleReorder = useCallback((reordered: Member[]) => {
    setMembers(reordered);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentUser={currentUser}
        onLogout={() => {}}
        onProfileClick={() => {}}
        activePath="/members"
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thành viên</h1>
              <p className="text-muted-foreground">
                Quản lý danh sách thành viên trong nhóm
              </p>
            </div>
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Thêm thành viên
            </Button>
          </div>

          <MemberList members={members} onReorder={handleReorder} />
        </div>
      </main>

      <CreateMemberModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default Members;
