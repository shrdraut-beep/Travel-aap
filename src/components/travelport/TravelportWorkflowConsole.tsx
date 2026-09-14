import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Hotel, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  FileText, 
  Key, 
  CreditCard, 
  User, 
  Layers, 
  
  Ticket,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepItem {
  id: string;
  step: string;
  name: string;
  category: 'search' | 'workbench' | 'seats' | 'ancillaries' | 'payment' | 'ticketing';
  optional?: boolean;
  ndcOnly?: boolean;
  endpoint: string;
  method: string;
  description: string;
}

const WORKFLOW_STEPS: StepItem[] = [
  { id: 'A', step: 'A', name: 'Air Search (CatalogOfferings)', category: 'search', endpoint: '/api/travelport/flights/search', method: 'POST', description: 'Returns initial branded flight offers and product catalog IDs' },
  { id: 'B', step: 'B', name: 'Flight Specific Search (FSLS)', category: 'search', optional: true, endpoint: '/api/travelport/flights/buildoptions', method: 'POST', description: 'Returns all brand options for the selected flight' },
  { id: 'C', step: 'C', name: 'Price Offer (AirPrice)', category: 'search', endpoint: '/api/travelport/flights/price', method: 'POST', description: 'Returns repriced offer with complete taxes, fees, and baggage rules' },
  { id: 'D', step: 'D', name: 'Standalone Fare Rules', category: 'search', optional: true, endpoint: '/api/travelport/flights/farerules', method: 'GET', description: 'Returns structured cancellation, refund, and change penalties' },
  { id: 'E', step: 'E', name: 'Create Workbench', category: 'workbench', endpoint: '/api/travelport/workbench/create', method: 'POST', description: 'Initializes a transaction workbench session (Reservation ID)' },
  { id: 'F', step: 'F', name: 'Add Traveler(s)', category: 'workbench', endpoint: '/api/travelport/workbench/:id/travelers', method: 'POST', description: 'Adds traveler details, gender, DOB, email, and phone to workbench' },
  { id: 'G', step: 'G', name: 'Add Offer', category: 'workbench', endpoint: '/api/travelport/workbench/:id/offers', method: 'POST', description: 'Binds selected flight catalog offer to the workbench reservation' },
  { id: 'H', step: 'H', name: 'Seat Map', category: 'seats', optional: true, endpoint: '/api/travelport/seats/seatmap', method: 'POST', description: 'Returns aircraft seat layout with availability and extra charges' },
  { id: 'I', step: 'I', name: 'Book Seat(s)', category: 'seats', optional: true, endpoint: '/api/travelport/workbench/:id/seats', method: 'POST', description: 'Reserves selected seat numbers on the flight segments' },
  { id: 'J', step: 'J', name: 'Commit Workbench (Held Booking)', category: 'workbench', endpoint: '/api/travelport/workbench/:id/commit', method: 'POST', description: 'Creates reservation and generates PNR / Locator with ticket time limit' },
  { id: 'K', step: 'K', name: 'Create Post-Commit Workbench', category: 'workbench', optional: true, endpoint: '/api/travelport/workbench/postcommit', method: 'POST', description: 'Loads existing PNR reservation into a new workbench session' },
  { id: 'L', step: 'L', name: 'Add Non-Traveler Remarks', category: 'workbench', optional: true, endpoint: '/api/travelport/workbench/:id/remarks', method: 'POST', description: 'Appends itinerary, billing, or corporate accounting remarks' },
  { id: 'M', step: 'M', name: 'Ancillary Shop', category: 'ancillaries', optional: true, endpoint: '/api/travelport/ancillaries/shop', method: 'POST', description: 'Discovers extra baggage, lounge access, meals, and priority check-in' },
  { id: 'N', step: 'N', name: 'Ancillary Price (NDC Only)', category: 'ancillaries', optional: true, ndcOnly: true, endpoint: '/api/travelport/workbench/:id/ancillaries/price', method: 'POST', description: 'Calculates dynamic NDC ancillary pricing and currency conversion' },
  { id: 'O', step: 'O', name: 'Book Ancillary', category: 'ancillaries', optional: true, endpoint: '/api/travelport/workbench/:id/ancillaries/book', method: 'POST', description: 'Attaches selected ancillary services to passenger segments' },
  { id: 'P', step: 'P', name: 'Commit Workbench (Held Ancillaries)', category: 'ancillaries', optional: true, endpoint: '/api/travelport/workbench/:id/commit', method: 'POST', description: 'Saves reserved ancillaries to the PNR before payment' },
  { id: 'Q', step: 'Q', name: 'Create Post-Commit Workbench', category: 'workbench', optional: true, endpoint: '/api/travelport/workbench/postcommit', method: 'POST', description: 'Re-opens reservation for FOP and payment processing' },
  { id: 'R', step: 'R', name: 'Form of Payment (FOP)', category: 'payment', endpoint: '/api/travelport/workbench/:id/fop', method: 'POST', description: 'Sets payment method (CreditCard, AgencyAccount, Cash)' },
  { id: 'S', step: 'S', name: 'Apply Payment', category: 'payment', endpoint: '/api/travelport/workbench/:id/payments', method: 'POST', description: 'Authorizes airfare, seat fees, and ancillary EMD totals' },
  { id: 'T', step: 'T', name: 'Commit & Issue Ticket(s) / EMDs', category: 'ticketing', endpoint: '/api/travelport/workbench/:id/ticket', method: 'POST', description: 'Finalizes transaction, issues e-Tickets (006/016/...) and EMD documents' }
];

