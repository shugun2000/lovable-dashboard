import { useEffect, useRef, useState, useCallback } from 'react';
import { Document } from '@/types/document';
import { Priority, PRIORITY_LABELS } from '@/types/task';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { LayoutGroup, motion } from 'framer-motion';
import { GripVertical, FileText, FileIcon, User, Clock } from 'lucide-react';
import PriorityBadge from '@/components/dashboard/PriorityBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentListProps {
  documents: Document[];
  onReorder: (docs: Document[]) => void;
  onPriorityChange: (docId: string, priority: Priority) => void;
  isAdmin?: boolean;
}

type DragState = 'idle' | 'dragging' | 'over';

const DraggableDocumentRow = ({
  doc,
  index,
  onPriorityChange,
  isAdmin,
}: {
  doc: Document;
  index: number;
  onPriorityChange: (priority: Priority) => void;
  isAdmin?: boolean;
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
        getInitialData: () => ({ index, id: doc.id }),
        onDragStart: () => setDragState('dragging'),
        onDrop: () => setDragState('idle'),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ index, id: doc.id }),
        onDragEnter: () => setDragState('over'),
        onDragLeave: () => setDragState('idle'),
        onDrop: () => setDragState('idle'),
      }),
    ];

    return () => cleanups.forEach(fn => fn());
  }, [index, doc.id]);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const fileIcon = doc.fileType === 'pdf' ? (
    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
      <FileText className="w-5 h-5 text-destructive" />
    </div>
  ) : (
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <FileIcon className="w-5 h-5 text-primary" />
    </div>
  );

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

      {fileIcon}

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-foreground truncate">{doc.fileName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4 shrink-0" />
          <span className="truncate">{doc.uploadedBy}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="truncate">{formatDateTime(doc.uploadedAt)}</span>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Select
            value={doc.priority}
            onValueChange={(v) => onPriorityChange(v as Priority)}
          >
            <SelectTrigger className="w-[120px] h-8">
              <PriorityBadge priority={doc.priority} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const DocumentList = ({ documents, onReorder, onPriorityChange, isAdmin }: DocumentListProps) => {
  const handleReorder = useCallback(
    (sourceIndex: number, destIndex: number) => {
      if (sourceIndex === destIndex) return;
      const updated = [...documents];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destIndex, 0, moved);
      onReorder(updated);
    },
    [documents, onReorder]
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

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg">Chưa có tài liệu nào</p>
        <p className="text-sm">Bấm "Đăng tài liệu" để tải lên file</p>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className="space-y-2">
        <div className="hidden md:flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="w-5" />
          <div className="w-10" />
          <div className="flex-1 grid grid-cols-4 gap-4">
            <span>Tên file</span>
            <span>Người đăng</span>
            <span>Thời gian</span>
            <span>Trạng thái</span>
          </div>
        </div>

        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            layout
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <DraggableDocumentRow
              doc={doc}
              index={index}
              onPriorityChange={(p) => onPriorityChange(doc.id, p)}
              isAdmin={isAdmin}
            />
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
};

export default DocumentList;
