import fs from 'fs/promises';
import pdfParse, { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param {string} filePath - The path to the PDF file
 * @returns {Promise<{text : string , numPages: number}>} - The extracted text from the PDF
 */

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText(); 
        
        return {
            text : data.text , 
            numPages : data.numPages, 
            info : data.info
        }; 
    }
    catch(error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}