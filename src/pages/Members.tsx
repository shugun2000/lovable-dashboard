import { useState, useCallback, useMemo, useEffect } from 'react';
import { Member } from '@/types/member';
import { mockUsers } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
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
import { Plus, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = mockUsers[0];
  const isAdmin = currentUser.role === 'admin';

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Lỗi tải danh sách thành viên');
      console.error(error);
    } else {
      setMembers(
        (data || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          dateOfBirth: m.date_of_birth,
          unit: m.unit,
          team: m.team,
          createdAt: m.created_at,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const units = useMemo(() => {
    const set = new Set(members.map(m => m.unit));
    return Array.from(set).sort();
  }, [members]);

  const teams = useMemo(() => {
    const set = new Set(members.map(m => m.team));
    return Array.from(set).sort((a, b) => a - b);
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (filterUnit !== 'all') {
      result = result.filter(m => m.unit === filterUnit);
    }
    if (filterTeam !== 'all') {
      result = result.filter(m => m.team === Number(filterTeam));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.unit.toLowerCase().includes(q));
    }
    return result;
  }, [members, filterUnit, filterTeam, searchQuery]);

  const handleCreate = useCallback(async (member: Omit<Member, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('members').insert({
      name: member.name,
      date_of_birth: member.dateOfBirth,
      unit: member.unit,
      team: member.team,
    });
    if (error) {
      toast.error('Lỗi tạo thành viên');
      console.error(error);
    } else {
      toast.success('Đã tạo thành viên');
      fetchMembers();
    }
    setIsCreateOpen(false);
  }, [fetchMembers]);

  const handleSave = useCallback(async (updated: Member) => {
    const { error } = await supabase.from('members').update({
      name: updated.name,
      date_of_birth: updated.dateOfBirth,
      unit: updated.unit,
      team: updated.team,
    }).eq('id', updated.id);
    if (error) {
      toast.error('Lỗi cập nhật thành viên');
      console.error(error);
    } else {
      toast.success('Đã cập nhật thành viên');
      fetchMembers();
    }
  }, [fetchMembers]);

  const handleReorder = useCallback((reordered: Member[]) => {
    setMembers(reordered);
  }, []);

  const handleMemberClick = useCallback((member: Member) => {
    if (isAdmin) setEditingMember(member);
  }, [isAdmin]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentUser={currentUser} onLogout={() => {}} onProfileClick={() => {}} activePath="/members" />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thành viên</h1>
              <p className="text-muted-foreground">Quản lý danh sách thành viên trong nhóm ({filteredMembers.length} người)</p>
            </div>
            {isAdmin && (
              <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                Thêm thành viên
              </Button>
            )}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="search-input flex-1 max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm thành viên..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
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
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo đội" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đội</SelectItem>
                {teams.map(t => (
                  <SelectItem key={t} value={String(t)}>Đội {t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : (
            <MemberList members={filteredMembers} onReorder={handleReorder} onMemberClick={handleMemberClick} />
          )}
        </div>
      </main>

      <CreateMemberModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
      <EditMemberModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} member={editingMember} onSave={handleSave} />
    </div>
  );
};

export default Members;
