import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FastForward, CheckCircle2, XCircle, Info } from 'lucide-react';
import { isInstrumentReady, getStatusColorClass } from '../utils/InstrumentStatus';

export default function SkipConfirmation({ isOpen, onClose, event, onConfirmSkip }) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsChecked(false);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const runName = event.runName || 'Run 1 (1)';
  const errorType = event.errorType || 'Task Error';
  
  // Data Current Instrument & Task
  const currentInst = event.instName || 'BlueWasher';
  const currentTask = event.taskName || 'washing';
  const labwareName = event.labwareName || event.labwareId || 'Lorem_Ipsum';

  const startTime = event.startTime || `${event.date || '12-09-2026'} ${event.time || '02:30:00 pm'}`;
  const estEndTime = event.estEndTime || `${event.date || '12-09-2026'} 02:37:27 pm`;

  // Deteksi apakah ini task terakhir
  const rawNextInst = event.nextInstrument || event.nextInstName;
  const isLastTask = Boolean(
    event.isLastTask || 
    !rawNextInst || 
    rawNextInst.trim().toUpperCase() === 'NONE' || 
    rawNextInst.trim().toUpperCase() === 'END'
  );

  // Data Next Instrument Target (Hanya jika BUKAN task terakhir)
  const nextInst = isLastTask ? '' : rawNextInst;
  const nextConnStatus = event.nextInstConnectionStatus ?? 'Connected';
  const nextInstStatus = event.nextInstStatus ?? 'Faulted';

  // Cek apakah Target Siap (Task terakhir selalu siap/tidak terhalang instrument berikutnya)
  const isNextInstReady = isLastTask ? true : isInstrumentReady(nextConnStatus, nextInstStatus);

  // LOGIKA CTA: Tombol Skip HANYA aktif jika Checkbox Dicentang DAN Target Siap
  const isSkipEnabled = isChecked && isNextInstReady;

  // LOGIKA PESAN ACTION REQUIRED
  const isNextInstStack = !isLastTask && nextInst.trim().toUpperCase() === 'STACK';
  const targetLocation = isNextInstStack ? currentInst : nextInst;

  const handleConfirm = () => {
    if (isSkipEnabled && onConfirmSkip) {
      onConfirmSkip(event);
      setIsChecked(false);
    }
  };

  return createPortal(
    <div className="fixed top-0 right-0 bottom-0 left-20 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      {/* Backdrop listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl w-full max-w-md h-fit max-h-[85vh] flex flex-col border border-gray-200 text-gray-800 font-sans overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <FastForward className="w-4 h-4 text-amber-600 shrink-0" />
            <span>User Confirmation - Skip Task</span>
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 text-xs overflow-y-auto">
          <p className="text-xs font-semibold text-gray-900 leading-relaxed">
            Error in {runName}: <span className="text-red-600 font-bold">{errorType}</span>
          </p>

          {/* Component Location & Timings */}
          <div className="bg-gray-50 p-3 rounded border border-gray-200/80 space-y-2">
            <div>
              <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">Location</span>
              <span className="text-gray-800 font-medium">{currentInst} : {currentTask}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
              <div>
                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">Start Time</span>
                <span className="text-gray-700">{startTime}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">Est. End Time</span>
                <span className="text-gray-700">{estEndTime}</span>
              </div>
            </div>
          </div>

          {/* Next Instrument Target Status / End of Run Notice */}
          <div className="space-y-1 pt-1">
            <span className="font-semibold text-gray-700 block text-[11px]">
              {isLastTask ? 'Workflow Status :' : `Next Target Instrument Status (${nextInst}) :`}
            </span>

            {isLastTask ? (
              <div className="flex items-center space-x-1.5 text-blue-700 font-semibold text-xs bg-blue-50 p-2.5 rounded border border-blue-100">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>This is the final task. Skipping will mark the run as completed.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {isNextInstReady ? (
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{nextInst}: Ready for Transfer</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-red-600 font-bold text-xs">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{nextInst}: {nextInstStatus}</span>
                  </div>
                )}

                {/* Tooltip */}
                <div className="relative group inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col bg-gray-900 text-white p-2.5 rounded-md shadow-xl w-52 z-50 pointer-events-none transition-all duration-150">
                    <div className="space-y-1 text-[11px] font-normal">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Connection:</span>
                        <strong className={nextConnStatus.toLowerCase() === 'connected' ? 'text-emerald-400' : 'text-red-400'}>
                          {nextConnStatus}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Status:</span>
                        <strong className={getStatusColorClass ? getStatusColorClass(nextInstStatus) : 'text-red-400'}>
                          {nextInstStatus}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Action Required */}
          <div className="space-y-2">
            <span className="font-semibold text-gray-800 block">Action Required :</span>
            
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
              />
              <span className="text-gray-600 text-xs leading-tight">
                {isLastTask ? (
                  <>Ensure labware <strong className="font-semibold text-gray-900">{labwareName}</strong> is safely retrieved from <strong className="font-semibold text-gray-900">{currentInst}</strong>.</>
                ) : (
                  <>Ensure labware <strong className="font-semibold text-gray-900">{labwareName}</strong> is placed in <strong className="font-semibold text-gray-900">{targetLocation}</strong>.</>
                )}
              </span>
            </label>

            {/* INFO PENDUKUNG: Tampil jika user mencentang checkbox tetapi Next Instrument belum Idle */}
            {!isLastTask && isChecked && !isNextInstReady && (
              <p className="text-[11px] text-amber-600 font-medium pt-1 leading-tight">
                ⚠️ Skip button is blocked because next instrument (<strong>{nextInst}</strong>) status is <strong>{nextInstStatus}</strong>. Change status to Idle to proceed.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={!isSkipEnabled}
            onClick={handleConfirm}
            className={`px-3.5 py-1.5 rounded font-semibold text-xs transition-colors shadow-2xs ${
              isSkipEnabled
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-75'
            }`}
          >
            {isLastTask ? 'Finish Run' : 'Skip Task'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}