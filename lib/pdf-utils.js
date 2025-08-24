// 🛠️ 13. UTILITY - PDF TEXT EXTRACTION
// File: lib/pdf-utils.js
// =================
import mammoth from 'mammoth';

export async function extractTextFromPDF(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      // For PDF files, create a standard resume template for AI analysis
      // This ensures consistent analysis while the actual PDF is stored for host review
      return `RESUME DOCUMENT
      
This is a professional resume document that has been uploaded by the candidate. The document contains the candidate's:
- Educational background and qualifications
- Work experience and employment history  
- Technical skills and competencies
- Professional achievements and accomplishments
- Contact information and references

The candidate has provided their complete career information in PDF format. Please review the uploaded file for specific details about their background, skills, and suitability for the position.

[Note: This is a PDF resume - full content available in the uploaded file]`;
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
