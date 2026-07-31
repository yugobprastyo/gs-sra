import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, 
  Folder, 
  Atom, 
  FileCode, 
  Info, 
  RotateCcw, 
  Plus, 
  MoreVertical, 
  ListOrdered, 
  FileText, 
  CheckCircle2, 
  Play, 
  RefreshCw 
} from 'lucide-react';

import ValidationInfoCard from './components/ValidationInfoCard';
import UserActionCard from './components/UserActionCard';
import ErrorGenerator from './components/ErrorGenerator';
import AbortConfirmation from './components/AbortConfirmation';
import RetryConfirmation from './components/RetryConfirmation';
import SkipConfirmation from './components/SkipConfirmation';

const INITIAL_RUNS = [
  { id: 1, name: 'Run 1 (1)', status: 'Scheduled', category: 'Queue', instrument: 'BlueWasher', events: [] },
  { id: 2, name: 'Run 1 (2)', status: 'Scheduled', category: 'Queue', instrument: 'BlueWasher', events: [] },
  { id: 3, name: 'Run 2', status: 'Scheduled', category: 'Queue', instrument: 'TECAN', events: [] },
  { id: 4, name: 'Draft Protocol A', status: 'Draft', category: 'Draft', instrument: 'THERMO', events: [] },
  { id: 5, name: 'Completed Run X', status: 'Finished', category: 'Finished', instrument: 'MANTIS', events: [] },
];

const INSTRUMENT_TASK_MAP = {
  BlueWasher: { taskName: 'washing', errorType: 'Wash Cycle Failed' },
  MANTIS: { taskName: 'dispense', errorType: 'Pressure Loss / Faulted' },
  TECAN: { taskName: 'pipetting', errorType: 'Liquid Level Error' },
  STACK: { taskName: 'transfer protocol', errorType: 'Gripper Jammed' },
};

const generateUniqueId = () => `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function App() {
  const [activeMainMenu, setActiveMainMenu] = useState('Runs');
  const [activeRunTab, setActiveRunTab] = useState('Queue');

  // Simulation State
  const [runs, setRuns] = useState(INITIAL_RUNS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTimer, setSimTimer] = useState(0);
  
  // Simulation Config State
  const [selectedErrorInst, setSelectedErrorInst] = useState(null);
  const [errorCategory, setErrorCategory] = useState('Instrument Error');
  const [instrumentConnection, setInstrumentConnection] = useState('Connected');
  
  // Target Instrument Config
  const [isLastTaskConfig, setIsLastTaskConfig] = useState(false);
  const [nextTargetInst, setNextTargetInst] = useState('STACK');
  const [nextInstStatusConfig, setNextInstStatusConfig] = useState('Idle');
  const [nextInstConnConfig, setNextInstConnConfig] = useState('Connected');

  // Modal States
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [activeEventForConfirmation, setActiveEventForConfirmation] = useState(null);

  // Detail Navigation States
  const [selectedRunId, setSelectedRunId] = useState(1);
  const [activeTab, setActiveTab] = useState('Run Details');
  const [activeSubTab, setActiveSubTab] = useState('Events');
  const [eventsHistory, setEventsHistory] = useState(false);

  const addEventToRun = useCallback((runId, newEvent) => {
    setRuns((prevRuns) =>
      prevRuns.map((r) => {
        if (r.id === runId) {
          return {
            ...r,
            status: newEvent.newStatus || r.status,
            events: [newEvent, ...r.events],
          };
        }
        return r;
      })
    );
  }, []);

  const handleStartSimulation = (payload) => {
    const { 
      instrument, 
      errorCategory: category, 
      nextInstrument, 
      nextInstStatus, 
      nextInstConnectionStatus,
      isLastTask
    } = payload;

    setRuns(INITIAL_RUNS);
    setSimTimer(0);
    setSelectedErrorInst(instrument);
    setErrorCategory(category);
    setInstrumentConnection('Connected');
    
    // Simpan konfigurasi Last Task
    setIsLastTaskConfig(Boolean(isLastTask));

    setNextTargetInst(nextInstrument || (instrument === 'STACK' ? 'BlueWasher' : 'STACK'));
    setNextInstStatusConfig(nextInstStatus || 'Idle');
    setNextInstConnConfig(nextInstConnectionStatus || 'Connected');

    setIsSimulating(true);
  };

  const resetSimulation = () => {
    setRuns(INITIAL_RUNS);
    setSimTimer(0);
    setIsSimulating(false);
    setSelectedErrorInst(null);
    setInstrumentConnection('Connected');
    setIsLastTaskConfig(false);
    setNextTargetInst('STACK');
    setNextInstStatusConfig('Idle');
    setNextInstConnConfig('Connected');
    setIsAbortModalOpen(false);
    setIsRetryModalOpen(false);
    setIsSkipModalOpen(false);
  };

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Dynamic Simulation Timeline
  useEffect(() => {
    if (!isSimulating || !selectedErrorInst) return;

    if (simTimer === 2) {
      setRuns((prev) =>
        prev.map((r) => (r.id === 1 || r.id === 2 ? { ...r, status: 'Running' } : r))
      );
    }

    if (simTimer === 4 && errorCategory === 'Instrument Disconnect') {
      setInstrumentConnection('Disconnected');
    }

    if (simTimer === 6) {
      const instConfig = INSTRUMENT_TASK_MAP[selectedErrorInst] || {
        taskName: 'Task Executing',
        errorType: 'Unexpected Hardware Error',
      };

      const errorTitleMsg = 
        errorCategory === 'Instrument Disconnect' 
          ? 'Instrument Disconnected Unexpectedly' 
          : instConfig.errorType;

      addEventToRun(1, {
        id: generateUniqueId(),
        cardType: 'user_action',
        title: 'User Action - Run Blocked',
        instName: selectedErrorInst,
        taskName: instConfig.taskName,
        runName: 'Run 1 (1)',
        errorType: errorTitleMsg,
        connectionStatus: errorCategory === 'Instrument Disconnect' ? 'Disconnected' : 'Connected',
        instStatus: 'Faulted',

        // Konfigurasi Task Kritis
        isLastTask: isLastTaskConfig,
        nextInstrument: isLastTaskConfig ? '' : nextTargetInst,

        nextInstConnectionStatus: nextInstConnConfig, 
        nextInstStatus: nextInstStatusConfig,         
        nextInstConsumableStatus: 'OK',
        labwareId: 'LW_96_WELL',
        startTime: '12-09-2026 02:30:00 pm',
        estEndTime: '12-09-2026 02:40:00 pm',
        newStatus: 'Blocked',
      });
    }

    if (simTimer === 9) {
      const dependencyReason = 
        errorCategory === 'Instrument Disconnect' 
          ? `${selectedErrorInst} Disconnected` 
          : `${selectedErrorInst} Faulted/Error`;

      addEventToRun(2, {
        id: generateUniqueId(),
        cardType: 'validation_info',
        title: 'Validation Info - Run Blocked',
        instName: selectedErrorInst,
        taskName: 'queued task',
        runName: 'Run 1 (2)',
        reasonHeader: 'Run Blocked',
        errorType: dependencyReason,
        newStatus: 'Blocked',
      });

      setIsSimulating(false);
    }
  }, [
    simTimer, 
    isSimulating, 
    selectedErrorInst, 
    errorCategory, 
    isLastTaskConfig, 
    nextTargetInst, 
    nextInstStatusConfig, 
    nextInstConnConfig, 
    addEventToRun
  ]);

  const handleUserActionRequest = (actionType, eventData) => {
    setActiveEventForConfirmation(eventData);
    if (actionType === 'ABORT') setIsAbortModalOpen(true);
    if (actionType === 'RETRY') setIsRetryModalOpen(true);
    if (actionType === 'SKIP') setIsSkipModalOpen(true);
  };

  const handleConfirmAbort = (targetEvent) => {
    if (!targetEvent) return;
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id === 1 || r.name === targetEvent.runName) {
          return {
            ...r,
            status: 'Aborted',
            events: r.events.filter((e) => e.id !== targetEvent.id),
          };
        }
        return r;
      })
    );
    setIsAbortModalOpen(false);
  };

  const handleConfirmRetry = (targetEvent) => {
    if (!targetEvent) return;
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id === 1 || r.name === targetEvent.runName) {
          return {
            ...r,
            status: 'Running',
            events: r.events.map((e) =>
              e.id === targetEvent.id
                ? { ...e, instStatus: 'Faulted', actionTaken: 'RETRY_ATTEMPTED', newStatus: 'Running' }
                : e
            ),
          };
        }
        return r;
      })
    );
    setIsRetryModalOpen(false);
  };

  const handleConfirmSkip = (targetEvent) => {
    if (!targetEvent) return;
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id === 1 || r.name === targetEvent.runName) {
          return {
            ...r,
            status: 'Running',
            events: r.events.map((e) =>
              e.id === targetEvent.id
                ? { ...e, instStatus: 'Faulted', actionTaken: 'STEP_SKIPPED', newStatus: 'Running' }
                : e
            ),
          };
        }
        return r;
      })
    );
    setIsSkipModalOpen(false);
  };

  const filteredRuns = runs.filter((run) => run.category === activeRunTab);
  const selectedRun = runs.find((r) => r.id === selectedRunId) || filteredRuns[0] || runs[0];

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Running':
        return <span className="bg-[#a8e0b1] text-emerald-900 text-xs px-3.5 py-1 rounded-full font-medium inline-block">Running</span>;
      case 'Blocked':
        return (
          <div className="flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
            <span className="bg-[#ffcdd2] text-red-900 text-xs px-3.5 py-1 rounded-full font-medium inline-block">Blocked</span>
          </div>
        );
      case 'Aborted':
        return <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full font-semibold inline-block">Aborted</span>;
      case 'Scheduled':
        return <span className="text-gray-700 text-xs font-medium pl-1">Scheduled</span>;
      case 'Draft':
        return <span className="text-amber-700 bg-amber-100 text-xs px-3 py-1 rounded-full font-medium inline-block">Draft</span>;
      case 'Finished':
        return <span className="text-blue-700 bg-blue-100 text-xs px-3 py-1 rounded-full font-medium inline-block">Finished</span>;
      default:
        return <span className="text-gray-500 text-xs">{status}</span>;
    }
  };

  const mainMenuItems = [
    { id: 'Dashboard', name: 'Dashboard', icon: Home },
    { id: 'Runs', name: 'Runs', icon: Folder },
    { id: 'Instrument', name: 'Instrument', icon: Atom },
    { id: 'Template', name: 'Template', icon: FileCode },
  ];

  const runExplorerTabs = [
    { id: 'Queue', name: 'Queue', icon: ListOrdered },
    { id: 'Draft', name: 'Draft', icon: FileText },
    { id: 'Finished', name: 'Finished', icon: CheckCircle2 },
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans text-gray-800 overflow-hidden select-none relative">
      {/* 1. MAIN SIDEBAR NAVIGATION */}
      <aside className="w-20 bg-[#1e2029] flex flex-col justify-between items-center py-4 shrink-0 h-screen z-30 relative shadow-lg">
        <div className="flex flex-col items-center w-full space-y-6">
          <div className="relative cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              GS
            </div>
          </div>

          <nav className="w-full flex flex-col space-y-3">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMainMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMainMenu(item.id)}
                  className={`w-full py-2.5 flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
                    isActive ? 'text-blue-400 bg-gray-800/60 border-l-2 border-blue-500 font-medium' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1.5 leading-none">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        {activeMainMenu === 'Runs' && (
          <>
            {/* HEADER BAR */}
            <header className="h-14 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800">Run Explorer</h1>
                
                <div className="flex items-center space-x-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200 ml-4">
                  {!isSimulating ? (
                    <button
                      onClick={() => setIsErrorModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>GENERATE ERROR</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs font-semibold px-2">
                      <span className="text-emerald-700 animate-pulse">
                        [{errorCategory}] {selectedErrorInst}: {simTimer}s
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        instrumentConnection === 'Connected' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800 animate-pulse'
                      }`}>
                        {instrumentConnection}
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={resetSimulation} 
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors cursor-pointer" 
                    title="Reset Simulation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESCHEDULE</span>
                </button>
                <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>NEW RUN</span>
                </button>
              </div>
            </header>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex overflow-hidden">
              <div className="w-20 border-r border-gray-200 bg-white flex flex-col pt-3 shrink-0">
                {runExplorerTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeRunTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveRunTab(tab.id);
                        const firstInTab = runs.find((r) => r.category === tab.id);
                        if (firstInTab) setSelectedRunId(firstInTab.id);
                      }}
                      className={`py-3 flex flex-col items-center justify-center border-l-4 cursor-pointer ${
                        isActive ? 'text-blue-600 bg-blue-50/50 border-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50 border-transparent'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] mt-1">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* RUN TABLE */}
              <div className="flex-1 flex flex-col border-r border-gray-200 bg-white min-w-[320px]">
                <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-200/80 text-gray-700 text-xs font-semibold">
                        <th className="py-3 px-4 w-20">Run ID</th>
                        <th className="py-3 px-4">Run</th>
                        <th className="py-3 px-4 w-36">Status</th>
                        <th className="py-3 px-4 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRuns.map((run) => {
                        const isSelected = run.id === selectedRun?.id;
                        return (
                          <tr
                            key={run.id}
                            onClick={() => setSelectedRunId(run.id)}
                            className={`cursor-pointer ${isSelected ? 'bg-[#d0e1fd]/80' : 'hover:bg-gray-50'}`}
                          >
                            <td className="py-4 px-4 text-xs font-medium text-gray-600">{run.id}</td>
                            <td className="py-4 px-4 text-xs font-medium text-gray-800">{run.name}</td>
                            <td className="py-4 px-4">{renderStatusBadge(run.status)}</td>
                            <td className="py-4 px-4 text-center">
                              <MoreVertical className="w-4 h-4 text-gray-600 mx-auto" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RUN DETAIL PANEL */}
              <div className="w-[50%] flex flex-col bg-white relative">
                <div className="h-11 border-b border-gray-200 flex items-center px-4 bg-gray-50 shrink-0">
                  <button onClick={() => setActiveTab('Run Details')} className={`px-6 h-full text-xs font-medium border-b-2 cursor-pointer ${activeTab === 'Run Details' ? 'border-blue-500 text-blue-600 bg-white' : 'text-gray-500'}`}>
                    Run Details
                  </button>
                  <button onClick={() => setActiveTab('Gantt Chart')} className={`px-6 h-full text-xs font-medium border-b-2 cursor-pointer ${activeTab === 'Gantt Chart' ? 'border-blue-500 text-blue-600 bg-white' : 'text-gray-500'}`}>
                    Gantt Chart
                  </button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Selected Run: <strong className="font-semibold text-blue-600">{selectedRun?.name || '-'}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Events History</span>
                      <button onClick={() => setEventsHistory(!eventsHistory)} className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer ${eventsHistory ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${eventsHistory ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex min-h-0">
                    <div className="w-32 border-r border-gray-200 flex flex-col text-xs text-gray-600 shrink-0 bg-gray-50/50">
                      {['Overview', 'Consumable', 'Events', 'Report'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveSubTab(tab)}
                          className={`py-3 px-4 text-left font-medium cursor-pointer ${activeSubTab === tab ? 'text-blue-600 bg-white border-l-2 border-blue-500' : 'text-gray-600'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 p-4 overflow-auto bg-gray-50/20">
                      {activeSubTab === 'Events' && (
                        <div>
                          {selectedRun?.events && selectedRun.events.length > 0 ? (
                            selectedRun.events.map((eventItem) => {
                              if (eventItem.cardType === 'user_action') {
                                return (
                                  <UserActionCard 
                                    key={eventItem.id} 
                                    event={eventItem} 
                                    onActionConfirm={handleUserActionRequest}
                                  />
                                );
                              }
                              return <ValidationInfoCard key={eventItem.id} event={eventItem} />;
                            })
                          ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400 text-xs italic">
                              No event logged.
                            </div>
                          )}
                        </div>
                      )}

                      {activeSubTab === 'Overview' && (
                        <div className="space-y-3 text-xs">
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Protocol Name</span>
                            <span className="font-medium text-gray-800">{selectedRun?.name}</span>
                          </div>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Instrument</span>
                            <span className="font-medium text-gray-800">{selectedRun?.instrument}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      {/* MODAL DIALOGS */}
      <AbortConfirmation
        isOpen={isAbortModalOpen}
        onClose={() => setIsAbortModalOpen(false)}
        event={activeEventForConfirmation}
        onConfirmAbort={handleConfirmAbort}
      />

      <RetryConfirmation
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        event={activeEventForConfirmation}
        onConfirmRetry={handleConfirmRetry}
      />

      <SkipConfirmation
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        event={activeEventForConfirmation}
        onConfirmSkip={handleConfirmSkip}
      />

      <ErrorGenerator
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onStartSimulation={handleStartSimulation}
      />
    </div>
  );
}