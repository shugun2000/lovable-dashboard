import { useState, useMemo, useCallback } from 'react';
import { Task, Priority, User } from '@/types/task';
import { mockTasks, mockUsers } from '@/data/mockData';
import Sidebar from '@/components/dashboard/Sidebar';
import ProgressHeader from '@/components/dashboard/ProgressHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import DraggableTaskGrid from '@/components/dashboard/DraggableTaskGrid';
import TaskModal from '@/components/dashboard/TaskModal';
import UserRoleBadge from '@/components/dashboard/UserRoleBadge';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // Admin by default
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'priority'>('priority');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';

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
    setIsModalOpen(true);
  };

  const handlePriorityChange = (taskId: string, priority: Priority) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, priority, updatedAt: new Date().toISOString().split('T')[0] }
          : task
      )
    );
    // Also update selected task if it's open
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, priority } : null));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTask(null), 200);
  };

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
  };

  // Handle task reordering via drag and drop
  const handleReorder = useCallback((reorderedTasks: Task[]) => {
    // Update the order in the original tasks array based on filtered/sorted results
    const taskIdOrder = reorderedTasks.map(t => t.id);
    setTasks(prevTasks => {
      const taskMap = new Map(prevTasks.map(t => [t.id, t]));
      const orderedTasks = taskIdOrder.map(id => taskMap.get(id)!).filter(Boolean);
      const remainingTasks = prevTasks.filter(t => !taskIdOrder.includes(t.id));
      return [...orderedTasks, ...remainingTasks];
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar currentUser={currentUser} />

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
              {/* User Role Badge & Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4" />
                    Chuyển người dùng
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Chọn người dùng (Demo)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mockUsers.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => handleUserSwitch(user)}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                        </p>
                      </div>
                      {currentUser.id === user.id && (
                        <span className="w-2 h-2 rounded-full bg-done" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <UserRoleBadge user={currentUser} />

              {isAdmin && (
                <Button className="gap-2">
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
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPriorityChange={handlePriorityChange}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Index;
