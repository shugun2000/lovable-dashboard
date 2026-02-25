import { useState, useCallback, useEffect } from 'react';
import { Document } from '@/types/document';
import { Priority } from '@/types/task';
import { mockUsers } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/dashboard/Sidebar';
import DocumentList from '@/components/documents/DocumentList';
import UploadDocumentModal from '@/components/documents/UploadDocumentModal';
import { Button } from '@/components/ui/button';
import { Upload, Search } from 'lucide-react';
import { toast } from 'sonner';

const Tasks = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = mockUsers[0];
  const isAdmin = currentUser.role === 'admin';

  const fetchDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) {
      toast.error('Lỗi tải danh sách tài liệu');
      console.error(error);
    } else {
      setDocuments(
        (data || []).map((d: any) => ({
          id: d.id,
          fileName: d.file_name,
          fileType: d.file_type as 'word' | 'pdf',
          uploadedBy: d.uploaded_by,
          uploadedAt: d.uploaded_at,
          priority: d.priority as Priority,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filteredDocuments = searchQuery
    ? documents.filter(d =>
        d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents;

  const handleUpload = useCallback(async (doc: Omit<Document, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const { error } = await supabase.from('documents').insert({
      file_name: doc.fileName,
      file_type: doc.fileType,
      uploaded_by: currentUser.name,
      priority: doc.priority,
    });
    if (error) {
      toast.error('Lỗi đăng tài liệu');
      console.error(error);
    } else {
      toast.success('Đã đăng tài liệu');
      fetchDocuments();
    }
    setIsUploadOpen(false);
  }, [currentUser.name, fetchDocuments]);

  const handlePriorityChange = useCallback(async (docId: string, priority: Priority) => {
    const { error } = await supabase.from('documents').update({ priority }).eq('id', docId);
    if (error) {
      toast.error('Lỗi cập nhật trạng thái');
    } else {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, priority } : d));
    }
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
              <p className="text-muted-foreground">Quản lý tài liệu công việc ({filteredDocuments.length} tài liệu)</p>
            </div>
            <Button className="gap-2" onClick={() => setIsUploadOpen(true)}>
              <Upload className="w-4 h-4" />
              Đăng tài liệu
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="search-input flex-1 max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : (
            <DocumentList
              documents={filteredDocuments}
              onReorder={handleReorder}
              onPriorityChange={handlePriorityChange}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </main>

      <UploadDocumentModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />
    </div>
  );
};

export default Tasks;
