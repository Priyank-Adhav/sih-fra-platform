import React, { useState } from 'react';
import type { Document } from '../types/claimProcess';
import { claimProcessService } from '../services/claimProcessService';
import { useTranslation } from 'react-i18next';

interface DocumentUploaderProps {
  caseId: number;
  stepInstanceId?: number;
  existingDocuments: Document[];
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  caseId,
  stepInstanceId,
  existingDocuments
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('document_uploader.errors.invalid_file_type'));
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('document_uploader.errors.file_too_large'));
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      await claimProcessService.uploadDocument(caseId, file, stepInstanceId);
      
      setSuccess(t('document_uploader.success.upload'));
      event.target.value = ''; // Reset file input
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('document_uploader.errors.upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm(t('document_uploader.actions.delete_confirm'))) return;

    try {
      await claimProcessService.deleteDocument(documentId);
      setSuccess(t('document_uploader.success.delete'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('document_uploader.errors.delete_failed'));
    }
  };

  const getDocumentTypeDisplay = (docType: string) => {
    const types: Record<string, string> = {
      meeting_minutes: t('document_types.meeting_minutes'),
      attendance_sheet: t('document_types.attendance_sheet'),
      map: t('document_types.map'),
      noc: t('document_types.noc'),
      application_form: t('document_types.application_form'),
      photograph: t('document_types.photograph'),
      video_recording: t('document_types.video_recording'),
      audio_recording: t('document_types.audio_recording'),
      other: t('document_types.other')
    };
    return types[docType] || docType;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <input
          type="file"
          id="document-upload"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        
        <label
          htmlFor="document-upload"
          className={`cursor-pointer block ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div className="text-sm text-gray-600">
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                {t('document_uploader.upload_area.uploading')}
              </div>
            ) : (
              <>
                <p className="font-medium text-gray-900">{t('document_uploader.upload_area.title')}</p>
                <p className="mt-1">{t('document_uploader.upload_area.description')}</p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">{t('claim_documents.upload_error')}</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900">{t('messages.upload_document_success')}</p>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('document_uploader.documents_list.title')}</h3>
          <div className="space-y-3">
            {existingDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(doc.mime_type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{doc.filename}</div>
                    <div className="text-sm text-gray-500">
                      {getDocumentTypeDisplay(doc.document_type)} • 
                      {(doc.file_size / 1024).toFixed(1)} KB • 
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`http://localhost:8001${doc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                    title={t('document_uploader.actions.view_document')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                    title={t('document_uploader.actions.delete_document')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t('document_uploader.documents_list.empty_title')}</p>
          <p className="text-sm mt-1">{t('document_uploader.documents_list.empty_description')}</p>
        </div>
      )}
    </div>
  );
};