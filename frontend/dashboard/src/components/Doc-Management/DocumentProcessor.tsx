import { useState } from 'react';

interface DocumentProcessorProps {
  selectedFile: File | null;
  onProcessingStart: () => void;
  onProcessingComplete: (result: any) => void;
  onProcessingError: (error: string) => void;
  processing: boolean;
  apiConnected: boolean;
}

export function DocumentProcessor({
  selectedFile,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  processing,
  apiConnected
}: DocumentProcessorProps) {
  const [processingStep, setProcessingStep] = useState<string>('');

  const processDocument = async () => {
    if (!selectedFile || !apiConnected) {
      onProcessingError('No file selected or API not connected');
      return;
    }

    onProcessingStart();
    setProcessingStep('Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setProcessingStep('Extracting text with OCR...');
      
      const response = await fetch('http://localhost:5001/process-document', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Processing failed');
      }

      if (result.error) {
        throw new Error(result.message || result.error);
      }

      setProcessingStep('Extracting entities with AI...');
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingStep('Processing complete!');
      
      setTimeout(() => {
        setProcessingStep('');
        onProcessingComplete(result);
      }, 500);

    } catch (error) {
      setProcessingStep('');
      onProcessingError(error instanceof Error ? error.message : 'Processing failed');
    }
  };

  const processTextOnly = async () => {
    if (!selectedFile || !apiConnected) {
      onProcessingError('No file selected or API not connected');
      return;
    }

    onProcessingStart();
    setProcessingStep('Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setProcessingStep('Extracting text with OCR...');
      
      const response = await fetch('http://localhost:5001/extract-text-only', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Text extraction failed');
      }

      if (result.error) {
        throw new Error(result.message || result.error);
      }

      setProcessingStep('Text extraction complete!');
      
      setTimeout(() => {
        setProcessingStep('');
        onProcessingComplete({
          ...result,
          entities: null,
          ai_provider: 'text-only'
        });
      }, 500);

    } catch (error) {
      setProcessingStep('');
      onProcessingError(error instanceof Error ? error.message : 'Text extraction failed');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Process Document</h2>
          <p className="text-gray-600">OCR and AI entity extraction</p>
        </div>
      </div>

      {processing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
              <p className="text-gray-600">{processingStep}</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">Processing steps:</p>
                <ul className="space-y-1">
                  <li>1. Automatic language detection</li>
                  <li>2. OCR text extraction</li>
                  <li>3. AI entity recognition</li>
                  <li>4. Data structuring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedFile ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-500">No document selected</p>
              <p className="text-sm text-gray-400 mt-1">Please select a document to process</p>
            </div>
          )}

          {!apiConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800">API Connection Required</p>
                  <p className="text-sm text-yellow-700">Please ensure the backend API is running and connected.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={processDocument}
              disabled={!selectedFile || !apiConnected}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Full Processing (OCR + AI Entities)
            </button>

            <button
              onClick={processTextOnly}
              disabled={!selectedFile || !apiConnected}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Text Only (OCR Only)
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Processing Options:</p>
                <ul className="space-y-1">
                  <li><strong>Full Processing:</strong> OCR text extraction + AI entity recognition</li>
                  <li><strong>Text Only:</strong> OCR text extraction without entity analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}