import { Priority } from './task';

export interface Document {
  id: string;
  fileName: string;
  fileType: 'word' | 'pdf';
  uploadedBy: string;
  uploadedAt: string;
  priority: Priority;
}
