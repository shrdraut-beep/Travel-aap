import React from 'react';

export interface PDFLayoutWrapperProps {
  tripName: string;
  tripDates?: string;
  documentType?: string;
  generatedAt?: string;
  children: React.ReactNode;
}

export const PDFLayoutWrapper: React.FC<PDFLayoutWrapperProps> = ({
  tripName,
  tripDates,
  documentType = "अधिकृत अहवाल / Official Report",
  generatedAt,
  children,
}) => {
  const currentDate = generatedAt || new Date().toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="pdf-export-root pdf-watermark-container relative bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mx-auto overflow-hidden text-left"
      style={{
        width: '800px',
        minWidth: '800px',
        maxWidth: '800px',
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* CSS Watermark Overlay & Printing rules */}
      <style>{`
        .pdf-watermark-container {
          position: relative;
          background-color: #ffffff !important;
          background-image: url('/AppIcons/playstore.png');
          background-position: center center;
          background-repeat: repeat-y;
          background-size: 320px auto;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pdf-watermark-container::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.94);
          z-index: 1;
          pointer-events: none;
        }
        .pdf-content-wrapper {
          position: relative;
          z-index: 10;
        }
        .page-break-avoid, .break-inside-avoid, .day-card {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }
      `}</style>

      <div className="pdf-content-wrapper space-y-6">
        {/* BRANDED LETTERHEAD HEADER - APP SIGNATURE THEME */}
        <header className="brochure-header break-inside-avoid page-break-avoid bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white rounded-2xl p-6 shadow-md border border-rose-500/40">
          <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-4 mb-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/AppIcons/playstore.png"
                alt="Routripo Logo"
                crossOrigin="anonymous"
                loading="eager"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/30 shrink-0 bg-white"
              />
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>राऊट्रिपो</span>
                  <span className="text-[10px] font-bold bg-amber-300 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Official PDF
                  </span>
                </h1>
                <p className="text-xs font-semibold text-amber-200 tracking-wide mt-0.5">
                  दोस्तांची सफर, हिशोब विसर! 🚩
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 inline-block mb-1 shadow-xs">
                {documentType}
              </span>
              <p className="text-[11px] font-semibold text-rose-100">
                दिनांक: {currentDate}
              </p>
            </div>
          </div>

          {/* DYNAMIC TRIP DETAILS SUBHEADER */}
          <div className="flex items-center justify-between gap-4 bg-black/15 rounded-xl p-3 border border-white/15 backdrop-blur-xs">
            <div>
              <span className="text-[10px] font-bold text-rose-100 uppercase tracking-widest block">
                सहलीचे नाव / Trip Title
              </span>
              <span className="text-base font-black text-white tracking-tight">
                {tripName || 'सहलीचा तपशील (Trip Details)'}
              </span>
            </div>
            {tripDates && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-rose-100 uppercase tracking-widest block">
                  कालावधी / Trip Dates
                </span>
                <span className="text-xs font-extrabold text-amber-300">
                  {tripDates}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="pdf-body space-y-6">
          {children}
        </main>

        {/* BRANDED FOOTER */}
        <footer className="brochure-footer break-inside-avoid page-break-avoid pt-4 border-t-2 border-slate-200 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-600 uppercase tracking-wider">
            <img
              src="/AppIcons/playstore.png"
              alt="Logo"
              crossOrigin="anonymous"
              loading="eager"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-4 h-4 rounded-md"
            />
            <span>राऊट्रिपो - Routripo AI Travel Companion</span>
          </div>
          <p className="text-[10px] font-medium text-slate-400">
            Generated automatically via Routripo App • Verified Group Travel Report
          </p>
        </footer>
      </div>
    </div>
  );
};
