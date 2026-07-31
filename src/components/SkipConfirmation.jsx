import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function SkipConfirmation({ isOpen, onClose, event, onConfirmSkip }) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  // 1. Ambil Nama Target Inst dengan Safe Fallbacks
  const rawNextInst = 
    event.nextInstrument ?? 
    event.nextInstName ?? 
    event.nextInst ?? 
    '';

  const safeNextInstStr = typeof rawNextInst === 'string' ? rawNextInst.trim().toUpperCase() : '';

  // 2. Evaluasi Eksplisit Flags Last Task
  const isLastTask = Boolean(
    event.isLastTask === true ||
    String(event.isLastTask).toLowerCase() === 'true' ||
    safeNextInstStr === 'NONE' ||
    safeNextInstStr === 'END' ||
    safeNextInstStr === 'LAST'
  );

  // 3. Nama display untuk instrumen berikutnya
  const nextInstName = isLastTask ? '' : (rawNextInst || 'STACK');

  const nextConnStatus = event.nextInstConnectionStatus ?? 'Connected';
  const nextInstStatus = event.nextInstStatus ?? 'Idle';

  // Pembacaan Kelayakan Instrumen Target
  const isConnOk = nextConnStatus === 'Connected';
  const isStatusOk = nextInstStatus === 'Idle' || nextInstStatus === 'Ready';

  // Jika Last Task, tidak bergantung pada status instrumen berikutnya
  const isNextInstReady = isLastTask ? true : (isConnOk && isStatusOk);
  const isSkipEnabled = isChecked && isNextInstReady;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-amber-600 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-200" />
            <h3 className="font-semibold text-sm">Confirm Skip Action</h3>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs text-gray-700">
          <p className="text-gray-800 leading-relaxed">
            You are about to skip the current failed step on <strong className="font-semibold">{event.instName || 'Instrument'}</strong> for <strong className="font-semibold">{event.runName || 'Run'}</strong>.
          </p>

          {/* Validation Target Status Section */}
          <div className="bg-gray-50 p-3.5 rounded-md border border-gray-200 space-y-2">
            <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider block">
              Validation Check
            </span>

            {isLastTask ? (
              <div className="flex items-center space-x-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>This is the final task in the protocol. No downstream handover required.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Target Instrument: <strong className="font-semibold text-gray-800">{nextInstName}</strong></span>
                  {isNextInstReady ? (
                    <span className="flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>READY</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-red-600 font-semibold text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>NOT READY</span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className={isConnOk ? 'text-gray-700 font-medium' : 'text-red-600 font-bold'}>{nextConnStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={isStatusOk ? 'text-gray-700 font-medium' : 'text-red-600 font-bold'}>{nextInstStatus}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isNextInstReady && !isLastTask && (
            <p className="text-red-600 bg-red-50 p-2.5 rounded border border-red-200 text-[11px] leading-tight">
              Cannot skip step: The target instrument (<strong>{nextInstName}</strong>) is currently not ready or disconnected.
            </p>
          )}

          {/* User Acknowledgment */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="confirmSkipCheckbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="confirmSkipCheckbox" className="text-gray-600 leading-snug cursor-pointer select-none">
              I understand that skipping this step may result in unwashed or incomplete samples moving to the next process.
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!isSkipEnabled}
            onClick={() => onConfirmSkip(event)}
            className={`px-4 py-1.5 rounded text-xs font-semibold text-white transition-colors ${
              isSkipEnabled 
                ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer shadow-sm' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm & Skip
          </button>
        </div>
      </div>
    </div>
  );
}