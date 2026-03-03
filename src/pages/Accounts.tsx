import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockUsers } from '@/data/mockData';
import Sidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Search, Shield, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Account {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'admin' | 'user';
  createdAt: string;
}

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = mockUsers[0];

  const fetchAccounts = useCallback(async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải danh sách tài khoản');
      console.error(error);
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('*');

    const roleMap = new Map<string, 'admin' | 'user'>();
    (roles || []).forEach((r: any) => roleMap.set(r.user_id, r.role));

    setAccounts(
      (profiles || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        email: p.email,
        avatarUrl: p.avatar_url,
        role: roleMap.get(p.user_id) || 'user',
        createdAt: p.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const filteredAccounts = searchQuery
    ? accounts.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : accounts;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentUser={currentUser} onLogout={() => {}} onProfileClick={() => {}} activePath="/accounts" />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý tài khoản</h1>
            <p className="text-muted-foreground">Danh sách các tài khoản đã đăng ký ({filteredAccounts.length} tài khoản)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="search-input flex-1 max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm tài khoản..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">Chưa có tài khoản nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Tên</span>
                <span>Email</span>
                <span>Vai trò</span>
                <span>Ngày tạo</span>
                <span></span>
              </div>
              {filteredAccounts.map(account => (
                <div key={account.id} className="flex items-center gap-4 px-4 py-3 bg-card border border-border rounded-lg hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {account.avatarUrl ? (
                      <img src={account.avatarUrl} alt={account.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
                    <span className="font-medium text-foreground truncate">{account.name}</span>
                    <span className="text-sm text-muted-foreground truncate">{account.email}</span>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className={`text-sm font-medium ${account.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {account.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Accounts;
