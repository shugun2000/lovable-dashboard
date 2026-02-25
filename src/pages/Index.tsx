import { useState, useMemo, useCallback, useEffect } from 'react';
import { Task, Priority } from '@/types/task';
import { mockUsers } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/dashboard/Sidebar';
import ProgressHeader from '@/components/dashboard/ProgressHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import DraggableTaskGrid from '@/components/dashboard/DraggableTaskGrid';
import TaskModal from '@/components/dashboard/TaskModal';
import CreateTaskModal from '@/components/dashboard/CreateTaskModal';
import UserRoleBadge from '@/components/dashboard/UserRoleBadge';
import OnlineMembers from '@/components/dashboard/OnlineMembers';
import UrgentTasksList from '@/components/dashboard/UrgentTasksList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = mockUsers[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'priority'>('priority');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Lỗi tải công việc');
      console.error(error);
    } else {
      setTasks(
        (data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority as Priority,
          assignee: t.assignee,
          dueDate: t.due_date,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          details: t.details,
          tags: t.tags,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filterPriority !== 'all') {
      result = result.filter((task) => task.priority === filterPriority);
    }

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

  const urgentTasks = useMemo(() => tasks.filter(t => t.priority === 'urgent').slice(0, 10), [tasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handlePriorityChange = async (taskId: string, priority: Priority) => {
    const { error } = await supabase.from('tasks').update({ priority }).eq('id', taskId);
    if (error) {
      toast.error('Lỗi cập nhật');
    } else {
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, priority } : task));
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, priority } : null);
      }
    }
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTimeout(() => setSelectedTask(null), 200);
  };

  const handleReorder = useCallback((reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        currentUser={currentUser} 
        onLogout={() => {}}
        onProfileClick={() => {}}
        activePath="/"
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
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

          {/* Online Members */}
          <OnlineMembers />

          <ProgressHeader tasks={tasks} />

          {/* Urgent Tasks Summary */}
          {urgentTasks.length > 0 && (
            <UrgentTasksList tasks={urgentTasks} onTaskClick={handleTaskClick} />
          )}

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPriority={filterPriority}
            onFilterChange={setFilterPriority}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : (
            <DraggableTaskGrid
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onPriorityChange={handlePriorityChange}
              onReorder={handleReorder}
              isAdmin={isAdmin}
            />
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || filterPriority !== 'all'
                  ? 'Không tìm thấy công việc nào phù hợp'
                  : 'Chưa có công việc nào'}
              </p>
            </div>
          )}
        </div>
      </main>

      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onPriorityChange={handlePriorityChange}
        isAdmin={isAdmin}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Index;
