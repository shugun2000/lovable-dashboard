import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  FolderKanban
} from 'lucide-react';
import { User } from '@/types/task';

interface SidebarProps {
  currentUser: User;
  onLogout?: () => void;
}

const Sidebar = ({ currentUser, onLogout }: SidebarProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: CheckSquare, label: 'Công việc', count: 10 },
    { icon: FolderKanban, label: 'Dự án' },
    { icon: Users, label: 'Thành viên' },
    { icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          TaskFlow
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`sidebar-nav-item w-full ${item.active ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full bg-muted"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-primary truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-sidebar-foreground truncate">
              {currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="sidebar-nav-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
