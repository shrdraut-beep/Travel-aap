import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, FileText, RotateCcw, Scale, Handshake, 
  Search, ExternalLink, CheckCircle2, ChevronRight, 
  Copy, Check
} from 'lucide-react';
import { 
  ROUTRIPO_LEGAL_POLICIES, 
  LEGAL_COMPANY_INFO, 
  LegalPolicy, 
  getLegalPolicyById 
} from '../../data/legalPolicies';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPolicyId?: string;
  initialSectionId?: string;
}

const POLICY_ICONS: Record<string, React.ElementType> = {
  'terms': FileText,
  'privacy': Shield,
  'cancellation-refund': RotateCcw,
  'dpdp': Scale,
  'bargaining-bidding': Handshake,
};

function renderFormattedText(text: string): React.ReactNode {
  // Regex to split on ***bold-italic***, **bold**, or *italic*
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

        // Sub-heading (###)
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="font-bold text-slate-900 text-sm sm:text-base mt-4 mb-1">
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          );
        }

        // Sub-sub-heading (####)
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={bIdx} className="font-bold text-slate-800 text-xs sm:text-sm mt-3 mb-1">
              {trimmed.replace(/^####\s+/, '')}
            </h5>
          );
        }

        // Bullet lists
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

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  initialPolicyId = 'terms',
  initialSectionId
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialPolicyId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (initialPolicyId) {
      setSelectedId(initialPolicyId);
    }
  }, [initialPolicyId, isOpen]);

  const currentPolicy = useMemo(() => {
    return getLegalPolicyById(selectedId) || ROUTRIPO_LEGAL_POLICIES[0];
  }, [selectedId]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentPolicy.sections;
    const q = searchQuery.toLowerCase();
    return currentPolicy.sections.filter(s => 
      s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [currentPolicy, searchQuery]);

  // Copy email helper
  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-sky-500/20">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                    RoutTripo Legal & Policies
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    v1.0 Official
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Statutory compliance, zero-trust privacy, and marketplace terms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentPolicy.htmlFile}
                target="_blank"
                rel="noopener noreferrer"
                title="Open standalone web version"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Web Link</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Policy Selector Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 overflow-x-auto scrollbar-hide flex gap-2 shrink-0">
            {ROUTRIPO_LEGAL_POLICIES.map((policy) => {
              const Icon = POLICY_ICONS[policy.id] || FileText;
              const isActive = policy.id === currentPolicy.id;
              return (
                <button
                  key={policy.id}
                  onClick={() => {
                    setSelectedId(policy.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{policy.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-header Bar: Search & Policy Summary */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                  {currentPolicy.category}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Effective: {currentPolicy.effectiveDate}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {currentPolicy.title}
              </h3>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search within policy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Executive Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 text-xs text-slate-700 leading-relaxed space-y-2">
              <div className="font-bold text-sky-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Executive Summary & Scope</span>
              </div>
              <p>{currentPolicy.summary}</p>
            </div>

            {/* Sections */}
            {filteredSections.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No sections matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              filteredSections.map((sec, idx) => {
              const cleanTitle = sec.title.replace(/^\d+(\.\d+)*[\.\s]+/, '');
              return (
                <div
                  key={sec.id + idx}
                  id={sec.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3 transition hover:border-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      Section {idx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {cleanTitle || sec.title}
                    </h4>
                  </div>
                  <PolicyContentRenderer content={sec.content} />
                </div>
              );
            })
            )}

            {/* Legal Grievance & Compliance Card */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-400" />
                <h4 className="text-sm font-bold text-white">
                  Statutory Grievance Redressal & Redressal Desk
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under the Information Technology (Intermediary Guidelines) Rules, 2021 and Section 13 of the Digital Personal Data Protection Act, 2023, Users and Partners may lodge grievances, data deletion requests, or escalation notices with our officer:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Grievance Officer:</span>
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
                    <span className="text-[10px] text-slate-400 block">Data Protection Desk:</span>
                    <span className="font-semibold text-white">DPDP Compliance Desk</span>
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
                <span>{LEGAL_COMPANY_INFO.entityName} • {LEGAL_COMPANY_INFO.jurisdiction}</span>
                <span>Helpline: {LEGAL_COMPANY_INFO.helpline}</span>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="bg-white border-t border-slate-200 px-5 sm:px-6 py-3 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 hidden sm:block">
              All documents are legally binding under the Information Technology Act, 2000.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                I Understand & Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
