import { useState, useCallback } from 'react';
import { Document } from '@/types/document';
import { Priority } from '@/types/task';
import { mockUsers } from '@/data/mockData';
import Sidebar from '@/components/dashboard/Sidebar';
import DocumentList from '@/components/documents/DocumentList';
import UploadDocumentModal from '@/components/documents/UploadDocumentModal';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const initialDocs: Document[] = [
  { id: '1', fileName: 'Báo cáo tháng 1.pdf', fileType: 'pdf', uploadedBy: 'Nguyễn Văn A', uploadedAt: '2024-06-15T08:30:00', priority: 'urgent' },
  { id: '2', fileName: 'Kế hoạch dự án.docx', fileType: 'word', uploadedBy: 'Trần Thị B', uploadedAt: '2024-06-14T14:20:30', priority: 'later' },
  { id: '3', fileName: 'Biên bản họp.pdf', fileType: 'pdf', uploadedBy: 'Lê Văn C', uploadedAt: '2024-06-13T09:15:45', priority: 'done' },
];

const Tasks = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const currentUser = mockUsers[0];
  const isAdmin = currentUser.role === 'admin';

  const handleUpload = useCallback((doc: Omit<Document, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadOpen(false);
  }, [currentUser.name]);

  const handlePriorityChange = useCallback((docId: string, priority: Priority) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, priority } : d));
  }, []);

  const handleReorder = useCallback((reordered: Document[]) => {
    setDocuments(reordered);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentUser={currentUser} onLogout={() => {}} onProfileClick={() => {}} activePath="/tasks" />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Công việc</h1>
              <p className="text-muted-foreground">Quản lý và đăng tải tài liệu công việc</p>
            </div>
            <Button className="gap-2" onClick={() => setIsUploadOpen(true)}>
              <Upload className="w-4 h-4" />
              Đăng tài liệu
            </Button>
          </div>

          <DocumentList
            documents={documents}
            onReorder={handleReorder}
            onPriorityChange={handlePriorityChange}
            isAdmin={isAdmin}
          />
        </div>
      </main>

      <UploadDocumentModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />
    </div>
  );
};

export default Tasks;
