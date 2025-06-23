/**
 * Enhanced validation utilities with comprehensive checks
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

// Text content validation
export const validateTextContent = (text: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic checks
  if (!text || text.trim().length === 0) {
    errors.push('Text content cannot be empty');
  }

  if (text.length > 10000) {
    errors.push('Text content exceeds maximum length of 10,000 characters');
  }

  // Content quality checks
  if (text.length < 10) {
    warnings.push('Text content is very short and may not generate quality audio');
  }

  // Check for potentially problematic content
  const suspiciousPatterns = [
    /\b(script|javascript|eval|function)\s*\(/gi,
    /<[^>]*>/g, // HTML tags
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b/gi, // SQL keywords
  ];

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      warnings.push('Text contains potentially unsafe content that may be filtered');
    }
  });

  // Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  const maxRepetition = Math.max(...wordCount.values());
  if (maxRepetition > words.length * 0.3) {
    warnings.push('Text contains excessive word repetition');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// File validation
export const validateUploadedFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];

  // Type validation
  if (!allowedTypes.includes(file.type)) {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      errors.push('File type not supported. Please use .txt, .pdf, .doc, or .docx files');
    }
  }

  // Size validation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }

  if (file.size < 100) {
    warnings.push('File appears to be very small and may be empty');
  }

  // Name validation
  if (file.name.length > 255) {
    errors.push('File name is too long');
  }

  const dangerousChars = /[<>:"/\\|?*]/;
  if (dangerousChars.test(file.name)) {
    warnings.push('File name contains potentially problematic characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Voice settings validation
export const validateVoiceSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof settings !== 'object' || settings === null) {
    errors.push('Voice settings must be an object');
    return { isValid: false, errors, warnings };
  }

  // Stability validation
  if (typeof settings.stability !== 'number' || settings.stability < 0 || settings.stability > 1) {
    errors.push('Stability must be a number between 0 and 1');
  }

  // Similarity boost validation
  if (typeof settings.similarity_boost !== 'number' || settings.similarity_boost < 0 || settings.similarity_boost > 1) {
    errors.push('Similarity boost must be a number between 0 and 1');
  }

  // Style validation
  if (typeof settings.style !== 'number' || settings.style < 0 || settings.style > 1) {
    errors.push('Style must be a number between 0 and 1');
  }

  // Speaker boost validation
  if (typeof settings.use_speaker_boost !== 'boolean') {
    errors.push('Speaker boost must be a boolean value');
  }

  // Optimal settings warnings
  if (settings.stability < 0.3) {
    warnings.push('Low stability may result in inconsistent voice quality');
  }

  if (settings.similarity_boost < 0.5) {
    warnings.push('Low similarity boost may reduce voice authenticity');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Generic validator class
export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  validate(value: T): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.rules.forEach(rule => {
      if (!rule.validate(value)) {
        if (rule.severity === 'error') {
          errors.push(rule.message);
        } else {
          warnings.push(rule.message);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Pre-built validators
export const createEmailValidator = (): Validator<string> => {
  return new Validator<string>()
    .addRule({
      validate: (email) => email.length > 0,
      message: 'Email is required',
      severity: 'error'
    })
    .addRule({
      validate: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Please enter a valid email address',
      severity: 'error'
    })
    .addRule({
      validate: (email) => email.length <= 254,
      message: 'Email address is too long',
      severity: 'error'
    })
    .addRule({
      validate: (email) => !email.includes('..'),
      message: 'Email contains consecutive dots',
      severity: 'warning'
    });
};

export const createPasswordValidator = (): Validator<string> => {
  return new Validator<string>()
    .addRule({
      validate: (password) => password.length >= 8,
      message: 'Password must be at least 8 characters long',
      severity: 'error'
    })
    .addRule({
      validate: (password) => /[a-z]/.test(password),
      message: 'Password must contain at least one lowercase letter',
      severity: 'error'
    })
    .addRule({
      validate: (password) => /[A-Z]/.test(password),
      message: 'Password must contain at least one uppercase letter',
      severity: 'error'
    })
    .addRule({
      validate: (password) => /\d/.test(password),
      message: 'Password must contain at least one number',
      severity: 'error'
    })
    .addRule({
      validate: (password) => /[@$!%*?&]/.test(password),
      message: 'Password must contain at least one special character (@$!%*?&)',
      severity: 'error'
    })
    .addRule({
      validate: (password) => password.length <= 128,
      message: 'Password is too long',
      severity: 'error'
    })
    .addRule({
      validate: (password) => !/(.)\1{2,}/.test(password),
      message: 'Password contains too many repeated characters',
      severity: 'warning'
    });
};