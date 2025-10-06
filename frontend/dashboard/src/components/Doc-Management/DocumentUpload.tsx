import { useRef, useState } from 'react';
import { useTranslation } from "react-i18next";

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled: boolean;
}

const SUPPORTED_FORMATS = ['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export function DocumentUpload({ onFileSelect, selectedFile, disabled }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { t } = useTranslation();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return t('document_upload.errors.file_too_large', { maxSize: MAX_FILE_SIZE / (1024 * 1024) });
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      return t('document_upload.errors.unsupported_format', { formats: SUPPORTED_FORMATS.join(', ').toUpperCase() });
    }

    return null;
  };

  const handleFileSelection = (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('document_upload.title')}</h2>
          <p className="text-gray-600">{t('document_upload.subtitle')}</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={SUPPORTED_FORMATS.map(fmt => `.${fmt}`).join(',')}
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              {getFileIcon(selectedFile.name)}
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('document_upload.file_selected')}
            </div>

            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null as any);
                  setUploadError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                {t('document_upload.choose_different')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className={`w-12 h-12 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                {disabled ? t('document_upload.api_not_connected') : t('document_upload.drop_here')}
              </p>
              <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                {disabled ? t('document_upload.check_api') : t('document_upload.or_click')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{uploadError}</span>
          </div>
        </div>
      )}

      {/* Format Info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>{t('document_upload.supported_formats')}:</strong> {SUPPORTED_FORMATS.join(', ').toUpperCase()}</p>
          <p><strong>{t('document_upload.max_file_size')}:</strong> {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
          <p><strong>{t('document_upload.languages')}:</strong> {t('document_upload.languages_list')}</p>
        </div>
      </div>
    </div>
  );
}