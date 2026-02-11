import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  FolderKanban,
  User
} from 'lucide-react';
import { User as UserType } from '@/types/task';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  currentUser: UserType;
  onLogout?: () => void;
  onProfileClick?: () => void;
  activePath?: string;
}

const Sidebar = ({ currentUser, onLogout, onProfileClick, activePath = '/' }: SidebarProps) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CheckSquare, label: 'Công việc', path: '/tasks' },
    { icon: FolderKanban, label: 'Dự án', path: '/projects' },
    { icon: Users, label: 'Thành viên', path: '/members' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border sticky top-0">
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
              onClick={() => navigate(item.path)}
              className={`sidebar-nav-item w-full ${activePath === item.path ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 mb-3 w-full hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
        >
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full bg-muted object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-sidebar-primary truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-sidebar-foreground truncate">
              {currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </p>
          </div>
        </button>
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
