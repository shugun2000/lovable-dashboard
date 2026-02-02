import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, Priority } from '@/types/task';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách công việc',
        variant: 'destructive'
      });
      return;
    }

    const mappedTasks: Task[] = (data || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority as Priority,
      assignee: task.assignee || undefined,
      dueDate: task.due_date || undefined,
      createdAt: task.created_at.split('T')[0],
      updatedAt: task.updated_at.split('T')[0],
      details: task.details || undefined,
      tags: task.tags || undefined
    }));

    setTasks(mappedTasks);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isAdmin) {
      toast({
        title: 'Không có quyền',
        description: 'Chỉ admin mới có thể thêm công việc',
        variant: 'destructive'
      });
      return { error: new Error('Permission denied') };
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        assignee: task.assignee,
        due_date: task.dueDate,
        details: task.details,
        tags: task.tags,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo công việc',
        variant: 'destructive'
      });
      return { error };
    }

    await fetchTasks();
    toast({
      title: 'Thành công',
      description: 'Đã tạo công việc mới'
    });

    return { error: null, data };
  };

  const updateTaskPriority = async (taskId: string, priority: Priority) => {
    const { error } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive'
      });
      return { error };
    }

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, priority, updatedAt: new Date().toISOString().split('T')[0] }
          : task
      )
    );

    return { error: null };
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) {
      toast({
        title: 'Không có quyền',
        description: 'Chỉ admin mới có thể chỉnh sửa công việc',
        variant: 'destructive'
      });
      return { error: new Error('Permission denied') };
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        assignee: updates.assignee,
        due_date: updates.dueDate,
        details: updates.details,
        tags: updates.tags
      })
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật công việc',
        variant: 'destructive'
      });
      return { error };
    }

    await fetchTasks();
    return { error: null };
  };

  const deleteTask = async (taskId: string) => {
    if (!isAdmin) {
      toast({
        title: 'Không có quyền',
        description: 'Chỉ admin mới có thể xóa công việc',
        variant: 'destructive'
      });
      return { error: new Error('Permission denied') };
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa công việc',
        variant: 'destructive'
      });
      return { error };
    }

    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: 'Thành công',
      description: 'Đã xóa công việc'
    });

    return { error: null };
  };

  return {
    tasks,
    loading,
    createTask,
    updateTaskPriority,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks
  };
};
