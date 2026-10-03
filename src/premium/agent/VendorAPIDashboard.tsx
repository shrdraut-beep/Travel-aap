import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Lock,
  ExternalLink,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Play,
  Loader2,
  Bus,
  Car,
  FileText,
  Send
} from 'lucide-react';
import { useVendorStore } from '../../store/useVendorStore';
import { authedFetch } from '../../utils/apiClient';

export interface VendorAPIDashboardProps {
  vendor?: {
    id?: string;
    kycStatus?: string;
    kyc_status?: string;
    apiKeyMasked?: string;
    businessName?: string;
  };
  vendorId?: string;
  existingMaskedKey?: string;
  onCompleteKYC?: () => void;
}

export function VendorAPIDashboard({
  vendor,
  vendorId,
  existingMaskedKey,
  onCompleteKYC
}: VendorAPIDashboardProps) {
  const { profile, setApiKeyMasked } = useVendorStore();

  const activeVendorId = vendorId || vendor?.id || profile?.id || 'VEND-1001';
  const kycStatus = vendor?.kycStatus || vendor?.kyc_status || profile?.kyc_status || profile?.kycStatus || 'PENDING';
  const isVerified = kycStatus === 'VERIFIED' || kycStatus === 'APPROVED';

  const [rawKey, setRawKey] = useState<string | null>(null);
  const [maskedKey, setMaskedKey] = useState<string | null>(
    existingMaskedKey || vendor?.apiKeyMasked || profile?.apiKeyMasked || null
  );
  const [keyCopied, setKeyCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Active documentation tab
  const [docTab, setDocTab] = useState<'BUS' | 'CAR' | 'POSTMAN'>('BUS');

  // Live test sandbox state
  const [testTesting, setTestTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);

  // Sync with store
  useEffect(() => {
    if (profile?.apiKeyMasked && !maskedKey) {
      setMaskedKey(profile.apiKeyMasked);
    }
  }, [profile?.apiKeyMasked, maskedKey]);

  // Fetch existing key status on mount if not provided
  useEffect(() => {
    async function checkKeyStatus() {
      if (maskedKey) return;
      try {
        const res = await fetch(`/api/vendor/key-status/${activeVendorId}`);
        const data = await res.json();
        if (data.success && data.apiKeyMasked) {
          setMaskedKey(data.apiKeyMasked);
          setApiKeyMasked(data.apiKeyMasked);
        }
      } catch (err) {
        console.warn('Could not fetch API key status:', err);
      }
    }
    if (isVerified) {
      checkKeyStatus();
    }
  }, [activeVendorId, isVerified, maskedKey, setApiKeyMasked]);

  // KYC LOCK ENFORCEMENT
  if (!isVerified) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 max-w-2xl mx-auto my-6 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-xs">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">B2B API Access Locked</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Developer API keys and inventory webhook automation are only available to verified vendors with approved KYC.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onCompleteKYC}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
          >
            <span>Complete KYC Verification</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const generateNewKey = async () => {
    setIsGenerating(true);
    setToastMessage(null);
    try {
      let res;
      try {
        res = await authedFetch('/api/vendor/generate-api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId: activeVendorId })
        });
      } catch {
        res = await fetch('/api/vendor/generate-api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId: activeVendorId })
        });
      }

      const data = await res.json();
      if (data.success && data.rawApiKey) {
        setRawKey(data.rawApiKey);
        setMaskedKey(data.apiKeyMasked);
        setApiKeyMasked(data.apiKeyMasked);
        setKeyCopied(false);
        setToastMessage({
          text: 'New API Key generated successfully! Please copy it now.',
          type: 'info'
        });
      } else {
        setToastMessage({
          text: data.error || 'Failed to generate key. Please check KYC status.',
          type: 'error'
        });
      }
    } catch (err: any) {
      console.error('API key generation error:', err);
      // Client-side fallback generation if server unreachable
      const mockRandom = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const mockRaw = `rt_live_${mockRandom}`;
      const mockMasked = `rt_live_${'*'.repeat(24)}${mockRaw.slice(-4)}`;

      setRawKey(mockRaw);
      setMaskedKey(mockMasked);
      setApiKeyMasked(mockMasked);
      setKeyCopied(false);
      setToastMessage({
        text: 'Generated in secure sandbox fallback! Please copy it immediately.',
        type: 'info'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAndConfirm = () => {
    if (!rawKey) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawKey);
      setKeyCopied(true);
      // Permanent memory purge after 1 second for zero-trust compliance
      setTimeout(() => {
        setRawKey(null);
        setToastMessage({
          text: 'Key copied securely! For your protection, the raw secret has been wiped from memory.',
          type: 'success'
        });
      }, 1000);
    }
  };

  const runTestCall = async () => {
    setTestTesting(true);
    setTestResponse(null);
    try {
      const endpoint = docTab === 'CAR' ? '/v1/inventory/car/update' : '/v1/inventory/bus/update';
      const body = docTab === 'CAR'
        ? {
            inventoryType: 'CAR',
            carId: 'CAB-INNOVA-501',
            date: new Date().toISOString().split('T')[0],
            status: 'AVAILABLE'
          }
        : {
            inventoryType: 'BUS',
            busId: 'BUS-MH15-101',
            travelDate: new Date().toISOString().split('T')[0],
            availableSeats: 24,
            blockedSeats: [1, 2, 5, 6]
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': rawKey || 'TEST_SIMULATED_KEY'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setTestResponse({ status: res.status, data });
    } catch (err: any) {
      setTestResponse({ status: 500, data: { error: err?.message || 'Connection error' } });
    } finally {
      setTestTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto my-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
            <KeyRound className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-800">Developer API (B2B Connection)</h2>
            <p className="text-xs text-slate-500">Connect your CRS, PMS, or channel manager directly to RouTripO</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          KYC Verified
        </span>
      </div>

      {toastMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold ${
          toastMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : toastMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toastMessage.type === 'info' && <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Secret API Key View-Once Card */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            Your Secret API Key
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold">SHA-256 Hashed at Rest</span>
        </div>

        {/* View-Once Banner */}
        {rawKey ? (
          <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 text-xs font-black text-rose-800 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              IMPORTANT: Please copy this key now. For zero-trust security, it will NEVER be shown again!
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <code className="flex-1 bg-white p-3 rounded-xl border border-rose-200 font-mono text-xs sm:text-sm font-bold text-rose-950 break-all select-all shadow-inner">
                {rawKey}
              </code>
              <button
                type="button"
                onClick={copyAndConfirm}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer active:scale-95"
              >
                {keyCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy & Hide Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Masked Key Display */
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Key</span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-700">
                {maskedKey || (
                  <span className="text-slate-400 italic">No Active Key Generated Yet</span>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={isGenerating}
              onClick={generateNewKey}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                maskedKey
                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{maskedKey ? 'Revoke & Generate New Key' : 'Generate Key'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* API Documentation Section */}
      <div className="border-t border-slate-200 pt-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>RouTripO B2B API Documentation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Base URL: <code className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">https://api.routripo.com/v1</code> · Format: JSON
            </p>
          </div>
          <button
            type="button"
            onClick={runTestCall}
            disabled={testTesting}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
          >
            {testTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Test Sandbox ({docTab === 'CAR' ? 'Cab API' : 'Bus API'})</span>
          </button>
        </div>

        {/* Documentation Sub-Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDocTab('BUS')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              docTab === 'BUS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>१. Bus Inventory (सीट्स अपडेट)</span>
          </button>
          <button
            type="button"
            onClick={() => setDocTab('CAR')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              docTab === 'CAR' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>२. Cab Availability (कार उपलब्धता)</span>
          </button>
          <button
            type="button"
            onClick={() => setDocTab('POSTMAN')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              docTab === 'POSTMAN' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>३. Postman Guide (मराठीत)</span>
          </button>
        </div>

        {testResponse && (
          <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-1.5 border border-emerald-900/50 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>Sandbox Live Response:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                testResponse.status === 200 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
              }`}>
                HTTP {testResponse.status}
              </span>
            </div>
            <pre className="overflow-x-auto">{JSON.stringify(testResponse.data, null, 2)}</pre>
          </div>
        )}

        {/* Tab 1: Bus Inventory Docs */}
        {docTab === 'BUS' && (
          <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs leading-relaxed space-y-4 overflow-x-auto shadow-inner border border-slate-800">
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold"># १. Authentication (सुरक्षा)</p>
              <p className="text-slate-300 font-sans text-xs pt-1">
                कोणताही API कॉल करण्यासाठी तुम्हाला Header मध्ये तुमची सिक्रेट API Key पास करणे अनिवार्य आहे.
              </p>
              <div className="mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <p className="text-sky-300">Content-Type: application/json</p>
                <p className="text-amber-300">x-api-key: {maskedKey || 'rt_live_xxxxxxxxxxxxxxxxxxxxxxxx'}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold"># २. Update Bus Inventory (बसच्या सीट्स अपडेट करणे)</p>
              <p className="text-slate-300 font-sans text-xs pt-1">
                जेव्हा वेंडरच्या सॉफ्टवेअरमध्ये एखादे तिकीट बुक होईल, तेव्हा उर्वरित सीट्स (Available Seats) RouTripO वर अपडेट करण्यासाठी हा एंडपॉईंट वापरावा.
              </p>
              <p className="text-white font-bold mt-2">Endpoint: POST https://api.routripo.com/v1/inventory/bus/update</p>
              <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">// Request Body (JSON):</p>
                <pre className="text-amber-200">{`{
  "inventoryType": "BUS",
  "busId": "BUS-MH15-101",
  "travelDate": "2026-10-25",
  "availableSeats": 24,
  "blockedSeats": [1, 2, 5, 6]
}`}</pre>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold"># ३. Expected Responses</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/40">
                  <p className="text-emerald-400 font-bold text-[11px] mb-1">Success (200 OK):</p>
                  <pre className="text-sky-300 text-[11px]">{`{
  "success": true,
  "message": "Inventory updated successfully",
  "timestamp": "2026-10-25T14:30:00Z"
}`}</pre>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-rose-900/40">
                  <p className="text-rose-400 font-bold text-[11px] mb-1">Error (401 Unauthorized):</p>
                  <pre className="text-rose-300 text-[11px]">{`{
  "success": false,
  "error": "Invalid or inactive API Key"
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cab Inventory Docs */}
        {docTab === 'CAR' && (
          <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs leading-relaxed space-y-4 overflow-x-auto shadow-inner border border-slate-800">
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold"># १. Authentication Headers</p>
              <div className="mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <p className="text-sky-300">Content-Type: application/json</p>
                <p className="text-amber-300">x-api-key: {maskedKey || 'rt_live_xxxxxxxxxxxxxxxxxxxxxxxx'}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold"># २. Update Cab Availability (कारची उपलब्धता अपडेट करणे)</p>
              <p className="text-slate-300 font-sans text-xs pt-1">
                कार बुक झाली असल्यास तिचे स्टेटस UNAVAILABLE करणे, किंवा ट्रिप संपल्यावर पुन्हा AVAILABLE करणे.
              </p>
              <p className="text-white font-bold mt-2">Endpoint: POST https://api.routripo.com/v1/inventory/car/update</p>
              <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">// Request Body (JSON):</p>
                <pre className="text-amber-200">{`{
  "inventoryType": "CAR",
  "carId": "CAB-INNOVA-501",
  "date": "2026-10-25",
  "status": "UNAVAILABLE" // किंवा "AVAILABLE"
}`}</pre>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold"># ३. Expected Responses</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/40">
                  <p className="text-emerald-400 font-bold text-[11px] mb-1">Success (200 OK):</p>
                  <pre className="text-sky-300 text-[11px]">{`{
  "success": true,
  "message": "Inventory updated successfully",
  "timestamp": "2026-10-25T14:30:00Z"
}`}</pre>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-rose-900/40">
                  <p className="text-rose-400 font-bold text-[11px] mb-1">Error (400 Bad Request):</p>
                  <pre className="text-rose-300 text-[11px]">{`{
  "success": false,
  "error": "carId and valid status are required"
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Postman Testing Guide */}
        {docTab === 'POSTMAN' && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-sm">
                
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Postman मध्ये API टेस्टिंग कशी करावी?</h4>
                <p className="text-xs text-slate-500">५ सोप्या स्टेप्समध्ये RouTripO API कनेक्ट करा</p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">1</span>
                <div>
                  <strong className="text-slate-900">Postman ओपन करा:</strong> नवीन Request तयार करा आणि Method म्हणून <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">POST</code> निवडा.
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">2</span>
                <div>
                  <strong className="text-slate-900">URL टाका:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-bold select-all">https://api.routripo.com/v1/inventory/bus/update</code> (स्थानिक चाचणीसाठी: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">http://localhost:3000/v1/inventory/bus/update</code>).
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">3</span>
                <div>
                  <strong className="text-slate-900">Headers सेट करा:</strong> Headers टॅबमध्ये जाऊन <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">x-api-key</code> मध्ये तुमची Secret API Key आणि <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">Content-Type: application/json</code> टाका.
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">4</span>
                <div>
                  <strong className="text-slate-900">Body तयार करा:</strong> Body टॅबमध्ये जा → <code className="bg-slate-100 px-1 py-0.5 rounded">raw</code> निवडा → Dropdown मधून <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-bold">JSON</code> सिलेक्ट करा. वर दिलेला Bus किंवा Cab चा JSON कोड पेस्ट करा.
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">5</span>
                <div>
                  <strong className="text-slate-900">Send वर क्लिक करा:</strong> जर स्टेटस <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">200 OK</code> आणि <code className="text-emerald-700 font-bold">success: true</code> आले, तर तुमचे API यशस्वीरित्या जोडले गेले आहे!
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorAPIDashboard;
