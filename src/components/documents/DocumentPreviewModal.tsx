import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { Document } from '@/types/document';

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentPreviewModal = ({ document: doc, isOpen, onClose }: DocumentPreviewModalProps) => {
  if (!doc || !doc.fileUrl) return null;

  const isPdf = doc.fileType === 'pdf';

  const handleDownload = () => {
    const a = window.document.createElement('a');
    a.href = doc.fileUrl!;
    a.download = doc.fileName;
    a.target = '_blank';
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{doc.fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border bg-muted">
          {isPdf ? (
            <iframe
              src={`${doc.fileUrl}#toolbar=1`}
              className="w-full h-full"
              title={doc.fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <p className="text-muted-foreground">
                Không thể xem trước file Word trên trình duyệt.
              </p>
              <p className="text-sm text-muted-foreground">
                Bạn có thể tải xuống để xem hoặc mở bằng Google Docs.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" /> Tải xuống
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href={`https://docs.google.com/gview?url=${encodeURIComponent(doc.fileUrl!)}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" /> Mở bằng Google Docs
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Tải xuống
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
