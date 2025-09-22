import { useState } from 'react';

interface ExtractedEntitiesProps {
  document: {
    id: string;
    filename: string;
    extractedText: string;
    detectedLanguage: string;
    entities: any;
    processedAt: string;
    aiProvider: string;
  } | null;
  onClear: () => void;
  processing: boolean;
}

export function ExtractedEntities({ document, onClear, processing }: ExtractedEntitiesProps) {
  const [activeTab, setActiveTab] = useState<'entities' | 'text'>('entities');

  const exportAsJSON = () => {
    if (!document) return;

    const exportData = {
      filename: document.filename,
      processedAt: document.processedAt,
      detectedLanguage: document.detectedLanguage,
      aiProvider: document.aiProvider,
      extractedText: document.extractedText,
      entities: document.entities
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a'); // Use window.document to avoid conflict
    a.href = url;
    a.download = `extracted-data-${document.id}.json`;
    window.document.body.appendChild(a); // Use window.document to avoid conflict
    a.click();
    window.document.body.removeChild(a); // Use window.document to avoid conflict
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderEntityValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return (
        <span className="text-gray-400 italic">Not found</span>
      );
    }

    // Handle arrays and objects
    if (Array.isArray(value)) {
      return (
        <span className="text-gray-900 font-medium">{value.join(', ')}</span>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <span className="text-gray-900 font-medium">{JSON.stringify(value)}</span>
      );
    }

    return (
      <span className="text-gray-900 font-medium">{String(value)}</span>
    );
  };

  const hasValidValue = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  };

  const getStringValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getLanguageFlag = (langCode: string) => {
    const flags: Record<string, string> = {
      'eng': '🇺🇸',
      'hin': '🇮🇳',
      'ori': '🇮🇳',
      'en': '🇺🇸',
      'hi': '🇮🇳',
      'or': '🇮🇳'
    };
    return flags[langCode] || '🌐';
  };

  const getLanguageName = (langCode: string) => {
    const names: Record<string, string> = {
      'eng': 'English',
      'hin': 'Hindi',
      'ori': 'Oriya',
      'en': 'English',
      'hi': 'Hindi',
      'or': 'Oriya'
    };
    return names[langCode] || langCode.toUpperCase();
  };

  const formatEntityKey = (key: string) => {
    // Convert camelCase or snake_case to readable format
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  if (processing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900">Processing Document</h3>
            <p className="text-gray-600">Please wait while we extract text and entities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Processed</h3>
          <p className="text-gray-600">Upload and process a document to see extracted entities and text here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Extraction Results</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">{document.filename}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  {getLanguageFlag(document.detectedLanguage)}
                  {getLanguageName(document.detectedLanguage)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportAsJSON}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export
            </button>
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('entities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'entities'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Extracted Entities
            </div>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'text'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Extracted Text
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'entities' ? (
          <div className="space-y-4">
            {document.entities && !document.entities.error ? (
              <div className="grid gap-4">
                {Object.entries(document.entities).filter(([key]) => key !== 'error' && key !== 'message').map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">{formatEntityKey(key)}</h3>
                        <div className="text-sm">
                          {renderEntityValue(key, value)}
                        </div>
                      </div>
                      {hasValidValue(value) && (
                        <button
                          onClick={() => copyToClipboard(getStringValue(value))}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          title="Copy to clipboard"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : document.entities?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-red-900">Entity Extraction Error</h3>
                    <p className="text-red-700 text-sm mt-1">
                      {document.entities.message || document.entities.error}
                    </p>
                    {document.entities.raw_output && (
                      <details className="mt-2">
                        <summary className="text-red-700 text-sm cursor-pointer">Show raw output</summary>
                        <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap bg-red-100 p-2 rounded">
                          {document.entities.raw_output}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No Entities Available</h3>
                <p className="text-sm text-gray-600">
                  {document.aiProvider === 'text-only' 
                    ? 'Text-only processing was used. Use full processing to extract entities.'
                    : 'No entities were extracted from this document.'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Extracted Text</h3>
              <button
                onClick={() => copyToClipboard(document.extractedText)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy Text
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
                {document.extractedText || 'No text extracted'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Processed: {new Date(document.processedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-4">
            <span>Language: {getLanguageName(document.detectedLanguage)}</span>
            <span>Provider: {document.aiProvider}</span>
          </div>
        </div>
      </div>
    </div>
  );
}