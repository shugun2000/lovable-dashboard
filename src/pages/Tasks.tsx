import { useState, useCallback, useEffect, useMemo } from 'react';
import { Document } from '@/types/document';
import { Priority } from '@/types/task';
import { mockUsers } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/dashboard/Sidebar';
import DocumentList from '@/components/documents/DocumentList';
import UploadDocumentModal from '@/components/documents/UploadDocumentModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import EditDocumentModal from '@/components/documents/EditDocumentModal';
import { Button } from '@/components/ui/button';
import { Upload, Search } from 'lucide-react';
import { toast } from 'sonner';

const Tasks = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const currentUser = mockUsers[0];
  const isAdmin = currentUser.role === 'admin';

  const fetchDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) { toast.error('Lỗi tải danh sách tài liệu'); console.error(error); } else {
      setDocuments((data || []).map((d: any) => ({
        id: d.id, fileName: d.file_name, fileType: d.file_type as 'word' | 'pdf',
        uploadedBy: d.uploaded_by, uploadedAt: d.uploaded_at,
        priority: d.priority as Priority, fileUrl: d.file_url, note: d.note || '',
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(d => d.fileName.toLowerCase().includes(q) || d.uploadedBy.toLowerCase().includes(q));
  }, [documents, searchQuery]);

  const handlePriorityChange = useCallback(async (docId: string, priority: Priority) => {
    const { error } = await supabase.from('documents').update({ priority }).eq('id', docId);
    if (error) { toast.error('Lỗi cập nhật trạng thái'); }
    else { setDocuments(prev => prev.map(d => d.id === docId ? { ...d, priority } : d)); }
  }, []);

  const handleReorder = useCallback((reordered: Document[]) => { setDocuments(reordered); }, []);

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
              <Upload className="w-4 h-4" /> Đăng tài liệu
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="search-input flex-1 max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Tìm kiếm tài liệu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          {loading ? <div className="text-center py-12 text-muted-foreground">Đang tải...</div> : (
            <DocumentList documents={filteredDocuments} onReorder={handleReorder} onPriorityChange={handlePriorityChange} onPreview={doc => setPreviewDoc(doc)} onEdit={doc => setEditingDoc(doc)} isAdmin={isAdmin} />
          )}
        </div>
      </main>
      <UploadDocumentModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploaded={fetchDocuments} />
      <EditDocumentModal document={editingDoc} isOpen={!!editingDoc} onClose={() => setEditingDoc(null)} onUpdated={fetchDocuments} />
      <DocumentPreviewModal document={previewDoc} isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

export default Tasks;
