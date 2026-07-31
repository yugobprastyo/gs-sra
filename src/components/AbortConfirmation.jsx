import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertOctagon } from 'lucide-react';

export default function AbortConfirmation({ isOpen, onClose, event, onConfirmAbort }) {
  const [isCleared, setIsCleared] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCleared(false);
      setIsConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const runName = event.runName || 'Run 1 (1)';
  const errorType = event.errorType || 'Task Error';
  const currentInst = event.instName || 'BlueWasher';
  const currentTask = event.taskName || 'washing';

  const startTime = event.startTime || `${event.date || '12-09-2026'} ${event.time || '02:30:00 pm'}`;
  const estEndTime = event.estEndTime || `${event.date || '12-09-2026'} 02:37:27 pm`;

  const isAbortEnabled = isCleared && isConfirmed;

  return createPortal(
    /* Offset left-20 memasukkan batas kiri dari lebar sidebar utama (w-20) */
    <div className="fixed top-0 right-0 bottom-0 left-20 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      {/* Backdrop listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl w-full max-w-md h-fit max-h-[85vh] flex flex-col border border-gray-200 text-gray-800 font-sans overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <span>User Confirmation - Abort Task</span>
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

          <hr className="border-gray-100" />

          {/* Action Required */}
          <div className="space-y-2.5">
            <span className="font-semibold text-gray-800 block">Action Required :</span>
            
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCleared}
                onChange={(e) => setIsCleared(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <span className="text-gray-600 text-xs leading-tight">
                I have cleared labware <strong className="font-semibold text-gray-900">Lorem Ipsum</strong> on <strong className="font-semibold text-gray-900">{currentInst}</strong>
              </span>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
              />
              <span className="text-gray-600 text-xs leading-tight">
                I am sure I want to <strong className="font-semibold text-red-700">ABORT</strong> this task and change the run status to <strong className="font-semibold text-red-700">ABORTED</strong>.
              </span>
            </label>
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
            disabled={!isAbortEnabled}
            onClick={() => onConfirmAbort && onConfirmAbort(event)}
            className={`px-3.5 py-1.5 rounded font-semibold text-xs transition-colors shadow-2xs ${
              isAbortEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Abort Run
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}