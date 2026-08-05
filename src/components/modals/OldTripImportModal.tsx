import { ScrollView } from '../ScrollView';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Users, Calendar, DollarSign, Sparkles, FileText, ArrowRight, Shield, Crown } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Expense, Category } from '../../types';

interface ExtractedTripData {
  name: string;
  startDate: string;
  endDate: string;
  members: { name: string; deposit: string; upiId?: string; isAdmin: boolean }[];
  expenses: Omit<Expense, 'id'>[];
}

interface OldTripImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: ExtractedTripData) => void;
  lang: string;
}

const REQUIRED_FIELDS = [
  { key: 'date', label: 'Date (तारीख)', aliases: ['date', 'दिनांक', 'tx date', 'transaction date', 'time', 'created', 'day'] },
  { key: 'category', label: 'Category name (प्रकार)', aliases: ['category name', 'category', 'प्रकार', 'cat', 'expense category', 'item type', 'type'] },
  { key: 'paidBy', label: 'Amount shared by / Paid by (कोणी दिले)', aliases: ['amount shared by', 'paid by', 'payer', 'коणी दिले', 'कोणी दिले', 'spent by', 'shares', 'members', 'member', 'given by', 'paid_by', 'paidby', 'who paid', 'name'] },
  { key: 'amount', label: 'Amount (रक्कम)', aliases: ['amount', 'रक्कम', 'cost', 'total amount', 'price', 'rs', 'inr', 'value', 'total'] }
];

const VALID_CATEGORIES: Record<string, Category> = {
  food: 'food',
  dining: 'food',
  breakfast: 'food',
  lunch: 'food',
  dinner: 'food',
  snacks: 'food',
  fuel: 'fuel',
  petrol: 'fuel',
  diesel: 'fuel',
  gas: 'fuel',
  tickets: 'traveling',
  traveling: 'traveling',
  travel: 'traveling',
  flight: 'traveling',
  train: 'traveling',
  bus: 'traveling',
  transport: 'transport',
  cab: 'transport',
  auto: 'transport',
  taxi: 'transport',
  hotels: 'hotels',
  hotel: 'hotels',
  stay: 'hotels',
  resort: 'hotels',
  fun: 'fun',
  activity: 'fun',
  activities: 'fun',
  entry: 'fun',
  highway: 'highway',
  toll: 'highway',
  tolls: 'highway',
  restaurant: 'restaurant',
  tips: 'tips',
  tip: 'tips',
  personal: 'personal',
  other: 'other'
};

