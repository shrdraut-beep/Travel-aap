import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Shield, FileText, RotateCcw, Scale, Handshake, 
  Search, ExternalLink, CheckCircle2, Copy, Check,
  ChevronRight
} from 'lucide-react';
import { 
  ROUTRIPO_LEGAL_POLICIES, 
  LEGAL_COMPANY_INFO, 
  LegalPolicy, 
  getLegalPolicyById,
  getLegalPolicyBySlug 
} from '../data/legalPolicies';

const POLICY_ICONS: Record<string, React.ElementType> = {
  'terms': FileText,
  'privacy': Shield,
  'cancellation-refund': RotateCcw,
  'dpdp': Scale,
  'bargaining-bidding': Handshake,
};

function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('***') && part.endsWith('***')) {
      return <strong key={index} className="font-bold text-slate-900 italic">{part.slice(3, -3)}</strong>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="text-slate-700 not-italic font-medium">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const PolicyContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = content.split('\n\n');
  return (
    <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="font-bold text-slate-900 text-sm sm:text-base mt-4 mb-1">
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={bIdx} className="font-bold text-slate-800 text-xs sm:text-sm mt-3 mb-1">
              {trimmed.replace(/^####\s+/, '')}
            </h5>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const items = trimmed.split('\n').filter(l => l.trim().startsWith('- ') || l.trim().startsWith('• '));
          return (
            <ul key={bIdx} className="space-y-2 pl-1 my-2">
              {items.map((item, iIdx) => {
                const cleanItem = item.replace(/^[-•]\s+/, '');
                return (
                  <li key={iIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <span>{renderFormattedText(cleanItem)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={bIdx} className="leading-relaxed text-slate-700">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const LegalPolicyPage: React.FC = () => {
  const { policyId } = useParams<{ policyId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active policy from URL path or param
  const activePolicyId = useMemo(() => {
    if (policyId) return policyId;
    const path = location.pathname.replace(/^\//, '');
    if (path === 'terms') return 'terms';
    if (path === 'privacy') return 'privacy';
    if (path === 'cancellation-refund' || path === 'refund-policy') return 'cancellation-refund';
    if (path === 'dpdp') return 'dpdp';
    if (path === 'bargaining-policy' || path === 'bargaining') return 'bargaining-bidding';
    return 'terms';
  }, [policyId, location.pathname]);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const policy = useMemo(() => {
    return getLegalPolicyById(activePolicyId) || getLegalPolicyBySlug(activePolicyId) || ROUTRIPO_LEGAL_POLICIES[0];
  }, [activePolicyId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [policy.id]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return policy.sections;
    const q = searchQuery.toLowerCase();
    return policy.sections.filter(s => 
      s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [policy, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                R
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">RoutTripo</span>
                <span className="hidden sm:inline text-xs font-medium text-slate-500 ml-1.5 border-l border-slate-300 pl-2">
                  Legal & Compliance Hub
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={policy.htmlFile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Standalone Web View</span>
            </a>

            <button
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero Card */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold backdrop-blur-sm">
              <span>{policy.category}</span>
              <span>•</span>
              <span>Version {policy.version}</span>
              <span>•</span>
              <span>{policy.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {policy.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {policy.summary}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 border-t border-white/10 pt-3">
              <div>Effective Date: <strong className="text-slate-200">{policy.effectiveDate}</strong></div>
              <div>Entity: <strong className="text-slate-200">{LEGAL_COMPANY_INFO.entityName}</strong></div>
              <div>Jurisdiction: <strong className="text-slate-200">{LEGAL_COMPANY_INFO.jurisdiction}</strong></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            {/* Policy Switching Tabs */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                All Legal Documents
              </h3>
              {ROUTRIPO_LEGAL_POLICIES.map((p) => {
                const Icon = POLICY_ICONS[p.id] || FileText;
                const isActive = p.id === policy.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate(`/legal/${p.id}`);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{p.shortTitle}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* In-Policy Search */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Search Sections
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Keyword (e.g., escrow, refund, PII)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              {searchQuery && (
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Found {filteredSections.length} matching sections</span>
                  <button onClick={() => setSearchQuery('')} className="text-sky-600 font-semibold hover:underline cursor-pointer">
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Quick Contact & Redressal */}
            <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100 text-xs text-sky-900 space-y-2">
              <div className="font-bold text-sky-950 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-sky-600" />
                <span>Statutory Officer</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                {LEGAL_COMPANY_INFO.grievanceOfficer}
              </p>
              <div className="font-semibold text-slate-800 text-[11px]">
                {LEGAL_COMPANY_INFO.grievanceEmail}
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-sky-100">
                Helpline: {LEGAL_COMPANY_INFO.helpline}
              </div>
            </div>
          </aside>

          {/* Sections Viewer */}
          <main className="lg:col-span-3 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No sections matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              filteredSections.map((sec, idx) => {
              const cleanTitle = sec.title.replace(/^\d+(\.\d+)*[\.\s]+/, '');
              return (
                <article
                  key={sec.id + idx}
                  id={sec.id}
                  className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4 transition hover:border-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                      Section {idx + 1}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {cleanTitle || sec.title}
                    </h2>
                  </div>
                  <PolicyContentRenderer content={sec.content} />
                </article>
              );
            })
            )}

            {/* Compliance & Redressal Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Regulatory Compliance & Grievance Mechanism
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This document is published in accordance with the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Grievance Redressal Officer:</span>
                    <span className="font-semibold text-white">{LEGAL_COMPANY_INFO.grievanceOfficer}</span>
                    <span className="text-slate-300 block text-[11px]">{LEGAL_COMPANY_INFO.grievanceEmail}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(LEGAL_COMPANY_INFO.grievanceEmail)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                    title="Copy email"
                  >
                    {copiedEmail === LEGAL_COMPANY_INFO.grievanceEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Data Protection & Privacy Desk:</span>
                    <span className="font-semibold text-white">DPDP Compliance Officer</span>
                    <span className="text-slate-300 block text-[11px]">{LEGAL_COMPANY_INFO.privacyEmail}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(LEGAL_COMPANY_INFO.privacyEmail)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                    title="Copy email"
                  >
                    {copiedEmail === LEGAL_COMPANY_INFO.privacyEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span>{LEGAL_COMPANY_INFO.entityName} • {LEGAL_COMPANY_INFO.registeredAddress}</span>
                <span>Courts of Jurisdiction: {LEGAL_COMPANY_INFO.jurisdiction}</span>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 {LEGAL_COMPANY_INFO.entityName}. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            CIN: {LEGAL_COMPANY_INFO.cin} • Registered at {LEGAL_COMPANY_INFO.registeredAddress}
          </p>
        </div>
      </footer>
    </div>
  );
};
