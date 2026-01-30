import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/task';

interface ProgressHeaderProps {
  tasks: Task[];
}

const ProgressHeader = ({ tasks }: ProgressHeaderProps) => {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.priority === 'done').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent').length;
  const laterTasks = tasks.filter((t) => t.priority === 'later').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Hoàn thành',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'text-done',
      bgColor: 'bg-done-bg',
    },
    {
      label: 'Khẩn cấp',
      value: urgentTasks,
      icon: AlertTriangle,
      color: 'text-urgent',
      bgColor: 'bg-urgent-bg',
    },
    {
      label: 'Chờ xử lý',
      value: laterTasks,
      icon: Clock,
      color: 'text-later-foreground',
      bgColor: 'bg-later-bg',
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Tiến độ công việc
          </h2>
          <p className="text-muted-foreground">
            Tổng quan trạng thái các công việc
          </p>
        </div>
        <div className="text-right">
          <motion.div
            key={progressPercent}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-done"
          >
            {progressPercent}%
          </motion.div>
          <p className="text-sm text-muted-foreground">Hoàn thành</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="progress-fill"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${stat.bgColor} rounded-xl p-4`}
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressHeader;
