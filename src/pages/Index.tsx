import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, Priority } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import Sidebar from '@/components/dashboard/Sidebar';
import ProgressHeader from '@/components/dashboard/ProgressHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import DraggableTaskGrid from '@/components/dashboard/DraggableTaskGrid';
import TaskModal from '@/components/dashboard/TaskModal';
import ProfileModal from '@/components/dashboard/ProfileModal';
import CreateTaskModal from '@/components/dashboard/CreateTaskModal';
import UserRoleBadge from '@/components/dashboard/UserRoleBadge';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, updateTaskPriority } = useTasks();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'priority'>('priority');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Create user object for components that need it
  const currentUser = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.user_id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
      role: isAdmin ? 'admin' as const : 'user' as const
    };
  }, [profile, isAdmin]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      result = result.filter((task) => task.priority === filterPriority);
    }

    // Sort
    if (sortOrder === 'priority') {
      const priorityOrder: Record<Priority, number> = { urgent: 0, later: 1, done: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortOrder === 'asc') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [tasks, searchQuery, filterPriority, sortOrder]);

  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handlePriorityChange = async (taskId: string, priority: Priority) => {
    await updateTaskPriority(taskId, priority);
    // Also update selected task if it's open
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, priority } : null));
    }
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTimeout(() => setSelectedTask(null), 200);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleReorder = useCallback((reorderedTasks: Task[]) => {
    // For now, just update the local order (could be persisted to DB if needed)
    console.log('Reordered tasks:', reorderedTasks.map(t => t.id));
  }, []);

  // Loading state
  if (authLoading || tasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Quản lý và theo dõi công việc của bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <UserRoleBadge user={currentUser} />

              {isAdmin && (
                <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Thêm công việc
                </Button>
              )}
            </div>
          </div>

          {/* Progress Header */}
          <ProgressHeader tasks={tasks} />

          {/* Search and Filters */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPriority={filterPriority}
            onFilterChange={setFilterPriority}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          {/* Draggable Task Grid */}
          <DraggableTaskGrid
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onPriorityChange={handlePriorityChange}
            onReorder={handleReorder}
            isAdmin={isAdmin}
          />

          {/* Empty state */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || filterPriority !== 'all'
                  ? 'Không tìm thấy công việc nào phù hợp'
                  : 'Chưa có công việc nào'}
              </p>
              {isAdmin && !searchQuery && filterPriority === 'all' && (
                <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm công việc đầu tiên
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onPriorityChange={handlePriorityChange}
        isAdmin={isAdmin}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Index;
