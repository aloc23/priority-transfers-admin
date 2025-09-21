import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Advanced document processor for receipts and expense documents
 * Supports PDF text extraction, OCR for images, and smart data parsing
 */
export class DocumentProcessor {
  constructor() {
    this.supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.supportedDocTypes = ['application/pdf'];
  }

  /**
   * Process uploaded document and extract expense data
   * @param {File} file - The uploaded file
   * @returns {Promise<Array>} - Array of extracted expense objects
   */
  async processDocument(file) {
    const results = [];
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    try {
      let extractedText = '';

      if (this.supportedImageTypes.includes(fileType)) {
        // Process image with OCR
        extractedText = await this.extractTextFromImage(file);
      } else if (this.supportedDocTypes.includes(fileType) || fileName.endsWith('.pdf')) {
        // Process PDF
        extractedText = await this.extractTextFromPDF(file);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Parse extracted text for expense data
      const expenses = this.parseExpenseData(extractedText, file.name);
      results.push(...expenses);

      return results;
    } catch (error) {
      console.error('Document processing error:', error);
      throw error;
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(file) {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      return text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Parse extracted text to find expense information
   */
  parseExpenseData(text, filename) {
    const expenses = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common receipt patterns and keywords
    const patterns = {
      // Date patterns (various formats)
      dates: [
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
        /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
        /(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4})/gi,
        /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{2,4})/gi
      ],
      // Amount patterns (various currency formats)
      amounts: [
        /€\s*(\d+[.,]\d{2})/g,
        /(\d+[.,]\d{2})\s*€/g,
        /EUR\s*(\d+[.,]\d{2})/g,
        /(\d+[.,]\d{2})\s*EUR/g,
        /Total:?\s*€?\s*(\d+[.,]\d{2})/gi,
        /Amount:?\s*€?\s*(\d+[.,]\d{2})/gi,
        /Sum:?\s*€?\s*(\d+[.,]\d{2})/gi,
        /\$\s*(\d+[.,]\d{2})/g,
        /(\d+[.,]\d{2})\s*\$/g
      ],
      // Merchant/vendor patterns
      merchants: [
        /^([A-Z][A-Z\s&.,'-]+)$/m,
        /Store:?\s*(.+)/gi,
        /Merchant:?\s*(.+)/gi,
        /Vendor:?\s*(.+)/gi
      ]
    };

    // Extract potential dates
    const foundDates = [];
    patterns.dates.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => foundDates.push(match[1] || match[0]));
    });

    // Extract potential amounts
    const foundAmounts = [];
    patterns.amounts.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const amount = match[1] || match[0];
        const numericAmount = parseFloat(amount.replace(/[€$,EUR]/g, '').replace(',', '.'));
        if (numericAmount > 0 && numericAmount < 10000) { // Reasonable expense range
          foundAmounts.push(numericAmount);
        }
      });
    });

    // Extract potential merchant names
    const foundMerchants = [];
    patterns.merchants.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const merchant = match[1] || match[0];
        if (merchant && merchant.length > 2 && merchant.length < 100) {
          foundMerchants.push(merchant.trim());
        }
      });
    });

    // Try to match receipt-specific patterns
    const receiptPatterns = this.detectReceiptPatterns(text);

    if (receiptPatterns.isReceipt) {
      // If it looks like a receipt, try to extract structured data
      const receiptData = this.parseReceiptStructure(text);
      if (receiptData.amount > 0) {
        expenses.push({
          date: receiptData.date || this.normalizeDate(foundDates[0]) || new Date().toISOString().split('T')[0],
          description: receiptData.merchant || foundMerchants[0] || `Receipt from ${filename}`,
          amount: receiptData.amount,
          category: this.categorizeExpense(receiptData.merchant || foundMerchants[0] || text),
          source: 'receipt_scan',
          rawText: text.substring(0, 500) // Store first 500 chars for reference
        });
        return expenses;
      }
    }

    // Fallback: create expense entries for each found amount
    foundAmounts.forEach((amount, index) => {
      expenses.push({
        date: this.normalizeDate(foundDates[index]) || new Date().toISOString().split('T')[0],
        description: foundMerchants[index] || `Expense from ${filename}`,
        amount: amount,
        category: this.categorizeExpense(foundMerchants[index] || text),
        source: 'document_scan',
        rawText: text.substring(0, 300)
      });
    });

    // If no expenses found, create a manual entry prompt
    if (expenses.length === 0) {
      const potentialAmount = foundAmounts[0] || 0;
      const potentialMerchant = foundMerchants[0] || `Document: ${filename}`;
      
      expenses.push({
        date: new Date().toISOString().split('T')[0],
        description: potentialMerchant,
        amount: potentialAmount,
        category: 'general',
        source: 'document_manual',
        needsReview: true,
        rawText: text.substring(0, 300)
      });
    }

    return expenses;
  }

  /**
   * Detect if text looks like a receipt
   */
  detectReceiptPatterns(text) {
    const receiptKeywords = [
      'receipt', 'invoice', 'bill', 'payment', 'purchase', 'transaction',
      'total', 'subtotal', 'tax', 'vat', 'change', 'cash', 'card',
      'thank you', 'thanks for', 'come again', 'store', 'shop'
    ];

    const lowerText = text.toLowerCase();
    const keywordCount = receiptKeywords.reduce((count, keyword) => {
      return count + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);

    return {
      isReceipt: keywordCount >= 3,
      confidence: Math.min(keywordCount / receiptKeywords.length, 1)
    };
  }

  /**
   * Parse receipt structure to extract key information
   */
  parseReceiptStructure(text) {
    const result = {
      merchant: null,
      date: null,
      amount: 0,
      items: []
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // First few lines often contain merchant name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && line.length < 50 && /[A-Za-z]/.test(line)) {
        if (!result.merchant || line.length > result.merchant.length) {
          result.merchant = line;
        }
      }
    }

    // Look for total amount (usually towards the end)
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
      const line = lines[i].toLowerCase();
      if (line.includes('total') || line.includes('amount due') || line.includes('balance')) {
        const amountMatch = line.match(/(\d+[.,]\d{2})/);
        if (amountMatch) {
          result.amount = parseFloat(amountMatch[1].replace(',', '.'));
          break;
        }
      }
    }

    // If no total found, look for any significant amount
    if (result.amount === 0) {
      const amounts = [];
      lines.forEach(line => {
        const matches = line.match(/(\d+[.,]\d{2})/g);
        if (matches) {
          matches.forEach(match => {
            const amount = parseFloat(match.replace(',', '.'));
            if (amount > 1) amounts.push(amount);
          });
        }
      });
      
      // Take the largest amount as likely total
      if (amounts.length > 0) {
        result.amount = Math.max(...amounts);
      }
    }

    return result;
  }

  /**
   * Normalize date strings to YYYY-MM-DD format
   */
  normalizeDate(dateStr) {
    if (!dateStr) return null;

    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      // Try different date formats
      const formats = [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
        /(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/   // YYYY/MM/DD
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          let [, part1, part2, part3] = match;
          
          // Determine if it's YYYY/MM/DD format
          if (part1.length === 4) {
            return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
          }
          
          // Assume DD/MM/YYYY format (European)
          if (parseInt(part1) > 12) {
            return `${part3.length === 2 ? '20' + part3 : part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
          }
          
          // Assume MM/DD/YYYY format (US)
          return `${part3.length === 2 ? '20' + part3 : part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`;
        }
      }
    } catch (error) {
      console.error('Date parsing error:', error);
    }

    return null;
  }

  /**
   * Categorize expenses based on merchant name or content
   */
  categorizeExpense(merchantOrContent) {
    if (!merchantOrContent) return 'general';

    const content = merchantOrContent.toLowerCase();
    
    const categories = {
      fuel: ['shell', 'bp', 'esso', 'texaco', 'petrol', 'gas', 'fuel', 'station'],
      food: ['restaurant', 'cafe', 'coffee', 'food', 'pizza', 'burger', 'lunch', 'dinner'],
      maintenance: ['garage', 'service', 'repair', 'parts', 'tire', 'oil', 'mechanic'],
      office: ['office', 'supplies', 'paper', 'ink', 'stationery', 'depot'],
      travel: ['hotel', 'accommodation', 'booking', 'travel', 'flight', 'train'],
      parking: ['parking', 'meter', 'toll', 'garage'],
      insurance: ['insurance', 'cover', 'policy', 'premium'],
      telecommunications: ['phone', 'mobile', 'internet', 'broadband', 'vodafone', 'three']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Take photo using device camera (for mobile receipt scanning)
   */
  async captureReceiptPhoto() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Create capture button
          const captureBtn = document.createElement('button');
          captureBtn.textContent = 'Capture Receipt';
          captureBtn.className = 'btn btn-primary';
          captureBtn.style.position = 'fixed';
          captureBtn.style.bottom = '20px';
          captureBtn.style.left = '50%';
          captureBtn.style.transform = 'translateX(-50%)';
          captureBtn.style.zIndex = '10000';

          // Style video for full screen preview
          video.style.position = 'fixed';
          video.style.top = '0';
          video.style.left = '0';
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.objectFit = 'cover';
          video.style.zIndex = '9999';

          document.body.appendChild(video);
          document.body.appendChild(captureBtn);

          captureBtn.onclick = () => {
            context.drawImage(video, 0, 0);
            canvas.toBlob(blob => {
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(video);
              document.body.removeChild(captureBtn);
              
              // Create file from blob
              const file = new File([blob], 'receipt-photo.jpg', { type: 'image/jpeg' });
              resolve(file);
            }, 'image/jpeg', 0.9);
          };
        };

        video.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Camera access failed'));
        };
      });
    } catch (error) {
      throw new Error('Camera not available: ' + error.message);
    }
  }
}

// Export instance
export const documentProcessor = new DocumentProcessor();
