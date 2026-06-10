import React, { useState, useCallback } from 'react';
import { Upload, FileText, Camera, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getApiUrl } from '../lib/api';

interface ReceiptData {
  amount: number;
  date: string;
  merchant: string;
  category: string;
}

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData, imageUrl: string) => void;
  onClose: () => void;
}

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not set. Please ensure the API key is configured.');
    }
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export default function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file || !preview) return;

    setIsScanning(true);
    setError(null);
    try {
      // 1. Upload to backend for storage
      const formData = new FormData();
      formData.append('receipt', file);
      
      const storedUser = localStorage.getItem('expense_tracker_user_v2');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const uploadRes = await fetch(getApiUrl('/api/ocr/scan'), {
        method: 'POST',
        headers: {
          'x-user-id': userId?.toString() || '',
        },
        body: formData
      });

      if (!uploadRes.ok) {
        let errorMsg = `Upload failed: ${uploadRes.status}`;
        try {
          const clone = uploadRes.clone();
          const errorData = await clone.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          try {
            const errorText = await uploadRes.text();
            if (errorText) errorMsg = errorText;
          } catch (e2) {
            // Fallback to status
          }
        }

        if (uploadRes.status === 404) {
          throw new Error('Backend OCR endpoint not found (404).');
        } else if (uploadRes.status === 401) {
          throw new Error('Authorization failed. Please sign in again.');
        } else if (uploadRes.status === 400) {
          throw new Error('Receipt upload failed: Invalid file or missing data.');
        }
        
        throw new Error(errorMsg);
      }
      
      const { url } = await uploadRes.json();

      // 2. Perform OCR via Gemini on frontend
      // Sanitize mimeType - Gemini is strict about supported types
      let mimeType = file.type;
      if (!mimeType || !['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mimeType)) {
        // Fallback to jpeg if unknown or unsupported image type
        mimeType = 'image/jpeg';
      }

      const base64Data = preview.split(',')[1];
      
      const prompt = `Extract receipt data from this image. 
      Return details in JSON format.
      Fields: 
      - amount (number)
      - date (string, YYYY-MM-DD)
      - merchant (string)
      - category (string, pick one: Food, Transport, Entertainment, Shopping, Healthcare, Bills, Education, Other)
      
      If the date is missing, use today's date: ${new Date().toISOString().split('T')[0]}.`;

      let genAIInstance;
      try {
        genAIInstance = getGenAI();
      } catch (keyError: any) {
        throw new Error(`API Key Error: ${keyError.message}`);
      }

      const model = genAIInstance.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
      });

      // Simple retry logic for 429 errors
      let attempts = 0;
      const maxAttempts = 2;
      let result;

      while (attempts <= maxAttempts) {
        try {
          result = await model.generateContent([
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            { text: prompt }
          ]);
          break; // Success
        } catch (error: any) {
          if (error.message?.includes('429') && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Wait longer each time
            continue;
          }
          throw error;
        }
      }

      if (!result) throw new Error('Failed to generate content after retries');

      const response = await result.response;
      const text = response.text();
      
      try {
        // Try to find JSON block if it's wrapped in markdown
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        const extractedData = JSON.parse(jsonString);
        onScanComplete(extractedData, url);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Could not read receipt data clearly. Try another photo.');
      }
    } catch (err: any) {
      console.error('Receipt Scan Error:', err);
      const errorMessage = err.message || String(err);
      
      if (errorMessage.includes('API_KEY')) {
        setError('Missing Gemini API Key. Please add it to your environment variables.');
      } else if (errorMessage.includes('Failed to fetch')) {
        setError('OCR server is not running or unreachable.');
      } else if (errorMessage.includes('404')) {
        setError('Backend endpoint not found. Please check server configuration.');
      } else if (errorMessage.includes('Extract') || errorMessage.includes('parse')) {
        setError('Could not extract text from receipt. Please try a clearer photo.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-card/80 dark:bg-slate-900/80 backdrop-blur-2xl p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.2)] w-full max-w-lg mx-auto relative overflow-hidden max-h-[92vh] overflow-y-auto"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold text-text-main dark:text-white">Smart Scan</h3>
            <p className="text-[10px] font-bold text-text-muted dark:text-slate-400 uppercase tracking-widest leading-tight">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2.5 hover:bg-bg dark:hover:bg-white/5 rounded-2xl transition-all hover:rotate-90"
        >
          <X size={20} className="text-text-muted" />
        </button>
      </div>

      {!preview ? (
        <label className="border-2 border-dashed border-border dark:border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 flex flex-col items-center gap-5 sm:gap-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden text-center">
          <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-3xl flex items-center justify-center relative z-10"
          >
            <Upload className="text-primary w-8 h-8 sm:w-10 sm:h-10" />
          </motion.div>
          <div className="text-center relative z-10">
            <p className="text-[15px] font-extrabold text-text-main dark:text-white">Drop your receipt here</p>
            <p className="text-xs text-text-muted mt-2 font-medium">Or click to browse your files</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-border dark:border-white/10 shadow-2xl bg-bg dark:bg-slate-950 aspect-[4/3] flex items-center justify-center p-2">
            <img src={preview} alt="Receipt Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            <button 
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all hover:scale-110 shadow-lg"
            >
              <X size={18} />
            </button>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-red-500 font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3"
              >
                <div className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center shrink-0">!</div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-4 sm:py-5 bg-primary text-white rounded-[1.25rem] font-extrabold text-sm sm:text-[15px] shadow-[0_10px_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:bg-primary-hover active:scale-[0.98] group overflow-hidden relative"
          >
            {isScanning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="relative z-10 uppercase tracking-widest text-xs">Analyzing Receipt...</span>
              </>
            ) : (
              <>
                <Camera size={20} />
                <span className="relative z-10">Process Receipt</span>
              </>
            )}
            {isScanning && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