export function TravelportWorkflowConsole({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<'workflow' | 'stays' | 'auth'>('workflow');
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  
  // Workflow state
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<Record<string, { status: 'idle' | 'running' | 'success' | 'failed'; data?: any; error?: string; latency?: number }>>({});
  const [workflowSummary, setWorkflowSummary] = useState<any>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>('A');

  // Interactive inputs
  const [origin, setOrigin] = useState('BOM');
  const [destination, setDestination] = useState('DEL');
  const [departDate, setDepartDate] = useState(() => new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [travelerName, setTravelerName] = useState('Sharad Raut');
  const [travelerEmail, setTravelerEmail] = useState('shrd.raut@gmail.com');
  const [reservationId, setReservationId] = useState<string>('');

  // Stays Property Details state
  const [hotelPropId, setHotelPropId] = useState('TP-HTL-101');
  const [hotelDetailsResult, setHotelDetailsResult] = useState<any>(null);
  const [isLoadingHotelDetails, setIsLoadingHotelDetails] = useState(false);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/travelport/auth/test');
      const data = await res.json();
      setConnectionStatus(data);
    } catch (err: any) {
      setConnectionStatus({ configured: false, error: err.message });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleRunFullWorkflow = async () => {
    setIsExecutingWorkflow(true);
    setWorkflowSummary(null);

    // Reset step statuses to running
    const initialStatuses: any = {};
    WORKFLOW_STEPS.forEach(s => {
      initialStatuses[s.id] = { status: 'idle' };
    });
    setStepStatuses(initialStatuses);

    try {
      const res = await fetch('/api/travelport/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightSearch: {
            origin,
            destination,
            departDate,
            adults: 1,
            cabinClass: 'Economy'
          },
          travelers: [
            {
              givenName: travelerName.split(' ')[0] || 'Sharad',
              surname: travelerName.split(' ')[1] || 'Raut',
              passengerTypeCode: 'ADT',
              gender: 'Male',
              birthDate: '1990-05-15',
              email: travelerEmail,
              telephone: '+919876543210'
            }
          ]
        })
      });

      const data = await res.json();
      setWorkflowSummary(data);

      // Populate step statuses from workflow result
      const stepsList = data?.steps || data?.stepResults;
      if (Array.isArray(stepsList)) {
        const updated: any = {};
        stepsList.forEach((step: any) => {
          const stepKey = step.step || step.stepCode;
          const isSuccess = step.status === 'SUCCESS' || step.status === 'success';
          const isSkipped = step.status === 'SKIPPED' || step.status === 'skipped';
          updated[stepKey] = {
            status: isSuccess ? 'success' : (isSkipped ? 'idle' : 'failed'),
            data: step.data || step.response,
            error: step.error,
            latency: step.durationMs
          };
        });
        setStepStatuses(updated);
        if (data.reservationId) {
          setReservationId(data.reservationId);
        }
      }
    } catch (err: any) {
      setWorkflowSummary({ success: false, error: err.message });
    } finally {
      setIsExecutingWorkflow(false);
    }
  };

  const handleRunSingleStep = async (step: StepItem) => {
    setStepStatuses(prev => ({
      ...prev,
      [step.id]: { status: 'running' }
    }));
    setExpandedStep(step.id);

    const startTime = Date.now();
    try {
      let endpoint = step.endpoint;
      if (endpoint.includes(':id')) {
        const activeResId = reservationId || 'WB-DEMO-98213';
        endpoint = endpoint.replace(':id', activeResId);
      }

      let res;
      if (step.method === 'GET') {
        res = await fetch(endpoint);
      } else {
        let body: any = {};
        if (step.id === 'A') {
          body = { origin, destination, departDate, adults: 1, cabinClass: 'Economy' };
        } else if (step.id === 'E') {
          body = { purpose: 'AirBooking' };
        } else if (step.id === 'F') {
          body = {
            travelers: [{
              givenName: travelerName.split(' ')[0] || 'Sharad',
              surname: travelerName.split(' ')[1] || 'Raut',
              passengerTypeCode: 'ADT',
              gender: 'Male',
              birthDate: '1990-05-15',
              email: travelerEmail,
              telephone: '+919876543210'
            }]
          };
        } else if (step.id === 'G') {
          body = { catalogOfferingId: 'CO-6E-204-AIR' };
        }

        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (step.id === 'E' && data?.reservationId) {
        setReservationId(data.reservationId);
      }

      setStepStatuses(prev => ({
        ...prev,
        [step.id]: {
          status: data.success !== false ? 'success' : 'failed',
          data,
          error: data.error,
          latency
        }
      }));
    } catch (err: any) {
      setStepStatuses(prev => ({
        ...prev,
        [step.id]: {
          status: 'failed',
          error: err.message,
          latency: Date.now() - startTime
        }
      }));
    }
  };

  const handleFetchHotelDetails = async () => {
    setIsLoadingHotelDetails(true);
    try {
      const res = await fetch(`/api/travelport/hotels/properties/${encodeURIComponent(hotelPropId)}?checkInDate=${departDate}&adults=2&currency=INR`);
      const data = await res.json();
      setHotelDetailsResult(data);
    } catch (err: any) {
      setHotelDetailsResult({ success: false, error: err.message });
    } finally {
      setIsLoadingHotelDetails(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-pink-950/40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[20px] bg-[var(--premium-violet)]/20 border border-premium-violet/30 flex items-center justify-center text-premium-violet">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Travelport TripServices Workflow DevKit</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-premium-violet-soft0/20 text-premium-violet-soft border border-premium-violet/30">
                20-Step Orchestrator (A–T)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              GDS & NDC DevKit Postman Specification &bull; Stays 11.33/12 Properties Detail API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkConnection}
            disabled={isLoadingStatus}
            className="p-2.5 rounded-[16px] bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Refresh Token & Environment Probe"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Check API</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-[16px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'workflow'
              ? 'text-premium-violet border-premium-violet'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Full Workflow (Steps A–T)</span>
        </button>

        <button
          onClick={() => setActiveTab('stays')}
          className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'stays'
              ? 'text-premium-sky-deep border-premium-sky-deep'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Hotel className="w-4 h-4" />
          <span>Stays 11.33/12 Property Details</span>
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'auth'
              ? 'text-premium-pink border-premium-pink'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Auth & Environment</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-slate-800/60 p-5 rounded-[20px] border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Route</label>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-[16px] border border-slate-700 text-xs font-mono font-bold">
                    <input
                      type="text"
                      value={origin}
                      onChange={e => setOrigin(e.target.value.toUpperCase())}
                      className="w-12 bg-transparent text-white focus:outline-none text-center"
                      maxLength={3}
                    />
                    <span className="text-slate-500">&rarr;</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value.toUpperCase())}
                      className="w-12 bg-transparent text-white focus:outline-none text-center"
                      maxLength={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Date</label>
                  <input
                    type="date"
                    value={departDate}
                    onChange={e => setDepartDate(e.target.value)}
                    className="bg-slate-900 px-3 py-2 rounded-[16px] border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Traveler</label>
                  <input
                    type="text"
                    value={travelerName}
                    onChange={e => setTravelerName(e.target.value)}
                    className="bg-slate-900 px-3 py-2 rounded-[16px] border border-slate-700 text-xs font-bold text-white focus:outline-none w-36"
                  />
                </div>

                {reservationId && (
                  <div>
                    <label className="text-[10px] font-black text-premium-sky-deep uppercase tracking-wider block mb-1">Active Session</label>
                    <span className="bg-premium-sky-deep border border-premium-sky-deep/40 text-pink-300 px-3 py-2 rounded-[16px] text-xs font-mono font-bold block">
                      {reservationId}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunFullWorkflow}
                  disabled={isExecutingWorkflow}
                  className="px-5 py-2.5 bg-[var(--premium-violet)] hover:bg-premium-violet-soft0 disabled:opacity-50 text-white rounded-[16px] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-pink-900/50 transition-all cursor-pointer"
                >
                  {isExecutingWorkflow ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Steps A–T...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Execute Full Sequence</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Workflow Result Banner if completed */}
            {workflowSummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-[20px] border ${
                  workflowSummary.success
                    ? 'bg-pink-950/40 border-premium-sky-deep/40 text-pink-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {workflowSummary.success ? (
                      <CheckCircle2 className="w-6 h-6 text-premium-sky-deep shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">
                        {workflowSummary.success
                          ? 'Workflow Completed Successfully: Ticket Issued & Confirmed'
                          : 'Workflow Finished with Errors'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        PNR Locator: <strong className="text-white font-mono">{workflowSummary.pnr || 'N/A'}</strong> &bull; 
                        Tickets: <span className="font-mono text-premium-violet-soft">{workflowSummary.tickets?.map((t: any) => t.ticketNumber).join(', ') || 'N/A'}</span> &bull; 
                        EMDs: <span className="font-mono text-pink-300">{workflowSummary.emds?.map((e: any) => e.emdNumber).join(', ') || 'None'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-bold">
                      {workflowSummary.stepResults?.length || 0} Steps Executed
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step list table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                <span>TripServices Steps & Endpoint Contracts</span>
                <span>Actions / Status</span>
              </div>

              {WORKFLOW_STEPS.map(step => {
                const stepStatus = stepStatuses[step.id];
                const isExpanded = expandedStep === step.id;

                return (
                  <div
                    key={step.id}
                    className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 rounded-[20px] overflow-hidden transition-all"
                  >
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                        <div className="w-8 h-8 rounded-[16px] bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-xs text-premium-violet">
                          {step.step}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{step.name}</span>
                            {step.optional && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-700 text-slate-300">
                                Optional
                              </span>
                            )}
                            {step.ndcOnly && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-900/60 text-premium-pink border border-orange-700/50">
                                NDC Required
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            <span className="text-premium-violet font-bold mr-1">{step.method}</span>
                            {step.endpoint}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {stepStatus?.status === 'running' && (
                          <div className="flex items-center gap-1.5 text-premium-pink text-xs font-bold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Running...</span>
                          </div>
                        )}
                        {stepStatus?.status === 'success' && (
                          <div className="flex items-center gap-1.5 text-premium-sky-deep text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{stepStatus.latency ? `${stepStatus.latency}ms` : 'Succeeded'}</span>
                          </div>
                        )}
                        {stepStatus?.status === 'failed' && (
                          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            <span>Failed</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleRunSingleStep(step)}
                          disabled={stepStatus?.status === 'running' || isExecutingWorkflow}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable JSON / Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 border-t border-slate-700/50 bg-slate-950/40 text-xs"
                        >
                          <div className="pt-3 space-y-2">
                            <p className="text-slate-300 font-medium">{step.description}</p>
                            
                            {stepStatus?.data && (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-black">
                                  <span>Response Payload</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(stepStatus.data, null, 2))}
                                    className="flex items-center gap-1 hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copy JSON</span>
                                  </button>
                                </div>
                                <pre className="p-3 bg-slate-900 rounded-[16px] border border-slate-800 text-[11px] font-mono text-premium-violet-soft overflow-x-auto max-h-60">
                                  {JSON.stringify(stepStatus.data, null, 2)}
                                </pre>
                              </div>
                            )}

                            {stepStatus?.error && (
                              <div className="p-3 bg-rose-950/50 border border-rose-800/50 rounded-[16px] text-rose-300 font-mono text-[11px]">
                                Error: {stepStatus.error}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stays' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-5 rounded-[20px] border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Stays 11.33 / 12 Get Properties Detail API
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Endpoint: <code className="text-premium-sky-deep font-mono">GET /v11/hotel/properties/{'{propertyId}'}</code>
                  </p>
                </div>
                <a
                  href="https://developer.travelport.com/apis/stays/11.33/search-and-details/getpropertiesdetail"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-premium-sky-deep hover:text-pink-300 font-bold"
                >
                  <span>API Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Property ID</label>
                  <input
                    type="text"
                    value={hotelPropId}
                    onChange={e => setHotelPropId(e.target.value)}
                    placeholder="e.g. TP-HTL-101 or 123456"
                    className="w-full bg-slate-900 px-3 py-2 rounded-[16px] border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="pt-5">
                  <button
                    onClick={handleFetchHotelDetails}
                    disabled={isLoadingHotelDetails}
                    className="px-5 py-2.5 bg-premium-sky-deep hover:bg-premium-sky-soft0 disabled:opacity-50 text-white rounded-[16px] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-pink-900/50 transition-all cursor-pointer"
                  >
                    {isLoadingHotelDetails ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Hotel className="w-4 h-4" />
                        <span>Fetch Property Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {hotelDetailsResult && (
              <div className="bg-slate-900/80 p-5 rounded-[20px] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase">
                  <span>API Response &bull; Travelport Stays v11.33 / v12</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(hotelDetailsResult, null, 2))}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 rounded-[16px] border border-slate-800 text-[11px] font-mono text-pink-300 overflow-x-auto max-h-96">
                  {JSON.stringify(hotelDetailsResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-5 rounded-[20px] border border-slate-700/60 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[16px] bg-[var(--premium-pink)]/20 text-premium-pink flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">OAuth 2.0 Credentials & Pre-Production Endpoint</h3>
                  <p className="text-xs text-slate-400">Targeting Travelport OpenAPI Gateway</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-[16px] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Base URL</span>
                  <span className="text-white font-bold">https://api.travelport.com</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-[16px] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">OAuth Token URL</span>
                  <span className="text-white font-bold">/oauth/v2/token</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-[16px] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Target PCC</span>
                  <span className="text-premium-violet font-bold">{connectionStatus?.targetPcc || '7T66 / Default'}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-[16px] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Environment</span>
                  <span className="text-premium-pink font-bold">{connectionStatus?.environment || 'pre-production'}</span>
                </div>
              </div>

              {connectionStatus && (
                <div className="p-4 bg-slate-900/90 rounded-[16px] border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Live Probe Result:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      connectionStatus.success ? 'bg-premium-sky-soft0/20 text-pink-300' : 'bg-[var(--premium-pink)]/20 text-premium-pink'
                    }`}>
                      {connectionStatus.success ? 'Connected / Active' : 'Ready (Mock Sandbox Mode)'}
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto">
                    {JSON.stringify(connectionStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
