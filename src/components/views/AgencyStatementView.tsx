import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Search, Download, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as XLSX from 'xlsx';

export const AgencyStatementView = () => {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Mock ledger data
  const ledger = [
    { id: 'TXN-9012', date: '2026-08-14', type: 'Flight Booking', confId: 'PNR-X89K2', gross: 12500, comm: 625, tds: 12.5, net: 612.5, status: 'Completed' },
    { id: 'TXN-9013', date: '2026-08-13', type: 'Hotel Stay', confId: 'HTL-B991', gross: 24000, comm: 1920, tds: 38.4, net: 1881.6, status: 'Completed' },
    { id: 'TXN-9014', date: '2026-08-12', type: 'Train Ticket', confId: 'PNR-88123', gross: 1200, comm: 40, tds: 0.8, net: 39.2, status: 'Completed' },
    { id: 'TXN-9015', date: '2026-08-10', type: 'Payout', confId: 'UTR-991203', gross: 0, comm: 0, tds: 0, net: -2500, status: 'Processed' },
  ];

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(ledger.map(tx => ({
      'Transaction ID': tx.id,
      'Date': tx.date,
      'Type': tx.type,
      'Confirmation ID': tx.confId,
      'Gross Amount (INR)': tx.gross,
      'Commission (INR)': tx.comm,
      'TDS Deducted (INR)': tx.tds,
      'Net Payout (INR)': tx.net,
      'Status': tx.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agency Statement");
    XLSX.writeFile(workbook, `Agency_Statement_${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Agency Statement</h2>
            <p className="text-xs font-semibold text-slate-500">Track commissions, TDS deductions, and net payouts.</p>
          </div>
        </div>
        
        <button onClick={handleExport} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 space-y-4">
        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none" />
          </div>
          <span className="text-slate-300 font-bold hidden sm:block">➔</span>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none" />
          </div>
          <button className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-3">Date</th>
                <th className="p-3">Details</th>
                <th className="p-3">Gross (₹)</th>
                <th className="p-3">App Comm. (₹)</th>
                <th className="p-3">TDS (194-O)</th>
                <th className="p-3 text-right">Net Payout (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-bold text-slate-700 whitespace-nowrap">{tx.date}</td>
                  <td className="p-3">
                    <p className="text-xs font-black text-slate-900">{tx.type}</p>
                    <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {tx.id} • {tx.confId}
                    </p>
                  </td>
                  <td className="p-3 text-xs font-bold text-slate-700">₹{tx.gross.toFixed(2)}</td>
                  <td className="p-3 text-xs font-bold text-emerald-600">₹{tx.comm.toFixed(2)}</td>
                  <td className="p-3 text-xs font-bold text-rose-500">-₹{tx.tds.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${tx.net > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                      {tx.net > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      ₹{Math.abs(tx.net).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
