import { supabase } from './supabase';

export interface FileUploadResult {
  text: string;
  filename: string;
  size: number;
}

/**
 * Extract text from uploaded files
 */
export const extractTextFromFile = async (file: File): Promise<FileUploadResult> => {
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  const filename = file.name;
  const size = file.size;
  let text = '';

  if (file.type === 'text/plain') {
    text = await file.text();
  } else if (file.type === 'application/pdf') {
    // For PDF files, we'll use a simple text extraction
    // In a real implementation, you'd use a PDF parsing library
    text = await extractTextFromPDF(file);
  } else if (file.type.includes('document') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
    // For Word documents, we'll provide a placeholder
    // In a real implementation, you'd use a document parsing library
    throw new Error('Word document support coming soon. Please convert to PDF or plain text.');
  } else {
    throw new Error('Unsupported file type. Please use .txt, .pdf, .doc, or .docx files.');
  }

  // Limit text length
  if (text.length > 10000) {
    text = text.substring(0, 10000);
  }

  return { text, filename, size };
};

/**
 * Simple PDF text extraction (placeholder)
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  // This is a simplified implementation
  // In production, you'd use a library like pdf-parse or PDF.js
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);
  
  // Extract readable text (very basic approach)
  const textMatch = text.match(/\/T\s*\((.*?)\)/g);
  if (textMatch) {
    return textMatch.map(match => match.replace(/\/T\s*\(|\)/g, '')).join(' ');
  }
  
  throw new Error('Could not extract text from PDF. Please try a different file or convert to plain text.');
};

/**
 * Upload file to Supabase storage
 */
export const uploadFileToStorage = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('user-files')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
};

/**
 * Get file URL from storage
 */
export const getFileUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('user-files')
    .getPublicUrl(path);

  return data.publicUrl;
};