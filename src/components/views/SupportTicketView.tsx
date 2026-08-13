import React, { useState } from 'react';
import { LifeBuoy, UploadCloud, CheckCircle2, AlertTriangle, Send, Loader2, FileText, ChevronDown } from 'lucide-react';
import { authedFetch } from '../../utils/apiClient';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export const SupportTicketView = () => {
  const [category, setCategory] = useState('Booking Failed');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  const categories = [
    'Booking Failed',
    'Payment Deducted but no Ticket',
    'Name Correction',
    'Refund Status',
    'Other'
  ];

  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const isOverWordLimit = wordCount > 500;
  const MAX_FILE_SIZE = 200 * 1024; // 200 KB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Strict file type validation
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a valid image (JPG/PNG) or PDF.');
        setFile(null);
        return;
      }
      
      // Strict size validation (200 KB)
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size must not exceed 200 KB.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please provide a description of your issue.');
      return;
    }

    if (isOverWordLimit) {
      setError('Description must be 500 words or less.');
      return;
    }

    setIsSubmitting(true);

    try {
      let fileBase64 = null;
      if (file) {
        fileBase64 = await convertFileToBase64(file);
      }

      
      const ticketId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      const docRef = doc(db, 'support_tickets', ticketId);
      await setDoc(docRef, {
        ticketId,
        userEmail: auth.currentUser?.email || '',
        category,
        description,
        hasAttachment: !!fileBase64,
        fileName: file?.name || null,
        status: 'OPEN',
        createdAt: serverTimestamp()
      });
      
      setSuccessTicketId(ticketId);
      
      // Reset form
      setCategory('Booking Failed');
      setDescription('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successTicketId) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Ticket Created Successfully</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">
          Your support ticket <span className="font-bold text-slate-900">{successTicketId}</span> has been generated. 
          Our automated system has sent a confirmation to your Email and WhatsApp. 
          Our team is already looking into it and will resolve it soon.
        </p>
        <button
          onClick={() => setSuccessTicketId(null)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-500 transition-colors"
        >
          Raise Another Ticket
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-indigo-600" />
            Contact Us / Help Center
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Raise an issue instantly. Our automated system will notify you via Email and WhatsApp.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Issue Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Issue Description</label>
            <span className={`text-xs font-bold ${isOverWordLimit ? 'text-rose-500' : 'text-slate-400'}`}>
              {wordCount} / 500 words
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe your issue in detail..."
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 min-h-[150px] resize-y focus:outline-none focus:ring-2 transition-all text-slate-900 font-medium ${
              isOverWordLimit ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* File Upload (Proof) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Upload Proof / Screenshot</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors relative">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center pointer-events-none">
              {file ? (
                <>
                  <FileText className="w-8 h-8 text-indigo-600 mb-2" />
                  <p className="text-sm font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Click or drag file here</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">JPEG, PNG, or PDF. Max 200 KB.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isOverWordLimit || !description.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Ticket...</>
          ) : (
            <><Send className="w-5 h-5" /> Generate Ticket & Send Alert</>
          )}
        </button>

      </form>
    </div>
  );
};