export const OldTripImportModal: React.FC<OldTripImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  lang,
}) => {
  const isMr = lang === 'mr';

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedTripData | null>(null);
  const [adminIndex, setAdminIndex] = useState<number>(0);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setValidationError(null);
    setMissingHeaders([]);
    setExtractedData(null);
    setIsProcessing(false);
    setAdminIndex(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Helper to normalize header string for matching
  const normalize = (str: any) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9\u0900-\u097F]/g, '');

  // Helper to parse dynamic dates into YYYY-MM-DD
  const parseToYMD = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toISOString().split('T')[0];
    }
    if (typeof val === 'number') {
      const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(jsDate.getTime())) {
        return jsDate.toISOString().split('T')[0];
      }
    }
    const strD = String(val).trim();
    if (!strD) return null;

    const parsedD = new Date(strD);
    if (!isNaN(parsedD.getTime()) && strD.match(/\d/)) {
      return parsedD.toISOString().split('T')[0];
    }

    const parts = strD.split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      } else if (parts[2].length === 4) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
    }
    return null;
  };

  // Helper for Smart Name Fallback from Filename
  const cleanFileNameToTripName = (fileName: string): string => {
    let cleaned = fileName
      .replace(/\.(xlsx|xls|csv)$/i, '')
      .replace(/\b\d{8,20}\b/g, '')
      .replace(/\d{8,20}/g, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b(expense\s*manager|expenses|expense|manager|report|export|sheet|data|update|details|statement)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return 'Imported Old Trip';

    cleaned = cleaned.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    if (!cleaned.toLowerCase().includes('trip')) {
      cleaned += ' Trip';
    }

    return cleaned;
  };

  // Pre-upload File Scanner & Validator with 50-row Dynamic Fuzzy Header Detection
  const validateAndParseFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setValidationError(null);
    setMissingHeaders([]);
    setExtractedData(null);

    try {
      let grid: any[][] = [];
      const fileName = uploadedFile.name;
      const isCsv = fileName.toLowerCase().endsWith('.csv');

      if (isCsv) {
        const text = await uploadedFile.text();
        const parseResult = Papa.parse(text, { skipEmptyLines: true });
        grid = (parseResult.data as any[][]) || [];
      } else {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        grid = (XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]) || [];
      }

      if (!grid || grid.length === 0) {
        setValidationError(
          isMr
            ? 'फाइल रिकामी आहे किंवा वाचता आली नाही. कृपया स्प्रेडशीट तपासा.'
            : 'Uploaded spreadsheet is empty or invalid. Please check your file.'
        );
        setIsProcessing(false);
        return;
      }

      // 1. HEADER EXTRACTION (Primary Method) - Scan top 15 rows for Trip Name & Date Range
      let headerExtractedTripName: string | null = null;
      let headerExtractedStartDate: string | null = null;
      let headerExtractedEndDate: string | null = null;

      const top15Rows = grid.slice(0, Math.min(15, grid.length));
      for (const row of top15Rows) {
        if (!Array.isArray(row)) continue;
        const rowCells = row.map(c => String(c || '').trim()).filter(Boolean);
        const rowText = rowCells.join(' ');
        if (!rowText) continue;

        if (!headerExtractedTripName) {
          const reportMatch = rowText.match(/report\s+for\s+([^\n\r\t,;-]+)/i);
          const tripNameMatch = rowText.match(/(?:trip\s*name|trip|project|event|tour|title)\s*[:\-]\s*([^\n\r\t,;]+)/i);
          if (reportMatch && reportMatch[1].trim()) {
            headerExtractedTripName = reportMatch[1].trim();
          } else if (tripNameMatch && tripNameMatch[1].trim()) {
            headerExtractedTripName = tripNameMatch[1].trim();
          }
        }

        if (!headerExtractedStartDate || !headerExtractedEndDate) {
          const rangeMatch = rowText.match(/(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})\s*(?:to|-|–|until|through)\s*(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})/i);
          if (rangeMatch) {
            const d1 = parseToYMD(rangeMatch[1]);
            const d2 = parseToYMD(rangeMatch[2]);
            if (d1 && d2) {
              headerExtractedStartDate = d1 <= d2 ? d1 : d2;
              headerExtractedEndDate = d1 <= d2 ? d2 : d1;
            }
          }
        }
      }

      // 2. SCAN FIRST 50 ROWS to find dynamic column header row
      const maxScan = Math.min(50, grid.length);
      let headerRowIndex = -1;
      let dateCol = -1;
      let categoryCol = -1;
      let amountCol = -1;
      let paidByCol = -1;
      let titleCol = -1;

      for (let r = 0; r < maxScan; r++) {
        const row = grid[r];
        if (!Array.isArray(row)) continue;

        // 2. FUZZY MATCHING (LOWERCASE & TRIM)
        const cells = row.map(c => String(c || '').toLowerCase().trim());

        let dIdx = -1, cIdx = -1, aIdx = -1, pIdx = -1, tIdx = -1;

        cells.forEach((cell, idx) => {
          if (!cell) return;

          // 3. KEYWORD DETECTION
          // Date
          if (dIdx === -1 && (cell.includes('date') || cell.includes('दिनांक') || cell.includes('tx date') || cell.includes('time') || cell.includes('day'))) {
            dIdx = idx;
          }
          // Category
          if (cIdx === -1 && (cell.includes('category') || cell.includes('प्रकार') || cell.includes('cat') || cell.includes('type'))) {
            cIdx = idx;
          }
          // Amount / Cost
          if (aIdx === -1 && (cell.includes('amount') || cell.includes('cost') || cell.includes('price') || cell.includes('total') || cell.includes('rs') || cell.includes('inr') || cell.includes('रक्कम'))) {
            aIdx = idx;
          }
          // Shared / Paid by
          if (pIdx === -1 && (cell.includes('shared') || cell.includes('paid') || cell.includes('payer') || cell.includes('spent') || cell.includes('giver') || cell.includes('member') || cell.includes('who') || cell.includes('कोणी'))) {
            pIdx = idx;
          }
          // Title / Description
          if (tIdx === -1 && (cell.includes('description') || cell.includes('title') || cell.includes('note') || cell.includes('details') || cell.includes('particulars') || cell.includes('item') || cell.includes('खर्च'))) {
            tIdx = idx;
          }
        });

        // Ensure amountCol and paidByCol don't collision if cell is "Amount Shared By"
        if (aIdx !== -1 && aIdx === pIdx) {
          const separateAmountIdx = cells.findIndex((c, i) => i !== aIdx && (c === 'amount' || c.includes('total amount') || c.includes('cost') || c.includes('price')));
          if (separateAmountIdx !== -1) {
            aIdx = separateAmountIdx;
          }
        }

        // 4. SET HEADER ROW DYNAMICALLY if all required concepts are found
        if (dIdx !== -1 && cIdx !== -1 && aIdx !== -1 && pIdx !== -1 && aIdx !== pIdx) {
          headerRowIndex = r;
          dateCol = dIdx;
          categoryCol = cIdx;
          amountCol = aIdx;
          paidByCol = pIdx;
          titleCol = tIdx;
          break;
        }
      }

      // Fallback pass: match if at least Date, Amount, PaidBy are detected in a row
      if (headerRowIndex === -1) {
        for (let r = 0; r < maxScan; r++) {
          const row = grid[r];
          if (!Array.isArray(row)) continue;
          const cells = row.map(c => String(c || '').toLowerCase().trim());

          let dIdx = cells.findIndex(c => c.includes('date') || c.includes('tx') || c.includes('दिनांक'));
          let cIdx = cells.findIndex(c => c.includes('cat') || c.includes('type') || c.includes('प्रकार'));
          let aIdx = cells.findIndex(c => c.includes('amount') || c.includes('cost') || c.includes('price') || c.includes('total') || c.includes('rs') || c.includes('inr'));
          let pIdx = cells.findIndex(c => c.includes('shared') || c.includes('paid') || c.includes('payer') || c.includes('spent') || c.includes('who') || c.includes('by') || c.includes('name'));
          let tIdx = cells.findIndex(c => c.includes('desc') || c.includes('title') || c.includes('note') || c.includes('item'));

          if (dIdx !== -1 && aIdx !== -1 && pIdx !== -1 && aIdx !== pIdx) {
            headerRowIndex = r;
            dateCol = dIdx;
            categoryCol = cIdx !== -1 ? cIdx : (dIdx !== 0 ? 0 : 1);
            amountCol = aIdx;
            paidByCol = pIdx;
            titleCol = tIdx;
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        const missing: string[] = ['Date', 'Category name', 'Amount shared by / Paid by', 'Amount'];
        setMissingHeaders(missing);
        setValidationError(
          isMr
            ? 'फाइलमध्ये आवश्यक कॉलम्स (Date, Category, Amount shared by, Amount) आढळले नाहीत.'
            : 'Pre-upload validation failed. Could not locate header row containing Date, Category name, Amount shared by, and Amount within first 50 rows.'
        );
        setIsProcessing(false);
        return;
      }

      // 3. PARSE TRANSACTION DATA & AUTO-CALCULATE DATES
      const dataRows = grid.slice(headerRowIndex + 1);
      const memberNamesSet = new Set<string>();
      const parsedExpenses: Omit<Expense, 'id'>[] = [];
      let minDate: string | null = null;
      let maxDate: string | null = null;

      dataRows.forEach((row, idx) => {
        if (!Array.isArray(row) || row.length === 0) return;

        const dateRaw = row[dateCol];
        const categoryRaw = categoryCol !== -1 ? String(row[categoryCol] || 'other').trim() : 'other';
        const paidByRaw = String(row[paidByCol] || '').trim();
        const amountStr = String(row[amountCol] || '0').replace(/[^0-9.]/g, '');
        const amountRaw = parseFloat(amountStr);
        const titleRaw = titleCol !== -1 ? String(row[titleCol] || '').trim() : '';

        if (!paidByRaw || isNaN(amountRaw) || amountRaw <= 0) return;

        // 1. SPLIT BY COMMA (and ampersand/semicolon)
        // 2. TRIM WHITESPACE
        // 3. FILTER 'ALL' (case-insensitive)
        // 4. UNIQUE USERS ONLY
        const namesInCell = paidByRaw
          .split(/[,&;]+/)
          .map(n => n.trim())
          .filter(n => n.length > 0 && n.toLowerCase() !== 'all');

        namesInCell.forEach(name => memberNamesSet.add(name));

        const primaryPaidBy = namesInCell.length > 0 ? namesInCell[0] : (paidByRaw.toLowerCase() === 'all' ? 'Admin' : paidByRaw);

        // Format Date using parseToYMD
        let dateFormatted = parseToYMD(dateRaw) || new Date().toISOString().split('T')[0];

        if (!minDate || dateFormatted < minDate) minDate = dateFormatted;
        if (!maxDate || dateFormatted > maxDate) maxDate = dateFormatted;

        // Category determination
        const normCat = categoryRaw.toLowerCase();
        let matchedCat: Category = 'other';
        for (const [key, val] of Object.entries(VALID_CATEGORIES)) {
          if (normCat.includes(key)) {
            matchedCat = val;
            break;
          }
        }

        const finalTitle = titleRaw || `${categoryRaw || 'Expense'} #${idx + 1}`;

        parsedExpenses.push({
          title: finalTitle,
          amount: amountRaw,
          date: dateFormatted,
          category: matchedCat,
          paidBy: primaryPaidBy,
          splitWith: [],
        });
      });

      if (parsedExpenses.length === 0) {
        setValidationError(
          isMr
            ? 'फाइलमध्ये वैध खर्च सापडले नाहीत. कृपया रकमेचे मूल्य तपासा.'
            : 'No valid expense rows found in file. Please ensure amounts are numeric.'
        );
        setIsProcessing(false);
        return;
      }

      if (memberNamesSet.size === 0) {
        memberNamesSet.add('Admin');
      }

      const memberList = Array.from(memberNamesSet).map((mName, i) => ({
        name: mName,
        deposit: '0',
        upiId: '',
        isAdmin: i === 0,
      }));

      // FINAL TRIP NAME & DATES DETERMINATION:
      // Name: Primary Header Extracted -> Smart Fallback from Filename
      const finalTripName = headerExtractedTripName
        ? (headerExtractedTripName.charAt(0).toUpperCase() + headerExtractedTripName.slice(1))
        : cleanFileNameToTripName(fileName);

      // Dates: Header Extracted -> Auto-Calculated from Transactions
      const startDate = headerExtractedStartDate || minDate || new Date().toISOString().split('T')[0];
      const endDate = headerExtractedEndDate || maxDate || startDate;

      setExtractedData({
        name: finalTripName,
        startDate,
        endDate,
        members: memberList,
        expenses: parsedExpenses,
      });

      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      setValidationError(
        isMr
          ? 'फाइलचे विश्लेषण करताना त्रुटी आली. कृपया वैध एक्सेल किंवा CSV फाइल निवडा.'
          : 'Error parsing spreadsheet file. Please upload a valid .xlsx or .csv file.'
      );
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!extractedData) return;

    // Apply Admin selection
    const updatedMembers = extractedData.members.map((m, idx) => ({
      ...m,
      isAdmin: idx === adminIndex,
    }));

    onImportSuccess({
      ...extractedData,
      members: updatedMembers,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="bg-white rounded-t-[36px] sm:rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center shrink-0 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                <span>{isMr ? 'जुन्या ट्रिपचा डेटा इम्पोर्ट करा' : 'Import Your Old Trip Data'}</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase">
                  Excel / CSV
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-300">
                {isMr
                  ? 'एक्सेल स्प्रेडशीट अपलोड करा आणि जुना खर्च स्वयंचलितरित्या आणा'
                  : 'Upload your expense spreadsheet to auto-populate expenses & members'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto   p-5 space-y-5  ">
          {/* Upload Dropzone */}
          {!extractedData && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50/90 rounded-3xl p-8 text-center transition-all relative cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      validateAndParseFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 mb-3">
                  <Upload className="w-8 h-8" />
                </div>

                <h4 className="text-base font-black text-slate-900 mb-1">
                  {isMr ? 'येथे एक्सेल (.xlsx) किंवा CSV फाइल अपलोड करा' : 'Click or Drag & Drop Excel (.xlsx / .csv) File'}
                </h4>
                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                  {isMr
                    ? 'सिस्टम आपोआप Date, Category name, Amount shared by व Amount हे कॉलम तपासेल'
                    : 'File validation will check required columns: Date, Category name, Amount shared by & Amount'}
                </p>
              </div>

              {/* Sample Requirements Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  {isMr ? 'स्प्रेडशीट कॉलम्स आवश्यकता (Required Columns):' : 'Pre-Upload Column Checklist:'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Date (दिनांक)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Category name (प्रकार)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Amount shared by (कोणी दिले)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Amount (रक्कम)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Processing Spinner */}
          {isProcessing && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                {isMr ? 'फाइलची पूर्व-तपासणी होत आहे...' : 'Validating Columns & Scanning Spreadsheet...'}
              </p>
            </div>
          )}

          {/* Validation Error Alert Box */}
          {validationError && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2 text-rose-950">
              <div className="flex items-center gap-2 font-black text-sm text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{isMr ? 'फाइल पडताळणी अयशस्वी (Validation Failed)' : 'Pre-Upload File Validation Warning'}</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">{validationError}</p>

              {missingHeaders.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-black uppercase text-rose-700 block mb-1">
                    {isMr ? 'गहाळ असलेले कॉलम्स:' : 'Missing Required Headers:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingHeaders.map((m) => (
                      <span key={m} className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md font-bold text-xs">
                        ⚠️ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setValidationError(null);
                  setFile(null);
                }}
                className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {isMr ? 'पुन्हा दुसरी फाइल निवडा' : 'Choose Another File'}
              </button>
            </div>
          )}

          {/* Validation Success & Extraction Preview */}
          {extractedData && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-sm">
                      {isMr ? 'पडताळणी यशस्वी! फाइल स्वीकृत झाली' : '✅ File Validation Passed Successfully'}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-800">
                      {extractedData.expenses.length} {isMr ? 'खर्च आणि' : 'expenses &'} {extractedData.members.length} {isMr ? 'मित्र आढळले' : 'participants detected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable Extracted Trip Info */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h5 className="font-black text-xs uppercase text-slate-700 tracking-wider">
                  {isMr ? 'सहलीचे तपशील:' : 'Extracted Trip Summary:'}
                </h5>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    {isMr ? 'सहलीचे नाव (Trip Name)' : 'Trip Name'}
                  </label>
                  <input
                    type="text"
                    value={extractedData.name}
                    onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Start Date</label>
                    <input
                      type="date"
                      value={extractedData.startDate}
                      onChange={(e) => setExtractedData({ ...extractedData, startDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block">End Date</label>
                    <input
                      type="date"
                      value={extractedData.endDate}
                      onChange={(e) => setExtractedData({ ...extractedData, endDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Assignment Section */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>{isMr ? 'प्रशासक (Admin) निवड करा:' : 'Select Trip Administrator (Admin Role):'}</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-800">
                  {isMr
                    ? 'निवडलेला प्रशासक ट्रिपचे सर्व हिशोब आणि मास्तर डेटा व्यवस्थापित करू शकेल.'
                    : 'The designated Admin will manage trip approvals, master data & pooled funds.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extractedData.members.map((member, idx) => (
                    <button
                      key={member.name}
                      type="button"
                      onClick={() => setAdminIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        adminIndex === idx
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-500 shadow-sm'
                          : 'bg-white text-slate-800 font-bold border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-xs truncate">{member.name}</span>
                      {adminIndex === idx && (
                        <span className="text-[10px] font-black bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          👑 Admin
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Parsed Expenses Table Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-xs uppercase text-slate-700 tracking-wider">
                    {isMr ? 'खर्च नमुना (Expense Preview):' : 'Parsed Expenses Sample:'}
                  </h5>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                    Total: ₹{extractedData.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                  </span>
                </div>

                <div className="overflow-y-auto max-h-48  rounded-2xl border border-slate-200 bg-white   ">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Paid By</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                      {extractedData.expenses.slice(0, 8).map((exp, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 text-[11px] text-slate-500">{exp.date}</td>
                          <td className="p-2.5 truncate max-w-[120px]">{exp.title}</td>
                          <td className="p-2.5 uppercase text-[10px] text-indigo-600">{exp.category}</td>
                          <td className="p-2.5">{exp.paidBy}</td>
                          <td className="p-2.5 text-right font-black text-slate-900">₹{exp.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {extractedData.expenses.length > 8 && (
                    <div className="p-2 text-center text-[10px] font-bold text-slate-500 bg-slate-50">
                      +{extractedData.expenses.length - 8} {isMr ? 'आणखी खर्च ऑटो-इम्पोर्ट होतील' : 'more expenses will be auto-imported'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all"
          >
            {isMr ? 'रद्द करा' : 'Cancel'}
          </button>

          {extractedData && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isMr ? 'सहल डेटा तयार करा' : 'Confirm & Import Trip'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
