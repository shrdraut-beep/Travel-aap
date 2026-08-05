import React, { useState } from 'react';
import { fetchWikipediaSummary, WikipediaSummary } from '../services/api/wikipedia';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';

interface WikipediaSnippetProps {
  query: string;
  lang: string;
}

export const WikipediaSnippet: React.FC<WikipediaSnippetProps> = ({ query, lang }) => {
  const [summary, setSummary] = useState<WikipediaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const handleFetchOnDemand = async () => {
    if (hasFetched || loading) return;
    setLoading(true);
    setHasFetched(true);
    const cleanQuery = query.replace(/(day \d+|दिवस \d+:?)/gi, '').trim().split(':')[0].trim();
    if (!cleanQuery) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWikipediaSummary(cleanQuery);
      setSummary(res);
    } catch (e) {
      console.error("API Rate Limit Hit for: WikipediaSummary", e);
    } finally {
      setLoading(false);
    }
  };

  if (!hasFetched) {
    return (
      <button
        type="button"
        onClick={handleFetchOnDemand}
        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors border border-blue-200/60"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>{lang === 'mr' ? 'विकिपीडिया माहिती पहा' : 'Load Wikipedia Info'}</span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-xs mt-3">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{lang === 'mr' ? 'माहिती शोधत आहे...' : 'Fetching facts...'}</span>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="mt-4 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <BookOpen className="w-4 h-4" />
        </div>
        <h5 className="font-bold text-sm text-slate-800">{summary.title}</h5>
      </div>
      <div className="flex gap-3">
        {summary.thumbnail && (
          <img src={summary.thumbnail} alt={summary.title} className="w-16 h-16 object-cover rounded-xl shadow-sm shrink-0" />
        )}
        <div>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {summary.extract}
          </p>
          <a 
            href={summary.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-2 hover:text-blue-700 transition-colors"
          >
            {lang === 'mr' ? 'विकिपीडियावर अधिक वाचा' : 'Read more on Wikipedia'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
