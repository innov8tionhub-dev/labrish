import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { extractTextFromFile, FileUploadResult } from '@/lib/fileUpload';

interface FileUploadZoneProps {
  onFileProcessed: (result: FileUploadResult) => void;
  onError: (error: string) => void;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFileProcessed, 
  onError, 
  className = '' 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);
    setUploadStatus('idle');

    try {
      const result = await extractTextFromFile(file);
      setUploadStatus('success');
      onFileProcessed(result);
    } catch (error: any) {
      setUploadStatus('error');
      onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-50'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
            <p className="text-gray-600">Processing file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="w-12 h-12 text-red-500" />
              ) : (
                <File className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
            </div>
            {uploadStatus === 'success' && (
              <p className="text-green-600 text-sm">File processed successfully!</p>
            )}
            {uploadStatus === 'error' && (
              <p className="text-red-600 text-sm">Failed to process file</p>
            )}
            <button
              onClick={clearFile}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports .txt, .pdf, .doc, and .docx files (max 10MB)
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Supported Formats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { ext: '.txt', name: 'Text Files', color: 'bg-blue-100 text-blue-700' },
          { ext: '.pdf', name: 'PDF Files', color: 'bg-red-100 text-red-700' },
          { ext: '.doc', name: 'Word Docs', color: 'bg-blue-100 text-blue-700' },
          { ext: '.docx', name: 'Word Docs', color: 'bg-blue-100 text-blue-700' },
        ].map((format, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-center ${format.color}`}
          >
            <p className="font-medium text-sm">{format.ext}</p>
            <p className="text-xs opacity-75">{format.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadZone;