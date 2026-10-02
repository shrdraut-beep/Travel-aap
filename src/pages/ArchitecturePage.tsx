import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);
      const res = await fetch('/architecture.html');
      if (!res.ok) throw new Error('Failed to fetch architecture file');
      const htmlText = await res.text();

      // Create a Blob and trigger a download via object URL
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'routripo_architecture.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 200);
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError('Browser blocked auto-download. Click "Copy HTML" to copy the full code instead.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const res = await fetch('/architecture.html');
      const htmlText = await res.text();
      await navigator.clipboard.writeText(htmlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      // Fallback
      window.open('/download-architecture', '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Header Bar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Back to App"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>RouTripo Architecture Diagram</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30">
                Interactive
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Standalone interactive SVG diagram powered by Archify
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Direct File Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Download routripo_architecture.html to your device"
          >
            {downloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloading ? 'Downloading...' : 'Download HTML'}</span>
          </button>

          {/* Copy Full Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="Copy full HTML source to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy HTML</span>
              </>
            )}
          </button>

          {/* Open Raw in New Window */}
          <a
            href="/architecture.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition-all"
            title="Open standalone HTML in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>New Tab</span>
          </a>
        </div>
      </header>

      {/* Error / Notice Banner if download was blocked */}
      {downloadError && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <span>{downloadError}</span>
          <button
            onClick={handleCopy}
            className="underline font-bold text-amber-100 hover:text-white ml-2"
          >
            Copy HTML Code
          </button>
        </div>
      )}

      {/* Embedded Live Interactive Diagram */}
      <main className="flex-1 w-full bg-slate-950 relative overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        <iframe
          src="/architecture.html"
          title="RouTripo System Architecture Diagram"
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </main>
    </div>
  );
};
