import { useEffect, useRef, useState, useCallback } from 'react';
import { Member } from '@/types/member';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { LayoutGroup, motion } from 'framer-motion';
import { GripVertical, User, Building2, Users, Calendar, FileText } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onReorder: (members: Member[]) => void;
}

type DragState = 'idle' | 'dragging' | 'over';

const DraggableMemberRow = ({
  member,
  index,
}: {
  member: Member;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>('idle');

  useEffect(() => {
    const el = ref.current;
    const handle = handleRef.current;
    if (!el || !handle) return;

    const cleanups = [
      draggable({
        element: el,
        dragHandle: handle,
        getInitialData: () => ({ index, id: member.id }),
        onDragStart: () => setDragState('dragging'),
        onDrop: () => setDragState('idle'),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ index, id: member.id }),
        onDragEnter: () => setDragState('over'),
        onDragLeave: () => setDragState('idle'),
        onDrop: () => setDragState('idle'),
      }),
    ];

    return () => cleanups.forEach(fn => fn());
  }, [index, member.id]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div
      ref={ref}
      className={`flex items-center gap-4 px-4 py-3 bg-card border rounded-lg transition-all ${
        dragState === 'dragging'
          ? 'opacity-50 scale-[0.98]'
          : dragState === 'over'
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border hover:border-muted-foreground/30 hover:shadow-sm'
      }`}
    >
      <div
        ref={handleRef}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-foreground truncate">{member.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{formatDate(member.dateOfBirth)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{member.unit}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 shrink-0" />
          <span className="truncate">{member.team}</span>
        </div>
      </div>

      {member.fileName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">
          <FileText className="w-3.5 h-3.5" />
          <span className="max-w-[100px] truncate">{member.fileName}</span>
        </div>
      )}
    </div>
  );
};

const MemberList = ({ members, onReorder }: MemberListProps) => {
  const handleReorder = useCallback(
    (sourceIndex: number, destIndex: number) => {
      if (sourceIndex === destIndex) return;
      const updated = [...members];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destIndex, 0, moved);
      onReorder(updated);
    },
    [members, onReorder]
  );

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const dest = location.current.dropTargets[0];
        if (!dest) return;
        const sourceIndex = source.data.index as number;
        const destIndex = dest.data.index as number;
        handleReorder(sourceIndex, destIndex);
      },
    });
  }, [handleReorder]);

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg">Chưa có thành viên nào</p>
        <p className="text-sm">Bấm "Thêm thành viên" để bắt đầu</p>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className="space-y-2">
        {/* Header */}
        <div className="hidden md:flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="w-5" />
          <div className="w-10" />
          <div className="flex-1 grid grid-cols-4 gap-4">
            <span>Họ tên</span>
            <span>Ngày sinh</span>
            <span>Đơn vị</span>
            <span>Đội</span>
          </div>
          <div className="w-[120px]">Tài liệu</div>
        </div>

        {members.map((member, index) => (
          <motion.div
            key={member.id}
            layout
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <DraggableMemberRow member={member} index={index} />
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
};

export default MemberList;
