// 🛠️ 13. UTILITY - PDF TEXT EXTRACTION
// File: lib/pdf-utils.js
// =================
import mammoth from 'mammoth';

export async function extractTextFromPDF(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      // For PDF files, we'll use a simple text extraction
      // In production, you might want to use pdf-parse or similar
      return "PDF text extraction would go here. Please implement pdf-parse for production use.";
    } 
    
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        mimeType === 'application/msword') {
      // Extract text from Word documents
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    // Fallback for other formats
    return buffer.toString('utf-8');
    
  } catch (error) {
    console.error('Text extraction error:', error);
    return 'Error extracting text from document';
  }
}

export async function extractMetadataFromResume(text) {
  // Basic text analysis to extract key information
  const metadata = {
    hasEmail: /\S+@\S+\.\S+/.test(text),
    hasPhone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
    wordCount: text.split(/\s+/).length,
    hasEducation: /education|degree|university|college|school/i.test(text),
    hasExperience: /experience|work|job|position|role/i.test(text),
    hasSkills: /skills|proficient|expert|knowledge/i.test(text)
  };
  
  return metadata;
}
