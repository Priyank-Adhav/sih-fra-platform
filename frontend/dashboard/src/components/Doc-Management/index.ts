// Document Management Components Export
export { default as DocManagementPanel } from './DocManagementPanel';
export { DocumentUpload } from './DocumentUpload';
export { DocumentProcessor } from './DocumentProcessor';
export { ExtractedEntities } from './ExtractedEntities';
export { ProcessingHistory } from './ProcessingHistory';

// Types
export interface ProcessedDocument {
  id: string;
  filename: string;
  extractedText: string;
  detectedLanguage: string;
  entities: any;
  processedAt: string;
  aiProvider: string;
}

export interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled: boolean;
}

export interface DocumentProcessorProps {
  selectedFile: File | null;
  onProcessingStart: () => void;
  onProcessingComplete: (result: any) => void;
  onProcessingError: (error: string) => void;
  processing: boolean;
  apiConnected: boolean;
}